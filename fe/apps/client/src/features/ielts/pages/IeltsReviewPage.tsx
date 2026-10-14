import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flag,
  Headphones,
  Mic,
  PenLine,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import {
  LISTENING_SECTIONS,
  MODULE_META,
  READING_PASSAGES,
} from "../constants";
import { getSpeakingParts } from "../mocks/speaking-data";
import { IELTS_WRITING_TASKS } from "../mocks/writing-data";
import { inScope, scopeSearch } from "../scope";
import { countWords, formatClock, isSpeakingPartRecorded, saveSubmittedSnapshot } from "../utils";
import type { IeltsModule, ObjectiveModule } from "../types";
import { IeltsHeader } from "../components/chrome/IeltsHeader";
import { SectionBadge } from "../components/common/SectionBadge";
import { ReviewModal } from "../components/common/ReviewModal";

interface GroupBlock {
  key: string;
  label: string;
  caption: string;
  ids: number[];
}

function idRange(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const OBJECTIVE_UI: Record<
  ObjectiveModule,
  { icon: typeof Headphones; route: string; chip: string }
> = {
  listening: {
    icon: Headphones,
    route: "/ielts/test/listening",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
  },
  reading: {
    icon: BookOpen,
    route: "/ielts/test/reading",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

/**
 * Review page — full inventory of the exam before submitting:
 * per-section navigator grids, jump-to-unanswered / jump-to-flagged,
 * Writing & Speaking status, then the final `ReviewModal` confirmation.
 */
export function IeltsReviewPage() {
  const navigate = useNavigate();
  const {
    answers,
    flags,
    notes,
    drafts,
    timeLeft,
    started,
    speakingAnswered,
    speakingTranscript,
    scope,
    setCurrent,
    submitExam,
    isApiMode,
    apiExam,
    submitToServer,
  } = useIeltsExam();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  // Practice scope — a section-2-only run reviews (and counts) section 2 only.
  const writingTasks = IELTS_WRITING_TASKS.filter((task) => inScope("writing", task.id, scope));
  const speakingParts = getSpeakingParts().filter((part) => inScope("speaking", part.part, scope));
  const writingRoute = `/ielts/test/writing${scopeSearch("writing", scope)}`;
  const speakingRoute = `/ielts/test/speaking${scopeSearch("speaking", scope)}`;
  const routeFor = (module: ObjectiveModule) =>
    `${OBJECTIVE_UI[module].route}${scopeSearch(module, scope)}`;

  // Số câu Listening THẬT (suy từ config đang dùng, có thể splice theo DB) — không hardcode 40.
  const listeningBase = LISTENING_SECTIONS.reduce((m, s) => Math.max(m, s.to), 0);

  const blocksByModule = useMemo<Record<ObjectiveModule, GroupBlock[]>>(
    () => ({
      listening: LISTENING_SECTIONS.filter((s) => inScope("listening", s.section, scope)).map(
        (s) => ({
          key: `s${s.section}`,
          label: `${s.label} · ${s.title}`,
          caption: `Câu ${s.from}–${s.to} · ${s.typeLabel}`,
          ids: idRange(s.from, s.to),
        }),
      ),
      reading: READING_PASSAGES.filter((p) => inScope("reading", p.passage, scope)).map((p) => ({
        key: `p${p.passage}`,
        label: p.label,
        caption: `Câu ${p.from - listeningBase}–${p.to - listeningBase} · ${p.title}`,
        ids: idRange(p.from, p.to),
      })),
    }),
    [scope, listeningBase],
  );

  const sourceByModule = useMemo<Record<ObjectiveModule, number[]>>(
    () => ({
      listening: blocksByModule.listening.flatMap((block) => block.ids),
      reading: blocksByModule.reading.flatMap((block) => block.ids),
    }),
    [blocksByModule],
  );

  // Only show / count what the candidate actually started.
  // Fresh deep-link to /ielts/review (nothing started) → fall back to everything.
  const anyStarted = (Object.keys(started) as IeltsModule[]).some((key) => started[key]);
  const showListening = !anyStarted || started.listening;
  const showReading = !anyStarted || started.reading;
  const showWriting = !anyStarted || started.writing;
  const showSpeaking = !anyStarted || started.speaking;

  const modules: ObjectiveModule[] = (["listening", "reading"] as ObjectiveModule[]).filter(
    (moduleKey) => (moduleKey === "listening" ? showListening : showReading),
  );

  const totalObjective = modules.reduce(
    (sum, moduleKey) => sum + sourceByModule[moduleKey].length,
    0,
  );
  const answeredCount = modules.reduce(
    (sum, moduleKey) => sum + sourceByModule[moduleKey].filter((id) => answers[id]?.trim()).length,
    0,
  );
  const unansweredCount = Math.max(0, totalObjective - answeredCount);
  const flaggedCount = modules.reduce(
    (sum, moduleKey) => sum + sourceByModule[moduleKey].filter((id) => flags[id]).length,
    0,
  );
  const writingWords = showWriting
    ? writingTasks.reduce((sum, task) => sum + countWords(drafts[task.id] ?? ""), 0)
    : 0;
  const speakingDone = showSpeaking
    ? speakingParts.filter((part) => isSpeakingPartRecorded(part, speakingAnswered)).length
    : 0;
  const speakingPending = showSpeaking ? Math.max(0, speakingParts.length - speakingDone) : 0;
  // No objective module in scope (Writing/Speaking only) → nothing left to answer.
  const completionPct =
    totalObjective === 0 ? 100 : Math.round((answeredCount / totalObjective) * 100);

  const timeSpentSec = (Object.keys(started) as IeltsModule[]).reduce(
    (sum, key) => (started[key] ? sum + Math.max(0, MODULE_META[key].minutes * 60 - timeLeft[key]) : sum),
    0,
  );

  const firstUnanswered = (module: ObjectiveModule): number | null =>
    sourceByModule[module].find((id) => !answers[id] || !answers[id].trim()) ?? null;

  const firstFlagged = (module: ObjectiveModule): number | null =>
    sourceByModule[module].find((id) => flags[id]) ?? null;

  const jump = (module: ObjectiveModule, id: number | null) => {
    if (id === null) return;
    setCurrent(module, id);
    navigate(withExamId(routeFor(module)));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Đề API: nộp lên máy chủ trước (objective + essay + transcript) → nhận
      // attempt thật (điểm máy chủ chấm) rồi mới chấm local để hiển thị chi tiết.
      const attempt = isApiMode ? await submitToServer() : null;
      const computed = submitExam();
      saveSubmittedSnapshot({
        answers,
        drafts,
        flags,
        notes,
        speakingAnswered,
        speakingTranscript,
        started,
        scope,
        result: computed,
        serverScore: attempt?.score ?? undefined,
        attemptId: attempt?.id ?? undefined,
        examId: apiExam?.id,
      });
      setModalOpen(false);
      navigate(withExamId("/ielts/result"));
    } catch {
      setModalOpen(false);
      setSubmitError(
        "Nộp bài lên máy chủ thất bại — hãy kiểm tra kết nối và đăng nhập, rồi bấm “Nộp bài & xem kết quả” thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="exam-screen min-h-screen bg-muted/50 text-foreground">
      <IeltsHeader />

      <main className="mx-auto w-full max-w-[1240px] px-6 py-6">
        {/* Summary */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <SectionBadge label="Ôn tập & Nộp bài" tone="amber" />
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                Rà soát bài làm IELTS
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Kiểm tra các câu trả lời, nhảy tới câu chưa làm hoặc đã gắn cờ, rồi xác nhận
                nộp bài để xem band ước tính.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Thời gian đã dùng
              </p>
              <p className="font-mono text-2xl font-extrabold tabular-nums">
                {formatClock(timeSpentSec)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[
              { label: "Đã trả lời", value: `${answeredCount}/${totalObjective}`, hint: "Câu trắc nghiệm", accent: "text-sky-600" },
              { label: "Chưa trả lời", value: String(unansweredCount), hint: "Cần hoàn thiện", accent: "text-amber-600" },
              { label: "Đã gắn cờ", value: String(flaggedCount), hint: "Cần xem lại", accent: "text-rose-600" },
              { label: "Từ đã viết", value: String(writingWords), hint: "Writing Task 1–2", accent: "text-emerald-600" },
              {
                label: "Đã hoàn thành",
                value: `${completionPct}%`,
                hint: "Phần đã bắt đầu",
                accent: "text-primary",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className={`mt-1 text-2xl font-extrabold tabular-nums ${stat.accent}`}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{stat.hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Objective modules */}
        {modules.map((moduleKey) => {
          const ui = OBJECTIVE_UI[moduleKey];
          const Icon = ui.icon;
          const moduleIds = sourceByModule[moduleKey];
          const answeredInModule = moduleIds.filter((id) => answers[id]?.trim()).length;
          const nextUnanswered = firstUnanswered(moduleKey);
          const nextFlagged = firstFlagged(moduleKey);

          return (
            <section
              key={moduleKey}
              className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-muted">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-lg font-extrabold tracking-tight">
                      {MODULE_META[moduleKey].label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {moduleIds.length} câu · {MODULE_META[moduleKey].minutes} phút ·{" "}
                      {answeredInModule}/{moduleIds.length} đã trả lời
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${ui.chip}`}>
                    {answeredInModule}/{moduleIds.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={nextUnanswered === null}
                    onClick={() => jump(moduleKey, nextUnanswered)}
                  >
                    <ArrowRight className="size-4" />
                    Chưa trả lời
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={nextFlagged === null}
                    onClick={() => jump(moduleKey, nextFlagged)}
                  >
                    <ShieldAlert className="size-4" />
                    Gắn cờ
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(withExamId(routeFor(moduleKey)))}
                  >
                    Làm bài
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {blocksByModule[moduleKey].map((block) => {
                  const answeredInBlock = block.ids.filter((id) => answers[id]?.trim()).length;
                  return (
                    <div key={block.key}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full bg-primary" />
                          <span className="text-sm font-bold">{block.label}</span>
                          <span className="text-xs text-muted-foreground">({block.caption})</span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {answeredInBlock}/{block.ids.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {block.ids.map((id) => {
                          const display =
                            moduleKey === "reading" ? id - listeningBase : id;
                          const answered = Boolean(answers[id]?.trim());
                          const flagged = Boolean(flags[id]);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => jump(moduleKey, id)}
                              aria-label={`Câu ${display}${answered ? " — đã làm" : " — chưa làm"}`}
                              className={`relative flex size-8 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                                answered
                                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                              }`}
                            >
                              {display}
                              {flagged && (
                                <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500 ring-1 ring-card" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Writing */}
        {showWriting && (
          <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-muted">
                  <PenLine className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-extrabold tracking-tight">
                    {MODULE_META.writing.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {writingTasks.length} tasks · {MODULE_META.writing.minutes} phút · {writingWords} từ đã viết
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => navigate(withExamId(writingRoute))}
              >
                Mở Writing
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {writingTasks.map((task) => {
                const words = countWords(drafts[task.id] ?? "");
                const done = words >= task.minWords;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => navigate(withExamId(writingRoute))}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      done
                        ? "border-emerald-300 bg-emerald-50/60 hover:border-emerald-400"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold">{task.label}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                          done
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-amber-300 bg-amber-100 text-amber-700"
                        }`}
                      >
                        {done ? "Đủ số từ" : "Chưa đủ số từ"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.title}</p>
                    <p className="mt-2 text-xs font-semibold text-foreground">
                      {words}/{task.minWords} từ
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Speaking */}
        {showSpeaking && (
          <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-muted">
                  <Mic className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-extrabold tracking-tight">
                    {MODULE_META.speaking.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {speakingParts.length} parts · đã ghi âm {speakingDone}/{speakingParts.length} part
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => navigate(withExamId(speakingRoute))}
              >
                Mở Speaking
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {speakingParts.map((part) => {
                const recorded = isSpeakingPartRecorded(part, speakingAnswered);
                const recordedCount = part.questions.filter((q) => speakingAnswered[q.id]).length;
                return (
                  <button
                    key={part.part}
                    type="button"
                    onClick={() => navigate(withExamId(speakingRoute))}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      recorded
                        ? "border-emerald-300 bg-emerald-50/60 hover:border-emerald-400"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold">{part.label}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                          recorded
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-amber-300 bg-amber-100 text-amber-700"
                        }`}
                      >
                        {recorded
                          ? "Đã ghi âm"
                          : recordedCount > 0
                            ? `${recordedCount}/${part.questions.length} câu`
                            : "Chưa ghi âm"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{part.title}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Submit */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="font-extrabold tracking-tight">Sẵn sàng nộp bài?</p>
                <p className="text-sm text-muted-foreground">
                  {unansweredCount > 0
                    ? `Còn ${unansweredCount} câu chưa trả lời — câu trống sẽ được tính là sai.`
                    : "Tất cả câu trắc nghiệm đã được trả lời. Nộp bài để xem kết quả chi tiết."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => navigate(withExamId("/ielts"))}>
                <ArrowLeft className="size-4" />
                Quay lại trang đề
              </Button>
              <Button size="lg" className="gap-2" onClick={() => setModalOpen(true)}>
                <Flag className="size-4" />
                Nộp bài &amp; xem kết quả
              </Button>
            </div>
          </div>
        </section>

        {submitError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>{submitError}</p>
          </div>
        )}
      </main>

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        stats={[
          { label: "Đã trả lời", value: `${answeredCount}/${totalObjective}`, tone: "primary" },
          { label: "Chưa trả lời", value: unansweredCount, tone: "amber" },
          { label: "Gắn cờ", value: flaggedCount },
          { label: "Từ đã viết", value: writingWords, tone: "emerald" },
        ]}
        warning={
          unansweredCount > 0
            ? `Còn ${unansweredCount} câu trắc nghiệm chưa trả lời${
                speakingPending > 0 ? ` và ${speakingPending} part Speaking chưa ghi âm` : ""
              }. Sau khi nộp, bạn sẽ không thể chỉnh sửa bài làm.`
            : `Bạn đã trả lời toàn bộ câu trắc nghiệm. Sau khi nộp, bạn sẽ không thể chỉnh sửa bài làm và sẽ chuyển sang trang kết quả band ước tính.`
        }
        confirmLabel={submitting ? "Đang nộp bài…" : "Nộp bài ngay"}
        confirmDisabled={submitting}
      />
    </div>
  );
}
