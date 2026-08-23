import { Star, Users, PlayCircle, Globe, Mail, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@fe/components/ui/avatar";

export const CourseInstructor = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin giảng viên</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm">
          <AvatarImage src="https://i.pravatar.cc/150?u=bao-anh" />
          <AvatarFallback>BA</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">Bảo Anh</h3>
          <div className="text-rose-500 font-medium text-sm mb-3">Senior Product Designer tại TechDeck</div>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">4.8</span>
              <span>Đánh giá</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="font-semibold text-slate-900">52.124</span>
              <span>Học viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4" />
              <span className="font-semibold text-slate-900">18</span>
              <span>Khóa học</span>
            </div>
          </div>
          
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Với hơn 8 năm kinh nghiệm trong lĩnh vực Product Design. Bảo Anh đã tham gia thiết kế cho nhiều dự án lớn nhỏ trong và ngoài nước. Từ các startup về Edtech cho đến các hệ thống ngân hàng lớn tại Việt Nam. Khóa học này tổng hợp những kinh nghiệm thực tế nhất mà Bảo Anh đúc kết được trong suốt quá trình làm việc.
          </p>
          
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-blue-400 hover:border-blue-200 hover:bg-blue-50 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
              <Link2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
