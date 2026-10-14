import { Search } from "lucide-react";
import { Input } from "@fe/components/ui/input";
import type { ExamCategory, ExamSectionTag } from "../../types";

export type ExamListFilter = "ALL" | "FREE" | "PREMIUM";
export type ExamCategoryFilter = "ALL" | ExamCategory;

interface ExamListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: ExamListFilter;
  onFilterChange: (filter: ExamListFilter) => void;
  category: ExamCategoryFilter;
  onCategoryChange: (category: ExamCategoryFilter) => void;
  /** Skill filter — only offered for TOEIC (3 loại) and IELTS (4 loại). */
  section: ExamSectionTag | null;
  onSectionChange: (section: ExamSectionTag | null) => void;
  totalResults: number;
}

const FILTERS: { value: ExamListFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "FREE", label: "Miễn phí" },
  { value: "PREMIUM", label: "Premium" },
];

const CATEGORIES: { value: ExamCategoryFilter; label: string; hint: string }[] = [
  { value: "ALL", label: "Tất cả đề", hint: "Mọi loại đề" },
  { value: "TOEIC", label: "TOEIC", hint: "3 loại: Nghe & Đọc · Viết · Nói" },
  { value: "IELTS", label: "IELTS", hint: "4 kỹ năng: Listening · Reading · Writing · Speaking" },
  { value: "GENERAL", label: "Đề chung", hint: "Đề trắc nghiệm hệ thống" },
];

/** Sub-types inside each module category. */
const SECTION_OPTIONS: Record<"TOEIC" | "IELTS", { value: ExamSectionTag; label: string }[]> = {
  TOEIC: [
    { value: "LR", label: "Nghe & Đọc" },
    { value: "WRITING", label: "Viết" },
    { value: "SPEAKING", label: "Nói" },
  ],
  IELTS: [
    { value: "LISTENING", label: "Listening" },
    { value: "READING", label: "Reading" },
    { value: "WRITING", label: "Writing" },
    { value: "SPEAKING", label: "Speaking" },
  ],
};

/** Page header: title, result count, exam-type tabs, search and quick filters. */
export function ExamListToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  category,
  onCategoryChange,
  section,
  onSectionChange,
  totalResults,
}: ExamListToolbarProps) {
  const sectionOptions =
    category === "TOEIC" || category === "IELTS" ? SECTION_OPTIONS[category] : null;

  return (
    <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Tổng kho đề thi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn loại đề, rồi bấm vào đề để bắt đầu làm bài
            {totalResults > 0 ? ` • ${totalResults} đề phù hợp` : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên đề thi..."
            className="pl-9"
            aria-label="Tìm đề thi"
          />
        </div>
      </div>

      {/* Exam types */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Loại đề
        </span>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onCategoryChange(c.value)}
            title={c.hint}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              category === c.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Skills inside TOEIC (3 loại) / IELTS (4 loại) */}
      {sectionOptions && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Kỹ năng
          </span>
          <button
            type="button"
            onClick={() => onSectionChange(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              section === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          {sectionOptions.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSectionChange(s.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                section === s.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Lọc
        </span>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "border border-primary/40 bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </header>
  );
}
