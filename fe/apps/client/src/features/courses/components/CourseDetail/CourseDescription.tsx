import type { Course } from "../../types/course.type";

interface CourseDescriptionProps {
  course: Course;
}


export const CourseDescription = ({course}:CourseDescriptionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Giới thiệu khóa học
      </h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-4">
        <p>
         {course.description}
        </p>
      </div>
    </div>
  );
};
