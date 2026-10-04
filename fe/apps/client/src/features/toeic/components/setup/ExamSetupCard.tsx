import { useEffect, useMemo, useState } from "react";
import { Clock, Mic, Pencil, SlidersHorizontal } from "lucide-react";
import { Input } from "@fe/components/ui/input";
import { useToeicExam } from "../../contexts/toeic-exam-context";
import {
  DEFAULT_MODE_MINUTES,
  MODE_LABELS,
  TIME_PRESETS,
  TOEIC_PARTS,
  WRITING_TASK_COUNT,
  effectiveParts,
  effectiveTasks,
  taskCountOf,
} from "../../constants";
import { TIME_PER_PART, TOEIC_WRITING_TASKS } from "../../mocks/exam-mock";
import { SPEAKING_GROUPS } from "../../mocks/speaking-mock";

const LISTENING_PARTS = [1, 2, 3, 4];
const READING_PARTS = [5, 6, 7];

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Setup card: choose the parts/tasks to take and the exam duration (mode comes from the đề). */
export function ExamSetupCard() {
  const { config, setConfig } = useToeicExam();
  const selected = effectiveParts(config.parts);
  const selectedSet = new Set(selected);
  const [custom, setCustom] = useState(String(config.minutes));

  useEffect(() => setCustom(String(config.minutes)), [config.minutes]);

  const questionCount = TOEIC_PARTS.filter((p) => selectedSet.has(p.part)).reduce(
    (sum, p) => sum + (p.to - p.from + 1),
    0,
  );

  // Suggested duration: official per-part timing of the selected parts.
  const suggested =
    config.mode === "lr"
      ? selected.reduce((sum, p) => sum + (TIME_PER_PART[String(p)] ?? 0), 0)
      : DEFAULT_MODE_MINUTES[config.mode];

  const presets = useMemo(() => {
    const base = TIME_PRESETS[config.mode];
    if (config.mode !== "lr") return base;
    return [...new Set([...base, suggested])].sort((a, b) => a - b);
  }, [config.mode, suggested]);

  const sameAs = (parts: number[]) =>
    parts.length === selected.length && parts.every((p) => selectedSet.has(p));

  const togglePart = (part: number) => {
    const next = new Set(selectedSet);
    if (next.has(part)) next.delete(part);
    else next.add(part);
    if (next.size === 0) return; // keep at least one part selected
    const arr = [...next].sort((a, b) => a - b);
    setConfig({ parts: arr.length === TOEIC_PARTS.length ? [] : arr });
  };

  // Writing / Speaking task selection (mode comes from the đề the user opened).
  const taskCount = taskCountOf(config.mode);
  const selectedTaskList = effectiveTasks(config.mode, config.tasks);
  const selectedTaskSet = new Set(selectedTaskList);

  const sameAsTasks = (ids: number[]) =>
    ids.length === selectedTaskList.length && ids.every((id) => selectedTaskSet.has(id));

  const toggleTask = (taskId: number) => {
    const next = new Set(selectedTaskSet);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    if (next.size === 0) return; // keep at least one task selected
    const arr = [...next].sort((a, b) => a - b);
    setConfig({ tasks: arr.length === taskCount ? [] : arr });
  };

  const commitCustom = (raw: string) => {
    setCustom(raw);
    const n = Number(raw);
    if (raw !== "" && Number.isFinite(n) && n >= 1) {
      setConfig({ minutes: Math.min(240, Math.round(n)) });
    }
  };

  const summary =
    config.mode === "lr"
      ? `${selected.length}/7 part · ${questionCount} câu · ${config.minutes} phút`
      : `${selectedTaskList.length}/${taskCount} task · ${config.minutes} phút`;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SlidersHorizontal className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-foreground">Cấu hình bài thi</h2>
          <p className="text-xs text-muted-foreground">
            {config.mode === "lr"
              ? "Chọn các part muốn làm và thời gian — ví dụ chỉ làm Part 2 trong 15 phút."
              : `Đề ${MODE_LABELS[config.mode]} chạy riêng — chọn task muốn làm và thời gian.`}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
          {MODE_LABELS[config.mode]}
        </span>
      </div>

      {/* Tasks (Writing / Speaking) */}
      {(config.mode === "writing" || config.mode === "speaking") && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Chọn task muốn làm
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setConfig({ tasks: [] })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  sameAsTasks(range(1, taskCount))
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Tất cả
              </button>
              {config.mode === "writing" && (
                <>
                  <button
                    type="button"
                    onClick={() => setConfig({ tasks: [1, 2, 3, 4] })}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      sameAsTasks([1, 2, 3, 4])
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Task 1–4
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ tasks: [5, 6, 7, 8] })}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      sameAsTasks([5, 6, 7, 8])
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Task 5–8
                  </button>
                </>
              )}
            </div>
          </div>

          {config.mode === "writing" ? (
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {range(1, WRITING_TASK_COUNT).map((id) => {
                const active = selectedTaskSet.has(id);
                const task = TOEIC_WRITING_TASKS[id - 1];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleTask(id)}
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
                        Task {id}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {task?.minWords ?? 0}+ từ
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {task?.type}
                    </span>
                    <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
                      {task?.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {SPEAKING_GROUPS.map((group) => (
                <div key={group.key}>
                  <p className="mb-1.5 flex items-center justify-between px-1 text-xs font-bold text-foreground">
                    <span>{group.label}</span>
                    <span className="text-muted-foreground">
                      Task {group.from}–{group.to}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {range(group.from, group.to).map((id) => {
                      const active = selectedTaskSet.has(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleTask(id)}
                          aria-pressed={active}
                          title={`Speaking task ${id} · ${group.label}`}
                          className={`flex size-8 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Parts (Listening & Reading only) */}
      {config.mode === "lr" && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Chọn part muốn làm
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setConfig({ parts: [] })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  sameAs(TOEIC_PARTS.map((p) => p.part))
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setConfig({ parts: LISTENING_PARTS })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  sameAs(LISTENING_PARTS)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Listening 1–4
              </button>
              <button
                type="button"
                onClick={() => setConfig({ parts: READING_PARTS })}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  sameAs(READING_PARTS)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Reading 5–7
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {TOEIC_PARTS.map((p) => {
              const active = selectedSet.has(p.part);
              return (
                <button
                  key={p.part}
                  type="button"
                  onClick={() => togglePart(p.part)}
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
                      {p.label}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {p.to - p.from + 1} câu
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {p.title}
                  </span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
                    {p.section === "listening" ? "Nghe" : "Đọc"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Writing / Speaking quick facts */}
      {config.mode === "writing" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <Pencil className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Writing thi riêng</strong> — tách khỏi Reading &
            Listening: {WRITING_TASK_COUNT} task, gồm Task viết email/yêu cầu và Task viết email
            công việc (khuyến nghị Task 1 ~20 phút, Task 2 ~40 phút).
          </p>
        </div>
      )}
      {config.mode === "speaking" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <Mic className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Speaking (11 task)</strong> — Read Aloud, Describe
            Picture, Respond, Respond Using Information, Express an Opinion · ghi âm bằng mic,
            nghe lại được trong phiên.
          </p>
        </div>
      )}

      {/* Duration */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex w-28 items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5" />
            Thời gian
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setConfig({ minutes })}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  config.minutes === minutes
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {minutes} phút{minutes === suggested ? " (gợi ý)" : ""}
              </button>
            ))}
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-1">
              <Input
                type="number"
                min={1}
                max={240}
                value={custom}
                onChange={(e) => commitCustom(e.target.value)}
                className="h-7 w-16 px-2 text-center text-xs"
                aria-label="Thời gian tự chọn (phút)"
              />
              <span className="text-[11px] font-semibold text-muted-foreground">tùy chọn</span>
            </span>
          </div>
        </div>
        {config.mode === "lr" && (
          <p className="mt-2 pl-0 text-[11px] text-muted-foreground sm:pl-32">
            Gợi ý {suggested} phút theo tổng thời gian chính thức của các part đã chọn (tổng bài
            đầy đủ ~106–120 phút).
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-sm font-bold text-foreground">Sẵn sàng: {summary}</p>
        <p className="text-xs text-muted-foreground">
          Đồng hồ đếm ngược chạy đúng bằng thời gian bạn chọn.
        </p>
      </div>
    </section>
  );
}
