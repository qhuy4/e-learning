import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, BookOpen, Flag, StickyNote, Trophy } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import { useExamHasSkill, useIeltsSkillGuard } from "../hooks";
import { READING_PASSAGES, firstIdOfPassage } from "../constants";
import { getReadingPassages } from "../data/source";
import { inScope, parseScopeParam, scopeGroups, scopeQuestionIds, scopeSearch, scopedPosition } from "../scope";
import { PassageViewer } from "../components/reading/PassageViewer";
import { ReadingQuestionCard } from "../components/question/ReadingQuestionCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

/** Reading exam page — real CBT two-column layout (passage 48% / questions 52%). */
export function IeltsReadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    answers,
    flags,
    notes,
    current,
    setCurrent,
    selectAnswer,
    toggleFlag,
    setNote,
    startModule,
    scope,
    setScope,
    isApiMode,
    reviewMode,
    apiExam,
  } = useIeltsExam();
  // Đề API không có Reading (đề 1 kỹ năng) → chuyển về kỹ năng đầu của đề.
  useIeltsSkillGuard("reading");
  // Reading-only → cuối phần không còn "Sang Writing" (chỉ còn "Kiểm tra & nộp").
  const hasWriting = useExamHasSkill("writing");
  // Reading-only → ẩn "Quay lại Listening" (bấm vào bị guard đá về mất scope ?passage=).
  const hasListening = useExamHasSkill("listening");
  const [jump, setJump] = useState<{ label: string; at: number } | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);

  /** Giữ examId + review trên mọi route điều hướng (mất → mất nguồn data API). */
  const withExamId = (route: string): string => {
    let out = route;
    if (isApiMode && apiExam) out += `${out.includes("?") ? "&" : "?"}examId=${apiExam.id}`;
    if (reviewMode) out += `${out.includes("?") ? "&" : "?"}review=1`;
    return out;
  };

  const passages = useMemo(
    () => getReadingPassages(),
    // Nguồn đổi (vào API mode / đổi examId) → tính lại ngay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isApiMode, apiExam?.id],
  );
  // Deep link: /ielts/test/reading?passage=2 (or 1,3) → scope + jump there.
  const passageParam = searchParams.get("passage");

  useEffect(() => {
    startModule("reading");
  }, [startModule]);

  useEffect(() => {
    const groups = parseScopeParam("reading", passageParam);
    setScope("reading", groups);
    if (groups.length > 0) setCurrent("reading", firstIdOfPassage(groups[0]));
  }, [passageParam, setScope, setCurrent]);

  // Only the passages inside the practice scope are playable / listed.
  const scopedPassages = useMemo(() => {
    const groups = scopeGroups("reading", scope);
    return groups ? passages.filter((p) => groups.includes(p.config.passage)) : passages;
  }, [passages, scope]);
  const scopeIds = useMemo(() => scopeQuestionIds("reading", scope), [scope]);
  const isScoped = scopeGroups("reading", scope) !== null;

  const active =
    scopedPassages.find((p) => current.reading >= p.config.from && current.reading <= p.config.to) ??
    scopedPassages[0] ??
    passages[0];
  // Đề API không có Reading (URL gõ tay / link cũ) → active undefined: KHÔNG
  // được crash giữa render — useIeltsSkillGuard redirect chạy ở effect (sau render).
  const questions = active?.questions ?? [];
  const currentQ = questions.find((q) => q.id === current.reading) ?? questions[0];

  // Bring the focused question into view inside the right panel.
  useEffect(() => {
    const el = document.getElementById(`rq-${current.reading}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [current.reading]);

  // Chưa có Reading trong đề → placeholder (sau MỌI hook, an toàn rules-of-hooks).
  if (!active) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-extrabold text-foreground">Đề thi này không có phần Reading</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Đang chuyển bạn về kỹ năng chính của đề…
          </p>
        </div>
      </div>
    );
  }

  const goTo = (id: number) => setCurrent("reading", id);

  const goPassage = (passage: number) => {
    const cfg = READING_PASSAGES.find((p) => p.passage === passage);
    if (cfg && inScope("reading", passage, scope)) goTo(cfg.from);
  };

  const answeredInPassage = questions.filter((q) => answers[q.id]).length;
  const answeredInScope = scopeIds.filter((id) => answers[id]).length;
  const readingTotal = passages.reduce((n, p) => n + p.questions.length, 0);
  const answeredTotal = passages.reduce(
    (n, p) => n + p.questions.filter((q) => answers[q.id]).length,
    0,
  );
  const position = scopedPosition("reading", scope, current.reading);

  const currentIndex = questions.findIndex((q) => q.id === current.reading);
  const prev = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const next = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;
  // Next passage = the next one INSIDE the scope (never jumps out of a practice run).
  const nextPassage =
    scopedPassages.find((p) => p.config.passage > active.config.passage) ?? null;

  const jumpToParagraph = (label: string) => setJump({ label, at: Date.now() });

  return (
    <div className="xl:flex xl:h-full xl:min-h-0 xl:flex-col">
      {/* Passage strip — luôn nằm yên trên đỉnh: làm từng part nhỏ, đổi passage bất cứ lúc nào */}
      <div className="mb-3 shrink-0 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label="Reading" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              {active.passage.title} · {active.passage.topic}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {scopedPassages.map((p) => {
              const done = p.questions.filter((q) => answers[q.id]).length;
              const isActive = p.config.passage === active.config.passage;
              return (
                <button
                  key={p.config.passage}
                  type="button"
                  onClick={() => goPassage(p.config.passage)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                  title={p.passage.title}
                >
                  {p.config.label} · {done}/{p.questions.length}
                </button>
              );
            })}
          </div>
        </div>
        <ProgressBar
          className="mt-3"
          value={answeredInPassage}
          max={questions.length}
          caption={
            reviewMode
              ? `Xem lại ${active.config.label} — bạn đã làm ${answeredInPassage}/${questions.length} câu · đáp án hiện dưới mỗi câu`
              : isScoped
                ? `Đã làm ${answeredInPassage}/${questions.length} câu ${active.config.label} · ${answeredInScope}/${scopeIds.length} câu trong phạm vi luyện`
                : `Đã làm ${answeredInPassage}/${questions.length} câu ${active.config.label} · ${answeredTotal}/${readingTotal} toàn bộ Reading`
          }
        />
      </div>

      {/* Two-column CBT workspace — chỉ 2 cột cuộn nội dung, strip & footer đứng yên */}
      <div className="grid gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[48fr_52fr] xl:overflow-hidden">
        {/* LEFT — passage column: viewer + passage-side footer */}
        <div className="flex min-h-0 flex-col gap-4">
          <div className="min-h-0 flex-1">
            <PassageViewer passage={active.passage} jumpTo={jump} />
          </div>
          <div className="shrink-0 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {reviewMode
                  ? "Xem lại bài đã nộp — đọc lại bài & đối chiếu đáp án"
                  : "Reading · 60 phút — không có thời gian chuyển đáp án riêng"}
              </span>
              {(reviewMode || hasListening) && (
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() =>
                    navigate(
                      reviewMode
                        ? withExamId("/ielts/result")
                        : withExamId(`/ielts/test/listening${scopeSearch("listening", scope)}`),
                    )
                  }
                >
                  <ArrowLeft className="size-4" />
                  {reviewMode ? "Quay lại kết quả" : "Quay lại Listening"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — questions column */}
        <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card shadow-sm">
          {/* Question title + ghi chú / đánh dấu — đứng yên */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-extrabold text-background">
                {currentQ.num}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-foreground">
                  Câu {position.position}/{position.total} — {active.passage.title}
                </p>
                <p className="truncate text-[11px] font-semibold text-muted-foreground">
                  Đã làm {answeredInPassage}/{questions.length} câu đoạn này · cuộn độc lập với bài
                  đọc
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SectionBadge label={currentQ.paragraph ? `Paragraph ${currentQ.paragraph}` : "Passage"} tone="sky" />
              <button
                type="button"
                onClick={() => setNotesOpen((v) => !v)}
                aria-pressed={notesOpen}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  notesOpen
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                <StickyNote className="size-3.5" />
                Ghi chú
              </button>
              {!reviewMode && (
                <button
                  type="button"
                  onClick={() => toggleFlag(current.reading)}
                  aria-pressed={Boolean(flags[current.reading])}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                    flags[current.reading]
                      ? "border-amber-400 bg-amber-100 text-amber-800"
                      : "border-border bg-card text-muted-foreground hover:border-amber-300 hover:text-amber-700"
                  }`}
                >
                  <Flag className={`size-3.5 ${flags[current.reading] ? "fill-amber-400" : ""}`} />
                  {flags[current.reading] ? "Đã đánh dấu" : "Đánh dấu"}
                </button>
              )}
            </div>
          </div>

          {/* Independent scroll area */}
          <div className="scrollbar-none min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {notesOpen && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <label
                  htmlFor="ielts-reading-notes"
                  className="mb-2 block text-xs font-extrabold text-foreground"
                >
                  Ghi chú cho câu {current.reading}
                </label>
                <textarea
                  id="ielts-reading-notes"
                  rows={5}
                  value={notes[current.reading] ?? ""}
                  onChange={(e) => setNote(current.reading, e.target.value)}
                  placeholder="Ghi chú của bạn trong lúc làm bài..."
                  className="w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
              <BookOpen className="size-3.5 text-primary" />
              {reviewMode
                ? "Bôi đen chữ trong bài đọc để Tô sáng / Gạch chân / Bookmark — đọc lại y hệt lúc thi."
                : "Bôi đen chữ trong bài đọc để Tô sáng / Gạch chân / Bookmark ở cột bài đọc bên trái."}
            </div>

            {questions.map((q) => (
              <div key={q.id} id={`rq-${q.id}`} className="scroll-mt-4">
                <ReadingQuestionCard
                  question={q}
                  value={answers[q.id] ?? null}
                  onChange={(value) => selectAnswer(q.id, value)}
                  flagged={Boolean(flags[q.id])}
                  onToggleFlag={reviewMode ? undefined : () => toggleFlag(q.id)}
                  onFocusQuestion={() => {
                    if (q.id !== current.reading) goTo(q.id);
                  }}
                  onJumpToParagraph={jumpToParagraph}
                  active={q.id === current.reading}
                  review={reviewMode}
                />
              </div>
            ))}
          </div>

          {/* Prev / caption / next + submit — đứng yên */}
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={prev === null}
              onClick={() => prev && goTo(prev.id)}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Câu trước
            </Button>
            <span className="text-center text-[11px] font-semibold text-muted-foreground">
              {active.config.label} · câu {currentIndex + 1}/{questions.length}
            </span>
            <div className="flex items-center gap-2">
              {next ? (
                <Button size="sm" onClick={() => goTo(next.id)} className="gap-2">
                  Câu tiếp
                  <ArrowRight className="size-4" />
                </Button>
              ) : nextPassage ? (
                <Button
                  size="sm"
                  onClick={() => goPassage(nextPassage.config.passage)}
                  className="gap-2"
                >
                  {nextPassage.config.label}
                  <ArrowRight className="size-4" />
                </Button>
              ) : reviewMode ? (
                <Button
                  size="sm"
                  onClick={() => navigate(withExamId("/ielts/result"))}
                  className="gap-2"
                >
                  Quay lại kết quả
                  <Trophy className="size-4" />
                </Button>
              ) : hasWriting ? (
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(withExamId(`/ielts/test/writing${scopeSearch("writing", scope)}`))
                  }
                  className="gap-2"
                >
                  Sang Writing
                  <ArrowRight className="size-4" />
                </Button>
              ) : null}
              {!reviewMode && (
                <Button
                  variant={hasWriting ? "outline" : "default"}
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(withExamId("/ielts/review"))}
                >
                  Kiểm tra &amp; nộp
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
