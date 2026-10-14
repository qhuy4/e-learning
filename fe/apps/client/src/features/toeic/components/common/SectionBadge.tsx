interface SectionBadgeProps {
  label: string;
  tone?: "primary" | "muted" | "amber";
  className?: string;
}

const TONES: Record<NonNullable<SectionBadgeProps["tone"]>, string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  muted: "border-border bg-muted text-muted-foreground",
  amber: "border-amber-300 bg-amber-50 text-amber-700",
};

/** Small pill used for parts / sections / statuses. */
export function SectionBadge({ label, tone = "muted", className = "" }: SectionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${TONES[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
