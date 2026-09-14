import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Star, MessageSquare } from "lucide-react";
import { useCourseReviews } from "@/features/reviews/hook/use-reviews";
import type { Review } from "@/features/reviews/types/review.types";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Button } from "@fe/components/ui/button";
import { Separator } from "@fe/components/ui/separator";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-3 text-right text-xs text-muted-foreground tabular-nums">
        {star}
      </span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export default function CourseReviewsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useCourseReviews(courseId);

  const reviews = (data as any)?.data ?? [];
  const totalReviews = reviews.length;

  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
        totalReviews
      : 0;

  const ratingMap = new Map<number, number>();
  for (const r of reviews) {
    ratingMap.set(r.rating, (ratingMap.get(r.rating) ?? 0) + 1);
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          <Skeleton className="h-48" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Đánh giá khóa học</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalReviews} đánh giá
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Left: Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-4xl font-bold">{avgRating.toFixed(1)}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalReviews} đánh giá
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={ratingMap.get(star) ?? 0}
                  total={totalReviews}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Review list */}
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {(review.user?.name ?? "?").charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {review.user?.name ?? "Ẩn danh"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-10 flex flex-col items-center text-center gap-3">
                <div className="rounded-full bg-muted p-3">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Chưa có đánh giá nào.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
