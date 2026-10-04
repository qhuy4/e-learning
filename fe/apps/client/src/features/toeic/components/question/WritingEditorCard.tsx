import { Image as ImageIcon, Mail, Save } from "lucide-react";
import type { WritingTask } from "../../types";
import { countWords, formatClock } from "../../utils";
import { SectionBadge } from "../common/SectionBadge";

interface WritingEditorCardProps {
  task: WritingTask;
  value: string;
  onChange: (value: string) => void;
  timeLeftSec: number;
  savedAt: number | null;
}

/** Writing task prompt + plain textarea with word/char counters. */
export function WritingEditorCard({ task, value, onChange, timeLeftSec, savedAt }: WritingEditorCardProps) {
  const words = countWords(value);
  const chars = value.length;
  const meetsMin = words >= task.minWords;

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label={`Task ${task.id}/8`} tone="primary" />
            <span className="text-sm font-extrabold text-foreground">{task.title}</span>
            <SectionBadge label={task.type} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Tối thiểu {task.minWords} từ
          </span>
        </div>

        {task.email && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                E-mail cần phản hồi
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground">
              <span className="font-bold text-muted-foreground">From: </span>
              {task.email.from}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-bold text-muted-foreground">Subject: </span>
              {task.email.subject}
            </p>
          </div>
        )}

        {task.hasImage && (
          <div className="mt-4 flex aspect-[16/7] w-full items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted via-muted/60 to-background">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto size-8" />
              <p className="mt-1.5 text-xs font-bold">Ảnh minh họa cho Task {task.id} (demo UI)</p>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-foreground">{task.prompt}</p>

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
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          placeholder="Bắt đầu viết câu trả lời của bạn tại đây..."
          aria-label={`Ô viết Task ${task.id}`}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span>
              <strong className={`text-sm ${meetsMin ? "text-emerald-600" : "text-amber-600"}`}>
                {words}
              </strong>{" "}
              từ
              {!meetsMin && <span className="text-amber-600"> (cần ≥ {task.minWords})</span>}
            </span>
            <span>
              <strong className="text-sm text-foreground">{chars}</strong> ký tự
            </span>
            <span className="inline-flex items-center gap-1">
              <Save className="size-3.5" />
              {savedAt
                ? `Đã lưu ${new Date(savedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                : "Chưa có thay đổi"}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Thời gian Writing còn lại:{" "}
            <strong className="font-mono text-sm text-foreground">{formatClock(timeLeftSec)}</strong>
          </span>
        </div>
      </section>
    </div>
  );
}
