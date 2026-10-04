import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Clock, Flag, Save, Split } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import { useIeltsSkillGuard } from "../hooks";
import { IELTS_WRITING_TASKS } from "../mocks/writing-data";
import { parseScopeParam } from "../scope";
import { countWords, formatClock } from "../utils";
import { WritingEditor } from "../components/writing/WritingEditor";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

/** Writing exam page — Task 1 + Task 2 with autosave, undo/redo and counters. */
export function IeltsWritingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    drafts,
    setDraft,
    writingTask,
    setWritingTask,
    startModule,
    timeLeft,
    savedAt,
    saveNow,
    setScope,
    isApiMode,
    apiExam,
  } = useIeltsExam();
  // Đề API không có Writing (đề 1 kỹ năng) → chuyển về kỹ năng đầu của đề.
  useIeltsSkillGuard("writing");
  const [pendingTask, setPendingTask] = useState<number | null>(null);

  /** Giữ examId trên mọi route điều hướng (mất examId → mất nguồn data API). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  // Deep link: /ielts/test/writing?task=2 → scope + start straight at that task.
  const taskParam = searchParams.get("task");

  useEffect(() => {
    startModule("writing");
  }, [startModule]);

  useEffect(() => {
    const groups = parseScopeParam("writing", taskParam);
    setScope("writing", groups);
    if (groups.length > 0) setWritingTask(groups[0]);
  }, [taskParam, setScope, setWritingTask]);

  // Keeps URL & scope in sync when the candidate switches task on a scoped run.
  const syncTaskParam = (taskId: number) => {
    if (taskParam === null) return;
    const next = new URLSearchParams(searchParams);
    next.set("task", String(taskId));
    setSearchParams(next, { replace: true });
  };

  const task = IELTS_WRITING_TASKS.find((t) => t.id === writingTask) ?? IELTS_WRITING_TASKS[0];
  const value = drafts[task.id] ?? "";
  const words = countWords(value);
  const meetsMin = words >= task.minWords;

  const requestSwitch = (taskId: number) => {
    if (taskId === writingTask) return;
    setPendingTask(taskId);
  };

  const confirmSwitch = () => {
    if (pendingTask !== null) {
      setWritingTask(pendingTask);
      syncTaskParam(pendingTask);
    }
    setPendingTask(null);
  };

  const taskIds = IELTS_WRITING_TASKS.map((t) => t.id);
  const writtenTasks = taskIds.filter((id) => countWords(drafts[id] ?? "") > 0).length;
  const totalWords = taskIds.reduce((sum, id) => sum + countWords(drafts[id] ?? ""), 0);

  return (
    <div>
      {/* Section strip */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label="Writing" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              Task {task.id}/{IELTS_WRITING_TASKS.length} — {task.label}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Tối thiểu {task.minWords} từ · khuyến nghị {task.recommendedMinutes} phút
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {IELTS_WRITING_TASKS.map((t) => {
              const done = countWords(drafts[t.id] ?? "") > 0;
              const isActive = t.id === writingTask;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => requestSwitch(t.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                  title={t.title}
                >
                  {t.label}
                  {done ? " ✓" : ""}
                </button>
              );
            })}
          </div>
        </div>

        <ProgressBar
          className="mt-3"
          value={words}
          max={task.minWords}
          tone={meetsMin ? "emerald" : "primary"}
          caption={`${words}/${task.minWords} từ cho ${task.label} · tổng ${totalWords} từ đã viết · đã hoàn thành ${writtenTasks}/${taskIds.length} task`}
        />
      </div>

      {/* Recommended split */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-card text-primary">
            <Split className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Time split</p>
            <p className="text-sm font-extrabold text-foreground">
              {IELTS_WRITING_TASKS.map((t) => `${t.label}: ${t.recommendedMinutes} phút`).join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-card text-sky-600">
            <Clock className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Writing còn lại</p>
            <p className="font-mono text-sm font-extrabold text-foreground">
              {formatClock(timeLeft.writing)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-card text-emerald-600">
            <Save className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Trạng thái lưu</p>
            <p className="text-sm font-extrabold text-foreground">
              {savedAt
                ? `Đã lưu ${new Date(savedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Tự lưu sau mỗi thao tác"}
            </p>
          </div>
        </div>
      </div>

      <WritingEditor
        task={task}
        value={value}
        onChange={(next) => setDraft(task.id, next)}
        timeLeftSec={timeLeft.writing}
        savedAt={savedAt}
        onAutosave={saveNow}
      />

      {/* Task navigation */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={task.id === 1}
            onClick={() => requestSwitch(task.id - 1)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Task 1
          </Button>
          <Button
            variant="outline"
            disabled={task.id === 2}
            onClick={() => requestSwitch(task.id + 1)}
            className="gap-2"
          >
            Task 2
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="gap-2" onClick={saveNow}>
            <Save className="size-4" />
            Lưu nháp
          </Button>
          <Button className="gap-2" onClick={() => navigate(withExamId("/ielts/review"))}>
            <Flag className="size-4" />
            Kiểm tra &amp; nộp
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Task 2 được chấm nặng hơn Task 1 — đừng để hết giờ mà chưa viết đủ 250 từ.
      </p>

      <ConfirmDialog
        open={pendingTask !== null}
        title={`Chuyển sang Task ${pendingTask ?? ""}?`}
        message={
          <>
            Bài viết của <strong>Task {writingTask}</strong> đã được tự động lưu. Bạn có thể quay lại
            bất cứ lúc nào từ cột điều hướng bên trái.
          </>
        }
        confirmLabel="Chuyển task"
        cancelLabel="Ở lại task hiện tại"
        onConfirm={confirmSwitch}
        onCancel={() => setPendingTask(null)}
      />
    </div>
  );
}
