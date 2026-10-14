import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useToeicExam } from "../../contexts/toeic-exam-context";
import {
  SPEAKING_TASK_COUNT,
  WRITING_TASK_COUNT,
  effectiveParts,
  effectiveTasks,
} from "../../constants";
import { getToeicPartRanges, getToeicQuestions } from "../../data/source";
import type { PartConfig, ToeicPartSection, ToeicSection } from "../../types";
import { SPEAKING_GROUPS, SPEAKING_TASKS } from "../../mocks/speaking-mock";

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
 * Left sidebar (260px). Adapts to the active shell:
 * L&R flow → selected parts only · Writing → 8 tasks · Speaking → 11 tasks.
 */
export function QuestionNavigator() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    answers,
    flags,
    current,
    drafts,
    speaking,
    config,
    setCurrent,
    writingTask,
    setWritingTask,
    speakingTask,
    setSpeakingTask,
    isApiMode,
    reviewMode,
    apiExam,
  } = useToeicExam();

  /** Giữ examId + review trên mọi route điều hướng (mất → mất nguồn data API). */
  const withExamId = useCallback(
    (route: string): string => {
      let out = route;
      if (isApiMode && apiExam) out += `${out.includes("?") ? "&" : "?"}examId=${apiExam.id}`;
      if (reviewMode) out += `${out.includes("?") ? "&" : "?"}review=1`;
      return out;
    },
    [isApiMode, apiExam, reviewMode],
  );

  // Đáp án đúng từng câu (chế độ xem lại) — nguồn đổi (examId) → tính lại.
  const correctById = useMemo(() => {
    const map = new Map<number, string>();
    for (const q of getToeicQuestions()) if (q.correct) map.set(q.id, q.correct);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiMode, apiExam]);

  // Range 7 Part SUY từ data đang dùng (DB / mock) — không hardcode from/to.
  const partRanges = getToeicPartRanges();

  const variant: "lr" | "writing" | "speaking" = pathname.includes("/toeic/writing")
    ? "writing"
    : pathname.includes("/toeic/speaking")
      ? "speaking"
      : "lr";

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

  // 7 Part đóng/mở riêng lẻ — đề 200 câu thì gập part không cần thiết lại.
  const [hiddenParts, setHiddenParts] = useState<ReadonlySet<number>>(() => new Set());
  const togglePart = (part: number) =>
    setHiddenParts((prev) => {
      const next = new Set(prev);
      if (next.has(part)) next.delete(part);
      else next.add(part);
      return next;
    });

  const activeSection: ToeicSection | null =
    variant === "writing"
      ? "writing"
      : variant === "speaking"
        ? "speaking"
        : pathname.includes("/listening")
          ? "listening"
          : pathname.includes("/reading")
            ? "reading"
            : null;

  const selected = effectiveParts(config.parts);
  const selectedSet = new Set(selected);

  function partOf(id: number): number {
    return partRanges.find((p) => id >= p.from && id <= p.to)?.part ?? -1;
  }

  const answeredAll = Object.keys(answers).filter((id) => selectedSet.has(partOf(Number(id)))).length;
  const correctAll = reviewMode
    ? Object.keys(answers).filter(
        (id) =>
          selectedSet.has(partOf(Number(id))) &&
          answers[Number(id)] === correctById.get(Number(id)),
      ).length
    : 0;
  const selectedTotal = partRanges
    .filter((p) => selectedSet.has(p.part))
    .reduce((sum, p) => sum + (p.to - p.from + 1), 0);
  const flaggedAll = Object.values(flags).filter(Boolean).length;

  // Writing / Speaking: only the tasks chosen in the config (empty = all).
  const activeWritingTasks =
    variant === "writing" && config.mode === "writing"
      ? effectiveTasks("writing", config.tasks)
      : range(1, WRITING_TASK_COUNT);
  const activeSpeakingTasks =
    variant === "speaking" && config.mode === "speaking"
      ? effectiveTasks("speaking", config.tasks)
      : range(1, SPEAKING_TASK_COUNT);
  const activeSpeakingSet = new Set(activeSpeakingTasks);
  const writtenSelected = activeWritingTasks.filter(
    (id) => (drafts[id] ?? "").trim().length > 0,
  ).length;
  const recordedSelected = activeSpeakingTasks.filter((id) => speaking[id]).length;

  const goQuestion = (section: ToeicPartSection, id: number) => {
    setCurrent(section, id);
    navigate(withExamId(`/toeic/run/${section}`));
  };
  const goTask = (taskId: number) => {
    setWritingTask(taskId);
    navigate(withExamId("/toeic/writing"));
  };
  const goSpeakingTask = (taskId: number) => {
    setSpeakingTask(taskId);
    navigate(withExamId("/toeic/speaking"));
  };

  const questionClass = (id: number, section: ToeicPartSection) => {
    const isCurrent = activeSection === section && current[section] === id;
    let state: string;
    if (reviewMode) {
      // Xem lại: đã làm → xanh nếu đúng, đỏ nếu sai; chưa làm → neutral.
      const pick = answers[id];
      state = !pick
        ? "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
        : pick === correctById.get(id)
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

  const renderPart = (cfg: PartConfig) => {
    const answered = range(cfg.from, cfg.to).filter((id) => answers[id]).length;
    const collapsed = hiddenParts.has(cfg.part);
    return (
      <div key={cfg.part} className="mt-3">
        <button
          type="button"
          onClick={() => togglePart(cfg.part)}
          aria-expanded={!collapsed}
          className="mb-1.5 flex w-full items-center justify-between gap-1 px-1 text-xs font-bold text-foreground transition-colors hover:text-primary"
        >
          <span className="inline-flex min-w-0 items-center gap-1">
            {collapsed ? (
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">
              {cfg.label} · {cfg.title}
            </span>
          </span>
          <span className="shrink-0 text-muted-foreground">
            {answered}/{cfg.to - cfg.from + 1}
          </span>
        </button>
        {!collapsed && (
          <div className="grid grid-cols-5 gap-1.5">
            {range(cfg.from, cfg.to).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => goQuestion(cfg.section, id)}
                className={questionClass(id, cfg.section)}
                aria-label={`Câu ${id}`}
                aria-current={current[cfg.section] === id ? "true" : undefined}
              >
                {id}
                {flags[id] && (
                  <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500 ring-1 ring-card" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const listeningParts = partRanges.filter(
    (p) => p.section === "listening" && selectedSet.has(p.part),
  );
  const readingParts = partRanges.filter(
    (p) => p.section === "reading" && selectedSet.has(p.part),
  );

  const writingTaskClass = (taskId: number) => {
    const done = (drafts[taskId] ?? "").trim().length > 0;
    const isCurrent = activeSection === "writing" && writingTask === taskId;
    const state = done
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";
    const ring = isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : "";
    return `flex size-8 items-center justify-center rounded-md border text-xs font-bold transition-colors ${state} ${ring}`;
  };

  const speakingTaskClass = (taskId: number) => {
    const done = Boolean(speaking[taskId]);
    const isCurrent = activeSection === "speaking" && speakingTask === taskId;
    const state = done
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground";
    const ring = isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : "";
    return `relative flex size-7 items-center justify-center rounded-md border text-[11px] font-bold transition-colors ${state} ${ring}`;
  };

  const legend = reviewMode ? (
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
  );

  const collapseBtn = (
    <button
      type="button"
      onClick={toggleCollapsed}
      title="Thu gọn bộ câu hỏi"
      aria-label="Thu gọn bộ câu hỏi"
      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
    </button>
  );

  // ------------------------------------------------- Rail when collapsed
  if (collapsed) {
    const count =
      variant === "writing"
        ? `${writtenSelected}/${activeWritingTasks.length}`
        : variant === "speaking"
          ? `${recordedSelected}/${activeSpeakingTasks.length}`
          : `${answeredAll}/${selectedTotal}`;
    const railLabel =
      variant === "writing" ? "Bộ task" : variant === "speaking" ? "Bộ câu nói" : "Bộ câu hỏi";
    return (
      <aside className="hidden w-12 shrink-0 xl:block" aria-label="Bộ câu hỏi (đã thu gọn)">
        <div className="flex h-full flex-col items-center gap-3 overflow-y-auto rounded-xl border border-border bg-card px-1.5 py-3 shadow-sm">
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
            {railLabel}
          </span>
          <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{count}</span>
        </div>
      </aside>
    );
  }

  // ---------------------------------------------------------------- Writing
  if (variant === "writing") {
    return (
      <aside className="hidden w-64 shrink-0 xl:block" aria-label="Bộ task viết">
        <div className="scrollbar-none h-full overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-extrabold text-foreground">Bộ task viết</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">
                {writtenSelected}/{activeWritingTasks.length}
              </span>
              {collapseBtn}
            </div>
          </div>

          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Writing · Task {activeWritingTasks[0]}–{activeWritingTasks[activeWritingTasks.length - 1]}
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {activeWritingTasks.map((taskId) => (
              <button
                key={taskId}
                type="button"
                onClick={() => goTask(taskId)}
                className={writingTaskClass(taskId)}
                aria-label={`Writing task ${taskId}`}
              >
                {taskId}
              </button>
            ))}
          </div>

          {legend}

          <p className="mt-3 rounded-lg bg-muted/60 p-2 text-[11px] leading-relaxed text-muted-foreground">
            Writing thi riêng — không chung phần với Listening/Reading. Tự lưu sau mỗi lần gõ.
          </p>
        </div>
      </aside>
    );
  }

  // ---------------------------------------------------------------- Speaking
  if (variant === "speaking") {
    return (
      <aside className="hidden w-64 shrink-0 xl:block" aria-label="Bộ câu nói">
        <div className="scrollbar-none h-full overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-extrabold text-foreground">Bộ câu nói</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">
                {recordedSelected}/{activeSpeakingTasks.length}
              </span>
              {collapseBtn}
            </div>
          </div>

          {SPEAKING_GROUPS.map((group) => {
            const ids = range(group.from, group.to).filter((id) => activeSpeakingSet.has(id));
            if (ids.length === 0) return null;
            const done = ids.filter((id) => speaking[id]).length;
            return (
              <div key={group.key} className="mt-3">
                <p className="mb-1.5 flex items-center justify-between px-1 text-xs font-bold text-foreground">
                  <span className="truncate">{group.label}</span>
                  <span className="text-muted-foreground">
                    {done}/{ids.length}
                  </span>
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {ids.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goSpeakingTask(id)}
                      className={speakingTaskClass(id)}
                      aria-label={`Speaking task ${id}`}
                      title={SPEAKING_TASKS[id - 1]?.group}
                    >
                      {id}
                      {activeSection === "speaking" && speakingTask === id && (
                        <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {legend}

          <p className="mt-3 rounded-lg bg-muted/60 p-2 text-[11px] leading-relaxed text-muted-foreground">
            Speaking thi riêng — 11 task, ghi âm mic thật (nghe lại được trong phiên).
          </p>
        </div>
      </aside>
    );
  }

  // ------------------------------------------------------------ Listening & Reading
  return (
    <aside className="hidden w-64 shrink-0 xl:block" aria-label="Bộ câu hỏi">
      <div className="scrollbar-none h-full overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-extrabold text-foreground">
            {reviewMode ? "Bộ câu hỏi — đã nộp" : "Bộ câu hỏi"}
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">
              {answeredAll}/{selectedTotal}
              {reviewMode ? ` · đúng ${correctAll}` : ""}
            </span>
            {collapseBtn}
          </div>
        </div>

        {listeningParts.length > 0 && (
          <>
            <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Listening · Part {listeningParts[0].part}–{listeningParts[listeningParts.length - 1].part}
            </p>
            {listeningParts.map(renderPart)}
          </>
        )}

        {readingParts.length > 0 && (
          <>
            <p className="mt-4 border-t border-border pt-3 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Reading · Part {readingParts[0].part}–{readingParts[readingParts.length - 1].part}
            </p>
            {readingParts.map(renderPart)}
          </>
        )}

        {legend}

        <p className="mt-3 rounded-lg bg-muted/60 p-2 text-[11px] leading-relaxed text-muted-foreground">
          Chỉ hiển thị các part bạn đã chọn ở bước cấu hình · đã đánh dấu{" "}
          <strong className="text-foreground">{flaggedAll}</strong> câu.
        </p>
      </div>
    </aside>
  );
}
