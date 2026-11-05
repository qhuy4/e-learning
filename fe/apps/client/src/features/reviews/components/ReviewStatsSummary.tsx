import React from "react";
import { Star } from "lucide-react";
import type { ReviewStats } from "../types/review.type";

interface ReviewStatsSummaryProps {
  stats: ReviewStats;
  selectedRating?: number;
  onSelectRating: (rating?: number) => void;
}

export const ReviewStatsSummary: React.FC<ReviewStatsSummaryProps> = ({
  stats,
  selectedRating,
  onSelectRating,
}) => {
  const { averageRating = 0, totalReviews = 0, starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } =
    stats || {};

  const numAverageRating = Number(averageRating) || 0;
  const numTotalReviews = Number(totalReviews) || 0;
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="bg-card rounded-2xl p-4 md:p-5 border border-border shadow-[0_4px_20px_rgba(15,23,42,0.06)] mb-5 flex flex-col md:flex-row items-center gap-5 md:gap-6">
      {/* Average Rating Score */}
      <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6 shrink-0 min-w-[130px]">
        <span className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-none">
          {numAverageRating > 0 ? numAverageRating.toFixed(1) : "0.0"}
        </span>
        <div className="flex items-center my-1.5 gap-0.5 text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= Math.round(numAverageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {numTotalReviews} đánh giá
        </span>
      </div>

      {/* Star Breakdown Progress Bars */}
      <div className="flex-1 w-full space-y-0.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-foreground">Lọc theo số sao:</span>
          {selectedRating && (
            <button
              onClick={() => onSelectRating(undefined)}
              className="text-[11px] text-piemind-pink hover:text-piemind-pink/80 font-semibold underline cursor-pointer"
            >
              Xem tất cả ({numTotalReviews})
            </button>
          )}
        </div>

        {stars.map((star) => {
          const rawCount = starCounts?.[star as keyof typeof starCounts] ?? (starCounts as any)?.[String(star)] ?? 0;
          const count = Number(rawCount) || 0;
          const percentage = numTotalReviews > 0 ? Math.round((count / numTotalReviews) * 100) : 0;
          const isSelected = selectedRating === star;

          return (
            <button
              key={star}
              onClick={() => onSelectRating(isSelected ? undefined : star)}
              className={`w-full flex items-center gap-2.5 group transition-colors rounded-lg px-1.5 py-1 cursor-pointer ${
                isSelected ? "bg-piemind-pink/10 ring-1 ring-piemind-pink/40" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-1 w-8 shrink-0 text-xs font-medium text-foreground">
                <span>{star}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300 group-hover:bg-amber-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-14 text-right text-[11px] font-medium text-muted-foreground shrink-0">
                {count} ({percentage}%)
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
