import { useState } from "react";
import { Play, Lock, Clock, FileText, Mic, Video } from "lucide-react";
import { Link } from "react-router";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@fe/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import { Button } from "@fe/components/ui/button";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseContentProps {
  course?: CourseDetail;
  isEnrolled?: boolean;
  previewMode?: boolean;
  previewToken?: string;
}

/** `duration` từ BE tính bằng giây → hiển thị "X phút" / "Xh Y phút". */
const formatDuration = (seconds: number) => {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return hours
    ? `${hours}h ${remainingMinutes} phút`
    : `${remainingMinutes} phút`;
};

const LESSON_TYPE_LABELS: Record<string, string> = {
  video: "Video",
  audio: "Âm thanh",
  text: "Tài liệu",
  document: "Tài liệu",
  quiz: "Bài kiểm tra",
  live: "Trực tuyến",
};

const lessonTypeIcon = (type: string) => {
  switch (type) {
    case "video": return <Video className="size-4" />;
    case "audio": return <Mic className="size-4" />;
    case "quiz": return <FileText className="size-4" />;
    default: return <Play className="size-4" />;
  }
};

export const CourseContent = ({
  course,
  isEnrolled,
  previewMode,
  previewToken,
}: CourseContentProps) => {
  const sections = course?.sections || [];
  const [lockedLessonTitle, setLockedLessonTitle] = useState<string | null>(null);

  if (sections.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-8 text-center">
        <p className="text-muted-foreground">Chưa có nội dung nào.</p>
      </div>
    );
  }

  return (
    <Accordion
      defaultValue={sections.map((s) => String(s.id))}
      className="flex flex-col gap-3"
    >
      {sections.map((section, sIdx) => (
        <AccordionItem
          key={section.id}
          value={String(section.id)}
          className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3 flex-1">
              <span className="w-8 h-8 rounded-full bg-piemind-pink flex items-center justify-center text-white text-sm font-bold shrink-0">
                {sIdx + 1}
              </span>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-base font-bold text-foreground">{section.title}</h3>
                {section.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {section.lessons?.length || 0} bài học
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="[&_a]:no-underline [&_a]:hover:no-underline">
            <div className="divide-y divide-border/50 border-t border-border">
              {section.lessons?.map((lesson, lIdx) => {
                // Quiz chỉ dành cho học viên đã ghi danh, kể cả khi bài được đánh dấu xem thử.
                const locked = !previewMode && !isEnrolled && (!lesson.isPreview || lesson.type === "quiz");

                const rowContent = (
                  <>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      locked
                        ? "bg-slate-100 text-slate-400"
                        : "bg-m3-surface-container-high text-muted-foreground"
                    }`}>
                      {locked ? (
                        <Lock className="size-3.5" />
                      ) : lesson.isPreview ? (
                        <Play className="size-3.5 text-piemind-pink" />
                      ) : (
                        <span className="text-xs font-bold">{lIdx + 1}</span>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${locked ? "text-muted-foreground" : "text-foreground"}`}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {lessonTypeIcon(lesson.type)}
                          {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}
                        </span>
                        {lesson.duration != null && lesson.duration > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                        {lesson.isPreview && (
                          <span className="text-[10px] font-bold text-piemind-pink bg-piemind-pink/10 px-1.5 py-0.5 rounded-full border border-piemind-pink/25">
                            Xem thử
                          </span>
                        )}
                      </div>
                    </div>

                    {locked ? (
                      <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500">
                        <Lock className="size-3" /> Mở khóa
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-piemind-pink/10 flex items-center justify-center text-piemind-pink hover:bg-piemind-pink hover:text-white transition-colors shrink-0">
                        <Play className="size-3.5" />
                      </span>
                    )}
                  </>
                );

                const rowClass = `px-6 py-3.5 flex items-center gap-4 transition-colors ${
                  locked
                    ? "cursor-pointer bg-slate-50/50 hover:bg-piemind-pink/[0.04] hover:opacity-100"
                    : "hover:bg-muted cursor-pointer"
                }`;

                // Bài đã mở (đã đăng ký hoặc cho xem thử) → vào trang xem video.
                return locked ? (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setLockedLessonTitle(lesson.title)}
                    className={`${rowClass} w-full text-left opacity-75`}
                  >
                    {rowContent}
                  </button>
                ) : (
                  <Link
                    key={lesson.id}
                    to={`/learning/${course?.slug}/${lesson.slug}${
                      previewMode && previewToken
                        ? `?previewToken=${encodeURIComponent(previewToken)}`
                        : ""
                    }`}
                    className={rowClass}
                  >
                    {rowContent}
                  </Link>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}

      <Dialog open={lockedLessonTitle !== null} onOpenChange={(open) => !open && setLockedLessonTitle(null)}>
        <DialogContent className="gap-0 overflow-hidden rounded-3xl border border-slate-200 p-0 shadow-2xl sm:max-w-md" showCloseButton={false}>
          <div className="bg-gradient-to-br from-rose-50 via-white to-slate-50 px-7 pb-7 pt-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-piemind-pink/12 text-piemind-pink ring-1 ring-piemind-pink/15">
              <Lock className="size-6" />
            </span>
            <DialogHeader className="mt-5 gap-2">
              <DialogTitle className="text-xl font-extrabold text-slate-900">Bài học đang được khóa</DialogTitle>
              <DialogDescription className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">
                “{lockedLessonTitle}” thuộc nội dung dành cho học viên đã đăng ký khóa học.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="bg-white px-7 py-5">
            <div className="flex items-start gap-3 rounded-2xl bg-piemind-pink/8 p-3.5 text-left">
              <p className="text-xs font-medium leading-relaxed text-slate-600">
                Bạn vẫn có thể học những bài có nhãn <strong className="text-piemind-pink">Xem thử</strong> miễn phí trước khi đăng ký.
              </p>
            </div>
          </div>
          <DialogFooter className="border-slate-100 bg-slate-50 px-7 py-5 sm:justify-between">
            <DialogClose render={<Button variant="ghost" className="font-semibold" />}>
              Để sau
            </DialogClose>
            <Link
              to={`/checkout/${course?.slug}`}
              className="mb-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-piemind-pink px-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(243,129,129,0.3)] transition hover:bg-piemind-pink/90"
            >
              <Lock className="size-3.5" /> {Number(course?.price) === 0 ? "Đăng ký miễn phí" : "Mở khóa khóa học"}
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Accordion>
  );
};
