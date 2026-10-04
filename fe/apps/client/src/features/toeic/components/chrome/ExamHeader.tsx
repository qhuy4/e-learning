import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Check, Flag, Trophy } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useToeicExam } from "../../contexts/toeic-exam-context";
import { useExamSection } from "../../hooks";
import {
  SPEAKING_TASK_COUNT,
  SECTION_META,
  TOEIC_PARTS,
  WRITING_TASK_COUNT,
  effectiveParts,
  effectiveTasks,
  modeOfPath,
  partOfQuestion,
} from "../../constants";
import { SECTION_DESCRIPTIONS } from "../../mocks/exam-mock";
import { SPEAKING_TASKS } from "../../mocks/speaking-mock";
import { CountdownTimer } from "../common/CountdownTimer";
import { ProgressBar } from "../common/ProgressBar";
import { SectionBadge } from "../common/SectionBadge";

function formatTime(value: number): string {
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/** Sticky 72px exam header: logo, current part, timer, progress, save state, submit. */
export function ExamHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const section = useExamSection();
  const mode = modeOfPath(pathname);
  const {
    config,
    current,
    writingTask,
    speakingTask,
    timeLeft,
    savedAt,
    answers,
    drafts,
    speaking,
    isApiMode,
    reviewMode,
    apiExam,
  } = useToeicExam();

  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  const selected = effectiveParts(config.parts);
  const selectedSet = new Set(selected);

  // Writing / Speaking task scope (config.tasks empty = every task).
  const selectedTasks =
    section === "writing"
      ? effectiveTasks("writing", config.mode === "writing" ? config.tasks : [])
      : section === "speaking"
        ? effectiveTasks("speaking", config.mode === "speaking" ? config.tasks : [])
        : [];

  // Active part label -------------------------------------------------
  let partLabel = "";
  let partTitle = "";
  if (section === "writing") {
    partLabel = `Task ${writingTask}/${WRITING_TASK_COUNT}`;
    partTitle = "Writing";
  } else if (section === "speaking") {
    partLabel = `Task ${speakingTask}/${SPEAKING_TASK_COUNT}`;
    partTitle = "Speaking";
  } else {
    const firstSelected = TOEIC_PARTS.find(
      (p) => p.section === section && selectedSet.has(p.part),
    );
    const id = firstSelected && selectedSet.has(partOfQuestion(current[section]).part)
      ? current[section]
      : (firstSelected?.from ?? current[section]);
    const cfg = partOfQuestion(id);
    partLabel = cfg.label;
    partTitle = cfg.title;
  }

  // Progress ------------------------------------------------------------
  const answeredIn = Object.keys(answers).filter(
    (id) => selectedSet.has(partOfQuestion(Number(id)).part),
  ).length;
  const selectedTotal = TOEIC_PARTS.filter((p) => selectedSet.has(p.part)).reduce(
    (sum, p) => sum + (p.to - p.from + 1),
    0,
  );
  const writtenTasks = selectedTasks.filter((id) => (drafts[id] ?? "").trim().length > 0).length;
  const recorded = selectedTasks.filter((id) => speaking[id]).length;

  let progressValue = answeredIn;
  let progressMax = selectedTotal;
  let progressCaption = `Đã làm ${answeredIn}/${selectedTotal} câu`;
  if (section === "writing") {
    progressValue = writtenTasks;
    progressMax = selectedTasks.length;
    progressCaption = `Task ${writingTask}/${WRITING_TASK_COUNT} — đã viết ${writtenTasks}/${selectedTasks.length}`;
  } else if (section === "speaking") {
    progressValue = recorded;
    progressMax = selectedTasks.length;
    progressCaption = `Task ${speakingTask}/${SPEAKING_TASK_COUNT} — đã ghi ${recorded}/${selectedTasks.length}`;
  } else {
    progressCaption = `Câu ${current[section]} — đã làm ${progressValue}/${progressMax} phần ${SECTION_META[section].label}`;
  }

  // Timer: one clock per mode (Listening & Reading share a single countdown).
  const seconds = timeLeft[mode];

  const sectionPart = TOEIC_PARTS.find((p) => p.section === section);
  const partDescription =
    section === "writing"
      ? "Viết — 8 task, nhập văn bản tự do"
      : section === "speaking"
        ? SPEAKING_TASKS[speakingTask - 1]?.group ?? "Nói — 11 task ghi âm mic"
        : sectionPart
          ? SECTION_DESCRIPTIONS[String(sectionPart.part)]
          : "";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center gap-6 px-4">
        {/* Brand + current part */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(withExamId("/toeic"))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
            title="Quay lại trang TOEIC"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại trang đề
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SectionBadge label={partLabel} tone="primary" />
              <p className="truncate text-sm font-extrabold text-foreground">{partTitle}</p>
            </div>
            {partDescription && (
              <p className="hidden truncate text-xs text-muted-foreground lg:block">
                {partDescription}
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="hidden min-w-0 flex-1 md:block">
          <ProgressBar value={progressValue} max={progressMax} caption={progressCaption} />
        </div>

        {/* Right controls */}
        {reviewMode ? (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 xl:flex">
              <Check className="size-3.5 text-amber-600" />
              Xem lại bài đã nộp — không sửa được nữa
            </span>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => navigate(withExamId("/toeic/result"))}
            >
              <Trophy className="size-4" />
              Quay lại kết quả
            </Button>
          </div>
        ) : (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground xl:flex">
              <Check className="size-3.5 text-emerald-600" />
              {savedAt ? `Đã lưu lúc ${formatTime(savedAt)}` : "Chưa có thay đổi"}
            </span>
            <CountdownTimer seconds={seconds} label="Còn lại" />
            <Button size="sm" className="gap-2" onClick={() => navigate(withExamId("/toeic/review"))}>
              <Flag className="size-4" />
              Kiểm tra &amp; nộp
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
