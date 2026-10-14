import { BookOpen, Headphones, Info, Layers, ListChecks, Mic, Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToeicExam } from "../../contexts/toeic-exam-context";
import { resolveSectionIntro } from "../../mocks/section-intros";
import type { SectionIntroKey } from "../../mocks/section-intros";
import { SectionBadge } from "../common/SectionBadge";

const SECTION_ICONS: Record<SectionIntroKey, LucideIcon> = {
  listening: Headphones,
  reading: BookOpen,
  lr: Layers,
  writing: Pencil,
  speaking: Mic,
};

/**
 * Contextual intro of the exam the candidate is about to take — derived from
 * the live setup config, so it reacts to part / task toggles on the setup card.
 */
export function SectionIntroCard() {
  const { config } = useToeicExam();
  const { intro, stats, scope } = resolveSectionIntro(config);
  const Icon = SECTION_ICONS[intro.key];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              Giới thiệu đề {intro.section}
            </h2>
            <p className="text-xs text-muted-foreground">
              Nội dung bài thi bạn sắp làm — tự cập nhật theo cấu hình ở trên.
            </p>
          </div>
        </div>
        <SectionBadge label={scope} tone="primary" />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{intro.summary}</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-muted/30 px-4 py-3"
          >
            <dt className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-0.5 text-sm font-extrabold text-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="size-3.5" />
            Cấu trúc bài thi
          </p>
          <ol className="space-y-2">
            {intro.format.map((line, index) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-foreground"
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-extrabold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">{line}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <Info className="size-3.5" />
            Lưu ý khi làm bài
          </p>
          <ul className="space-y-2">
            {intro.notes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-2 rounded-lg border border-amber-200/70 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-800"
              >
                <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
