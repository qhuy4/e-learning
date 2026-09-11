import { Star, Users, Clock, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@fe/components/ui/avatar";
import type { CourseDetail } from "../../types/course.type";

interface CourseHeaderProps {
  course: CourseDetail;
}

export const CourseHeader = ({ course }: CourseHeaderProps) => {
  const instructorName = course?.instructor?.name || "Giảng viên";
  const initials = instructorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updatedAt = course?.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })
    : "";

  return (
    <div className="bg-rose-50/50 pt-8 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
          <span>Trang chủ</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">{course?.title}</span>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {course?.title}
          </h1>
          {course?.description && (
            <p className="text-slate-600 text-lg mb-6 line-clamp-3">
              {course.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-600 mb-6">
            {course?.statistics?.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-900">{course.statistics.averageRating}</span>
                <span>({course.statistics.reviewCount} đánh giá)</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course?.statistics?.studentCount ?? 0} học viên</span>
            </div>
            {updatedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Cập nhật lần cuối: {updatedAt}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>Tiếng Việt</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${course?.instructor?.userId}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs text-slate-500">Giảng viên</div>
              <div className="text-sm font-semibold text-slate-900">
                {instructorName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
