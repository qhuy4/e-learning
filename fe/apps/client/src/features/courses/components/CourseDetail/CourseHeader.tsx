import { Clock, BookOpen, Award } from "lucide-react";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseHeaderProps {
  course: CourseDetail;
}

export const CourseHeader = ({ course }: CourseHeaderProps) => {
  const totalLessons = course?.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0;
  const totalSections = course?.sections?.length || 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-6 sm:p-10 flex flex-col md:flex-row gap-8">
      {/* Dải màu tông PieMind */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-piemind-pink via-piemind-mint to-piemind-pink/40" />
      {/* Left: Course Info */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {course?.level && (
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200">
              {course.level}
            </span>
          )}
          {totalSections > 0 && (
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-slate-200">
              <BookOpen className="size-3.5" />
              {totalSections} chương
            </span>
          )}
          {totalLessons > 0 && (
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-slate-200">
              <Clock className="size-3.5" />
              {totalLessons} bài học
            </span>
          )}
          {course?.statistics?.averageRating > 0 && (
            <span className="bg-piemind-pink/10 text-piemind-pink px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-piemind-pink/25">
              <Award className="size-3.5" />
              {course.statistics.averageRating.toFixed(1)} ★
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {course?.title || "Tiêu đề khóa học"}
          </h1>
          <p className="text-slate-600 mt-2">
            {course?.description || "Mô tả khóa học sẽ hiển thị tại đây."}
          </p>
        </div>

        {course?.statistics && (
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {course.statistics.studentCount > 0 && (
              <span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 font-semibold">
                {course.statistics.studentCount} học viên
              </span>
            )}
            {course.statistics.reviewCount > 0 && (
              <span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 font-semibold">
                {course.statistics.reviewCount} đánh giá
              </span>
            )}
          </div>
        )}

        {course?.instructor && (
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
            <div className="relative w-10 h-10 shrink-0 rounded-full bg-piemind-pink/10 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-piemind-pink">
                {(course.instructor.name || "GV")
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
              {course.instructor.avatar && (
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  alt={course.instructor.name || "Giảng viên"}
                  src={course.instructor.avatar}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">
                {course.instructor.name || "Giảng viên"}
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
        <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-gradient-to-br from-slate-50 to-piemind-pink/5">
          {course?.thumbnail ? (
            <img
              className="w-full h-full object-cover"
              alt={course.title || "Ảnh khóa học"}
              src={course.thumbnail}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
              <BookOpen className="size-8 text-piemind-pink/50" />
              <span>Không có ảnh</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
