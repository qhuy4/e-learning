import { useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Play,
  Star,
  User,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { Enrollment } from "../services/enrollment.service";
import { ReviewFormModal, useReviewEligibility } from "../../reviews";

interface CourseCardEnrolledProps {
  enrollment: Enrollment;
}

export const CourseCardEnrolled = ({ enrollment }: CourseCardEnrolledProps) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const isCompleted = enrollment.progress >= 100;

  // Query existing review status for this course
  const { data: eligibility } = useReviewEligibility(enrollment.courseId, true);
  const userReview = eligibility?.userReview;

  const progress = Math.min(100, Math.max(0, enrollment.progress));

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-muted-foreground/40 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
          <BookOpen className="w-10 h-10" />
        </div>
        {enrollment.courseThumbnail && (
          <img
            src={enrollment.courseThumbnail}
            alt={enrollment.courseTitle}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Trạng thái */}
        {isCompleted ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-piemind-mint px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn thành
          </span>
        ) : (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-3 py-1 text-[11px] font-bold text-foreground shadow-sm backdrop-blur">
            <Play className="w-3 h-3 fill-current" />
            Đang học
          </span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {enrollment.courseTitle}
          </h3>
          <div className="flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium text-muted-foreground">
              {enrollment.instructorName || "Giảng viên e-Learning"}
            </span>
          </div>
        </div>

        {/* Tiến độ */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Tiến độ học tập</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Meta + hành động */}
        <div className="mt-auto space-y-3 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {enrollment.enrolledAt
                  ? new Date(enrollment.enrolledAt).toLocaleDateString("vi-VN")
                  : "Mới đăng ký"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                userReview
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-border bg-card text-foreground hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              {userReview ? (
                <>
                  <Edit3 className="w-3 h-3 text-amber-500" />
                  Đã đánh giá
                </>
              ) : (
                <>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Đánh giá
                </>
              )}
            </button>
          </div>

          <Link to={`/courses/${enrollment.courseSlug}`} className="block">
            <Button className="h-10 w-full rounded-xl font-semibold">
              <Play className="size-3.5 fill-current" />
              {isCompleted ? "Xem lại" : "Học ngay"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Review Modal Form */}
      {isReviewModalOpen && (
        <ReviewFormModal
          courseId={enrollment.courseId}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          existingReview={userReview}
        />
      )}
    </div>
  );
};
