import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ServiceWithProfile, SearchFilters, SearchState } from "@/types";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      query: "",
      filters: {},
      results: [],
      loading: false,
      hasMore: true,

      setQuery: (query: string) => {
        set({ query });
      },

      setFilters: (newFilters: Partial<SearchFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      loadServices: async (reset = false) => {
        const { query, filters } = get();

        try {
          set({ loading: true });

          let queryBuilder = supabase
            .from("services")
            .select(
              `
              id, title, description, price_in_cents, service_type, pricing_type,
              delivery_time_value, delivery_time_unit, created_at,
              is_active,
              profile:profiles!profile_id (
                username, full_name, avatar_url, title, location
              ),
              category:categories!category_id (
                id, name
              )
            `
            )
            .eq("is_active", true);

          // Apply text search
          if (query) {
            queryBuilder = queryBuilder.or(
              `title.ilike.%${query}%,description.ilike.%${query}%`
            );
          }

          // Apply filters
          if (filters.category_id) {
            queryBuilder = queryBuilder.eq("category_id", filters.category_id);
          }

          if (filters.service_type) {
            queryBuilder = queryBuilder.eq(
              "service_type",
              filters.service_type
            );
          }

          if (filters.price_min !== undefined) {
            queryBuilder = queryBuilder.gte(
              "price_in_cents",
              filters.price_min
            );
          }

          if (filters.price_max !== undefined) {
            queryBuilder = queryBuilder.lte(
              "price_in_cents",
              filters.price_max
            );
          }

          if (filters.location) {
            queryBuilder = queryBuilder.ilike(
              "profiles.location",
              `%${filters.location}%`
            );
          }

          // Apply sorting
          switch (filters.sort_by) {
            case "price_asc":
              queryBuilder = queryBuilder.order("price_in_cents", {
                ascending: true,
              });
              break;
            case "price_desc":
              queryBuilder = queryBuilder.order("price_in_cents", {
                ascending: false,
              });
              break;
            case "newest":
              queryBuilder = queryBuilder.order("created_at", {
                ascending: false,
              });
              break;
            case "rating":
              // TODO: Implement rating sort when reviews are implemented
              queryBuilder = queryBuilder.order("created_at", {
                ascending: false,
              });
              break;
            default:
              queryBuilder = queryBuilder.order("created_at", {
                ascending: false,
              });
          }

          // Pagination
          const offset = reset ? 0 : get().results.length;
          const limit = 20;

          queryBuilder = queryBuilder.range(offset, offset + limit - 1);

          const { data, error } = await queryBuilder;

          if (error) throw error;

          const services = data as ServiceWithProfile[];

          set((state) => ({
            results: reset ? services : [...state.results, ...services],
            hasMore: services.length === limit,
            loading: false,
          }));
        } catch (error) {
          console.error("Search error:", error);
          set({ loading: false });
          throw error;
        }
      },

      loadMoreServices: async () => {
        const { hasMore, loading } = get();
        if (!hasMore || loading) return;

        await get().loadServices(false);
      },

      loadMore: async () => {
        const { hasMore, loading } = get();
        if (!hasMore || loading) return;

        await get().loadServices(false);
      },

      clearResults: () => {
        set({ results: [], hasMore: true });
      },
    }),
    {
      name: "search-store",
    }
  )
);
