import { Lock, Sparkles, Unlock } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface PremiumLockCardProps {
  title: string;
  description?: string;
  /** Blurred sample lines shown behind the lock. */
  sample?: string[];
  onUnlock?: () => void;
  compact?: boolean;
}

/** Locked (Premium) content block used on the result page and speaking UI. */
export function PremiumLockCard({
  title,
  description,
  sample = ["Nội dung chi tiết chỉ dành cho tài khoản Premium…"],
  onUnlock,
  compact = false,
}: PremiumLockCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-amber-300/70 bg-gradient-to-br from-card via-card to-amber-50 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Lock className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              {title}
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Premium
              </span>
            </p>
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={onUnlock}>
          <Unlock className="size-3.5" />
          Mở khóa
        </Button>
      </div>

      <div className="pointer-events-none mt-3 select-none space-y-1.5 blur-[3px]" aria-hidden="true">
        {sample.map((line) => (
          <p key={line} className="text-xs leading-relaxed text-muted-foreground">
            {line}
          </p>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
        <Sparkles className="size-3.5" />
        Nâng cấp Premium để xem đầy đủ giải thích, transcript và phản hồi AI.
      </p>
    </div>
  );
}
