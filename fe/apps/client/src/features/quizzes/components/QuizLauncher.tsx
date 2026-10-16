import { ArrowRight, ClipboardList, ListChecks, Loader2, Timer } from 'lucide-react';
import { cn } from '@fe/lib/utils';
import type { LessonQuiz } from '../types/quiz.type';

interface QuizLauncherProps {
  /** Danh sách quiz của bài học (undefined = đang tải). */
  quizzes?: LessonQuiz[];
  isLoading?: boolean;
  /** `hero`: thay thế khu vực player (bài học type quiz). `banner`: card nhỏ dưới nav. */
  variant?: 'hero' | 'banner';
  onStart: () => void;
  className?: string;
}

/**
 * Card "mở bài kiểm tra" — bấm vào sẽ mở giao diện quiz RIÊNG toàn màn hình
 * (không nhúng inline nên không phải lướt lên lướt xuống).
 */
export const QuizLauncher = ({
  quizzes,
  isLoading,
  variant = 'banner',
  onStart,
  className,
}: QuizLauncherProps) => {
  const list = quizzes ?? [];
  const totalQuestions = list.reduce((sum, q) => sum + q.questions.length, 0);

  const chips = (
    <>
      {isLoading ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
        </span>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-600">
            <ListChecks className="h-3.5 w-3.5 text-piemind-pink" />
            {list.length} quiz
          </span>
          {totalQuestions > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-600">
              <ClipboardList className="h-3.5 w-3.5 text-piemind-pink" />
              {totalQuestions} câu hỏi
            </span>
          )}
          {list.some((q) => q.timeLimit) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-600">
              <Timer className="h-3.5 w-3.5 text-piemind-pink" />
              Có giới hạn thời gian
            </span>
          )}
        </>
      )}
    </>
  );

  if (variant === 'hero') {
    return (
      <div className="w-full p-4 md:p-6">
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-piemind-pink/25 bg-gradient-to-br from-piemind-pink/10 via-white to-piemind-mint/10 p-6 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)] md:p-10',
            className,
          )}
        >
          {/* Trang trí */}
          <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-piemind-pink/10" />
          <span className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-piemind-mint/15" />

          <div className="relative flex flex-col items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-piemind-pink text-white shadow-[0_8px_24px_rgba(243,129,129,0.35)]">
              <ClipboardList className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-slate-900 md:text-2xl">
              Bài kiểm tra
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500 md:text-base">
              Ở chế độ toàn màn hình — làm bài thoải mái, không cần lướt lên lướt xuống.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{chips}</div>
            <button
              type="button"
              onClick={onStart}
              className="group mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-piemind-pink px-8 text-base font-bold text-white shadow-[0_4px_16px_rgba(243,129,129,0.35)] transition-all hover:bg-piemind-pink/90 hover:shadow-lg hover:shadow-piemind-pink/30"
            >
              Bắt đầu làm bài
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 md:px-6">
      <button
        type="button"
        onClick={onStart}
        className={cn(
          'group flex w-full items-center gap-4 rounded-2xl border border-piemind-pink/25 bg-white p-4 text-left shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all hover:border-piemind-pink/60 hover:shadow-[0_8px_28px_rgba(243,129,129,0.18)] md:p-5',
          className,
        )}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-piemind-pink/10 text-piemind-pink transition-colors group-hover:bg-piemind-pink group-hover:text-white">
          <ClipboardList className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-slate-900 md:text-base">
            Bài kiểm tra
          </span>
          <span className="mt-1 flex flex-wrap gap-1.5">{chips}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors group-hover:border-piemind-pink group-hover:bg-piemind-pink group-hover:text-white sm:inline-flex">
          Làm bài <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
};
