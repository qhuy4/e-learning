import { Clock, Flag, Headphones, Layers, Lock, Save, Send } from "lucide-react";

const RULES = [
  {
    icon: Layers,
    text: "Ba phần thi riêng biệt: Listening & Reading (200 câu), Writing (8 task) và Speaking (11 task) — Writing/Speaking không chung trang với Listening & Reading.",
  },
  {
    icon: Clock,
    text: "Chọn part và thời gian làm bài ở bước cấu hình — đồng hồ đếm ngược chạy ngay khi bắt đầu, không thể tạm dừng.",
  },
  { icon: Headphones, text: "Mỗi đoạn audio chỉ phát MỘT lần, không tua lại được." },
  { icon: Flag, text: "Dùng nút đánh dấu để review lại câu khó trước khi nộp bài." },
  { icon: Save, text: "Hệ thống tự lưu sau mỗi thao tác — có thể thoát giữa chừng ở chế độ luyện tập." },
  { icon: Send, text: "Sau khi nộp bài, điểm số hiển thị ngay và không thể sửa đáp án." },
  { icon: Lock, text: "Chế độ tối và máy tính bỏ túi bị ẩn theo cấu hình kỳ thi chính thức." },
];

/** Rules / exam instruction card. */
export function ExamInstructionCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Lock className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-foreground">Quy định làm bài</h2>
          <p className="text-xs text-muted-foreground">Đọc kỹ trước khi bắt đầu thi</p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {RULES.map((rule) => (
          <li key={rule.text} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <rule.icon className="size-3.5" />
            </span>
            <span>{rule.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
