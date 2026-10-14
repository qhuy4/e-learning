import { Clock, ListChecks, NotebookPen, Sparkles } from "lucide-react";
import type { CueCard as CueCardType } from "../../types";
import { formatClock } from "../../utils";
import { SectionBadge } from "../common/SectionBadge";

interface CueCardProps {
  cue: CueCardType;
  notes: string;
  onNotesChange: (value: string) => void;
}

/** Part 2 cue card: topic, "You should say" bullets, timing and notes area. */
export function CueCard({ cue, notes, onNotesChange }: CueCardProps) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-foreground">Cue Card — Part 2</p>
            <p className="text-[11px] text-muted-foreground">{cue.notePrompt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SectionBadge label={`Chuẩn bị ${formatClock(cue.prepSeconds)}`} tone="sky" />
          <SectionBadge label={`Nói ${formatClock(cue.speakSeconds)}`} tone="primary" />
        </div>
      </div>

      <h3 className="mt-4 text-xl font-extrabold tracking-tight text-foreground">{cue.topic}</h3>

      <p className="mt-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        <ListChecks className="size-4 text-primary" />
        You should say:
      </p>
      <ul className="mt-2 space-y-2">
        {cue.youShouldSay.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            {line}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          <NotebookPen className="size-4" />
          Ghi chú trong 1 phút chuẩn bị
        </p>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={5}
          placeholder="key words, examples, tenses…"
          aria-label="Ô ghi chú phần Speaking Part 2"
          className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="size-3.5" />
          Ghi từ khoá, không viết nguyên câu — bạn sẽ nói thay vì đọc.
        </p>
      </div>
    </div>
  );
}
