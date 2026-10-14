import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Flag, Save } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useToeicExam } from "../contexts/toeic-exam-context";
import { TOEIC_WRITING_TASKS } from "../mocks/exam-mock";
import { WRITING_TASK_COUNT, effectiveTasks } from "../constants";
import { WritingEditorCard } from "../components/question/WritingEditorCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

/** Writing exam page — free-response tasks with plain textareas (scoped to the chosen tasks). */
export function ToeicWritingPage() {
  const navigate = useNavigate();
  const {
    drafts,
    setDraft,
    writingTask,
    setWritingTask,
    startFlow,
    timeLeft,
    savedAt,
    saveNow,
    config,
  } = useToeicExam();

  useEffect(() => {
    startFlow("writing");
  }, [startFlow]);

  // Tasks selected on the setup card (empty config = all 8).
  const tasks = useMemo(
    () =>
      config.mode === "writing"
        ? effectiveTasks("writing", config.tasks)
        : Array.from({ length: WRITING_TASK_COUNT }, (_, i) => i + 1),
    [config.mode, config.tasks],
  );

  // Keep the current task inside the selection.
  useEffect(() => {
    if (!tasks.includes(writingTask)) setWritingTask(tasks[0]);
  }, [tasks, writingTask, setWritingTask]);

  const task = useMemo(
    () => TOEIC_WRITING_TASKS[writingTask - 1] ?? TOEIC_WRITING_TASKS[0],
    [writingTask],
  );

  const written = tasks.filter((id) => (drafts[id] ?? "").trim().length > 0).length;
  const taskIndex = tasks.indexOf(writingTask);
  const prev = taskIndex > 0 ? tasks[taskIndex - 1] : null;
  const next = taskIndex >= 0 && taskIndex < tasks.length - 1 ? tasks[taskIndex + 1] : null;

  return (
    <div>
      {/* Section progress strip */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SectionBadge label="Writing" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              Phần Viết — Task {writingTask}/{WRITING_TASK_COUNT}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Đã viết {written}/{tasks.length} task đã chọn · nhập văn bản tự do
          </span>
        </div>
        <ProgressBar className="mt-3" value={written} max={tasks.length} />
      </div>

      <WritingEditorCard
        task={task}
        value={drafts[task.id] ?? ""}
        onChange={(value) => setDraft(task.id, value)}
        timeLeftSec={timeLeft.writing}
        savedAt={savedAt}
      />

      {/* Task navigation — dính đáy: cố định, chỉ nội dung trên cuộn */}
      <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={prev === null}
            onClick={() => prev !== null && setWritingTask(prev)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Task trước
          </Button>
          <Button
            variant="outline"
            disabled={next === null}
            onClick={() => next !== null && setWritingTask(next)}
            className="gap-2"
          >
            Task tiếp
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="gap-2" onClick={saveNow}>
            <Save className="size-4" />
            Lưu nháp
          </Button>
          <Button className="gap-2" onClick={() => navigate("/toeic/review")}>
            <Flag className="size-4" />
            Kiểm tra &amp; nộp
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Gõ trực tiếp vào ô văn bản — bộ đếm từ/cập nhật trạng thái lưu nằm ngay dưới ô viết.
      </p>
    </div>
  );
}
