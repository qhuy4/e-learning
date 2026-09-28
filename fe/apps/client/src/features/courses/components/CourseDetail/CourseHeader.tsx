import { Clock, BookOpen, Award } from "lucide-react";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseHeaderProps {
  course: CourseDetail;
}

export const CourseHeader = ({ course }: CourseHeaderProps) => {
  const totalLessons = course?.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0;
  const totalSections = course?.sections?.length || 0;

  return (
    <section className="bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row gap-8">
      {/* Left: Course Info */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {course?.level && (
            <span className="bg-piemind-green/30 text-m3-secondary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-piemind-mint">
              {course.level}
            </span>
          )}
          {totalSections > 0 && (
            <span className="bg-m3-surface-container-high text-m3-on-surface-variant px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {totalSections} Sections
            </span>
          )}
          {totalLessons > 0 && (
            <span className="bg-m3-surface-container-high text-m3-on-surface-variant px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Clock className="size-3.5" />
              {totalLessons} Lessons
            </span>
          )}
          {course?.statistics?.averageRating > 0 && (
            <span className="bg-m3-tertiary-fixed text-m3-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Award className="size-3.5" />
              {course.statistics.averageRating.toFixed(1)} ★
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {course?.title || "Course Title"}
          </h1>
          <p className="text-slate-600 mt-2">
            {course?.description || "Course description goes here."}
          </p>
        </div>

        {course?.statistics && (
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {course.statistics.studentCount > 0 && (
              <span>{course.statistics.studentCount} students</span>
            )}
            {course.statistics.reviewCount > 0 && (
              <span>{course.statistics.reviewCount} reviews</span>
            )}
          </div>
        )}

        {course?.instructor && (
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
            <img
              className="w-10 h-10 rounded-full object-cover"
              alt={course.instructor.name || "Instructor"}
              src={`https://i.pravatar.cc/150?u=${course.instructor.id}`}
            />
            <div>
              <span className="text-sm font-bold text-slate-900">
                {course.instructor.name || "Instructor"}
              </span>
              {course.instructor.headline && (
                <span className="text-xs text-slate-500 block">
                  {course.instructor.headline}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Course Image */}
      <div className="md:w-80 lg:w-96 shrink-0">
        <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
          {course?.thumbnail ? (
            <img
              className="w-full h-full object-cover"
              alt={course.title || "Course thumbnail"}
              src={course.thumbnail}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              No image
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
