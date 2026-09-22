import { Play, Lock, Clock, FileText, Mic, Video } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@fe/components/ui/accordion";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseContentProps {
  course?: CourseDetail;
  isEnrolled?: boolean;
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
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
      <div className="bg-white rounded-xl border border-primary/30 shadow-sm p-8 text-center">
        <p className="text-slate-500">No content available yet.</p>
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
          className="bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden"
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
                {section.lessons?.length || 0} lessons
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="divide-y divide-slate-50 border-t border-slate-100">
              {section.lessons?.map((lesson, lIdx) => {
                const locked = !isEnrolled && !lesson.isPreview;
                return (
                  <div
                    key={lesson.id}
                    className={`px-6 py-3.5 flex items-center gap-4 transition-colors ${
                      locked
                        ? "opacity-60"
                        : "hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
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
                          {lesson.type}
                        </span>
                        {lesson.duration != null && lesson.duration > 0 && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                        {lesson.isPreview && (
                          <span className="text-[10px] font-bold text-piemind-pink bg-piemind-green/30 px-1.5 py-0.5 rounded border border-piemind-mint">
                            Preview
                          </span>
                        )}
                      </div>
                    </div>

                    {!locked && (
                      <button className="w-8 h-8 rounded-full bg-piemind-pink/10 flex items-center justify-center text-piemind-pink hover:bg-piemind-pink hover:text-white transition-colors shrink-0">
                        <Play className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
