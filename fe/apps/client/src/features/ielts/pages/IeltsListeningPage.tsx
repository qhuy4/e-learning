import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Flag, Headphones, StickyNote, Trophy } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import { useExamHasSkill, useIeltsSkillGuard } from "../hooks";
import { LISTENING_SECTIONS, QUESTION_TYPE_META, firstIdOfSection } from "../constants";
import { getListeningSections } from "../data/source";
import { inScope, parseScopeParam, scopeGroups, scopeQuestionIds, scopeSearch, scopedPosition } from "../scope";
import { AudioPlayer } from "../components/listening/AudioPlayer";
import { StimulusPanel } from "../components/listening/StimulusPanel";
import { ListeningQuestionCard } from "../components/question/ListeningQuestionCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

/** Listening exam page — Sections 1–4 with a simulated play-once audio player. */
export function IeltsListeningPage() {
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
  // Đề API không có Listening (đề 1 kỹ năng) → chuyển về kỹ năng đầu của đề.
  useIeltsSkillGuard("listening");
  // Listening-only → cuối phần không còn "Sang Reading" (chỉ còn "Kiểm tra & nộp").
  const hasReading = useExamHasSkill("reading");
  const [notesOpen, setNotesOpen] = useState(false);

  /** Giữ examId + review trên mọi route điều hướng (mất → mất nguồn data API). */
  const withExamId = (route: string): string => {
    let out = route;
    if (isApiMode && apiExam) out += `${out.includes("?") ? "&" : "?"}examId=${apiExam.id}`;
    if (reviewMode) out += `${out.includes("?") ? "&" : "?"}review=1`;
    return out;
  };

  const sections = useMemo(
    () => getListeningSections(),
    // Nguồn đổi (vào API mode / đổi examId) → tính lại ngay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isApiMode, apiExam?.id],
  );
  // Deep link: /ielts/test/listening?section=2 (or 1,3) → scope + jump there.
  const sectionParam = searchParams.get("section");

  useEffect(() => {
    startModule("listening");
  }, [startModule]);

  useEffect(() => {
    const groups = parseScopeParam("listening", sectionParam);
    setScope("listening", groups);
    if (groups.length > 0) setCurrent("listening", firstIdOfSection(groups[0]));
  }, [sectionParam, setScope, setCurrent]);

  // Only the sections inside the practice scope are playable / listed.
  const scopedSections = useMemo(() => {
    const groups = scopeGroups("listening", scope);
    return groups ? sections.filter((s) => groups.includes(s.config.section)) : sections;
  }, [sections, scope]);
  const scopeIds = useMemo(() => scopeQuestionIds("listening", scope), [scope]);
  const isScoped = scopeGroups("listening", scope) !== null;

  const active =
    scopedSections.find((s) => current.listening >= s.config.from && current.listening <= s.config.to) ??
    scopedSections[0] ??
    sections[0];
  // Đề API không có Listening (URL gõ tay / link cũ) → active undefined: KHÔNG
  // được crash giữa render — useIeltsSkillGuard redirect chạy ở effect (sau render).
  const questions = active?.questions ?? [];

  // Bring the focused question into view when it changes.
  useEffect(() => {
    const el = document.getElementById(`lq-${current.listening}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [current.listening]);

  // Chưa có Listening trong đề → placeholder (sau MỌI hook, an toàn rules-of-hooks).
  if (!active) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-extrabold text-foreground">
            Đề thi này không có phần Listening
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Đang chuyển bạn về kỹ năng chính của đề…
          </p>
        </div>
      </div>
    );
  }

  const answeredInSection = questions.filter((q) => answers[q.id]).length;
  const answeredInScope = scopeIds.filter((id) => answers[id]).length;
  const listeningTotal = sections.reduce((n, s) => n + s.questions.length, 0);
  const answeredTotal = sections.reduce(
    (n, s) => n + s.questions.filter((q) => answers[q.id]).length,
    0,
  );
  const position = scopedPosition("listening", scope, current.listening);

  const goTo = (id: number) => setCurrent("listening", id);

  const goSection = (section: number) => {
    const cfg = LISTENING_SECTIONS.find((s) => s.section === section);
    if (cfg && inScope("listening", section, scope)) goTo(cfg.from);
  };

  const currentIndex = questions.findIndex((q) => q.id === current.listening);
  const prev = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const next = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;
  // Next section = the next one INSIDE the scope (never jumps out of a practice run).
  const nextSection =
    scopedSections.find((s) => s.config.section > active.config.section) ?? null;

  return (
    <div className="xl:flex xl:h-full xl:min-h-0 xl:flex-col">
      {/* Section strip — luôn nằm yên trên đỉnh: làm từng part nhỏ, đổi part bất cứ lúc nào */}
      <div className="mb-3 shrink-0 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label="Listening" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              {active.config.label} — {active.config.typeLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {scopedSections.map(({ config: s }) => {
              const done = Object.keys(answers).filter(
                (id) => Number(id) >= s.from && Number(id) <= s.to,
              ).length;
              const isActive = s.section === active.config.section;
              return (
                <button
                  key={s.section}
                  type="button"
                  onClick={() => goSection(s.section)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                  title={`${s.label} · ${s.title}`}
                >
                  {s.label} · {done}/{s.to - s.from + 1}
                </button>
              );
            })}
          </div>
        </div>
        <ProgressBar
          className="mt-3"
          value={answeredInSection}
          max={questions.length}
          caption={
            isScoped
              ? `Đã làm ${answeredInSection}/${questions.length} câu ${active.config.label} · ${answeredInScope}/${scopeIds.length} câu trong phạm vi luyện`
              : `Đã làm ${answeredInSection}/${questions.length} câu Section ${active.config.section} · ${answeredTotal}/${listeningTotal} toàn bộ Listening`
          }
        />
      </div>

      {/* Workspace — audio cố định phía trên, hai cột dưới cuộn riêng (chỉ nội dung chạy) */}
      <div className="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <div className="mb-3 xl:mb-3 xl:shrink-0">
          <AudioPlayer
            key={active.config.section}
            title={active.stimulus.title}
            label={active.config.label}
            instruction={active.stimulus.instruction}
            durationSec={active.stimulus.audioDurationSec}
            src={active.stimulus.audioUrl}
            replay={reviewMode}
          />
        </div>

        <div className="grid gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
          {/* LEFT — stimulus cuộn riêng + footer đứng yên */}
          <div className="flex min-h-0 flex-col">
            <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
              <StimulusPanel
                stimulus={active.stimulus}
                answers={answers}
                markers={active.stimulus.kind === "map" ? questions.map((q) => q.num) : []}
                onBlankClick={(num) => goTo(num)}
              />
            </div>
            <div className="mt-3 shrink-0 rounded-xl border border-border bg-card p-3 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Flag className="size-3.5 shrink-0 text-amber-500" />
                Dùng cột bên trái để nhảy giữa các câu / section
              </p>
              <Button
                variant="ghost"
                className="mt-1 gap-2"
                onClick={() =>
                  navigate(
                    reviewMode
                      ? withExamId("/ielts/result")
                      : withExamId("/ielts/instructions"),
                  )
                }
              >
                <ArrowLeft className="size-4" />
                {reviewMode ? "Quay lại kết quả" : "Quay lại hướng dẫn"}
              </Button>
            </div>
          </div>

          {/* RIGHT — cột câu hỏi: header + cuộn riêng + footer đứng yên */}
          <div className="flex min-h-0 flex-col rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Headphones className="size-4 text-primary" />
                {reviewMode
                  ? `Câu ${position.position}/${position.total} — audio nghe lại được`
                  : `Câu ${position.position}/${position.total} — audio chỉ phát 1 lần`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Đã đánh dấu {Object.values(flags).filter(Boolean).length} câu
                </span>
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
              </div>
            </div>

            {/* Independent scroll area */}
            <div className="scrollbar-none min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {notesOpen && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <label
                    htmlFor="ielts-listening-notes"
                    className="mb-2 block text-xs font-extrabold text-foreground"
                  >
                    Ghi chú cho câu {current.listening}
                  </label>
                  <textarea
                    id="ielts-listening-notes"
                    rows={4}
                    value={notes[current.listening] ?? ""}
                    onChange={(e) => setNote(current.listening, e.target.value)}
                    placeholder="Ghi chú của bạn trong lúc làm bài..."
                    className="w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {questions.map((q) => {
                const isTextControl = QUESTION_TYPE_META[q.type]?.control === "text";
                return (
                  <div key={q.id} id={`lq-${q.id}`} className="scroll-mt-4">
                    <ListeningQuestionCard
                      question={q}
                      value={answers[q.id] ?? null}
                      onChange={(value) => selectAnswer(q.id, value)}
                      flagged={Boolean(flags[q.id])}
                      onToggleFlag={reviewMode ? undefined : () => toggleFlag(q.id)}
                      onFocusQuestion={() => {
                        if (q.id !== current.listening) goTo(q.id);
                      }}
                      active={q.id === current.listening}
                      autoFocus={q.id === current.listening && isTextControl}
                      review={reviewMode}
                    />
                  </div>
                );
              })}
            </div>

            {/* Prev / caption / next + submit — đứng yên, chỉ nội dung trên cuộn */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
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
              <span className="text-center text-xs font-semibold text-muted-foreground">
                {active.config.label} · câu {currentIndex + 1}/{questions.length}
              </span>
              <div className="flex items-center gap-2">
                {next ? (
                  <Button size="sm" onClick={() => goTo(next.id)} className="gap-2">
                    Câu tiếp
                    <ArrowRight className="size-4" />
                  </Button>
                ) : nextSection ? (
                  <Button
                    size="sm"
                    onClick={() => goSection(nextSection.config.section)}
                    className="gap-2"
                  >
                    {nextSection.config.label}
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
                ) : hasReading ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(withExamId(`/ielts/test/reading${scopeSearch("reading", scope)}`))
                    }
                    className="gap-2"
                  >
                    Sang Reading
                    <ArrowRight className="size-4" />
                  </Button>
                ) : null}
                {!reviewMode && (
                  <Button
                    variant={hasReading ? "outline" : "default"}
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
    </div>
  );
}
