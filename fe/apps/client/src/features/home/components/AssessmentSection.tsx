import { BadgeCheck, CircleCheck, BookA, Megaphone, Ear, Mic } from "lucide-react";

const skills = [
  { label: "Ngữ pháp", icon: CircleCheck, color: "text-m3-tertiary", percent: 72, barColor: "bg-m3-tertiary-fixed", desc: "Nền tảng cấu trúc vững chắc, các thì phức tạp sử dụng rõ ràng.", highlight: false },
  { label: "Từ vựng", icon: BookA, color: "text-m3-secondary", percent: 81, barColor: "bg-m3-secondary-fixed-dim", desc: "Kho từ vựng thực dụng phong phú cho đời sống và công việc.", highlight: false },
  { label: "Nói", icon: Megaphone, color: "text-m3-primary", percent: 54, barColor: "bg-m3-primary-container", desc: "Hay ngập ngừng, ngắt quãng khi hội thoại tự nhiên.", highlight: true },
  { label: "Nghe", icon: Ear, color: "text-m3-secondary", percent: 68, barColor: "bg-m3-secondary-container", desc: "Hiểu được ý chính trong các đoạn âm thanh nói tốc độ nhanh.", highlight: false },
];

export const AssessmentSection = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface" id="assessment">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-sm uppercase tracking-wider text-m3-primary font-bold">Chẩn đoán chính xác</span>
            <h2 className="font-headline-lg text-m3-on-surface mt-1">Tiếng Anh của bạn, được chúng tôi thấu hiểu.</h2>
            <p className="font-body-md text-m3-on-surface-variant mt-1">Xem bảng phân tích chi tiết mà hệ thống AI của chúng tôi tạo ra sau bài chẩn đoán 10 phút.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-m3-surface-container px-4 py-2 rounded-full self-start md:self-auto">
            <BadgeCheck className="w-[18px] h-[18px] text-m3-secondary" />
            <span className="font-label-md text-m3-on-surface">Phân tích chuẩn CEFR</span>
          </div>
        </div>

        <div className="bg-m3-surface-container-lowest rounded-2xl p-6 lg:p-10 shadow-lg flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-m3-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-m3-surface-container gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-m3-secondary-fixed flex items-center justify-center font-headline-md text-m3-on-secondary-fixed font-bold">AM</div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-headline-sm text-m3-on-surface font-bold">Alex M.</h4>
                  <span className="font-label-sm px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgb(234, 255, 208)", color: "rgb(20, 106, 95)" }}>Đã hoàn thành chẩn đoán</span>
                </div>
                <p className="font-body-sm text-m3-on-surface-variant">Mã hồ sơ: #PIE-8821 • Đánh giá bởi hệ thống Red Panda AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-m3-surface-container-low px-5 py-2.5 rounded-2xl">
              <span className="font-label-md text-m3-on-surface-variant">Trình độ hiện tại:</span>
              <span className="font-headline-sm font-bold bg-m3-primary-container text-m3-on-primary px-3 py-1 rounded-xl">B1 Trung cấp</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.highlight ? "bg-m3-primary-fixed/30 relative shadow-inner" : "bg-m3-surface-container-low"} p-5 rounded-2xl flex flex-col gap-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-label-lg font-semibold flex items-center gap-1.5 ${s.color}`}>
                      <Icon className="w-[18px] h-[18px]" /> {s.label}
                    </span>
                    <span className={`font-headline-sm font-bold ${s.color}`}>{s.percent}%</span>
                  </div>
                  <div className="w-full bg-m3-surface-container-highest rounded-full h-3">
                    <div className={`${s.barColor} h-full rounded-full`} style={{ width: `${s.percent}%` }} />
                  </div>
                  <p className={`font-body-sm ${s.highlight ? "text-m3-on-surface font-medium" : "text-m3-on-surface-variant"}`}>{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border"
            style={{ backgroundColor: "rgba(243, 129, 129, 0.1)", borderColor: "rgba(243, 129, 129, 0.3)" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ backgroundColor: "#F38181" }}>
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-m3-on-surface font-bold">Điểm bạn cần cải thiện nhất: Kỹ năng nói</span>
                  <span className="font-label-sm px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#ffdad8", color: "#9e3f42" }}>Mục tiêu chính</span>
                </div>
                <p className="font-body-md text-m3-on-surface-variant mt-1 max-w-2xl">Dựa trên kết quả đánh giá, PiEMind khuyên bạn nên tập trung vào sự tự tin khi nói và luyện hội thoại cùng các huấn luyện viên trình độ bản địa.</p>
              </div>
            </div>
            <a href="#courses" className="w-full md:w-auto font-label-lg text-white rounded-full px-8 py-3.5 shadow-[0_4px_0_#9e3f42] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all text-center whitespace-nowrap" style={{ backgroundColor: "#F38181" }}>
              Xem lộ trình học của tôi →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
