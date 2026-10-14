import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Flag, Image as ImageIcon, Info, Mic, Square, RotateCcw } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useToeicExam } from "../contexts/toeic-exam-context";
import { SPEAKING_TASK_COUNT, effectiveTasks } from "../constants";
import { SPEAKING_TASKS } from "../mocks/speaking-mock";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";
import { formatClock } from "../utils";
import { useMicRecorder } from "../../exams/hooks/mic-recorder";
import { AudioReplay } from "../../exams/components/AudioReplay";

type Phase = "idle" | "prep" | "recording";

const WAVE_BARS = 28;

/** Speaking test page — tasks with a REAL mic recorder (scoped to the chosen tasks). */
export function ToeicSpeakingPage() {
  const navigate = useNavigate();
  const {
    speaking,
    speakingAudio,
    speakingTask,
    setSpeakingTask,
    recordSpeaking,
    clearSpeaking,
    setSpeakingAudio,
    startFlow,
    savedAt,
    config,
    reviewMode,
  } = useToeicExam();

  const mic = useMicRecorder();
  /** Chống finish 2 lần khi effect re-fire trong lúc chờ mic.stop(). */
  const finalizingRef = useRef(false);

  useEffect(() => {
    startFlow("speaking");
  }, [startFlow]);

  // Tasks selected on the setup card (empty config = all 11).
  const tasks = useMemo(
    () =>
      config.mode === "speaking"
        ? effectiveTasks("speaking", config.tasks)
        : Array.from({ length: SPEAKING_TASK_COUNT }, (_, i) => i + 1),
    [config.mode, config.tasks],
  );

  // Keep the current task inside the selection.
  useEffect(() => {
    if (!tasks.includes(speakingTask)) setSpeakingTask(tasks[0]);
  }, [tasks, speakingTask, setSpeakingTask]);

  const index = tasks.includes(speakingTask)
    ? speakingTask
    : (tasks[0] ?? Math.min(SPEAKING_TASK_COUNT, Math.max(1, speakingTask)));
  const task = useMemo(() => SPEAKING_TASKS[index - 1] ?? SPEAKING_TASKS[0], [index]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(0);

  // Switching task resets the recorder state.
  useEffect(() => {
    setPhase("idle");
    setLeft(0);
    finalizingRef.current = false;
  }, [index]);

  // One-second tick while preparing / recording.
  useEffect(() => {
    if (phase === "idle") return;
    const id = window.setInterval(() => setLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  /** Kết thúc bản ghi: đóng mic → lưu blob URL (nếu có) + cờ đã ghi âm. */
  const finishRecording = async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;
    const result = await mic.stop();
    recordSpeaking(task.id);
    setSpeakingAudio(task.id, result?.url ?? null);
    setPhase("idle");
    setLeft(0);
    finalizingRef.current = false;
  };

  // Phase transitions: prep → recording → done (mở mic khi bắt đầu nói).
  useEffect(() => {
    if (phase === "idle" || left > 0 || finalizingRef.current) return;
    if (phase === "prep") {
      setPhase("recording");
      setLeft(task.responseSec);
      void mic.start();
    } else {
      void finishRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left, task, recordSpeaking, mic]);

  const done = Boolean(speaking[task.id]);
  const recorded = tasks.filter((id) => speaking[id]).length;

  const beginRecording = () => {
    setPhase("recording");
    setLeft(task.responseSec);
    finalizingRef.current = false;
    void mic.start();
  };

  const start = () => {
    if (reviewMode) return;
    if (task.prepSec > 0) {
      setPhase("prep");
      setLeft(task.prepSec);
    } else {
      beginRecording();
    }
  };
  const stop = () => {
    if (reviewMode) return;
    void finishRecording();
  };
  const redo = () => {
    if (reviewMode) return;
    clearSpeaking(task.id);
    setSpeakingAudio(task.id, null);
    setPhase("idle");
    setLeft(0);
    finalizingRef.current = false;
  };

  const taskIndex = tasks.indexOf(index);
  const prev = taskIndex > 0 ? tasks[taskIndex - 1] : null;
  const next = taskIndex >= 0 && taskIndex < tasks.length - 1 ? tasks[taskIndex + 1] : null;

  const phaseMax = phase === "prep" ? task.prepSec : task.responseSec;
  const phaseLabel =
    phase === "prep"
      ? "Chuẩn bị"
      : phase === "recording"
        ? "Đang trả lời"
        : done
          ? "Đã trả lời"
          : "Sẵn sàng";

  const statusTone =
    phase === "recording"
      ? "text-red-600"
      : phase === "prep"
        ? "text-amber-600"
        : done
          ? "text-emerald-600"
          : "text-muted-foreground";

  return (
    <div>
      {/* Section progress strip */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SectionBadge label="Speaking" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              Task {index}/{SPEAKING_TASK_COUNT} — {task.group}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {reviewMode
              ? "Chế độ xem lại — không ghi thêm"
              : `Đã ghi ${recorded}/${tasks.length} task đã chọn · ghi âm bằng mic`}
          </span>
        </div>
        <ProgressBar className="mt-3" value={recorded} max={tasks.length} />
      </div>

      {/* Task card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
              Task {task.id}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wide text-primary">
              {task.group}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5">
              Chuẩn bị {task.prepSec}s
            </span>
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5">
              Trả lời {task.responseSec}s
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{task.prompt}</p>

        {/* Picture placeholder */}
        {task.imageHint && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
              <ImageIcon className="size-5" />
            </span>
            <p className="text-sm text-muted-foreground">{task.imageHint}</p>
          </div>
        )}

        {/* Given information */}
        {task.info && (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              <Info className="size-3.5" />
              Thông tin
            </p>
            <ul className="space-y-1.5">
              {task.info.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Text to read / question to answer */}
        {task.text && (
          <div
            className={`mt-4 rounded-xl border p-4 ${
              task.kind === "read-aloud"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-muted/30"
            }`}
          >
            <p className="text-sm leading-relaxed text-foreground">
              {task.kind === "read-aloud" ? (
                <span className="italic">“{task.text}”</span>
              ) : (
                task.text
              )}
            </p>
          </div>
        )}
      </div>

      {/* Recorder */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center">
          {/* Waveform */}
          <div className="flex h-16 w-full max-w-2xl items-end justify-center gap-1">
            {Array.from({ length: WAVE_BARS }).map((_, i) => {
              const active = phase === "recording";
              const height = active ? 24 + ((i * 37) % 40) : 8;
              return (
                <span
                  key={i}
                  className={`w-2 rounded-full transition-all ${
                    active
                      ? "animate-pulse bg-primary"
                      : done
                        ? "bg-primary/30"
                        : "bg-muted"
                  }`}
                  style={{
                    height: `${height}px`,
                    animationDelay: `${(i % 7) * 90}ms`,
                  }}
                />
              );
            })}
          </div>

          <p className={`mt-4 text-sm font-extrabold ${statusTone}`}>
            {phaseLabel}
            {phase !== "idle" && ` — còn ${formatClock(left)}`}
          </p>

          {/* Controls — review mode chỉ phát lại, không hiện nút ghi */}
          {!reviewMode && (
          <div className="mt-4 flex items-center gap-5">
            <button
              type="button"
              onClick={redo}
              disabled={!done && phase === "idle"}
              aria-label="Thu lại"
              className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              <RotateCcw className="size-4" />
            </button>

            <button
              type="button"
              onClick={
                phase === "idle" ? start : phase === "prep" ? beginRecording : stop
              }
              aria-label={
                phase === "idle"
                  ? "Bắt đầu trả lời"
                  : phase === "prep"
                    ? "Bỏ qua chuẩn bị — nói ngay"
                    : "Dừng"
              }
              className={`relative flex size-20 items-center justify-center rounded-full transition-transform hover:scale-105 ${
                phase === "recording"
                  ? "bg-red-500 text-white ring-4 ring-red-200"
                  : "bg-primary text-primary-foreground ring-4 ring-primary/20"
              }`}
            >
              {phase === "idle" ? <Mic className="size-8" /> : <Square className="size-7" />}

              {/* Remaining-time circle */}
              {phase !== "idle" && (
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 46 * (1 - (phaseMax > 0 ? left / phaseMax : 0))
                    }`}
                  />
                </svg>
              )}
            </button>

            <div className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground">
              <span className="text-xs font-extrabold tabular-nums">
                {phase === "idle" ? `${task.responseSec}s` : formatClock(left)}
              </span>
            </div>
          </div>
          )}

          <p className="mt-3 text-center text-xs text-muted-foreground">
            {reviewMode
              ? done
                ? "Chế độ xem lại — phát lại bản ghi của bạn, không ghi thêm."
                : "Chế độ xem lại — task này chưa được ghi âm."
              : mic.unavailable
                ? "Không truy cập được mic — bài vẫn tính hoàn thành nhưng không có file nghe lại."
                : phase === "idle"
                  ? done
                    ? "Bấm “Thu lại” để ghi lại câu trả lời, hoặc chuyển task tiếp theo."
                    : "Bấm nút micro để bắt đầu ghi âm THẬT bằng mic trình duyệt."
                  : "Đang ghi âm — bấm dừng để kết thúc sớm."}
          </p>

          {/* Nghe lại bản ghi của task này */}
          {done && (
            <div className="mt-4 w-full max-w-2xl">
              <AudioReplay src={speakingAudio[task.id]} />
            </div>
          )}
        </div>
      </div>

      {/* Task navigation — dính đáy: cố định, chỉ nội dung trên cuộn */}
      <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={prev === null}
            onClick={() => prev !== null && setSpeakingTask(prev)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Task trước
          </Button>
          <Button
            variant="outline"
            disabled={next === null}
            onClick={() => next !== null && setSpeakingTask(next)}
            className="gap-2"
          >
            Task tiếp
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="hidden text-xs font-semibold text-muted-foreground sm:block">
              Đã lưu trạng thái
            </span>
          )}
          {reviewMode ? (
            <Button variant="outline" className="gap-2" onClick={() => navigate("/toeic/result")}>
              <ArrowLeft className="size-4" />
              Quay lại kết quả
            </Button>
          ) : (
            <Button className="gap-2" onClick={() => navigate("/toeic/review")}>
              <Flag className="size-4" />
              Kiểm tra &amp; nộp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
