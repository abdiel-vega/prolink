"use client";

import { useState } from "react";
import { Star, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { ReviewWithClient } from "@/types";

interface ReviewsListProps {
  reviews: ReviewWithClient[];
  averageRating: number;
  totalReviews: number;
  className?: string;
}

interface ReviewCardProps {
  review: ReviewWithClient;
}

function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongReview = review.comment && review.comment.length > 200;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="card-surface">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <UserAvatar
            src={review.client.avatar_url}
            alt={review.client.full_name || review.client.username || "Client"}
            size="md"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground truncate">
                {review.client.full_name || review.client.username || "Anonymous"}
              </h4>
              {review.verified_purchase && (
                <Badge variant="outline" className="status-success text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {review.comment && (
        <CardContent className="pt-0">
          <div className="relative">
            <p className={`text-muted-foreground leading-relaxed ${
              !isExpanded && isLongReview ? 'line-clamp-3' : ''
            }`}>
              {review.comment}
            </p>
            
            {isLongReview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 p-0 h-auto text-primary hover:text-primary-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Read more
                  </>
                )}
              </Button>
            )}
          </div>
          
          {review.helpful_votes && review.helpful_votes > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <ThumbsUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {review.helpful_votes} {review.helpful_votes === 1 ? 'person' : 'people'} found this helpful
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function ReviewsList({ 
  reviews, 
  averageRating, 
  totalReviews, 
  className = "" 
}: ReviewsListProps) {
  const [showAll, setShowAll] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = reviews.filter(review => 
    filterRating ? review.rating === filterRating : true
  );

  const displayedReviews = showAll 
    ? filteredReviews 
    : filteredReviews.slice(0, 6);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  if (reviews.length === 0) {
    return (
      <Card className="card-surface text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            This professional hasn't received any reviews yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Summary */}
      <Card className="card-secondary">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(averageRating))}
                </div>
              </div>
              <p className="text-muted-foreground">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-muted-foreground">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-border rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterRating === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterRating(null)}
          className={filterRating === null ? "bg-white text-gray-900" : ""}
        >
          All Reviews ({reviews.length})
        </Button>
        {[5, 4, 3, 2, 1].map(rating => {
          const count = ratingDistribution[rating as keyof typeof ratingDistribution];
          if (count === 0) return null;
          
          return (
            <Button
              key={rating}
              variant={filterRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(rating)}
              className={filterRating === rating ? "bg-white text-gray-900" : ""}
            >
              {rating} <Star className="w-3 h-3 ml-1 fill-current" /> ({count})
            </Button>
          );
        })}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More Button */}
      {!showAll && filteredReviews.length > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
          >
            Show {filteredReviews.length - 6} more reviews
          </Button>
        </div>
      )}

      {showAll && filteredReviews.length > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(false)}
          >
            Show fewer reviews
          </Button>
        </div>
      )}
    </div>
  );
}
