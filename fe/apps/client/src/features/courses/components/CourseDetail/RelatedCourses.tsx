import { Link } from "react-router";
import { BookOpen, Star, Heart } from "lucide-react";
import { useRelatedCourses } from "@/features/courses/hooks/use-courses";
import { formatVND } from "@fe/lib/utils";
import type { CatalogCourse } from "../Catalog/types";

interface RelatedCoursesProps {
  courseSlug: string;
}

export const RelatedCourses = ({ courseSlug }: RelatedCoursesProps) => {
  const { data: courses, isLoading } = useRelatedCourses(courseSlug);

  if (isLoading) {
    return (
      <div className="pt-8 border-t border-slate-200 mt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Khóa học liên quan</h2>
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

  return (
    <div className="pt-8 border-t border-slate-200 mt-6">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Khóa học liên quan</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course: CatalogCourse) => (
          <Link
            key={course.id}
            to={`/courses/${course.slug}`}
            className="group bg-white rounded-xl border border-primary/30 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
          >
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <button
                onClick={(e) => e.preventDefault()}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-400 hover:text-piemind-pink hover:bg-white transition-colors"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {course.avgRating > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-2 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{course.avgRating}</span>
                  <span className="text-slate-400 font-normal">({course.reviewCount})</span>
                </div>
              )}

              <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-piemind-pink transition-colors">
                {course.title}
              </h3>

              <div className="text-xs text-slate-500 mb-2">
                {course.instructorName}
              </div>

              <div className="font-bold text-sm text-piemind-pink">
                {formatVND(course.price)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
