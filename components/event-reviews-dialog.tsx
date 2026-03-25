"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";

interface Review {
  id: string;
  bookingId?: string;
  eventId?: string;
  userId?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

interface EventReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function EventReviewsDialog({
  open,
  onOpenChange,
  eventId,
  reviews,
  averageRating,
  totalReviews,
}: EventReviewsDialogProps) {
  const averageRatingDisplay =
    totalReviews > 0 ? Number(averageRating).toFixed(1) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Reviews</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reviews Summary */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Reviews Summary</h3>
              <div className="text-right">
                <p className="text-2xl font-bold">{averageRatingDisplay}</p>
                <p className="text-xs text-muted-foreground">
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">All Reviews</h4>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border p-3 space-y-2 bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          {review.userName || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleString()
                            : "Just now"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (review.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
