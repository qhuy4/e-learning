import { BookOpen, Check, Headphones, Minus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LISTENING_SECTIONS, READING_PASSAGES, readingLocalId } from "../../constants";
import type { IeltsQuestion, ObjectiveModule } from "../../types";
import { QuestionReviewItem } from "./QuestionReviewItem";
import type { ReviewState } from "./QuestionReviewItem";

/** One reviewed question passed in from the result page. */
export interface QuestionReviewEntry {
  question: IeltsQuestion;
  yourAnswer: string;
  state: ReviewState;
  flagged: boolean;
}

interface QuestionReviewListProps {
  items: QuestionReviewEntry[];
}

interface ReviewGroup {
  key: string;
  icon: LucideIcon;
  label: string;
  caption: string;
  entries: QuestionReviewEntry[];
}

const MODULE_META_BY_KEY: Record<ObjectiveModule, { icon: LucideIcon; chip: string }> = {
  listening: { icon: Headphones, chip: "border-sky-200 bg-sky-50 text-sky-700" },
  reading: { icon: BookOpen, chip: "border-amber-200 bg-amber-50 text-amber-700" },
};

const STATE_ORDER: ReviewState[] = ["correct", "wrong", "skipped"];

function groupLabel(question: IeltsQuestion): { label: string; caption: string } {
  if (question.module === "listening") {
    const config =
      LISTENING_SECTIONS.find((s) => s.section === question.group) ?? LISTENING_SECTIONS[0];
    return {
      label: `${config.label} · ${config.title}`,
      caption: `Câu ${config.from}–${config.to} · ${config.typeLabel}`,
    };
  }
  const config = READING_PASSAGES.find((p) => p.passage === question.group) ?? READING_PASSAGES[0];
  return {
    label: config.label,
    caption: `Câu ${readingLocalId(config.from)}–${readingLocalId(config.to)} · ${config.title}`,
  };
}

/** Buckets the entries by module (Listening / Reading) then by section / passage. */
function buildGroups(items: QuestionReviewEntry[]): ReviewGroup[] {
  const buckets = new Map<string, ReviewGroup>();
  items.forEach((entry) => {
    const { module, group } = entry.question;
    const key = `${module}-${group}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.entries.push(entry);
      return;
    }
    const { label, caption } = groupLabel(entry.question);
    buckets.set(key, { key, icon: MODULE_META_BY_KEY[module].icon, label, caption, entries: [entry] });
  });

  return [...buckets.values()].sort((a, b) => {
    const moduleWeight = (group: ReviewGroup) => (group.key.startsWith("listening") ? 0 : 1);
    if (moduleWeight(a) !== moduleWeight(b)) return moduleWeight(a) - moduleWeight(b);
    return a.key.localeCompare(b.key, undefined, { numeric: true });
  });
}

/**
 * "Giải thích chi tiết" — every objective question the candidate took, grouped
 * by Listening section / Reading passage, with the full per-question explanation.
 */
export function QuestionReviewList({ items }: QuestionReviewListProps) {
  const groups = buildGroups(items);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const counts = STATE_ORDER.reduce<Record<ReviewState, number>>(
          (acc, state) => {
            acc[state] = group.entries.filter((entry) => entry.state === state).length;
            return acc;
          },
          { correct: 0, wrong: 0, skipped: 0 },
        );
        const chip = MODULE_META_BY_KEY[group.entries[0].question.module].chip;

        return (
          <section key={group.key}>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${chip}`}>
                  <group.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-foreground">{group.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{group.caption}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  <Check className="size-3" />
                  {counts.correct} đúng
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-700">
                  <X className="size-3" />
                  {counts.wrong} sai
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
                  <Minus className="size-3" />
                  {counts.skipped} bỏ trống
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {group.entries.map((entry) => (
                <QuestionReviewItem
                  key={entry.question.id}
                  question={entry.question}
                  yourAnswer={entry.yourAnswer}
                  state={entry.state}
                  flagged={entry.flagged}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
