import { Link } from "react-router";
import type { CatalogCourse } from "./types";

const levelLabels: Record<number, string> = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Nâng cao",
};

const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
};

interface CourseCardProps {
  course: CatalogCourse;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-card transition-all duration-300 shadow-soft"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <img
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={course.thumbnail}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-5xl">play_lesson</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded text-xs font-bold text-slate-800 uppercase tracking-wider shadow-sm">
          {levelLabels[course.level] || "Cơ bản"}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#FCE38A] text-[18px] fill-current">star</span>
          <span className="text-sm font-bold text-slate-900">{course.avgRating}</span>
          <span className="text-sm text-slate-400">
            ({course.reviewCount.toLocaleString()} đánh giá)
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-[#95E1D3] transition-colors">
          {course.title}
        </h3>

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-3">
            {course.instructorAvatar ? (
              <img
                alt={course.instructorName || ""}
                className="size-8 rounded-full object-cover ring-2 ring-white"
                src={course.instructorAvatar}
              />
            ) : (
              <div className="size-8 rounded-full bg-rose-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                {course.instructorName?.[0] || "G"}
              </div>
            )}
            <span className="text-sm font-medium text-slate-500">
              {course.instructorName || "Giảng viên"}
            </span>
          </div>
          <span
            className={`text-lg font-bold ${
              course.price === 0 ? "text-emerald-500" : "text-[#F38181]"
            }`}
          >
            {formatPrice(course.price)}
          </span>
        </div>
      </div>
    </Link>
  );
};
