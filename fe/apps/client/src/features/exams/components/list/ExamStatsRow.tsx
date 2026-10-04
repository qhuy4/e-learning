import { BookOpenCheck, Clock3, Crown, Sparkles } from "lucide-react";
import type { Exam } from "../../types";

interface ExamStatsRowProps {
  exams: Exam[] | undefined;
}

/** Derived summary tiles — only real data from the exams API. */
export function ExamStatsRow({ exams }: ExamStatsRowProps) {
  const list = exams ?? [];
  const premium = list.filter((e) => e.isPremium).length;
  const free = list.length - premium;
  const minutes = list.reduce((sum, e) => sum + Math.round((e.durationSeconds ?? 0) / 60), 0);

  const tiles = [
    { label: "Tổng số đề", value: String(list.length), icon: BookOpenCheck, tint: "bg-muted text-muted-foreground" },
    { label: "Miễn phí", value: String(free), icon: Sparkles, tint: "bg-muted text-muted-foreground" },
    { label: "Premium", value: String(premium), icon: Crown, tint: "bg-amber-50 text-amber-600" },
    { label: "Tổng thời gian", value: `${minutes} phút`, icon: Clock3, tint: "bg-muted text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tile.tint}`}
          >
            <tile.icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {tile.label}
            </p>
            <p className="truncate text-lg font-extrabold text-foreground">{tile.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
