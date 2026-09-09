import { PlayCircle } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fe/components/ui/accordion";
import { formatDuration } from "@fe/lib/utils";
import type { CourseDetail } from "../../types/course.type";

interface CourseContentProps {
  course?: CourseDetail;
}

export const CourseContent = ({ course }: CourseContentProps) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("previewToken");
  const previewToken = tokenFromUrl || (window.location.pathname.includes('/courses/preview') ? id : null);

  const sections = course?.sections || [];

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
        defaultValue={sections.length > 0 ? [String(sections[0].id)] : []}
        className="space-y-4"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={String(section.id)}
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
                    <Link
                      to={`/learning/${course.slug || course.id}/${lesson.slug}${previewToken ? `?previewToken=${previewToken}` : ''}`}
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50/50 hover:border-emerald-200 border border-transparent transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-sm text-slate-700 group-hover:text-emerald-700 font-medium transition-colors">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {(previewToken || lesson.isPreview) && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            Học thử
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatDuration(lesson.duration || 0)}
                        </span>
                      </div>
                    </Link>
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
