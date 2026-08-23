import { Star, Users, Clock, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@fe/components/ui/avatar";
import type { Course } from "../../types/course.type";

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader = ({ course }: CourseHeaderProps) => {
  return (
    <div className="bg-rose-50/50 pt-8 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
          <span>Home</span>
          <span>&gt;</span>
          <span>Design</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">
            UI/UX Design Masterclass
          </span>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {course.title}
          </h1>
          <p className="text-slate-600 text-lg mb-6">
            Học cách thiết kế giao diện người dùng đẹp mắt và trải nghiệm người
            dùng tuyệt vời với công cụ Figma phổ biến nhất hiện nay.
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-600 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">4.5</span>
              <span>(1.500 đánh giá)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>10.500 học viên</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Cập nhật lần cuối: 10/2023</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>Tiếng Việt</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src="https://i.pravatar.cc/150?u=bao-anh" />
              <AvatarFallback>BA</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs text-slate-500">Giảng viên</div>
              <div className="text-sm font-semibold text-slate-900">
                Bảo Anh
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
