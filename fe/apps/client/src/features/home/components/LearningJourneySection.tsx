import { ClipboardList, Brain, BookOpen, Users, Video, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: {
  step: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  iconBg: string;
  iconColor: string;
}[] = [
  { step: "Bước 01", icon: ClipboardList, title: "Đánh giá", desc: "Bài kiểm tra thích ứng 10 phút", color: "text-m3-primary", iconBg: "bg-m3-primary-fixed", iconColor: "text-m3-primary" },
  { step: "Bước 02", icon: Brain, title: "Hồ sơ AI", desc: "Phân tích chi tiết từng kỹ năng", color: "text-m3-secondary", iconBg: "bg-m3-secondary-fixed", iconColor: "text-m3-secondary" },
  { step: "Bước 03", icon: BookOpen, title: "Khóa học phù hợp", desc: "Chương trình được cá nhân hóa", color: "text-m3-tertiary", iconBg: "bg-m3-tertiary-fixed", iconColor: "text-m3-tertiary" },
  { step: "Bước 04", icon: Users, title: "Ghép giảng viên", desc: "Huấn luyện viên hợp với bạn", color: "text-m3-secondary", iconBg: "bg-m3-secondary-container", iconColor: "text-m3-on-secondary-container" },
  { step: "Bước 05", icon: Video, title: "Buổi học 1-1", desc: "Luyện hội thoại trực tiếp", color: "text-m3-primary", iconBg: "bg-m3-primary-fixed-dim", iconColor: "text-m3-on-primary-fixed-variant" },
  { step: "Bước 06", icon: Award, title: "Kiểm tra lại", desc: "Theo dõi tiến độ CEFR", color: "text-m3-secondary", iconBg: "bg-m3-secondary-fixed-dim", iconColor: "text-m3-secondary" },
];

export const LearningJourneySection = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface-container-low overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center gap-1">
          <span className="font-label-sm uppercase tracking-wider text-m3-primary font-bold">Toàn bộ hành trình</span>
          <h2 className="font-headline-lg text-m3-on-surface">Hành trình học tập từng bước của bạn</h2>
          <p className="font-body-md text-m3-on-surface-variant">Từ câu hỏi đầu tiên đến cuộc hội thoại trôi chảy, được dẫn dắt từng bước bởi hệ thống red panda của chúng tôi.</p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-m3-primary-container via-m3-secondary to-m3-tertiary transform -translate-y-8 z-0 rounded-full opacity-40" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="bg-m3-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform">
                  <div className={`w-14 h-14 rounded-full ${s.iconBg} flex items-center justify-center ${s.iconColor} shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`font-label-sm ${s.color} font-bold uppercase tracking-wide`}>{s.step}</span>
                  <h4 className="font-headline-sm text-m3-on-surface font-semibold text-sm">{s.title}</h4>
                  <p className="font-body-sm text-m3-on-surface-variant text-xs">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
