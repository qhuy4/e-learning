import { Clock } from "lucide-react";

const courses = [
  {
    title: "Tự tin khi nói",
    level: "B1 → B2",
    lessons: 8,
    description:
      "Chinh phục cách chuyển lời tự nhiên, thành ngữ hằng ngày và giọng điệu để phá bỏ sự ngập ngừng khi giao tiếp thực tế.",
    focus: "Tập trung luyện nói",
    levelLabel: "Trung cấp",
    duration: "3 tuần",
    featured: true,
    badge: "Lựa chọn hàng đầu cho B1",
  },
  {
    title: "Nền tảng ngữ pháp",
    level: "A2 → B1",
    lessons: 10,
    description:
      "Làm rõ cấu trúc câu điều kiện, câu bị động và giới từ phức tạp qua các trò giải đố câu chuyện trực quan, tương tác.",
    focus: "Tập trung ngữ pháp",
    levelLabel: "Sơ cấp+",
    duration: "4 tuần",
    featured: false,
  },
  {
    title: "Tiếng Anh hằng ngày",
    level: "B1",
    lessons: 12,
    description:
      "Chuẩn bị cho các tình huống thực tế đời thường: chuyện phiếm nơi công sở, gọi món ở quán cà phê, hỏi đường khi du lịch và kết nối bạn bè.",
    focus: "Từ vựng + Lưu loát",
    levelLabel: "Đời thực",
    duration: "5 tuần",
    featured: false,
  },
];

export const RecommendedCourses = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface" id="courses">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-sm uppercase tracking-wider text-m3-secondary bg-m3-secondary-container/60 px-3 py-1 rounded-full font-bold">
              Lộ trình thiết kế riêng
            </span>
            <h2 className="font-headline-lg text-m3-on-surface mt-2">
              Lộ trình học được tạo ra cho bạn.
            </h2>
            <p className="font-body-md text-m3-on-surface-variant mt-1">
              Chương trình được tuyển chọn, tự động điều chỉnh theo kết quả kiểm tra xếp lớp của bạn.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-m3-secondary-fixed/50 px-3 py-1.5 rounded-full self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-m3-secondary" />
            <span className="font-label-sm text-m3-on-surface font-bold">Đồng bộ với bài chẩn đoán</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((c) => (
            <div
              key={c.title}
              className={`bg-m3-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6 relative ${
                c.featured ? "border-2 border-m3-primary-container" : "border border-m3-outline-variant/50"
              }`}
            >
              {c.badge && (
                <div className="absolute -top-3 right-6 bg-m3-primary-container text-m3-on-primary text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                  {c.badge}
                </div>
              )}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm font-bold text-m3-on-surface bg-m3-surface-container-high px-2.5 py-0.5 rounded-md">
                    Trình độ: {c.level}
                  </span>
                  <span className="font-label-sm text-m3-on-surface-variant flex items-center gap-1">
                    <Clock className="w-[15px] h-[15px]" />
                    {c.lessons} bài học
                  </span>
                </div>
                <h3 className="font-headline-sm text-m3-on-surface font-bold">{c.title}</h3>
                <p className="font-body-sm text-m3-on-surface-variant leading-relaxed">
                  {c.description}
                </p>
                <div className="flex items-center gap-2 pt-1 font-label-sm text-m3-on-surface-variant">
                  <span className="font-bold text-m3-primary">{c.focus}</span>
                  <span>·</span>
                  <span>{c.levelLabel}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-m3-outline-variant/30">
                <div className="flex flex-col">
                  <span className="font-label-sm text-m3-on-surface-variant font-medium">Thời lượng</span>
                  <span className="font-label-md font-bold text-m3-on-surface">{c.duration}</span>
                </div>
                <button
                  className={`font-label-md px-5 py-2.5 rounded-full transition-all ${
                    c.featured
                      ? "bg-m3-primary-container text-m3-on-primary hover:brightness-110 shadow-sm"
                      : "bg-m3-surface-container text-m3-on-surface hover:bg-m3-primary-container hover:text-m3-on-primary"
                  }`}
                >
                  {c.featured ? "Bắt đầu khóa học" : "Khám phá"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
