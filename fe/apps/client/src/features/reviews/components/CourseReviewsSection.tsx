import React, { useState } from "react";
import { Edit3, Lock, MessageSquare } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCourseReviews, useReviewEligibility } from "../hooks/use-reviews";
import { ReviewStatsSummary } from "./ReviewStatsSummary";
import { ReviewList } from "./ReviewList";
import { ReviewFormModal } from "./ReviewFormModal";

interface CourseReviewsSectionProps {
  courseId: string | number;
  isEnrolled?: boolean;
}

export const CourseReviewsSection: React.FC<CourseReviewsSectionProps> = ({
  courseId,
  isEnrolled = false,
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
  const { data: eligibilityData } = useReviewEligibility(courseId, isAuthenticated && isEnrolled);
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

  const canReview = isEnrolled && isAuthenticated && eligibility?.canReview === true;
  const userReview = eligibility?.userReview;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-piemind-pink" />
            Đánh giá từ học viên
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ý kiến đánh giá trung thực từ các học viên đã tham gia khóa học.
          </p>
        </div>

        {/* Action Button & Enrollment status info */}
        <div>
          {canReview ? (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-5 py-2.5 bg-piemind-pink hover:bg-piemind-pink/90 text-white font-bold text-sm rounded-xl shadow-[0_4px_16px_rgba(243,129,129,0.3)] hover:shadow-lg hover:shadow-piemind-pink/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              {userReview ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá"}
            </button>
          ) : isEnrolled ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-piemind-yellow/25 border border-piemind-yellow/60 text-foreground text-sm font-medium rounded-xl">
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Cần mua/đăng ký khóa học để viết đánh giá</span>
            </div>
          ) : null}
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3.5 bg-muted rounded-xl border border-border text-sm font-medium text-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-foreground mr-1">Bộ lọc:</span>

          {/* Filter by image option */}
          <button
            onClick={() => {
              setHasImage((prev) => !prev);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              hasImage
                ? "bg-piemind-pink text-white border-piemind-pink font-bold shadow-xs"
                : "bg-card text-foreground border-input hover:bg-muted"
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
              className="px-3 py-1.5 text-muted-foreground hover:text-piemind-pink underline font-semibold cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Sort Order Selector */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">Sắp xếp:</span>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "desc" | "asc");
              setPage(1);
            }}
            className="px-3 py-1.5 bg-card border border-input rounded-lg text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-piemind-pink/40 cursor-pointer"
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground font-medium text-sm">
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
        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-sm font-semibold text-foreground px-2">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
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
