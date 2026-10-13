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
    <div className="bg-slate-50 rounded-2xl p-8 md:p-10 border border-slate-200 mb-10 flex flex-col md:flex-row items-center gap-10">
      {/* Average Rating Score */}
      <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-10 shrink-0 min-w-[220px]">
        <span className="text-7xl font-extrabold text-slate-900 tracking-tight">
          {numAverageRating > 0 ? numAverageRating.toFixed(1) : "0.0"}
        </span>
        <div className="flex items-center my-3 gap-1 text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-7 h-7 ${
                star <= Math.round(numAverageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-medium text-slate-500">
          {numTotalReviews} đánh giá
        </span>
      </div>

      {/* Star Breakdown Progress Bars */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-base font-semibold text-slate-700">Lọc theo số sao:</span>
          {selectedRating && (
            <button
              onClick={() => onSelectRating(undefined)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
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
              className={`w-full flex items-center gap-4 group transition-colors rounded-lg p-2 cursor-pointer ${
                isSelected ? "bg-amber-100/60 ring-1 ring-amber-400" : "hover:bg-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-1 w-16 shrink-0 text-base font-medium text-slate-700">
                <span>{star}</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300 group-hover:bg-amber-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-20 text-right text-sm font-medium text-slate-500 shrink-0">
                {count} ({percentage}%)
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
