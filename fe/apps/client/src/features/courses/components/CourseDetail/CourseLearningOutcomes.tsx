import { Check } from "lucide-react";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseLearningOutcomesProps {
  course?: CourseDetail;
}

export const CourseLearningOutcomes = ({ course }: CourseLearningOutcomesProps) => {
  const sections = course?.sections || [];
  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);

  const outcomes = [
    course?.level && `Master ${course.level} level English skills`,
    totalLessons > 0 && `Complete ${totalLessons} structured lessons across ${sections.length} sections`,
    course?.instructor?.name && `Learn from ${course.instructor.name}`,
    "Build real-world conversation fluency",
    "Improve pronunciation and natural rhythm",
    "Gain confidence in professional settings",
  ].filter(Boolean) as string[];

  if (outcomes.length === 0) return null;

  return (
    <div className="bg-white border border-primary/30 rounded-xl p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">What you&apos;ll learn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {outcomes.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-piemind-green/30 flex items-center justify-center">
              <Check className="size-3 text-m3-secondary stroke-[3]" />
            </div>
            <span className="text-sm text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
