import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertTriangle, ArrowLeft, Check, Flag, ListChecks, Send, Timer, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useToeicExam } from "../contexts/toeic-exam-context";
import {
  SPEAKING_TASK_COUNT,
  WRITING_TASK_COUNT,
  effectiveParts,
  effectiveTasks,
} from "../constants";
import { PartTabs } from "../components/common/PartTabs";
import { ReviewModal as ReviewDialog } from "../components/common/ReviewModal";
import { SectionBadge } from "../components/common/SectionBadge";
import { getToeicPartRanges } from "../data/source";
import { SPEAKING_GROUPS } from "../mocks/speaking-mock";
import { countWords, formatClock, saveSubmittedSnapshot, startRouteForConfig } from "../utils";

type ReviewFilter = "all" | "listening" | "reading";

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Review page (standalone): stats + grid for the current mode + submit. */
export function ToeicReviewPage() {
  const navigate = useNavigate();
  const {
    answers,
    flags,
    drafts,
    speaking,
    config,
    setCurrent,
    setWritingTask,
    setSpeakingTask,
    submitExam,
    timeLeft,
    isApiMode,
    apiExam,
    submitToServer,
  } = useToeicExam();
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  const mode = config.mode;
  const selected = effectiveParts(config.parts);
  const selectedSet = new Set(selected);
  // Range 7 Part SUY từ data đang dùng (DB / mock) — không hardcode from/to.
  const partRanges = getToeicPartRanges();
  const inSelection = (id: number) => selectedSet.has(partOf(id));

  function partOf(id: number): number {
    return partRanges.find((p) => id >= p.from && id <= p.to)?.part ?? -1;
  }

  const totalQuestions = partRanges
    .filter((p) => selectedSet.has(p.part))
    .reduce((sum, p) => sum + (p.to - p.from + 1), 0);
  const answered = Object.keys(answers).filter((id) => inSelection(Number(id))).length;
  const unanswered = totalQuestions - answered;
  const flagged = Object.keys(flags)
    .map(Number)
    .filter((id) => flags[id] && inSelection(id)).length;
  const listeningRanges = partRanges.filter((p) => p.section === "listening");
  const readingRanges = partRanges.filter((p) => p.section === "reading");
  const listeningTotal = listeningRanges
    .filter((p) => selectedSet.has(p.part))
    .reduce((sum, p) => sum + (p.to - p.from + 1), 0);
  const readingTotal = totalQuestions - listeningTotal;
  const listeningDone = listeningRanges
    .flatMap((p) => range(p.from, p.to))
    .filter((id) => answers[id] && inSelection(id)).length;
  const readingDone = readingRanges
    .flatMap((p) => range(p.from, p.to))
    .filter((id) => answers[id] && inSelection(id)).length;

  // Writing / Speaking: only the tasks chosen on the setup card (empty = all).
  const selectedWritingTasks =
    mode === "writing" ? effectiveTasks("writing", config.tasks) : range(1, WRITING_TASK_COUNT);
  const selectedSpeakingTasks =
    mode === "speaking" ? effectiveTasks("speaking", config.tasks) : range(1, SPEAKING_TASK_COUNT);
  const speakingSet = new Set(selectedSpeakingTasks);
  const writingDoneSelected = selectedWritingTasks.filter(
    (id) => (drafts[id] ?? "").trim().length > 0,
  ).length;
  const totalWordsSelected = selectedWritingTasks.reduce(
    (sum, id) => sum + countWords(drafts[id] ?? ""),
    0,
  );
  const recordedSelected = selectedSpeakingTasks.filter((id) => speaking[id]).length;

  // Mode-specific stat tiles -------------------------------------------------
  let stats: { label: string; value: string; tone: string }[];
  if (mode === "writing") {
    stats = [
      {
        label: "Task đã viết",
        value: `${writingDoneSelected}/${selectedWritingTasks.length}`,
        tone: "text-foreground",
      },
      {
        label: "Chưa viết",
        value: String(selectedWritingTasks.length - writingDoneSelected),
        tone: "text-amber-600",
      },
      { label: "Tổng số từ", value: String(totalWordsSelected), tone: "text-foreground" },
      { label: "Thời gian còn lại", value: formatClock(timeLeft.writing), tone: "text-primary" },
    ];
  } else if (mode === "speaking") {
    stats = [
      {
        label: "Task đã ghi",
        value: `${recordedSelected}/${selectedSpeakingTasks.length}`,
        tone: "text-foreground",
      },
      {
        label: "Chưa ghi",
        value: String(selectedSpeakingTasks.length - recordedSelected),
        tone: "text-amber-600",
      },
      {
        label: "Hoàn thành",
        value: `${Math.round((recordedSelected / selectedSpeakingTasks.length) * 100)}%`,
        tone: "text-primary",
      },
      { label: "Thời gian còn lại", value: formatClock(timeLeft.speaking), tone: "text-primary" },
    ];
  } else {
    stats = [
      { label: "Đã làm", value: `${answered}/${totalQuestions}`, tone: "text-foreground" },
      { label: "Chưa làm", value: String(unanswered), tone: "text-amber-600" },
      { label: "Đánh dấu", value: String(flagged), tone: "text-primary" },
      { label: "Listening", value: `${listeningDone}/${listeningTotal}`, tone: "text-foreground" },
      { label: "Reading", value: `${readingDone}/${readingTotal}`, tone: "text-foreground" },
      { label: "Thời gian còn lại", value: formatClock(timeLeft.lr), tone: "text-primary" },
    ];
  }

  // Modal numbers follow the active mode -------------------------------------
  const modalAnswered =
    mode === "writing" ? writingDoneSelected : mode === "speaking" ? recordedSelected : answered;
  const modalTotal =
    mode === "writing"
      ? selectedWritingTasks.length
      : mode === "speaking"
        ? selectedSpeakingTasks.length
        : totalQuestions;
  const modalUnanswered = Math.max(0, modalTotal - modalAnswered);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Đề API: nộp lên máy chủ trước (letter → optionId) → nhận attempt thật
      // (điểm máy chủ chấm) rồi mới chấm local để hiển thị chi tiết.
      const attempt = isApiMode ? await submitToServer() : null;
      const result = submitExam();
      saveSubmittedSnapshot({
        answers,
        drafts,
        speaking,
        config,
        result,
        serverScore: attempt?.score ?? undefined,
        attemptId: attempt?.id ?? undefined,
        examId: apiExam?.id,
      });
      setModalOpen(false);
      navigate(withExamId("/toeic/result"));
    } catch {
      setModalOpen(false);
      setSubmitError(
        "Nộp bài lên máy chủ thất bại — hãy kiểm tra kết nối và đăng nhập, rồi bấm “Nộp bài thi” thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const visibleParts = partRanges.filter((p) => {
    if (!selectedSet.has(p.part)) return false;
    if (filter === "all") return true;
    return p.section === filter;
  });

  const questionButtonClass = (id: number) => {
    const state = answers[id]
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";
    return `relative flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-colors ${state}`;
  };

  return (
    <div className="exam-screen min-h-screen bg-muted/50">
      {/* Standalone top bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link
            to={withExamId("/toeic")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
            title="Quay lại trang TOEIC"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <span className="text-sm font-extrabold text-foreground">Kiểm tra &amp; nộp</span>
          <Link
            to={withExamId("/toeic")}
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
            Thoát
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListChecks className="size-5" />
              </span>
              <div>
                <h1 className="text-lg font-extrabold text-foreground">
                  Kiểm tra lại bài làm trước khi nộp
                </h1>
                <p className="text-xs text-muted-foreground">
                  {mode === "lr"
                    ? `Đang thi Listening & Reading (${selected.length}/7 part đã chọn) — bấm số câu để quay lại làm.`
                    : mode === "writing"
                      ? "Writing thi riêng — bấm task để quay lại chỉnh sửa."
                      : "Speaking thi riêng — bấm task để ghi lại câu trả lời."}
                </p>
              </div>
            </div>
            <SectionBadge
              label={mode === "lr" ? "Listening & Reading" : mode === "writing" ? "Writing" : "Speaking"}
              tone="amber"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className={`text-lg font-extrabold tabular-nums ${s.tone}`}>{s.value}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            {mode === "lr" ? (
              <PartTabs
                value={filter}
                onChange={(v) => setFilter(v as ReviewFilter)}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "listening", label: "Listening" },
                  { value: "reading", label: "Reading" },
                ]}
              />
            ) : (
              <p className="text-sm font-extrabold text-foreground">
                {mode === "writing"
                  ? `Writing · ${selectedWritingTasks.length} task`
                  : `Speaking · ${selectedSpeakingTasks.length} task`}
              </p>
            )}
            <span className="text-xs font-semibold text-muted-foreground">
              {mode === "lr"
                ? `${answered}/${totalQuestions} câu đã làm`
                : mode === "writing"
                  ? `${writingDoneSelected}/${selectedWritingTasks.length} task đã viết`
                  : `${recordedSelected}/${selectedSpeakingTasks.length} task đã ghi`}
            </span>
          </div>

          {mode === "lr" && (
            <div className="mt-4 space-y-4">
              {visibleParts.length === 0 && (
                <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  Không có part nào thuộc bộ lọc này trong cấu hình bạn đã chọn.
                </p>
              )}
              {visibleParts.map((part) => (
                <div key={part.part}>
                  <p className="mb-2 flex items-center justify-between text-xs font-bold text-foreground">
                    <span>
                      {part.label} · {part.title}
                    </span>
                    <span className="text-muted-foreground">
                      Câu {part.from}–{part.to}
                    </span>
                  </p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {range(part.from, part.to).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setCurrent(part.section, id);
                          navigate(withExamId(`/toeic/run/${part.section}`));
                        }}
                        className={questionButtonClass(id)}
                        aria-label={`Câu ${id}`}
                      >
                        {id}
                        {flags[id] && (
                          <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500 ring-1 ring-card" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === "writing" && (
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {selectedWritingTasks.map((taskId) => {
                const done = (drafts[taskId] ?? "").trim().length > 0;
                const words = countWords(drafts[taskId] ?? "");
                return (
                  <button
                    key={taskId}
                    type="button"
                    onClick={() => {
                      setWritingTask(taskId);
                      navigate(withExamId("/toeic/writing"));
                    }}
                    className={`flex h-14 flex-col items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                    aria-label={`Writing task ${taskId}`}
                  >
                    <span>Task {taskId}</span>
                    <span className="text-[10px] font-semibold opacity-80">{words} từ</span>
                  </button>
                );
              })}
            </div>
          )}

          {mode === "speaking" && (
            <div className="mt-4 space-y-4">
              {SPEAKING_GROUPS.map((group) => {
                const ids = range(group.from, group.to).filter((id) => speakingSet.has(id));
                if (ids.length === 0) return null;
                return (
                  <div key={group.key}>
                    <p className="mb-2 flex items-center justify-between text-xs font-bold text-foreground">
                      <span>{group.label}</span>
                      <span className="text-muted-foreground">
                        Task {group.from}–{group.to}
                      </span>
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                      {ids.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSpeakingTask(id);
                            navigate(withExamId("/toeic/speaking"));
                          }}
                          className={`relative flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                            speaking[id]
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/50"
                          }`}
                          aria-label={`Speaking task ${id}`}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions — dính đáy: luôn thấy nút nộp dù lướt danh sách dài */}
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate(withExamId(startRouteForConfig(config)))}
          >
            <ArrowLeft className="size-4" />
            Quay lại làm bài
          </Button>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Check className="size-3.5 text-emerald-600" />
              Tự lưu sau mỗi thao tác
            </span>
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Timer className="size-3.5" />
              {formatClock(
                mode === "writing" ? timeLeft.writing : mode === "speaking" ? timeLeft.speaking : timeLeft.lr,
              )}{" "}
              còn lại
            </span>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setModalOpen(true)}
              disabled={submitting}
            >
              <Send className="size-4" />
              {submitting ? "Đang nộp bài…" : "Nộp bài thi"}
            </Button>
          </div>
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{submitError}</p>
          </div>
        )}

        <ReviewDialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleSubmit}
          answered={modalAnswered}
          unanswered={modalUnanswered}
          flagged={mode === "lr" ? flagged : 0}
          total={modalTotal}
          confirmLabel={submitting ? "Đang nộp bài…" : "Xác nhận nộp bài"}
          confirmDisabled={submitting}
        />

        {/* Small legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-primary" /> Đã làm
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm border border-border bg-card" /> Chưa làm
          </span>
          <span className="flex items-center gap-1">
            <Flag className="size-3 text-amber-500" /> Đã đánh dấu
          </span>
          <span className="flex items-center gap-1">
            <X className="size-3" /> Không thể sửa sau khi nộp
          </span>
        </div>
      </main>
    </div>
  );
}
