import {
  Play,
  Check,
  MonitorSmartphone,
  Clock,
  FileText,
  Award,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { formatCurrency } from "@fe/lib/utils";
import type { CourseDetail } from "../../types/course.type";

interface CourseSidebarProps {
  course?: CourseDetail;
}
export const CourseSidebar = ({ course }: CourseSidebarProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("previewToken");
  const previewToken = tokenFromUrl || (window.location.pathname.includes('/courses/preview') ? id : null);

  const firstLesson = course?.sections?.flatMap((s) => s.lessons || [])[0];
  const firstLessonSlug = firstLesson?.slug || '';
  const courseIdentifier = course?.slug || course?.id || id || 'preview';
  
  const previewUrl = firstLessonSlug
    ? `/learning/${courseIdentifier}/${firstLessonSlug}${previewToken ? `?previewToken=${previewToken}` : ''}`
    : `/learning/${courseIdentifier}${previewToken ? `?previewToken=${previewToken}` : ''}`;

  const isFree = Number(course?.price) === 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
      <div
        className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-slate-100 group cursor-pointer block border border-slate-100"
      >
        {course?.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title || "Course Thumbnail"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <span>Chưa có ảnh</span>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-bold text-slate-900">
          {isFree ? "Miễn phí" : formatCurrency(course?.price)}
        </span>
        {!isFree && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            Chất lượng cao
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
        {isFree ? (
          <Button
            onClick={() => navigate(`/checkout/${course?.slug}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-6 text-base font-semibold shadow-sm shadow-emerald-200 cursor-pointer"
          >
            Đăng ký miễn phí
          </Button>
        ) : (
          <Button
            onClick={() => navigate(`/checkout/${course?.slug}`)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-full py-6 text-base font-semibold shadow-sm shadow-rose-200 cursor-pointer"
          >
            Mua ngay
          </Button>
        )}
        <Button
          onClick={() => navigate(previewUrl)}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-full py-6 text-base font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          Xem thử bài học
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
