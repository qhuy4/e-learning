import { formatVND } from "@fe/lib/utils";
import { Link } from "react-router";
import { useCart } from "@/features/cart/hooks/use-cart";
import type { CourseDetail } from "@/features/courses/types/course.type";

interface CourseSidebarProps {
  course?: CourseDetail;
  isEnrolled?: boolean;
}

export const CourseSidebar = ({ course, isEnrolled }: CourseSidebarProps) => {
  const { addItem, isInCart } = useCart();
  const sections = course?.sections || [];
  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const inCart = course ? isInCart(course.id) : false;

  const addCourseToCart = () => {
    if (!course || !course.instructor) return;
    addItem({
      courseId: course.id,
      instructorId: course.instructor.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      price: course.price,
      instructor: course.instructor,
      statistics: course.statistics,
    });
  };

  return (
    <aside className="flex flex-col gap-6 sticky top-24">
      {/* Course Info Card */}
      <div className="bg-white rounded-xl border border-primary/30 shadow-sm p-5 flex flex-col gap-4">
        <h3 className="text-base font-bold text-slate-900">Course Overview</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-m3-surface-container-low p-3 rounded-lg flex flex-col">
            <span className="text-xs text-slate-500">Sections</span>
            <span className="text-xl font-bold text-slate-900">{sections.length}</span>
          </div>
          <div className="bg-m3-surface-container-low p-3 rounded-lg flex flex-col">
            <span className="text-xs text-slate-500">Lessons</span>
            <span className="text-xl font-bold text-slate-900">{totalLessons}</span>
          </div>
        </div>

        {course?.price != null && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">Price</span>
            <span className="text-lg font-bold text-piemind-pink">
              {formatVND(course.price)}
            </span>
          </div>
        )}

        {isEnrolled ? (
          <Link
            to={`/learning/${course?.slug}`}
            className="w-full py-2.5 px-4 rounded-lg bg-piemind-pink text-white font-bold text-sm hover:bg-piemind-pink/90 transition-colors text-center"
          >
            Continue Learning
          </Link>
        ) : inCart ? (
          <Link
            to="/cart"
            className="w-full py-2.5 px-4 rounded-lg bg-piemind-pink text-white font-bold text-sm hover:bg-piemind-pink/90 transition-colors text-center"
          >
            View Cart
          </Link>
        ) : (
          <button
            type="button"
            onClick={addCourseToCart}
            className="w-full py-2.5 px-4 rounded-lg bg-piemind-pink text-white font-bold text-sm hover:bg-piemind-pink/90 transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
        )}
      </div>

      {/* Instructor */}
      {course?.instructor && (
        <div className="bg-white rounded-xl border border-primary/30 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-base font-bold text-slate-900">Instructor</h3>
          <div className="flex items-center gap-3">
            <img
              className="w-12 h-12 rounded-full object-cover shrink-0"
              alt={course.instructor.name || "Instructor"}
              src={`https://i.pravatar.cc/150?u=${course.instructor.id}`}
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {course.instructor.name || "Instructor"}
              </h4>
              {course.instructor.headline && (
                <p className="text-xs text-slate-500 truncate">
                  {course.instructor.headline}
                </p>
              )}
            </div>
          </div>
          {course.instructor.bio && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {course.instructor.bio}
            </p>
          )}
        </div>
      )}
    </aside>
  );
};
