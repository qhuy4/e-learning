import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Eye, Flame, Pencil, Star, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@fe/components/ui/avatar';
import { useNavigate } from 'react-router';
import { ReviewFormModal, useReviewEligibility } from '../../../reviews';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@fe/lib/utils';

interface LearningHeaderProps {
  courseId?: string | number;
  courseTitle: string;
  courseSlug?: string;
  progress?: number;
  /** Tên phần (module) của bài học hiện tại */
  sectionTitle?: string;
  /** Số bài đã hoàn thành / tổng số bài — chỉ có khi đã enroll */
  completedLessons?: number;
  totalLessons?: number;
  /** Tổng thời gian của các bài còn lại (phút) */
  remainingMinutes?: number;
  previewMode?: boolean;
  previewToken?: string;
  editUrl?: string;
}

export const LearningHeader = ({
  courseId,
  courseTitle,
  courseSlug,
  progress = 0,
  sectionTitle,
  completedLessons,
  totalLessons,
  remainingMinutes,
  previewMode,
  previewToken,
  editUrl,
}: LearningHeaderProps) => {
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user } = useAuth();

  const { data: eligibility } = useReviewEligibility(
    courseId || '',
    !!courseId && !previewMode,
  );
  const userReview = eligibility?.userReview;

  const hasProgress = typeof totalLessons === 'number' && totalLessons > 0;
  const isAllDone = hasProgress && typeof completedLessons === 'number' && completedLessons >= totalLessons;

  const userInitials =
    (user?.name || user?.email || 'Học viên')
      .split(/[\s@.]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'HV';

  const chipBase =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap';

  const handleBack = () => {
    if (previewMode && previewToken) {
      navigate(`/courses/preview/${previewToken}`);
    } else if (courseSlug) {
      navigate(`/courses/${courseSlug}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between gap-3 px-4 md:px-6 sticky top-0 z-50">
      {/* Trái: quay lại + breadcrumb khóa học › phần */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={handleBack}
          aria-label={previewMode ? 'Quay lại bản xem trước' : 'Quay lại trang khóa học'}
          className="shrink-0 w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex items-center gap-1.5 text-sm">
          <h1 className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[220px] lg:max-w-xs">
            {courseTitle}
          </h1>
          {sectionTitle && (
            <>
              <span className="text-slate-300 shrink-0" aria-hidden>
                ›
              </span>
              <span className="text-slate-500 truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[260px]">
                {sectionTitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Giữa: thanh tiến độ phiên */}
      {hasProgress && (
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Tiến độ khóa học
          </span>
          <div
            className="w-28 lg:w-44 h-2 rounded-full bg-slate-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-piemind-pink transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-extrabold text-piemind-pink tabular-nums">{progress}%</span>
        </div>
      )}

      {/* Phải: chip thống kê + đánh giá + avatar + đóng */}
      <div className="flex items-center gap-2 shrink-0">
        {hasProgress && (
          <span
            className={cn(
              chipBase,
              'hidden sm:inline-flex border-emerald-200 bg-emerald-50 text-emerald-600',
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedLessons}/{totalLessons} bài
          </span>
        )}
        {hasProgress && typeof remainingMinutes === 'number' && remainingMinutes > 0 && (
          <span className={cn(chipBase, 'hidden lg:inline-flex border-slate-200 bg-slate-50 text-slate-600')}>
            <Clock3 className="w-3.5 h-3.5" />
            còn ~{remainingMinutes} phút
          </span>
        )}
        {isAllDone && (
          <span className={cn(chipBase, 'hidden lg:inline-flex border-piemind-pink/30 bg-piemind-pink/10 text-piemind-pink')}>
            <Flame className="w-3.5 h-3.5" />
            Hoàn thành
          </span>
        )}

        {previewMode ? (
          <>
            <span
              className={cn(
                chipBase,
                'border-amber-200 bg-amber-50 text-amber-700',
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Xem trước
            </span>
            {editUrl && (
              <a
                href={editUrl}
                className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-50"
              >
                <Pencil className="w-3.5 h-3.5" />
                Quay lại chỉnh sửa
              </a>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-600 transition-colors hover:border-piemind-pink hover:text-piemind-pink"
            >
              <Star className="w-3.5 h-3.5" />
              Đánh giá
            </button>

            <Avatar className="hidden sm:flex h-9 w-9 ring-2 ring-white">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.name || 'Người dùng'} />
              <AvatarFallback className="bg-piemind-pink/10 text-piemind-pink text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </>
        )}

        <button
          onClick={handleBack}
          aria-label="Đóng bài học"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {courseId && !previewMode && (
        <ReviewFormModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          courseId={courseId}
          existingReview={userReview ?? undefined}
        />
      )}
    </header>
  );
};
