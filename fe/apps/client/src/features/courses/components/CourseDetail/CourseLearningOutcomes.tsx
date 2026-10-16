import { Check } from "lucide-react";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseLearningOutcomesProps {
  course?: CourseDetail;
}

export const CourseLearningOutcomes = ({ course }: CourseLearningOutcomesProps) => {
  const sections = course?.sections || [];
  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);

  const outcomes = [
    course?.level && `Thành thạo kỹ năng tiếng Anh cấp độ ${course.level}`,
    totalLessons > 0 && `Hoàn thành ${totalLessons} bài học có cấu trúc qua ${sections.length} chương`,
    course?.instructor?.name && `Học cùng ${course.instructor.name}`,
    "Phát triển độ trôi chảy trong giao tiếp thực tế",
    "Cải thiện phát âm và nhịp điệu tự nhiên",
    "Tự tin hơn trong môi trường chuyên nghiệp",
  ].filter(Boolean) as string[];

  if (outcomes.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <h2 className="text-lg font-extrabold text-slate-900 mb-4">Bạn sẽ học được gì</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {outcomes.map((item, index) => (
          <div key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-piemind-pink/15 flex items-center justify-center">
              <Check className="size-3 text-piemind-pink stroke-[3]" />
            </div>
            <span className="text-sm text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
