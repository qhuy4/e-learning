import {
  Play,
  Check,
  MonitorSmartphone,
  Clock,
  FileText,
  Award,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { CourseDetail } from "../../types/course.type";

interface CourseSidebarProps {
  course: CourseDetail;
}
export const CourseSidebar = ({ course }: CourseSidebarProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
      {/* Video Thumbnail placeholder */}
      <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-200 group cursor-pointer">
        <img
          src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop"
          alt="Course Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-rose-500 ml-1" />
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium text-sm drop-shadow-md">
          Xem trước khóa học
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl font-bold text-slate-900">{course.price}</span>
        <span className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-1 rounded-full">
          Giảm 50%
        </span>
      </div>
      <div className="text-sm text-slate-400 line-through mb-6">$99.00</div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <Button className="w-full bg-rose-400 hover:bg-rose-500 text-white rounded-full py-6 text-base font-semibold shadow-sm shadow-rose-200">
          Mua ngay
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full py-6 text-base font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Thêm vào giỏ hàng
        </Button>
      </div>

      {/* Features */}
      <h4 className="font-bold text-slate-900 mb-4">Khóa học bao gồm:</h4>
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>38.5 giờ video theo yêu cầu</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>85 tài nguyên tải xuống</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Truy cập trọn đời</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <MonitorSmartphone className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Truy cập trên thiết bị di động và TV</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Award className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Chứng chỉ hoàn thành</span>
        </div>
      </div>

      {/* Corporate Banner */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-center">
        <h4 className="font-bold text-slate-900 mb-1">Đào tạo doanh nghiệp</h4>
        <p className="text-xs text-slate-500 mb-4">
          Cung cấp khóa học này cho đội ngũ của bạn
        </p>
        <a
          href="#"
          className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
        >
          Khám phá E-Learning Business
        </a>
      </div>
    </div>
  );
};
