import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseDescriptionProps {
  course: CourseDetail;
}

export const CourseDescription = ({ course }: CourseDescriptionProps) => {
  if (!course.description) return null;

  return (
    <div className="bg-white border border-primary/30 rounded-xl p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-3">About this course</h2>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
        {course.description}
      </p>
    </div>
  );
};
