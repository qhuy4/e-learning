import { Lightbulb, Quote } from "lucide-react";

interface ExplanationCardProps {
  /** Why the correct answer is correct (English exam content). */
  explanation: string;
  /** Listening — transcript snippet. */
  transcript?: string;
  /** Reading — supporting sentence from the passage. */
  evidence?: string;
  title?: string;
}

/**
 * Answer explanation block: reasoning + transcript/evidence evidence line.
 * Rendered on the result page (optionally wrapped by a Premium lock).
 */
export function ExplanationCard({
  explanation,
  transcript,
  evidence,
  title = "Giải thích đáp án",
}: ExplanationCardProps) {
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-700">
        <Lightbulb className="size-3.5" />
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{explanation}</p>

      {transcript && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Quote className="size-3" />
            Transcript
          </p>
          <p className="mt-1 text-sm italic leading-relaxed text-muted-foreground">“{transcript}”</p>
        </div>
      )}

      {evidence && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Quote className="size-3" />
            Evidence in passage
          </p>
          <p className="mt-1 text-sm italic leading-relaxed text-muted-foreground">“{evidence}”</p>
        </div>
      )}
    </div>
  );
}
