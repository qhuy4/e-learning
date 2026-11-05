import { PlayCircle, CheckCircle2, Lock, Circle, ClipboardList, BookOpen } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fe/components/ui/accordion';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { cn } from '@fe/lib/utils';
import type { LearningSection, LearningLesson } from '../../types/learning.type';
import { LOCK_MESSAGES } from '../../utils/lesson-lock';

interface LessonProgressInfo {
  isCompleted: boolean;
  progressPercent: number;
  watchSeconds: number;
}

interface LearningSidebarProps {
  sections: LearningSection[];
  courseSlug: string;
  isEnrolled?: boolean;
  lessonProgressMap?: Map<number, LessonProgressInfo>;
  /** Bài bị khóa theo thứ tự (chưa hoàn thành >= 90% bài đứng trước). */
  lockedLessonIds?: Set<number>;
  /** Bấm vào bài đang khóa → hiện cảnh báo thay vì điều hướng. */
  onLessonClickLocked?: (message: string) => void;
}

const formatDuration = (duration: number | null) => {
  if (!duration) return null;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const lessonIcon = (lesson: LearningLesson) => {
  if (lesson.type === 'quiz') return ClipboardList;
  if (lesson.type === 'video') return PlayCircle;
  return BookOpen;
};

/** Tránh "Phần Phần 1: ..." — chỉ thêm tiền tố khi tiêu đề chưa có số thứ tự. */
export const formatSectionLabel = (index: number, title: string) =>
  /^(phần|module|chương|unit|bài)\s*\d+/i.test(title.trim())
    ? title
    : `Phần ${index + 1}: ${title}`;

export const LearningSidebar = ({
  sections,
  courseSlug,
  isEnrolled,
  lessonProgressMap,
  lockedLessonIds,
  onLessonClickLocked,
}: LearningSidebarProps) => {
  const { lessonSlug } = useParams<{ lessonSlug: string }>();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('previewToken');

  const activeSectionId = sections.find((s) =>
    s.lessons.some((l) => l.slug === lessonSlug)
  )?.id;

  const defaultValues = activeSectionId
    ? [String(activeSectionId)]
    : sections.length > 0
      ? [String(sections[0].id)]
      : [];

  const sectionCompletedCount = (lessons: LearningSection['lessons']) =>
    lessons.filter((l) => lessonProgressMap?.get(Number(l.id))?.isCompleted).length;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      {/* Header kiểu "CURRICULUM PATH" */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Chương trình học
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {sections.length} phần
          </span>
        </div>
        <h2 className="mt-1.5 text-lg font-extrabold text-slate-900">Nội dung khóa học</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <Accordion defaultValue={defaultValues} className="space-y-3">
          {sections.map((section, sectionIndex) => {
            const completed = sectionCompletedCount(section.lessons);
            const total = section.lessons.length;
            const isActiveSection = section.id === activeSectionId;
            const allDone = total > 0 && completed === total;

            return (
              <AccordionItem
                key={section.id}
                value={String(section.id)}
                className="rounded-2xl border border-slate-200 bg-white not-last:border-b data-[active=true]:border-piemind-pink/40 data-[active=true]:shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden"
                data-active={isActiveSection}
              >
                <AccordionTrigger className="hover:no-underline px-4 py-3.5 gap-3">
                  {/* Icon trạng thái phần */}
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      allDone
                        ? 'bg-emerald-50 text-emerald-500'
                        : isActiveSection
                          ? 'bg-piemind-pink/10 text-piemind-pink'
                          : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {allDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isActiveSection ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-piemind-pink" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {formatSectionLabel(sectionIndex, section.title)}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-slate-400">
                      {completed}/{total} bài đã hoàn thành
                    </span>
                  </span>

                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums',
                      allDone
                        ? 'bg-emerald-50 text-emerald-500'
                        : isActiveSection
                          ? 'bg-piemind-pink/10 text-piemind-pink'
                          : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {completed}/{total}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pb-3 [&_a]:no-underline [&_a]:hover:no-underline">
                  <div className="space-y-1.5 px-2">
                    {section.lessons.map((lesson, lessonIndex) => {
                      const info = lessonProgressMap?.get(Number(lesson.id));
                      const isActive = lesson.slug === lessonSlug;
                      // 2 loại khóa: "chưa mua khóa" vs "chưa hoàn thành bài đứng trước".
                      const purchaseLocked = !lesson.isPreview && !previewToken && !isEnrolled;
                      const sequenceLocked =
                        !purchaseLocked && lockedLessonIds?.has(Number(lesson.id)) === true;
                      const lockMessage = purchaseLocked
                        ? LOCK_MESSAGES.notEnrolled
                        : sequenceLocked
                          ? LOCK_MESSAGES.previousIncomplete
                          : null;
                      const isLocked = lockMessage !== null;
                      const Icon = lessonIcon(lesson);
                      const duration = formatDuration(lesson.duration);

                      return (
                        <Link
                          key={lesson.id}
                          to={
                            isLocked
                              ? '#'
                              : `/learning/${courseSlug}/${lesson.slug}${
                                  previewToken ? `?previewToken=${previewToken}` : ''
                                }`
                          }
                          aria-disabled={isLocked}
                          onClick={(e) => {
                            if (lockMessage === null) return;
                            e.preventDefault();
                            onLessonClickLocked?.(lockMessage);
                          }}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                            isActive
                              ? 'border-piemind-pink/50 bg-piemind-pink/[0.06] shadow-[0_4px_14px_rgba(243,129,129,0.15)]'
                              : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                            isLocked && 'cursor-not-allowed opacity-60 hover:border-transparent hover:bg-transparent'
                          )}
                        >
                          {/* Trạng thái */}
                          {info?.isCompleted ? (
                            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                          ) : (
                            <Icon
                              className={cn(
                                'h-4.5 w-4.5 shrink-0',
                                isActive ? 'text-piemind-pink' : 'text-slate-400'
                              )}
                            />
                          )}

                          {/* Số thứ tự */}
                          <span
                            className={cn(
                              'shrink-0 text-[11px] font-extrabold tabular-nums',
                              isActive ? 'text-piemind-pink' : 'text-slate-400'
                            )}
                          >
                            {sectionIndex + 1}.{lessonIndex + 1}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                'block truncate text-[13px]',
                                isActive
                                  ? 'font-bold text-slate-900'
                                  : info?.isCompleted
                                    ? 'font-medium text-slate-500'
                                    : 'font-medium text-slate-700'
                              )}
                            >
                              {lesson.title}
                            </span>
                            {!isActive && info && !info.isCompleted && info.progressPercent > 0 && (
                              <span className="mt-0.5 block text-[10px] font-semibold text-piemind-pink">
                                Đã xem {Math.round(info.progressPercent)}%
                              </span>
                            )}
                          </span>

                          {/* Badge / thời lượng */}
                          {isActive ? (
                            <span className="shrink-0 rounded-full bg-piemind-pink px-2 py-0.5 text-[10px] font-extrabold text-white">
                              Đang học
                            </span>
                          ) : isLocked ? (
                            <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">
                              {purchaseLocked ? 'Mua khóa' : 'Chưa học xong'}
                            </span>
                          ) : duration ? (
                            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-400">
                              {duration}
                            </span>
                          ) : info?.isCompleted ? null : lesson.type === 'quiz' ? (
                            <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">
                              Quiz
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {sections.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Circle className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Chưa có phần học nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
