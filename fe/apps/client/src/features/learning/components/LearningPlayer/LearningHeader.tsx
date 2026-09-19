import { useState } from 'react';
import { ArrowLeft, Bell, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@fe/components/ui/avatar';
import { useNavigate } from 'react-router';
import { ReviewFormModal, useReviewEligibility } from '../../../reviews';

interface LearningHeaderProps {
  courseId?: string | number;
  courseTitle: string;
  courseSlug?: string;
  progress?: number;
}

export const LearningHeader = ({
  courseId,
  courseTitle,
  courseSlug,
  progress = 0,
}: LearningHeaderProps) => {
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { data: eligibility } = useReviewEligibility(courseId || '', !!courseId);
  const userReview = eligibility?.userReview;

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={() => (courseSlug ? navigate(`/courses/${courseSlug}`) : navigate(-1))}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium hidden sm:inline">Quay lại khóa học</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

        <h1 className="font-semibold text-slate-900 text-sm md:text-base lg:text-lg truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
          {courseTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Review Course Button */}
        {courseId && (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl border border-amber-200 transition-colors cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="hidden sm:inline">
              {userReview ? 'Sửa đánh giá' : 'Đánh giá khóa học'}
            </span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Progress
            </span>
            <span className="text-xs font-bold text-emerald-500">{progress}%</span>
          </div>
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button className="relative text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white" />
        </button>

        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src="https://i.pravatar.cc/150?u=user" />
          <AvatarFallback>US</AvatarFallback>
        </Avatar>
      </div>

      {courseId && isReviewModalOpen && (
        <ReviewFormModal
          courseId={courseId}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          existingReview={userReview}
        />
      )}
    </header>
  );
};
