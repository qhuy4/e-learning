import { Play, Lock, Clock, FileText, Mic, Video } from "lucide-react";
import { Link } from "react-router";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@fe/components/ui/accordion";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseContentProps {
  course?: CourseDetail;
  isEnrolled?: boolean;
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

export const CourseContent = ({ course, isEnrolled }: CourseContentProps) => {
  const sections = course?.sections || [];

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-8 text-center">
        <p className="text-slate-500">Chưa có nội dung nào.</p>
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
          className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50">
            <div className="flex items-center gap-3 flex-1">
              <span className="w-8 h-8 rounded-full bg-piemind-pink flex items-center justify-center text-white text-sm font-bold shrink-0">
                {sIdx + 1}
              </span>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                {section.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium shrink-0">
                {section.lessons?.length || 0} bài học
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="[&_a]:no-underline [&_a]:hover:no-underline">
            <div className="divide-y divide-slate-50 border-t border-slate-100">
              {section.lessons?.map((lesson, lIdx) => {
                const locked = !isEnrolled && !lesson.isPreview;

                const rowContent = (
                  <>
                    <span className="w-7 h-7 rounded-full bg-m3-surface-container-high flex items-center justify-center text-slate-500 shrink-0">
                      {locked ? (
                        <Lock className="size-3.5" />
                      ) : lesson.isPreview ? (
                        <Play className="size-3.5 text-piemind-pink" />
                      ) : (
                        <span className="text-xs font-bold">{lIdx + 1}</span>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${locked ? "text-slate-400" : "text-slate-800"}`}>
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          {lessonTypeIcon(lesson.type)}
                          {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}
                        </span>
                        {lesson.duration != null && lesson.duration > 0 && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
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

                    {!locked && (
                      <span className="w-8 h-8 rounded-full bg-piemind-pink/10 flex items-center justify-center text-piemind-pink hover:bg-piemind-pink hover:text-white transition-colors shrink-0">
                        <Play className="size-3.5" />
                      </span>
                    )}
                  </>
                );

                const rowClass = `px-6 py-3.5 flex items-center gap-4 transition-colors ${
                  locked ? "opacity-60" : "hover:bg-slate-50 cursor-pointer"
                }`;

                // Bài đã mở (đã đăng ký hoặc cho xem thử) → vào trang xem video.
                return locked ? (
                  <div key={lesson.id} className={rowClass}>
                    {rowContent}
                  </div>
                ) : (
                  <Link
                    key={lesson.id}
                    to={`/learning/${course?.slug}/${lesson.slug}`}
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
    </Accordion>
  );
};
