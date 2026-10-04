import { Link } from "react-router";
import { ArrowRight, Clock3, Crown } from "lucide-react";
import type { ExamCategory, ExamListItem, ExamSectionTag } from "../../types";

interface ExamCardProps {
  exam: ExamListItem;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const CATEGORY_STYLE: Record<ExamCategory, { label: string; className: string }> = {
  GENERAL: { label: "Đề chung", className: "border-border bg-muted text-muted-foreground" },
  TOEIC: { label: "TOEIC", className: "border-primary/30 bg-primary/10 text-primary" },
  IELTS: { label: "IELTS", className: "border-sky-200 bg-sky-50 text-sky-700" },
};

/** Skill chip per category — TOEIC (Nghe & Đọc / Viết / Nói) vs IELTS (4 kỹ năng). */
const SECTION_LABELS: Record<ExamCategory, Partial<Record<ExamSectionTag, string>>> = {
  TOEIC: { LR: "Nghe & Đọc", WRITING: "Viết", SPEAKING: "Nói" },
  IELTS: {
    LISTENING: "Listening",
    READING: "Reading",
    WRITING: "Writing",
    SPEAKING: "Speaking",
  },
  GENERAL: {},
};

function sectionLabel(exam: ExamListItem): string | null {
  if (exam.category === "GENERAL" || !exam.skills?.length) return null;
  if (exam.skills.length > 1) return "4 kỹ năng";
  return SECTION_LABELS[exam.category][exam.skills[0]] ?? null;
}

/** One exam in the listing — restrained card, single accent on hover/CTA. */
export function ExamCard({ exam }: ExamCardProps) {
  const minutes = Math.max(1, Math.round((exam.durationSeconds ?? 0) / 60));
  const category = CATEGORY_STYLE[exam.category] ?? CATEGORY_STYLE.GENERAL;
  const section = sectionLabel(exam);
  const href = exam.href ?? `/exams/${exam.id}`;
  const cta = exam.href ? "Làm bài" : "Chi tiết";

  return (
    <Link
      to={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${category.className}`}
          >
            {category.label}
          </span>
          {section && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
              {section}
            </span>
          )}
          {exam.examFormatName && (
            <span
              className="inline-flex items-center max-w-[14rem] truncate rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
              title={exam.examFormatName}
            >
              {exam.examFormatName}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {exam.publishedAt ? formatDate(exam.publishedAt) : ""}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {exam.isPremium ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
            <Crown className="size-3" />
            Premium
          </span>
        ) : (
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
            Miễn phí
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary">
        {exam.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {exam.description || "Đề thi trắc nghiệm trực tuyến."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Clock3 className="size-4" />
          {minutes} phút
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          {cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
