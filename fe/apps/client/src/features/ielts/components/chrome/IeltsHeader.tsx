import { useNavigate } from "react-router";
import { ArrowLeft, Check, Minus, Plus, RotateCcw, Send, Trophy } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useIeltsExam } from "../../contexts/ielts-exam-context";
import { useIeltsRoute } from "../../hooks";
import {
  LISTENING_SECTIONS,
  MODULE_META,
  READING_PASSAGES,
  listeningTotalActual,
  readingLocalId,
  readingTotalActual,
} from "../../constants";
import { MODULE_DESCRIPTIONS } from "../../mocks/meta-data";
import { scopeGroups, scopeLabels, scopeQuestionIds, scopedPosition } from "../../scope";
import { countWords, recordedSpeakingParts } from "../../utils";
import { ExamTimer } from "./ExamTimer";
import { ProgressBar } from "../common/ProgressBar";
import { SectionBadge } from "../common/SectionBadge";

function formatTime(value: number): string {
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/** Sticky 72px IELTS header: brand, current module, timer, progress, save, submit. */
export function IeltsHeader() {
  const navigate = useNavigate();
  const route = useIeltsRoute();
  const {
    current,
    writingTask,
    speakingPart,
    timeLeft,
    started,
    savedAt,
    answers,
    drafts,
    speakingAnswered,
    scope,
    fontScale,
    setFontScale,
    isApiMode,
    reviewMode,
    apiExam,
  } = useIeltsExam();

  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  const isReview = route === "review";
  const isStandalone = route === "review" || route === "result";

  // Active module label --------------------------------------------------
  // No "IELTS" branding badge — only a meaningful module / review / result label.
  let badge: string | null = null;
  let title = "Computer Delivered";
  if (reviewMode) {
    badge = "Xem lại";
    title = "Xem lại bài đã nộp";
  } else if (isReview) {
    badge = "Review";
    title = "Kiểm tra trước khi nộp";
  } else if (route === "result") {
    badge = "Result";
    title = "Kết quả bài làm";
  } else if (route === "speaking") {
    badge = `Part ${speakingPart}`;
    title = MODULE_META.speaking.label;
  } else if (route === "writing") {
    badge = `Task ${writingTask}/2`;
    title = MODULE_META.writing.label;
  } else if (route === "listening") {
    badge = MODULE_META.listening.label;
    title =
      LISTENING_SECTIONS.find(
        (s) => current.listening >= s.from && current.listening <= s.to,
      )?.label ?? "Section 1";
  } else if (route === "reading") {
    badge = MODULE_META.reading.label;
    title =
      READING_PASSAGES.find((p) => current.reading >= p.from && current.reading <= p.to)?.label ??
      "Passage 1";
  }

  // Progress -------------------------------------------------------------
  // Objective ranges follow the practice scope (deep links like ?section=2).
  const listeningIds = scopeQuestionIds("listening", scope);
  const readingIds = scopeQuestionIds("reading", scope);
  const listeningScoped = scopeGroups("listening", scope) !== null;
  const readingScoped = scopeGroups("reading", scope) !== null;
  const answeredIn = (ids: number[]) => ids.filter((id) => answers[id]).length;

  let progressValue = 0;
  let progressMax = 1;
  let caption = "";

  if (route === "listening") {
    const position = scopedPosition("listening", scope, current.listening);
    progressValue = answeredIn(listeningIds);
    progressMax = listeningIds.length;
    caption = listeningScoped
      ? `${scopeLabels("listening", scope)} · câu ${position.position}/${position.total} — đã làm ${progressValue}/${progressMax} Listening`
      : `Câu ${current.listening} / ${listeningTotalActual()} — đã làm ${progressValue}/${progressMax} Listening`;
  } else if (route === "reading") {
    const position = scopedPosition("reading", scope, current.reading);
    progressValue = answeredIn(readingIds);
    progressMax = readingIds.length;
    caption = readingScoped
      ? `${scopeLabels("reading", scope)} · câu ${position.position}/${position.total} — đã làm ${progressValue}/${progressMax} Reading`
      : `Câu ${readingLocalId(current.reading)} / ${readingTotalActual()} — đã làm ${progressValue}/${progressMax} Reading`;
  } else if (route === "writing") {
    progressValue = [1, 2].filter((id) => countWords(drafts[id] ?? "") > 0).length;
    progressMax = 2;
    caption = `Task ${writingTask}/2 — đã viết ${progressValue}/2 task`;
  } else if (route === "speaking") {
    progressValue = recordedSpeakingParts(speakingAnswered);
    progressMax = 3;
    caption = `Part ${speakingPart}/3 — đã ghi âm ${progressValue}/3 part`;
  } else {
    const objectiveIds = [...listeningIds, ...readingIds];
    progressValue = answeredIn(objectiveIds);
    progressMax = objectiveIds.length;
    caption =
      listeningScoped || readingScoped
        ? `Đã làm ${progressValue}/${progressMax} câu trong phạm vi đang luyện`
        : `Đã làm ${progressValue}/${progressMax} câu trắc nghiệm`;
  }

  // Timer -----------------------------------------------------------------
  const activeModules = (["listening", "reading", "writing", "speaking"] as const).filter(
    (m) => started[m],
  );
  const remainingTotal = activeModules.reduce((sum, m) => sum + timeLeft[m], 0);
  let seconds = remainingTotal;
  if (
    route === "listening" ||
    route === "reading" ||
    route === "writing" ||
    route === "speaking"
  ) {
    seconds = timeLeft[route];
  }

  const description = MODULE_DESCRIPTIONS[String(route ?? "listening")] ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center gap-6 px-4">
        {/* Brand + current module */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(withExamId("/ielts"))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
            title="Quay lại trang IELTS"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại trang đề
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {badge && (
                <SectionBadge label={badge} tone={isReview || reviewMode ? "amber" : "primary"} />
              )}
              <p className="truncate text-sm font-extrabold text-foreground">{title}</p>
            </div>
            {description && (
              <p className="hidden truncate text-xs text-muted-foreground lg:block">{description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="hidden min-w-0 flex-1 md:block">
          <ProgressBar value={progressValue} max={progressMax} caption={caption} />
        </div>

        {/* Right controls — xem lại bài đã nộp: chip + quay về kết quả (không giờ, không nộp) */}
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
              onClick={() => navigate(withExamId("/ielts/result"))}
            >
              <Trophy className="size-4" />
              Quay lại kết quả
            </Button>
          </div>
        ) : (
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-1 rounded-lg border border-border bg-muted/40 px-1.5 py-1 xl:flex">
              <button
                type="button"
                onClick={() => setFontScale(fontScale - 0.05)}
                disabled={fontScale <= 0.9}
                aria-label="Giảm cỡ chữ"
                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-9 text-center text-[11px] font-bold tabular-nums text-foreground">
                {Math.round(fontScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setFontScale(fontScale + 0.05)}
                disabled={fontScale >= 1.3}
                aria-label="Tăng cỡ chữ"
                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <Plus className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFontScale(1)}
                disabled={fontScale === 1}
                aria-label="Khôi phục cỡ chữ"
                className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw className="size-3" />
              </button>
            </div>

            <span className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground 2xl:flex">
              <Check className="size-3.5 text-emerald-600" />
              {savedAt ? `Đã lưu lúc ${formatTime(savedAt)}` : "Chưa có thay đổi"}
            </span>

            <ExamTimer seconds={seconds} label={isReview ? "Tổng còn lại" : "Còn lại"} />

            {!isStandalone && (
              <Button size="sm" className="gap-2" onClick={() => navigate("/ielts/review")}>
                <Send className="size-4" />
                Kiểm tra &amp; nộp
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
