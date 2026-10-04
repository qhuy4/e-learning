import { useEffect } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface PremiumUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** CTA copy, e.g. "Nâng cấp để mở khóa". */
  title?: string;
}

const PERKS = [
  "Giải thích chi tiết từng câu + transcript nghe đầy đủ",
  "Đánh giá Writing/Speaking theo 4 tiêu chí IELTS (AI)",
  "Band ước tính chính xác theo bảng quy đổi chính thức",
  "Phân tích điểm mạnh / điểm yếu theo từng Section & Passage",
  "Lưu lịch sử bài làm và so sánh tiến bộ theo tuần",
];

/** Upgrade dialog opened from Premium-locked blocks on the result page. */
export function PremiumUpgradeModal({
  open,
  onClose,
  title = "Nâng cấp IELTS Premium",
}: PremiumUpgradeModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ielts-upgrade-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Sparkles className="size-4" />
            </span>
            <h2 id="ielts-upgrade-title" className="text-lg font-extrabold text-foreground">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Mở khóa toàn bộ báo cáo IELTS: giải thích từng câu, transcript, tiêu chí Writing &
          Speaking và lịch sử bài làm.
        </p>

        <ul className="mt-4 space-y-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-300/70 bg-amber-50 p-3">
          <div>
            <p className="text-xs font-semibold text-amber-700">Gói hàng năm</p>
            <p className="text-lg font-extrabold text-foreground">
              99.000₫ <span className="text-xs font-semibold text-muted-foreground">/ tháng</span>
            </p>
          </div>
          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white">
            −40%
          </span>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Để sau
          </Button>
          <Button className="gap-2" onClick={onClose}>
            <Sparkles className="size-4" />
            Nâng cấp ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
