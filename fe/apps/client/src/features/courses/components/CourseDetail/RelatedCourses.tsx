import { Link } from "react-router";
import { Star, Heart } from "lucide-react";
import { useRelatedCourses } from "../../hooks/use-courses";
import type { CatalogCourse } from "../Catalog/types";

interface RelatedCoursesProps {
  courseSlug: string;
}

export const RelatedCourses = ({ courseSlug }: RelatedCoursesProps) => {
  const { data: courses, isLoading } = useRelatedCourses(courseSlug);

  if (isLoading) {
    return (
      <div className="pt-8 border-t border-slate-200 mt-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Khóa học liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-slate-200 rounded-xl mb-3" />
              <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-1" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) return null;

  const formatPrice = (price: number) =>
    price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`;

  return (
    <div className="pt-8 border-t border-slate-200 mt-12">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Khóa học liên quan</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course: CatalogCourse) => (
          <Link
            key={course.id}
            to={`/courses/${course.slug}`}
            className="group cursor-pointer"
          >
            <div className="relative rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-slate-100">
              <img
                src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop"}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => e.preventDefault()}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-colors"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {course.avgRating > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-2 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{course.avgRating}</span>
                <span className="text-slate-400 font-normal">({course.reviewCount})</span>
              </div>
            )}

            <h3 className="font-bold text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors">
              {course.title}
            </h3>

            <div className="text-xs text-slate-500 mb-2">
              {course.instructorName}
            </div>

            <div className="font-bold text-rose-500">
              {formatPrice(course.price)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
