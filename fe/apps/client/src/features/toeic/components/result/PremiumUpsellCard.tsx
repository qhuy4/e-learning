import { Crown, Lock, Sparkles, Unlock } from "lucide-react";
import { Button } from "@fe/components/ui/button";

const FEATURES = [
  "Chấm điểm Writing theo rubric ETS",
  "Luyện lại bộ câu sai với đề tương đương",
  "Phân tích điểm theo kỹ năng nâng cao",
  "Xuất PDF báo cáo điểm & theo dõi tiến bộ",
  "Gỡ giới hạn số lần làm bài trên mỗi đề",
];

/** Premium upgrade card (locked features on the result page). */
export function PremiumUpsellCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-amber-300/70 bg-gradient-to-br from-card via-card to-amber-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Crown className="size-5" />
          </span>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
              Mở khóa Premium
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                Đang khóa
              </span>
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Giải thích &amp; transcript đã mở miễn phí — Premium thêm chấm Writing, luyện lại
              câu sai và báo cáo PDF.
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Unlock className="size-4" />
          Nâng cấp ngay
        </Button>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-foreground">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Lock className="size-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-amber-500" />
        Thanh toán 1 lần — dùng trọn đời cho mọi đề TOEIC trên PiEMind.
      </p>
    </section>
  );
}
