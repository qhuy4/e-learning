import { Mic, PencilLine } from "lucide-react";
import type { SpeakingTask, WritingTask } from "../../types";
import { countWords } from "../../utils";
import { AudioReplay } from "../../../exams/components/AudioReplay";

interface TaskReviewSectionProps {
  /** Task Writing trong phạm vi bài thi (đã lọc theo cấu hình — rỗng nếu không phải mode Writing). */
  writingTasks: WritingTask[];
  drafts: Record<number, string>;
  /** Task Speaking trong phạm vi bài thi (đã lọc theo cấu hình — rỗng nếu không phải mode Speaking). */
  speakingTasks: SpeakingTask[];
  speaking: Record<number, boolean>;
  /** Blob URL bản ghi theo task (chỉ trong phiên — F5 mất file, UI nói trung thực). */
  speakingAudio?: Record<number, string | undefined>;
}

/** Nhận xét dựa trên số từ (Writing) — mô phỏng, không phải chấm điểm thật. */
function writingFeedback(words: number, minWords: number): {
  tone: "empty" | "short" | "ok";
  text: string;
} {
  if (words === 0) {
    return { tone: "empty", text: "Chưa viết đáp án — task này không được tính hoàn thành." };
  }
  if (words < minWords) {
    return {
      tone: "short",
      text: `Đã viết ${words}/${minWords} từ — chưa đạt độ dài yêu cầu, cần phát triển thêm ý và dùng thêm câu nối.`,
    };
  }
  return {
    tone: "ok",
    text: `Đã viết ${words} từ (yêu cầu ${minWords}+) — đạt độ dài, bố cục đạt mức tối thiểu của task.`,
  };
}

const FEEDBACK_TONE: Record<"empty" | "short" | "ok", string> = {
  empty: "border-border bg-muted/40 text-muted-foreground",
  short: "border-amber-200 bg-amber-50 text-amber-800",
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

/** Nhận xét cho từng task Speaking (dựa trên trạng thái ghi âm thật — có phát lại). */
function speakingFeedback(recorded: boolean, responseSec: number): string {
  return recorded
    ? `Đã ghi âm ${responseSec}s — phát lại bản ghi ở trên, bài chờ giáo viên chấm.`
    : "Chưa ghi âm — task được tính chưa hoàn thành.";
}

/**
 * "Giải thích chi tiết — đáp án từng task": mọi task trong phạm vi bài thi đều
 * được xếp chồng trong DOM (KHÔNG tab ẩn nội dung), mỗi khối có `id="task-{n}"`
 * để nút "Xem chi tiết" cuộn mượt tới — kèm bản nháp / bản ghi Speaking
 * (phát lại được) và nhận xét từng loại.
 */
export function TaskReviewSection({
  writingTasks,
  drafts,
  speakingTasks,
  speaking,
  speakingAudio = {},
}: TaskReviewSectionProps) {
  const hasWriting = writingTasks.length > 0;
  const hasSpeaking = speakingTasks.length > 0;

  if (!hasWriting && !hasSpeaking) return null;

  const writingDone = writingTasks.filter((t) => (drafts[t.id] ?? "").trim().length > 0).length;
  const speakingDone = speakingTasks.filter((t) => speaking[t.id]).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {hasWriting ? <PencilLine className="size-4" /> : <Mic className="size-4" />}
        </span>
        <div>
          <h2 className="text-base font-extrabold text-foreground">
            Giải thích chi tiết — đáp án từng task
          </h2>
          <p className="text-xs text-muted-foreground">
            {hasWriting && hasSpeaking
              ? `Đầy đủ task trong phạm vi bài thi: Writing ${writingDone}/${writingTasks.length} task đã viết, Speaking ${speakingDone}/${speakingTasks.length} task đã ghi âm.`
              : hasWriting
                ? `${writingTasks.length} task Writing trong phạm vi bài thi: bản nháp, số từ và nhận xét mô phỏng từng task.`
                : `${speakingTasks.length} task Speaking trong phạm vi bài thi: nghe lại bản ghi và trạng thái từng task.`}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {writingTasks.map((task) => {
          const draft = (drafts[task.id] ?? "").trim();
          const words = countWords(draft);
          const feedback = writingFeedback(words, task.minWords);
          return (
            <article
              key={task.id}
              id={`task-${task.id}`}
              className="scroll-mt-24 rounded-xl border border-border bg-muted/30 p-4"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-extrabold text-background">
                    {task.id}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Writing · {task.type}
                  </span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {words} / {task.minWords}+ từ
                </span>
              </header>

              <p className="mt-2 text-sm font-bold text-foreground">{task.title}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {task.prompt}
              </p>

              <div className="mt-3 rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Bài làm của bạn
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {draft || "— Chưa viết gì cho task này —"}
                </p>
              </div>

              <p
                className={`mt-3 rounded-lg border px-3 py-2 text-xs font-semibold ${FEEDBACK_TONE[feedback.tone]}`}
              >
                {feedback.text}
              </p>
            </article>
          );
        })}

        {speakingTasks.map((task) => {
          const recorded = Boolean(speaking[task.id]);
          return (
            <article
              key={task.id}
              id={`task-${task.id}`}
              className="scroll-mt-24 rounded-xl border border-border bg-muted/30 p-4"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-extrabold text-background">
                    {task.id}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Speaking · {task.group}
                  </span>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                    recorded
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {recorded ? "Đã ghi âm" : "Chưa ghi âm"}
                </span>
              </header>

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {task.prompt}
              </p>
              {task.text && (
                <p className="mt-2 rounded-xl border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
                  {task.text}
                </p>
              )}
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                Chuẩn bị {task.prepSec}s · Trả lời {task.responseSec}s
              </p>

              {recorded && (
                <div className="mt-3">
                  <AudioReplay src={speakingAudio[task.id]} title="Nghe lại câu trả lời của bạn" />
                </div>
              )}

              <p
                className={`mt-3 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  recorded ? FEEDBACK_TONE.ok : FEEDBACK_TONE.short
                }`}
              >
                {speakingFeedback(recorded, task.responseSec)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
