import type { ReactNode } from "react";
import { formatBand } from "../../utils";

export interface BandSkill {
  key: string;
  label: string;
  band: number;
  detail: string;
  icon: ReactNode;
  /** Writing/Speaking bands come from heuristics — label them "Ước tính". */
  estimated?: boolean;
  accent: "sky" | "amber" | "emerald" | "rose";
}

const ACCENTS: Record<BandSkill["accent"], { chip: string; bar: string; text: string }> = {
  sky: { chip: "bg-sky-50 border-sky-200 text-sky-700", bar: "bg-sky-500", text: "text-sky-600" },
  amber: {
    chip: "bg-amber-50 border-amber-200 text-amber-700",
    bar: "bg-amber-500",
    text: "text-amber-600",
  },
  emerald: {
    chip: "bg-emerald-50 border-emerald-200 text-emerald-700",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  },
  rose: { chip: "bg-rose-50 border-rose-200 text-rose-700", bar: "bg-rose-500", text: "text-rose-600" },
};

interface BandScoreCardProps {
  skill: BandSkill;
  /** Overall band used as the reference bar (0–9). */
  overall?: number;
}

/** Single-skill band card (Listening / Reading / Writing / Speaking). */
export function BandScoreCard({ skill, overall }: BandScoreCardProps) {
  const accent = ACCENTS[skill.accent];
  const ratio = Math.min(1, Math.max(0, skill.band / 9));
  const overallRatio = overall ? Math.min(1, Math.max(0, overall / 9)) : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-9 items-center justify-center rounded-lg border ${accent.chip}`}
          >
            {skill.icon}
          </span>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-foreground">{skill.label}</p>
            <p className="text-[11px] text-muted-foreground">{skill.detail}</p>
          </div>
        </div>
        {skill.estimated && (
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Ước tính
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className={`text-4xl font-extrabold tabular-nums tracking-tight ${accent.text}`}>
          {formatBand(skill.band)}
        </span>
        <span className="pb-1.5 text-xs font-bold text-muted-foreground">/ 9.0</span>
      </div>

      <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${ratio * 100}%` }} />
        {overallRatio !== null && (
          <span
            className="absolute top-0 h-full w-0.5 bg-foreground/70"
            style={{ left: `${overallRatio * 100}%` }}
            title={`Overall: ${formatBand(overall ?? 0)}`}
          />
        )}
      </div>
      {overallRatio !== null && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Vạch đen = Overall {formatBand(overall ?? 0)}
        </p>
      )}
    </div>
  );
}
