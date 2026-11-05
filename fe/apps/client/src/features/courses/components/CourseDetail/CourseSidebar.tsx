import { formatVND } from "@fe/lib/utils";
import { Link } from "react-router";
import type { CourseDetail } from "@/features/courses/types/course.type";
import { CourseStatus } from "@/features/courses/types/course.enums";

interface CourseSidebarProps {
  course?: CourseDetail;
  isEnrolled?: boolean;
  previewMode?: boolean;
}

export const CourseSidebar = ({
  course,
  isEnrolled,
  previewMode,
}: CourseSidebarProps) => {
  const sections = course?.sections || [];
  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  // Version cũ đã lưu trữ: không hiển thị giá và nút mua nữa
  const isForSale =
    !previewMode &&
    (course?.status == null || course.status === CourseStatus.PUBLISHED);

  return (
    <aside className="flex flex-col gap-6 sticky top-24">
      {/* Course Info Card */}
      <div className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-5 flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-foreground">Tổng quan khóa học</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted border border-border p-3 rounded-xl flex flex-col">
            <span className="text-xs text-muted-foreground">Chương</span>
            <span className="text-xl font-extrabold text-foreground">{sections.length}</span>
          </div>
          <div className="bg-muted border border-border p-3 rounded-xl flex flex-col">
            <span className="text-xs text-muted-foreground">Bài học</span>
            <span className="text-xl font-extrabold text-foreground">{totalLessons}</span>
          </div>
        </div>

        {previewMode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-relaxed text-amber-700">
            Chế độ xem trước: đăng ký, thanh toán và tiến độ học đang bị tắt.
          </div>
        )}

        {!isEnrolled && isForSale && course?.price != null && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Học phí</span>
            <span className="text-lg font-bold text-piemind-pink">
              {formatVND(course.price)}
            </span>
          </div>
        )}

        {isEnrolled ? (
          <Link
            to={`/learning/${course?.slug}`}
            className="w-full py-3 px-4 rounded-xl bg-piemind-pink text-white font-bold text-sm hover:bg-piemind-pink/90 transition-all shadow-[0_4px_16px_rgba(243,129,129,0.3)] hover:shadow-lg hover:shadow-piemind-pink/25 text-center"
          >
            Tiếp tục học
          </Link>
        ) : isForSale ? (
          <Link
            to={`/checkout/${course?.slug}`}
            className="w-full py-3 px-4 rounded-xl bg-piemind-pink text-white font-bold text-sm hover:bg-piemind-pink/90 transition-all shadow-[0_4px_16px_rgba(243,129,129,0.3)] hover:shadow-lg hover:shadow-piemind-pink/25 text-center"
          >
            {Number(course?.price) === 0 ? "Đăng ký miễn phí" : "Mua ngay"}
          </Link>
        ) : null}
      </div>

      {/* Instructor */}
      {course?.instructor && (
        <div className="bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(15,23,42,0.06)] p-5 flex flex-col gap-4">
          <h3 className="text-base font-extrabold text-foreground">Giảng viên</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 rounded-full bg-piemind-pink/10 flex items-center justify-center overflow-hidden">
              <span className="text-sm font-bold text-piemind-pink">
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
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground truncate">
                {course.instructor.name || "Giảng viên"}
              </h4>
              {course.instructor.headline && (
                <p className="text-xs text-muted-foreground truncate">
                  {course.instructor.headline}
                </p>
              )}
            </div>
          </div>
          {course.instructor.bio && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {course.instructor.bio}
            </p>
          )}
        </div>
      )}
    </aside>
  );
};
