"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { ServiceWithProfile, SearchFilters } from "@/types";
import { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const ITEMS_PER_PAGE = 20;

export function useServices(filters?: SearchFilters) {
  const [services, setServices] = useState<ServiceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const buildQuery = useCallback(
    (offset = 0, limit = ITEMS_PER_PAGE) => {
      let query = supabase
        .from("services")
        .select(
          `
        *,
        profile:profiles!profile_id(
          id,
          username,
          full_name,
          avatar_url,
          bio
        ),
        reviews(
          rating
        )
      `
        )
        .eq("is_active", true);

      // Apply filters
      if (filters?.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
        );
      }

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters?.service_type) {
        query = query.eq("service_type", filters.service_type);
      }

      if (filters?.price_min !== undefined) {
        query = query.gte("price_in_cents", filters.price_min);
      }

      if (filters?.price_max !== undefined) {
        query = query.lte("price_in_cents", filters.price_max);
      }

      // Apply sorting
      switch (filters?.sort_by) {
        case "price_asc":
          query = query.order("price_in_cents", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price_in_cents", { ascending: false });
          break;
        case "rating":
          // This would need a computed field or view in the database
          query = query.order("created_at", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        default:
          // Default to relevance (newest for now)
          query = query.order("created_at", { ascending: false });
      }

      return query.range(offset, offset + limit - 1);
    },
    [filters]
  );

  const loadServices = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const offset = reset ? 0 : page * ITEMS_PER_PAGE;
        const { data, error: queryError, count } = await buildQuery(offset);

        if (queryError) throw queryError;

        // Transform data to include computed fields
        const transformedData = (data || []).map((service: any) => ({
          ...service,
          profile: service.profile,
          // Calculate average rating - simplified for now
          average_rating: undefined,
          review_count: 0,
        })) as ServiceWithProfile[];

        if (reset) {
          setServices(transformedData);
          setPage(1);
        } else {
          setServices((prev) => [...prev, ...transformedData]);
          setPage((prev) => prev + 1);
        }

        setHasMore(transformedData.length === ITEMS_PER_PAGE);
      } catch (err) {
        console.error("Error loading services:", err);
        const message =
          err instanceof Error ? err.message : "Failed to load services";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, page]
  );

  const loadMoreServices = useCallback(() => {
    if (!loading && hasMore) {
      loadServices(false);
    }
  }, [loading, hasMore, loadServices]);

  const refreshServices = useCallback(() => {
    setPage(0);
    loadServices(true);
  }, [loadServices]);

  // Load initial services when filters change
  useEffect(() => {
    refreshServices();
  }, [filters]);

  return {
    services,
    loading,
    error,
    hasMore,
    loadServices: refreshServices,
    loadMoreServices,
    refreshServices,
  };
}
