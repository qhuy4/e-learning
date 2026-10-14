import { BookOpen, Headphones, Pencil } from "lucide-react";
import { SectionBadge } from "../common/SectionBadge";

const INSTRUCTIONS = [
  {
    icon: Headphones,
    label: "Listening",
    meta: "30 minutes · 4 sections · 40 questions",
    points: [
      "Audio chỉ phát MỘT lần — trả lời trong lúc nghe.",
      "Section 1–2 là chủ đề đời thường, Section 3–4 là học thuật.",
      "Có bảng Section 1–4 ở cột trái để nhảy giữa các section.",
    ],
  },
  {
    icon: BookOpen,
    label: "Reading",
    meta: "60 minutes · 3 passages · 40 questions",
    points: [
      "Không có thời gian chuyển đáp án riêng — làm trực tiếp trên máy.",
      "Bài đọc và câu hỏi nằm ở hai cột, cuộn độc lập.",
      "Có thể tô sáng, gạch chân và đánh dấu đoạn văn khi đọc.",
    ],
  },
  {
    icon: Pencil,
    label: "Writing",
    meta: "60 minutes · Task 1 + Task 2",
    points: [
      "Task 1: tối thiểu 150 từ — khuyến nghị 20 phút.",
      "Task 2: tối thiểu 250 từ — khuyến nghị 40 phút (đếm điểm cao hơn).",
      "Bài được tự động lưu sau mỗi thao tác gõ.",
    ],
  },
];

/** Exam rules / instructions block on the instructions page. */
export function ExamInstructionCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-4" />
          </span>
          <h2 className="text-sm font-extrabold text-foreground">Hướng dẫn làm bài</h2>
        </div>
        <SectionBadge label="3 kỹ năng" tone="primary" />
      </div>

      <div className="mt-4 space-y-4">
        {INSTRUCTIONS.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-card text-primary">
                  <item.icon className="size-4" />
                </span>
                <span className="text-sm font-extrabold text-foreground">{item.label}</span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{item.meta}</span>
            </div>
            <ul className="mt-2.5 space-y-1.5">
              {item.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
