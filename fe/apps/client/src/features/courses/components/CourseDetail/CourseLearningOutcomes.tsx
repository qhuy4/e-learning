import { Check } from "lucide-react";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseLearningOutcomesProps {
  course?: CourseDetail;
}

export const CourseLearningOutcomes = ({ course }: CourseLearningOutcomesProps) => {
  const outcomes = course?.benefits ?? [];

  if (outcomes.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <h2 className="text-lg font-extrabold text-foreground mb-4">Bạn sẽ học được gì</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {outcomes.map((item, index) => (
          <div key={index} className="flex items-start gap-3 rounded-xl bg-muted px-3 py-2.5">
            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-piemind-pink/15 flex items-center justify-center">
              <Check className="size-3 text-piemind-pink stroke-[3]" />
            </div>
            <span className="text-sm text-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
