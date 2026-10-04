/**
 * Exam type layouts — frontend presentation only.
 *
 * The backend keeps ONE shared exam structure (Exam → ExamFormat → Sections).
 * Exam types (TOEIC / IELTS / ...) live in the shared `exam_types` table and
 * only drive presentation here.
 *
 * Adding a future type (JLPT / HSK / TOPIK) = add an entry in this file only —
 * no separate backend module or database structure per exam type.
 */

export type ExamTypeLayoutId = "toeic" | "ielts" | "default";

export const EXAM_TYPE_LAYOUT_LABELS: Record<ExamTypeLayoutId, string> = {
  toeic: "TOEIC",
  ielts: "IELTS",
  default: "Tiêu chuẩn",
};

/** Map a shared ExamType name to a frontend layout. */
export function resolveExamTypeLayout(
  examTypeName: string | null | undefined,
): ExamTypeLayoutId {
  const name = (examTypeName ?? "").trim().toUpperCase();
  if (name.includes("TOEIC")) return "toeic";
  if (name.includes("IELTS")) return "ielts";
  // Future layouts (frontend only):
  // if (name.includes("JLPT")) return "jlpt";
  // if (name.includes("HSK")) return "hsk";
  // if (name.includes("TOPIK")) return "topik";
  return "default";
}

const LAYOUT_STRIP: Record<
  ExamTypeLayoutId,
  { chips: string[]; scale: string } | null
> = {
  toeic: { chips: ["Listening", "Reading"], scale: "Thang điểm 10 – 990" },
  ielts: {
    chips: ["Listening", "Reading", "Writing", "Speaking"],
    scale: "Band 0 – 9",
  },
  default: null,
};

/** Type-specific header strip shown above the exam content. */
export function ExamLayoutStrip({ layoutId }: { layoutId: ExamTypeLayoutId }) {
  const strip = LAYOUT_STRIP[layoutId];
  if (!strip) return null;
  return (
    <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">
        {EXAM_TYPE_LAYOUT_LABELS[layoutId]}
      </span>
      <span className="text-border">·</span>
      {strip.chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border bg-background px-2 py-0.5 text-[11px]"
        >
          {chip}
        </span>
      ))}
      <span className="text-border">·</span>
      <span>{strip.scale}</span>
    </div>
  );
}

const IELTS_MODULE_KEYWORDS: Array<{ keyword: RegExp; label: string }> = [
  { keyword: /listen/i, label: "Listening" },
  { keyword: /read/i, label: "Reading" },
  { keyword: /writ/i, label: "Writing" },
  { keyword: /speak/i, label: "Speaking" },
];

export interface SectionLayoutChip {
  label: string;
  className: string;
}

const TOEIC_CHIP_CLASS =
  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
const IELTS_CHIP_CLASS =
  "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-400";

/** Type-specific chip for a section header (null for the default layout). */
export function sectionLayoutChip(
  layoutId: ExamTypeLayoutId,
  sectionName: string | null | undefined,
  sectionIndex: number,
): SectionLayoutChip | null {
  if (layoutId === "toeic") {
    return { label: `Part ${sectionIndex + 1}`, className: TOEIC_CHIP_CLASS };
  }
  if (layoutId === "ielts") {
    const hit = IELTS_MODULE_KEYWORDS.find((m) =>
      m.keyword.test(sectionName ?? ""),
    );
    return {
      label: hit?.label ?? `Module ${sectionIndex + 1}`,
      className: IELTS_CHIP_CLASS,
    };
  }
  return null;
}
