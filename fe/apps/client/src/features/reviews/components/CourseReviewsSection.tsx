import React, { useState } from "react";
import { Edit3, Lock, MessageSquare } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCourseReviews, useReviewEligibility } from "../hooks/use-reviews";
import { ReviewStatsSummary } from "./ReviewStatsSummary";
import { ReviewList } from "./ReviewList";
import { ReviewFormModal } from "./ReviewFormModal";

interface CourseReviewsSectionProps {
  courseId: string | number;
}

export const CourseReviewsSection: React.FC<CourseReviewsSectionProps> = ({
  courseId,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Fetch reviews list & aggregate stats
  const { data, isLoading } = useCourseReviews(courseId, {
    page,
    limit: 10,
    rating: selectedRating,
    sortOrder,
    hasImage: hasImage || undefined,
  });

  // Check enrollment eligibility
  const { data: eligibilityData } = useReviewEligibility(courseId, isAuthenticated);
  const eligibility = (eligibilityData as any)?.data ?? eligibilityData;

  const resObject = (data as any)?.stats ? data : ((data as any)?.data ?? data);

  const reviews = Array.isArray((resObject as any)?.data)
    ? (resObject as any).data
    : Array.isArray(resObject)
    ? resObject
    : [];

  const stats = (resObject as any)?.stats ?? (data as any)?.stats ?? {
    averageRating: 0,
    totalReviews: 0,
    starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const meta = (resObject as any)?.meta ?? (data as any)?.meta;
  const totalPages = meta?.totalPages || 1;

  const canReview = isAuthenticated && eligibility?.canReview === true;
  const userReview = eligibility?.userReview;

  return (
    <div className="mt-14 pt-10 border-t border-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-indigo-600" />
            Đánh giá từ học viên
          </h2>
          <p className="text-base text-slate-500 mt-2">
            Ý kiến đánh giá trung thực từ các học viên đã tham gia khóa học.
          </p>
        </div>

        {/* Action Button & Enrollment status info */}
        <div>
          {canReview ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-5 h-5" />
              {userReview ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá"}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-xl">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cần mua/đăng ký khóa học để viết đánh giá</span>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Statistics Summary */}
      <ReviewStatsSummary
        stats={stats}
        selectedRating={selectedRating}
        onSelectRating={(r) => {
          setSelectedRating(r);
          setPage(1);
        }}
      />

      {/* Filter Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900 mr-1">Bộ lọc:</span>

          {/* Filter by image option */}
          <button
            onClick={() => {
              setHasImage((prev) => !prev);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              hasImage
                ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <span>Có hình ảnh</span>
          </button>

          {(selectedRating !== undefined || hasImage) && (
            <button
              onClick={() => {
                setSelectedRating(undefined);
                setHasImage(false);
                setPage(1);
              }}
              className="px-3 py-2 text-slate-500 hover:text-rose-600 underline font-semibold cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Sort Order Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Sắp xếp:</span>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "desc" | "asc");
              setPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-14 text-slate-400 font-medium text-base">
          Đang tải đánh giá...
        </div>
      ) : (
        <ReviewList
          reviews={reviews}
          currentUserId={user?.id}
          courseId={courseId}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-9">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-5 py-2.5 text-base font-medium rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-base font-semibold text-slate-700 px-2">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-5 py-2.5 text-base font-medium rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      {isFormOpen && (
        <ReviewFormModal
          courseId={courseId}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          existingReview={userReview}
        />
      )}
    </div>
  );
};
