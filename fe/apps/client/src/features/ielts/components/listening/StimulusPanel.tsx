import { useState } from "react";
import { FileText, Map as MapIcon, MessagesSquare, NotebookPen } from "lucide-react";
import type { StimulusLine, ListeningStimulus } from "../../types";
import { SectionBadge } from "../common/SectionBadge";

interface StimulusPanelProps {
  stimulus: ListeningStimulus;
  answers: Record<number, string>;
  /** Question numbers shown as markers on map / diagram placeholders. */
  markers?: number[];
  onBlankClick?: (questionNum: number) => void;
}

const KIND_ICON = {
  form: FileText,
  map: MapIcon,
  conversation: MessagesSquare,
  notes: NotebookPen,
};

/** Renders a line containing `{{n}}` blanks (form / notes completion). */
function renderLine(
  text: string,
  answers: Record<number, string>,
  onBlankClick?: (n: number) => void,
) {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{\{(\d+)\}\}$/);
    if (!match) return <span key={i}>{part}</span>;
    const num = Number(match[1]);
    const answer = (answers[num] ?? "").trim();
    return (
      <button
        key={i}
        type="button"
        onClick={() => onBlankClick?.(num)}
        title={`Câu ${num} — bấm để nhảy tới`}
        className={`mx-0.5 inline-flex min-w-[120px] items-center justify-center rounded-md border px-2 py-0.5 text-base font-bold transition-colors ${
          answer
            ? "border-primary bg-primary/10 text-foreground"
            : "border-dashed border-primary/60 bg-background text-muted-foreground hover:bg-primary/5"
        }`}
      >
        {answer || `(${num})`}
      </button>
    );
  });
}

function renderLines(
  lines: StimulusLine[] | undefined,
  body: string[],
  answers: Record<number, string>,
  onBlankClick?: (n: number) => void,
) {
  if (lines && lines.length > 0) {
    return (
      <div className="space-y-3">
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
              {line.speaker ?? "Speaker"}
            </span>
            <p className="text-base leading-relaxed text-foreground">{line.text}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {body.map((line, i) => (
        <p key={i} className="text-base leading-relaxed text-foreground">
          {renderLine(line, answers, onBlankClick)}
        </p>
      ))}
    </div>
  );
}

/** Left panel of the Listening workspace (form / map / conversation / notes). */
export function StimulusPanel({
  stimulus,
  answers,
  markers = [],
  onBlankClick,
}: StimulusPanelProps) {
  const Icon = KIND_ICON[stimulus.kind];
  const [imgFailed, setImgFailed] = useState(false);
  const showFigure = stimulus.kind === "map" || Boolean(stimulus.figureUrl && !imgFailed);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-foreground">{stimulus.title}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">
              {stimulus.kind === "form"
                ? "Form completion — điền vào ô trống"
                : stimulus.kind === "notes"
                  ? "Note completion — điền vào bản ghi"
                  : stimulus.kind === "map"
                    ? "Map / diagram labeling"
                    : "Conversation — multiple speakers"}
            </p>
          </div>
        </div>
        <SectionBadge label={`Section ${stimulus.section}`} tone="primary" />
      </div>

      <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm leading-relaxed text-sky-800">
        {stimulus.instruction}
      </p>

      {showFigure && (
        <div className="mb-4">
          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted via-muted/60 to-background">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {stimulus.figureUrl && !imgFailed ? (
              <img
                src={stimulus.figureUrl}
                alt={stimulus.figureCaption ?? stimulus.title}
                loading="lazy"
                onError={() => setImgFailed(true)}
                className="relative h-full w-full object-contain"
              />
            ) : (
              <div className="relative text-center text-muted-foreground">
                <MapIcon className="mx-auto size-8" />
                <p className="mt-1 text-xs font-bold">
                  {stimulus.figureUrl
                    ? "Không tải được ảnh từ máy chủ"
                    : "Bản đồ / sơ đồ minh họa (chưa có file ảnh)"}
                </p>
              </div>
            )}
            {markers.map((num, i) => {
              const positions = [
                "left-[18%] top-[24%]",
                "left-[62%] top-[18%]",
                "left-[30%] top-[68%]",
                "left-[74%] top-[64%]",
                "left-[48%] top-[44%]",
                "left-[12%] top-[82%]",
              ];
              return (
                <span
                  key={num}
                  className={`absolute ${positions[i % positions.length]} flex size-7 items-center justify-center rounded-full border-2 border-primary bg-card text-xs font-extrabold text-primary shadow-sm`}
                >
                  {num}
                </span>
              );
            })}
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            {stimulus.figureCaption ?? stimulus.title}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        {renderLines(stimulus.lines, stimulus.body, answers, onBlankClick)}
      </div>

      {stimulus.kind === "conversation" && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Gợi ý: đây chỉ là tóm tắt người nói — chi tiết nằm trong audio, hãy nghe kỹ trước khi
          trả lời.
        </p>
      )}
    </section>
  );
}
