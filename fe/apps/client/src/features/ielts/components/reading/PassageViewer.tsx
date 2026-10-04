import { useEffect, useState } from "react";
import { Bookmark, Highlighter, Image as ImageIcon, Minus, Plus, RotateCcw } from "lucide-react";
import type { ReadingPassage } from "../../types";
import { HighlightToolbar } from "./HighlightToolbar";

interface PassageViewerProps {
  passage: ReadingPassage;
  /** Jump request from a question card (label + nonce so repeats re-scroll). */
  jumpTo?: { label: string; at: number } | null;
}

interface Mark {
  id: number;
  label: string;
  text: string;
  kind: "highlight" | "underline";
}

interface PendingSelection {
  text: string;
  label: string | null;
}

/** Sơ đồ/hình THẬT từ materials.file_url — file lỗi/không có → placeholder trung thực. */
function FigureImage({ figure }: { figure: NonNullable<ReadingPassage["figure"]> }) {
  const [failed, setFailed] = useState(false);
  if (figure.imageUrl && !failed) {
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <img
          src={figure.imageUrl}
          alt={figure.caption}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-80 w-full bg-muted/40 object-contain"
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-[16/7] w-full items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted via-muted/60 to-background">
      <div className="text-center text-muted-foreground">
        <ImageIcon className="mx-auto size-8" />
        <p className="mt-1 text-xs font-bold">
          {figure.imageUrl
            ? `${figure.kind.toUpperCase()} — không tải được ảnh từ máy chủ`
            : `${figure.kind.toUpperCase()} — chưa có file ảnh minh họa`}
        </p>
      </div>
    </div>
  );
}

/** Splits a paragraph into plain / highlighted / underlined segments. */
function segment(text: string, marks: Mark[]): Array<{ text: string; kind?: Mark["kind"] }> {
  const applicable = marks
    .filter((m) => m.text && text.includes(m.text))
    .sort((a, b) => text.indexOf(a.text) - text.indexOf(b.text));

  const out: Array<{ text: string; kind?: Mark["kind"] }> = [];
  let cursor = 0;
  for (const mark of applicable) {
    const index = text.indexOf(mark.text, cursor);
    if (index < 0) continue;
    if (index > cursor) out.push({ text: text.slice(cursor, index) });
    out.push({ text: mark.text, kind: mark.kind });
    cursor = index + mark.text.length;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out.length > 0 ? out : [{ text }];
}

/** Left Reading panel: passage text with labels, marks, bookmarks and zoom. */
export function PassageViewer({ passage, jumpTo }: PassageViewerProps) {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!jumpTo) return;
    const el = document.getElementById(`para-${jumpTo.label}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [jumpTo]);

  const captureSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    if (!selection || text.length < 2) return;
    let node: Node | null = selection.anchorNode;
    if (node && node.nodeType === 3) node = node.parentElement;
    const host = node instanceof HTMLElement ? node.closest("[data-label]") : null;
    const label = host instanceof HTMLElement ? (host.getAttribute("data-label") ?? null) : null;
    setPending({ text, label });
  };

  const addMark = (kind: Mark["kind"]) => {
    if (!pending) return;
    setMarks((prev) => [
      ...prev.filter((m) => !(m.text === pending.text && m.label === pending.label)),
      { id: Date.now(), label: pending.label ?? "", text: pending.text, kind },
    ]);
    window.getSelection()?.removeAllRanges();
    setPending(null);
  };

  const toggleBookmark = () => {
    if (!pending?.label) return;
    const label = pending.label;
    setBookmarks((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  };

  const clearMarks = () => {
    if (pending) {
      setMarks((prev) => prev.filter((m) => m.text !== pending.text));
      if (pending.label) {
        setBookmarks((prev) => prev.filter((l) => l !== pending.label));
      }
    } else {
      setMarks([]);
      setBookmarks([]);
    }
    window.getSelection()?.removeAllRanges();
    setPending(null);
  };

  // Cỡ chữ nền của bài đọc: 16px (zoom ± bằng nút A−/A+ giữ nguyên).
  const fontSize = Math.round((16 * zoom) / 100);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-foreground">{passage.title}</p>
          <p className="truncate text-[11px] font-semibold text-muted-foreground">{passage.topic}</p>
        </div>
        {/* Static hint so the selection toolbar (Tô sáng / Gạch chân / Bookmark) is discoverable */}
        <span className="hidden items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary md:inline-flex">
          <Highlighter className="size-3.5" />
          Bôi đen chữ trong bài đọc để Tô sáng / Gạch chân
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-1.5 py-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(85, z - 10))}
            disabled={zoom <= 85}
            aria-label="Thu nhỏ chữ"
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-9 text-center text-[11px] font-bold tabular-nums text-foreground">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            disabled={zoom >= 140}
            aria-label="Phóng to chữ"
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            disabled={zoom === 100}
            aria-label="Khôi phục cỡ chữ"
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>

      {/* Scrollable passage */}
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-5 py-4" onMouseUp={captureSelection}>
        <HighlightToolbar
          selectedText={pending?.text ?? null}
          paragraphLabel={pending?.label ?? null}
          bookmarked={pending?.label ? bookmarks.includes(pending.label) : false}
          onHighlight={() => addMark("highlight")}
          onUnderline={() => addMark("underline")}
          onBookmark={toggleBookmark}
          onClear={clearMarks}
          onDismiss={() => setPending(null)}
        />

        <div style={{ fontSize: `${fontSize}px` }}>
          {passage.paragraphs.map((para) => {
            const isBookmarked = bookmarks.includes(para.label);
            return (
              <section
                key={para.label}
                id={`para-${para.label}`}
                data-label={para.label}
                className="mb-4 flex scroll-mt-6 items-start gap-3"
              >
                <span
                  className={`sticky top-1 flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-extrabold ${
                    isBookmarked
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-border bg-muted text-foreground"
                  }`}
                >
                  {para.label}
                  {isBookmarked && <Bookmark className="size-3 fill-amber-400" />}
                </span>
                <p className="leading-7 text-foreground">
                  {segment(para.text, marks.filter((m) => m.label === para.label)).map(
                    (part, i) =>
                      part.kind === "highlight" ? (
                        <mark key={i} className="bg-primary/30 px-0.5">
                          {part.text}
                        </mark>
                      ) : part.kind === "underline" ? (
                        <u key={i} className="decoration-primary decoration-2 underline-offset-4">
                          {part.text}
                        </u>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                  )}
                </p>
              </section>
            );
          })}
        </div>

        {passage.table && (
          <figure className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-sm">
              <caption className="border-b border-border bg-muted/40 px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                {passage.table.caption}
              </caption>
              <thead>
                <tr>
                  {passage.table.headers.map((h) => (
                    <th
                      key={h}
                      className="border-b border-border bg-muted/30 px-3 py-2 text-left text-xs font-extrabold text-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {passage.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border-b border-border px-3 py-2 text-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        )}

        {passage.figure && (
          <figure className="mt-4">
            <FigureImage figure={passage.figure} />
            <figcaption className="mt-1.5 text-center text-[11px] text-muted-foreground">
              {passage.figure.caption}
            </figcaption>
          </figure>
        )}

        {passage.footnote && (
          <p className="mt-4 border-t border-border pt-3 text-[11px] italic text-muted-foreground">
            {passage.footnote}
          </p>
        )}
      </div>
    </div>
  );
}
