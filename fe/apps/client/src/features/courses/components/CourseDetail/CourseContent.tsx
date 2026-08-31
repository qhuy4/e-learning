import { PlayCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fe/components/ui/accordion";

import type { CourseDetail } from "../../types/course.type";

interface CourseContentProps {
  course?: CourseDetail;
}



export const CourseContent = ({ course }: CourseContentProps) => {
  const sections = course?.sections || [];
console.log(course)
  const totalLessons = sections.reduce(
    (total, section) => total + (section.lessons?.length || 0),
    0,
  );

  const totalDuration = sections.reduce(
    (total, section) =>
      total +
      (section.lessons || []).reduce(
        (lessonTotal, lesson) => lessonTotal + (lesson.duration ?? 0),
        0,
      ),
    0,
  );

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0 phút";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }

    return `${minutes} phút`;
  };

  if (!course) return null;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Nội dung khóa học
      </h2>
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-6 font-medium">
        <span>{sections.length} Chương</span>
        <span>•</span>
        <span>{totalLessons} Bài học</span>
        <span>•</span>
        <span>Thời lượng {formatDuration(totalDuration)}</span>
      </div>

      <Accordion
        defaultValue={sections.length > 0 ? [sections[0].id] : []}
        className="space-y-4"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border border-slate-200 rounded-xl px-4 bg-white"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-slate-900">
                  {section.title}
                </span>
                <span className="text-xs text-slate-500 font-normal mt-1">
                  {section.lessons?.length || 0} bài học
                </span>
              </div>
            </AccordionTrigger>
            {section.lessons && section.lessons.length > 0 && (
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-1">
                  {section.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {lesson.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDuration(lesson.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
