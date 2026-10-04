import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useIeltsExam } from "../../contexts/ielts-exam-context";
import {
  LISTENING_SECTIONS,
  READING_PASSAGES,
  SPEAKING_PART_COUNT,
  WRITING_TASK_COUNT,
  listeningTotalActual,
  readingTotalActual,
} from "../../constants";
import { getAllQuestions } from "../../data/source";
import { getSpeakingParts } from "../../mocks/speaking-data";
import { inScope, scopeQuestionIds, scopeSearch } from "../../scope";
import type { IeltsModule, ObjectiveModule } from "../../types";
import { isAnswerCorrect, isSpeakingPartRecorded } from "../../utils";

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Shared open/close preference (TOEIC & IELTS navigators use the same key). */
const NAVIGATOR_KEY = "exam:navigator-collapsed";

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(NAVIGATOR_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Left sidebar (260px): question navigator grouped by section / passage /
 * task / part, with current · answered · unanswered · flagged states.
 */
export function QuestionNavigator() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    answers,
    flags,
    current,
    drafts,
    writingTask,
    speakingPart,
    speakingAnswered,
    scope: practiceScope,
    setCurrent,
    setWritingTask,
    setSpeakingPart,
    toggleFlag,
    isApiMode,
    apiExam,
    reviewMode,
  } = useIeltsExam();

  /** Giữ examId + review trên mọi route điều hướng (mất → mất nguồn data API). */
  const withExamId = (route: string): string => {
    let out = route;
    if (isApiMode && apiExam) out += `${out.includes("?") ? "&" : "?"}examId=${apiExam.id}`;
    if (reviewMode) out += `${out.includes("?") ? "&" : "?"}review=1`;
    return out;
  };

  // Đáp án đúng từng câu (chế độ xem lại) — nguồn đổi (examId) → tính lại.
  const questionById = useMemo(() => {
    const map = new Map<number, ReturnType<typeof getAllQuestions>[number]>();
    for (const q of getAllQuestions()) map.set(q.id, q);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiMode, apiExam]);

  /** Câu này bạn làm ĐÚNG khi xem lại — chấm theo đúng luật của bài. */
  const isRight = (id: number): boolean => {
    const question = questionById.get(id);
    const pick = answers[id];
    return Boolean(question && pick && isAnswerCorrect(question, pick));
  };

  const isListening = pathname.includes("/listening");
  const isReading = pathname.includes("/reading");
  const isWriting = pathname.includes("/writing");
  const isSpeaking = pathname.includes("/speaking");
  const activeObjective: ObjectiveModule = isReading ? "reading" : "listening";

  // Scope to the current route's module only ("cái nào thì chỉ hiện cái đó").
  // `null` (review / result / instructions) → show every module as an overview.
  const scope: IeltsModule | null = isListening
    ? "listening"
    : isReading
      ? "reading"
      : isWriting
        ? "writing"
        : isSpeaking
          ? "speaking"
          : null;

  // Practice scope (?section= / ?passage= / ?task= / ?part=) — only those groups
  // are listed, and the header counter only counts questions inside them.
  const listeningSections = LISTENING_SECTIONS.filter((s) =>
    inScope("listening", s.section, practiceScope),
  );
  const readingPassages = READING_PASSAGES.filter((p) =>
    inScope("reading", p.passage, practiceScope),
  );
  const writingTasks = [1, 2].filter((taskId) => inScope("writing", taskId, practiceScope));
  const speakingParts = getSpeakingParts().filter((p) =>
    inScope("speaking", p.part, practiceScope),
  );
  const listeningIds = scopeQuestionIds("listening", practiceScope);
  const readingIds = scopeQuestionIds("reading", practiceScope);

  // Chỉ hiện block của module CÓ nội dung — đề API 1 kỹ năng (vd Reading-only)
  // đã splice config rỗng cho 3 module kia → không hiện label trống.
  const showListening = (scope === null || scope === "listening") && listeningSections.length > 0;
  const showReading = (scope === null || scope === "reading") && readingPassages.length > 0;
  const showWriting = (scope === null || scope === "writing") && writingTasks.length > 0;
  const showSpeaking = (scope === null || scope === "speaking") && speakingParts.length > 0;
  // Flags are objective-only — hidden on Writing / Speaking routes.
  const showFlagAction = scope === null || scope === "listening" || scope === "reading";

  const flaggedAll = Object.values(flags).filter(Boolean).length;
  const answeredListening = listeningIds.filter((id) => answers[id]).length;
  const answeredReading = readingIds.filter((id) => answers[id]).length;
  const draftsDone = writingTasks.filter((taskId) => countChars(drafts[taskId] ?? "") > 0).length;
  const recordedParts = speakingParts.filter((p) => isSpeakingPartRecorded(p, speakingAnswered))
    .length;

  const scopedAnswered =
    scope === "listening"
      ? answeredListening
      : scope === "reading"
        ? answeredReading
        : scope === "writing"
          ? draftsDone
          : scope === "speaking"
            ? recordedParts
            : answeredListening + answeredReading;
  const scopedTotal =
    scope === "listening"
      ? listeningIds.length
      : scope === "reading"
        ? readingIds.length
        : scope === "writing"
          ? writingTasks.length
          : scope === "speaking"
            ? speakingParts.length
            : listeningIds.length + readingIds.length;
  // Số câu ĐÚNG khi xem lại (chỉ câu trắc nghiệm trong phạm vi hiển thị).
  const scopedIds =
    scope === "listening"
      ? listeningIds
      : scope === "reading"
        ? readingIds
        : scope === null
          ? [...listeningIds, ...readingIds]
          : [];
  const correctScoped = reviewMode ? scopedIds.filter((id) => isRight(id)).length : 0;
  // Base Reading động (đề Reading-only splice Listening rỗng → base = 0).
  const listeningBase = listeningTotalActual();
  const readingFirst = readingIds[0] ?? listeningBase + 1;
  const readingLast = readingIds[readingIds.length - 1] ?? listeningBase + readingTotalActual();
  const writingLabel =
    writingTasks.length === WRITING_TASK_COUNT
      ? "Writing · Task 1–2"
      : `Writing · Task ${writingTasks.join(", ")}`;
  const speakingLabel =
    speakingParts.length === SPEAKING_PART_COUNT
      ? "Speaking · Part 1–3"
      : `Speaking · Part ${speakingParts.map((p) => p.part).join(", ")}`;

  // Tắt/mở bộ câu hỏi (remembered across pages & modules).
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggleCollapsed = () =>
    setCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(NAVIGATOR_KEY, next ? "1" : "0");
      } catch {
        /* private mode — ignore */
      }
      return next;
    });

  const goTo = (module: ObjectiveModule, id: number) => {
    setCurrent(module, id);
    const target = module === "listening" ? "/ielts/test/listening" : "/ielts/test/reading";
    // Already on the module → only move the focus (keeps ?section= / ?passage=).
    if (pathname !== target)
      navigate(withExamId(`${target}${scopeSearch(module, practiceScope)}`));
  };

  const questionClass = (id: number, module: ObjectiveModule) => {
    const isCurrent = (module === "listening" ? isListening : isReading) && current[module] === id;
    let state: string;
    if (reviewMode) {
      // Xem lại: đã làm → xanh nếu đúng, đỏ nếu sai; chưa làm → neutral.
      state = !answers[id]
        ? "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
        : isRight(id)
          ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
          : "border-red-400 bg-red-400 text-white hover:bg-red-500";
    } else {
      state = answers[id]
        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";
    }
    const ring = isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : "";
    return `relative flex size-7 items-center justify-center rounded-md border text-[11px] font-bold transition-colors ${state} ${ring}`;
  };

  const renderObjectiveGroup = (
    module: ObjectiveModule,
    label: string,
    rangeLabel: string,
    from: number,
    to: number,
  ) => {
    const ids = range(from, to);
    const answered = ids.filter((id) => answers[id]).length;
    return (
      <div className="mt-3" key={`${module}-${label}`}>
        <p className="mb-1.5 flex items-center justify-between px-1 text-xs font-bold text-foreground">
          <span>{label}</span>
          <span className="text-muted-foreground">
            {answered}/{ids.length}
          </span>
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => goTo(module, id)}
              className={questionClass(id, module)}
              aria-label={`Câu ${module === "reading" ? id - listeningBase : id}`}
              aria-current={current[module] === id ? "true" : undefined}
            >
              {module === "reading" ? id - listeningBase : id}
              {flags[id] && (
                <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500 ring-1 ring-card" />
              )}
            </button>
          ))}
        </div>
        <p className="mt-1 px-1 text-[10px] text-muted-foreground">{rangeLabel}</p>
      </div>
    );
  };

  // ----------------------------------------------------- Rail when collapsed
  if (collapsed) {
    return (
      <aside className="hidden min-h-0 w-12 shrink-0 xl:block" aria-label="Bộ câu hỏi (đã thu gọn)">
        <div className="scrollbar-none flex h-full flex-col items-center gap-3 overflow-y-auto rounded-xl border border-border bg-card px-1.5 py-3 shadow-sm">
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Mở bộ câu hỏi"
            aria-label="Mở bộ câu hỏi"
            className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ChevronRight className="size-4" />
          </button>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl]">
            Bộ câu hỏi
          </span>
          <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
            {scopedAnswered}/{scopedTotal}
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden min-h-0 w-64 shrink-0 xl:block" aria-label="Bộ câu hỏi">
      <div className="scrollbar-none h-full overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-extrabold text-foreground">
            {reviewMode ? "Bộ câu hỏi — đã nộp" : "Bộ câu hỏi"}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">
              {reviewMode
                ? `${scopedAnswered}/${scopedTotal} · đúng ${correctScoped}`
                : `${scopedAnswered}/${scopedTotal}`}
            </span>
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Thu gọn bộ câu hỏi"
              aria-label="Thu gọn bộ câu hỏi"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        </div>

        {/* Objective modules — only the current route's module, only in-scope groups */}
        {showListening &&
          listeningSections.map((s) =>
            renderObjectiveGroup(
              "listening",
              `${s.label} · ${s.typeLabel}`,
              `Câu ${s.from}–${s.to}`,
              s.from,
              s.to,
            ),
          )}

        {showReading && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Reading · Câu {readingFirst - listeningBase}–{readingLast - listeningBase}
            </p>
            {readingPassages.map((p) =>
              renderObjectiveGroup(
                "reading",
                p.label,
                `Câu ${p.from - listeningBase}–${p.to - listeningBase}`,
                p.from,
                p.to,
              ),
            )}
          </div>
        )}

        {/* Writing */}
        {showWriting && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {writingLabel}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {writingTasks.map((taskId) => {
                const done = countChars(drafts[taskId] ?? "");
                const isCurrent = isWriting && writingTask === taskId;
                const state = done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";
                return (
                  <button
                    key={taskId}
                    type="button"
                    onClick={() => {
                      setWritingTask(taskId);
                      const target = "/ielts/test/writing";
                      if (pathname !== target) {
                        navigate(withExamId(`${target}${scopeSearch("writing", practiceScope)}`));
                      }
                    }}
                    className={`flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-colors ${state} ${
                      isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                    }`}
                    aria-label={`Writing task ${taskId}`}
                  >
                    Task {taskId}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Speaking */}
        {showSpeaking && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {speakingLabel}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {speakingParts.map((p) => {
                const recorded = isSpeakingPartRecorded(p, speakingAnswered);
                const state = recorded
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";
                const isCurrent = isSpeaking && speakingPart === p.part;
                return (
                  <button
                    key={p.part}
                    type="button"
                    onClick={() => {
                      setSpeakingPart(p.part);
                      const target = "/ielts/test/speaking";
                      if (pathname !== target) {
                        navigate(withExamId(`${target}${scopeSearch("speaking", practiceScope)}`));
                      }
                    }}
                    className={`flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-colors ${state} ${
                      isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                    }`}
                    aria-label={`Speaking ${p.label}`}
                  >
                    {p.part}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        {reviewMode ? (
          <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-emerald-500" /> Bạn làm — đúng
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-red-400" /> Bạn làm — sai
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border border-border bg-card" /> Chưa làm
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border-2 border-primary bg-primary/20" /> Đang xem
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-primary" /> Đã làm
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border border-border bg-card" /> Chưa làm
            </div>
            <div className="flex items-center gap-2">
              <span className="relative size-3 rounded-sm border border-amber-400 bg-amber-100">
                <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500" />
              </span>
              Đánh dấu review
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border-2 border-primary bg-primary/20" /> Đang xem
            </div>
          </div>
        )}

        {showFlagAction && !reviewMode && (
          <button
            type="button"
            onClick={() => toggleFlag(current[activeObjective])}
            className="mt-3 w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
          >
            Đánh dấu câu đang xem
          </button>
        )}

        <p className="mt-3 rounded-lg bg-muted/60 p-2 text-[11px] leading-relaxed text-muted-foreground">
          Đã đánh dấu <strong className="text-foreground">{flaggedAll}</strong> câu · trạng thái làm
          bài được giữ nguyên khi chuyển trang.
        </p>
      </div>
    </aside>
  );
}

function countChars(text: string): number {
  return text.trim().length;
}
