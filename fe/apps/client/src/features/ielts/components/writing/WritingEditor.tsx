import { useEffect, useRef, useState } from "react";
import {
  ChartColumnIncreasing,
  Check,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { WritingTask } from "../../types";
import { countParagraphs, countWords, formatClock } from "../../utils";
import { SectionBadge } from "../common/SectionBadge";

interface WritingEditorProps {
  task: WritingTask;
  value: string;
  onChange: (value: string) => void;
  timeLeftSec: number;
  savedAt: number | null;
  /** Periodic autosave tick (every few seconds while typing). */
  onAutosave: () => void;
}

/** Writing task prompt + plain textarea with undo/redo, fullscreen, counters. */
export function WritingEditor({
  task,
  value,
  onChange,
  timeLeftSec,
  savedAt,
  onAutosave,
}: WritingEditorProps) {
  const words = countWords(value);
  const chars = value.length;
  const paragraphs = countParagraphs(value);
  const meetsMin = words >= task.minWords;

  const [figFailed, setFigFailed] = useState(false);
  // Đổi task → cho phép thử tải lại ảnh figure của task mới.
  useEffect(() => setFigFailed(false), [task.id]);

  const [focusMode, setFocusMode] = useState(false);
  const past = useRef<string[]>([]);
  const future = useRef<string[]>([]);
  const skip = useRef(false);
  const [historyTick, setHistoryTick] = useState(0);

  // Autosave every few seconds while there is content.
  useEffect(() => {
    if (!value.trim()) return;
    const id = window.setInterval(() => onAutosave(), 4000);
    return () => window.clearInterval(id);
  }, [value, onAutosave]);

  // Reset history when the task changes.
  useEffect(() => {
    past.current = [];
    future.current = [];
    setHistoryTick((t) => t + 1);
  }, [task.id]);

  const handleChange = (next: string) => {
    if (skip.current) {
      skip.current = false;
      onChange(next);
      return;
    }
    past.current.push(value);
    if (past.current.length > 300) past.current.shift();
    future.current = [];
    onChange(next);
    setHistoryTick((t) => t + 1);
  };

  const undo = () => {
    const previous = past.current.pop();
    if (previous === undefined) return;
    future.current.push(value);
    skip.current = true;
    onChange(previous);
    setHistoryTick((t) => t + 1);
  };

  const redo = () => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(value);
    skip.current = true;
    onChange(next);
    setHistoryTick((t) => t + 1);
  };

  const shell = (
    <div
      className={
        focusMode
          ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background p-6"
          : "space-y-4"
      }
    >
      {/* Prompt */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label={task.label} tone="primary" />
            <span className="text-sm font-extrabold text-foreground">{task.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <SectionBadge label={`≥ ${task.minWords} từ`} tone={meetsMin ? "emerald" : "amber"} />
            <SectionBadge label={`~${task.recommendedMinutes} phút`} />
          </div>
        </div>

        {task.figure && (
          <div className="mt-4">
            {task.figure.imageUrl && !figFailed ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={task.figure.imageUrl}
                  alt={task.figure.caption}
                  loading="lazy"
                  onError={() => setFigFailed(true)}
                  className="max-h-80 w-full bg-muted/40 object-contain"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/7] w-full items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted via-muted/60 to-background">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto size-8" />
                  <p className="mt-1 text-xs font-bold uppercase">
                    {task.figure.imageUrl
                      ? `${task.figure.kind} — không tải được ảnh từ máy chủ`
                      : `${task.figure.kind} — chưa có file ảnh minh họa`}
                  </p>
                </div>
              </div>
            )}
            <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
              {task.figure.caption}
            </p>
          </div>
        )}

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {task.prompt}
        </p>

        {task.keywords && task.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {task.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Editor */}
      <section
        className={`flex min-h-0 flex-col rounded-xl border border-border bg-card p-5 shadow-sm ${
          focusMode ? "h-full" : ""
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2" data-history={historyTick}>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={undo}
              disabled={past.current.length === 0}
              title="Hoàn tác (Undo)"
            >
              <Undo2 className="size-3.5" />
              Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={redo}
              disabled={future.current.length === 0}
              title="Làm lại (Redo)"
            >
              <Redo2 className="size-3.5" />
              Redo
            </Button>
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              Không có thanh định dạng — gõ văn bản thuần như thi thật.
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => setFocusMode((f) => !f)}
          >
            {focusMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {focusMode ? "Thoát toàn màn hình" : "Toàn màn hình viết"}
          </Button>
        </div>

        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Bắt đầu viết bài của bạn tại đây…"
          aria-label={`Ô viết ${task.label}`}
          className={`min-h-[280px] w-full flex-1 resize-none rounded-xl border border-border bg-background p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            focusMode ? "min-h-0" : ""
          }`}
        />

        {/* Sticky counters */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ChartColumnIncreasing className="size-3.5 text-primary" />
              <strong className={`text-sm ${meetsMin ? "text-emerald-600" : "text-amber-600"}`}>
                {words}
              </strong>{" "}
              từ
              {!meetsMin && <span className="text-amber-600"> (cần ≥ {task.minWords})</span>}
            </span>
            <span>
              <strong className="text-sm text-foreground">{chars}</strong> ký tự
            </span>
            <span>
              <strong className="text-sm text-foreground">{paragraphs}</strong> đoạn
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Save className="size-3.5" />
              {savedAt
                ? `Tự lưu ${new Date(savedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : "Chưa có thay đổi"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span>
              Khuyến nghị {task.recommendedMinutes} phút · còn lại{" "}
              <strong className="font-mono text-sm text-foreground">
                {formatClock(timeLeftSec)}
              </strong>
            </span>
            {meetsMin && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="size-3.5" />
                Đạt số từ tối thiểu
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  return shell;
}
