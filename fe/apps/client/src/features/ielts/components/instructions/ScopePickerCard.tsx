import { Check, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IeltsModule } from "../../types";

/** One selectable unit inside a skill — Section / Passage / Task / Part. */
export interface ScopeUnit {
  /** 1-based id (giống id scope trên URL: ?section=1 / ?passage=2 …). */
  id: number;
  /** "Section 1" / "Passage 2" / "Task 1" / "Part 3". */
  label: string;
  /** Mô tả ngắn dưới nhãn (loại đề / tiêu đề). */
  sub: string;
  /** Nhãn cỡ phải ("10 câu", "150+ từ · 20 phút", "6 câu · 4 phút"). */
  hint: string;
}

/** Một dòng kỹ năng của picker (chỉ gồm kỹ năng ĐỀ ĐANG MỞ có). */
export interface ScopeRow {
  module: IeltsModule;
  label: string;
  /** Nhãn tiếng Việt ("Nghe", "Đọc", "Viết", "Nói"). */
  tag: string;
  icon: LucideIcon;
  units: ScopeUnit[];
}

interface ScopePickerCardProps {
  rows: ScopeRow[];
  /** Đã chọn theo từng module — luôn ≥1 đơn vị (bỏ chọn hết sẽ bị chặn). */
  picked: Record<string, number[]>;
  onToggle: (module: IeltsModule, unitId: number) => void;
  onSelectAll: (module: IeltsModule) => void;
  /** "Listening: tất cả · Reading: Passage 1" — tóm tắt những gì sẽ làm. */
  summary: string;
}

/**
 * Chọn phần muốn làm — bản IELTS của TOEIC `ExamSetupCard`.
 *
 * Tick các Section/Passage/Task/Part muốn làm rồi bấm "Bắt đầu thi": phạm vi
 * được đưa vào URL (`?section=1,3` / `?passage=2` …) + context scope, các trang
 * làm bài tự lọc strip / navigator / thanh tiến độ theo scope đó.
 */
export function ScopePickerCard({
  rows,
  picked,
  onToggle,
  onSelectAll,
  summary,
}: ScopePickerCardProps) {
  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SlidersHorizontal className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-foreground">Chọn phần muốn làm</h2>
          <p className="text-xs text-muted-foreground">
            Không cần làm toàn bộ — tick đúng phần bạn muốn luyện (ví dụ chỉ Reading Passage 1),
            phần không tick sẽ không xuất hiện khi làm bài.
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
          Tùy chọn
        </span>
      </div>

      <div className="mt-4 space-y-5">
        {rows.map((row) => {
          const selected = picked[row.module] ?? [];
          const selectedSet = new Set(selected);
          const isAll = selected.length === row.units.length;
          return (
            <div key={row.module}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  <row.icon className="size-3.5" />
                  {row.label} · {row.tag}
                  <span className="font-semibold normal-case tracking-normal text-muted-foreground/80">
                    {row.units.length} {row.module === "writing" ? "task" : row.module === "speaking" ? "part" : row.module === "reading" ? "passage" : "section"}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => onSelectAll(row.module)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    isAll
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {row.units.map((unit) => {
                  const active = selectedSet.has(unit.id);
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => onToggle(row.module, unit.id)}
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-extrabold ${active ? "text-primary" : "text-foreground"}`}
                        >
                          {unit.label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                          {active && <Check className="size-3 shrink-0 text-primary" />}
                          {unit.hint}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {unit.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-primary">
        <SlidersHorizontal className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <strong className="font-extrabold">Sẵn sàng: </strong>
          {summary} — bấm <strong className="font-extrabold">Bắt đầu thi</strong> để vào ngay phần đã
          chọn.
        </span>
      </p>
    </section>
  );
}
