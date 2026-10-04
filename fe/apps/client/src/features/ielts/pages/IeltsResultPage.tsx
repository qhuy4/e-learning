import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  BarChart3,
  BookOpen,
  Crown,
  Headphones,
  Home,
  ListChecks,
  Lightbulb,
  Mic,
  PenLine,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { IeltsHeader } from "../components/chrome/IeltsHeader";
import { AnalyticsCard, MetricBar, StackedBar } from "../components/result/AnalyticsCard";
import { BandRing } from "../components/result/BandRing";
import { BandScoreCard } from "../components/result/BandScoreCard";
import { CriteriaCard, criteriaFromBand } from "../components/result/CriteriaCard";
import { PremiumLockCard } from "../components/result/PremiumLockCard";
import { PremiumUpgradeModal } from "../components/result/PremiumUpgradeModal";
import { TeacherGradeButton } from "../../exams/components/TeacherGradeButton";
import { QuestionReviewList } from "../components/result/QuestionReviewList";
import type { QuestionReviewEntry } from "../components/result/QuestionReviewList";
import type { ReviewState } from "../components/result/QuestionReviewItem";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import { LISTENING_SECTIONS, READING_PASSAGES } from "../constants";
import { skillsInSections } from "../../exams/utils";
import { getAllQuestions } from "../data/source";
import { examService } from "../../exams/services/exam.service";
import { inScope, scopeQuestionIds, scopeSearch } from "../scope";
import type { IeltsModule } from "../types";
import {
  computeIeltsResult,
  formatBand,
  formatClock,
  isAnswerCorrect,
  loadSubmittedSnapshot,
  rebuildIeltsAnswersFromRows,
} from "../utils";

const ALL_MODULES: IeltsModule[] = ["listening", "reading", "writing", "speaking"];

/** Result / band report page (standalone — reads the submitted snapshot). */
export function IeltsResultPage() {
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const {
    scope,
    started: startedMap,
    isApiMode,
    apiExam,
    answers: ctxAnswers,
    flags: ctxFlags,
    result: ctxResult,
  } = useIeltsExam();
  /** Giữ chế độ đề API khi điều hướng từ trang kết quả. */
  const withExamId = (route: string): string =>
    isApiMode && apiExam
      ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}`
      : route;
  /** Mở route ở chế độ XEM LẠI bài đã nộp (?review=1). */
  const withReview = (route: string): string =>
    `${route}${route.includes("?") ? "&" : "?"}review=1`;

  const examId = apiExam?.id ?? null;

  // 1) Snapshot đã lưu lúc nộp (kèm điểm máy chủ) — chỉ hợp lệ khi đúng đề.
  const snapshot = useMemo(() => loadSubmittedSnapshot(), []);
  const snapshotOk = Boolean(
    snapshot && (!isApiMode || snapshot.examId == null || snapshot.examId === examId),
  );
  // 2) Kết quả còn trong context (vừa nộp trong phiên này).
  const ctxReady = ctxResult !== null;

  // 3) Không có 1) hay 2) → dựng lại báo cáo TỪ MÁY CHỦ (attempt + answers đã
  //    nộp, đảo binding). Không có attempt → trạng thái trung thực, không bịa.
  type ServerReport = {
    answers: Record<number, string>;
    result: ReturnType<typeof computeIeltsResult>;
    serverScore: number;
  };
  const [serverReport, setServerReport] = useState<ServerReport | null>(null);
  const [serverLoading, setServerLoading] = useState(false);

  useEffect(() => {
    if (!isApiMode || examId === null || snapshotOk || ctxReady) return;
    let cancelled = false;
    setServerLoading(true);
    (async () => {
      try {
        const attempts = await examService.getAttempts(examId);
        const submitted = attempts.find((a) => a.status === "SUBMITTED");
        if (!submitted) return;
        const rows = await examService.getAnswers(submitted.id);
        // Dựng lại bài nộp bằng helper chung (dùng chung với chế độ ?review=1).
        const rebuilt = rebuildIeltsAnswersFromRows(rows);
        if (!rebuilt) return;

        const timeSpentSec = submitted.submittedAt
          ? Math.max(
              0,
              Math.round(
                (Date.parse(submitted.submittedAt) - Date.parse(submitted.startedAt)) / 1000,
              ),
            )
          : 0;
        const result = computeIeltsResult({
          answers: rebuilt.answers,
          drafts: rebuilt.drafts,
          flags: {},
          speakingAnswered: rebuilt.speakingAnswered,
          timeSpentSec,
          speakingQuestionCount: rebuilt.speakingQuestionCount,
          speakingAnsweredCount: rebuilt.speakingAnsweredCount,
        });
        if (!cancelled)
          setServerReport({ answers: rebuilt.answers, result, serverScore: submitted.score });
      } catch {
        /* chưa đăng nhập / offline → rơi về trạng thái trung thực */
      } finally {
        if (!cancelled) setServerLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isApiMode, examId, snapshotOk, ctxReady]);

  const { answers, flags, result, empty, serverScore, snapshotStarted, snapshotScope } =
    useMemo(() => {
      if (snapshot && snapshotOk) {
        return {
          answers: snapshot.answers,
          flags: snapshot.flags,
          result: snapshot.result,
          empty: false,
          serverScore: snapshot.serverScore,
          snapshotStarted: snapshot.started,
          snapshotScope: snapshot.scope,
        };
      }
      if (ctxResult) {
        return {
          answers: ctxAnswers,
          flags: ctxFlags,
          result: ctxResult,
          empty: false,
          serverScore: undefined,
          snapshotStarted: undefined,
          snapshotScope: undefined,
        };
      }
      if (serverReport) {
        return {
          answers: serverReport.answers,
          flags: {},
          result: serverReport.result,
          empty: false,
          serverScore: serverReport.serverScore,
          snapshotStarted: undefined,
          snapshotScope: undefined,
        };
      }
      // Chưa có bài nộp nào → KHÔNG bịa dữ liệu mẫu; hiển thị trạng thái trung thực.
      return {
        answers: {},
        flags: {},
        result: computeIeltsResult({
          answers: {},
          drafts: {},
          flags: {},
          speakingAnswered: {},
          timeSpentSec: 0,
          speakingQuestionCount: 0,
          speakingAnsweredCount: 0,
        }),
        empty: true,
        serverScore: undefined,
        snapshotStarted: undefined,
        snapshotScope: undefined,
      };
    }, [
      snapshot,
      snapshotOk,
      ctxAnswers,
      ctxFlags,
      ctxResult,
      serverReport,
    ]);

  const questions = useMemo(
    () => getAllQuestions(),
    // Nguồn đổi (vào API mode / đổi examId) → tính lại ngay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isApiMode, examId],
  );

  // Practice scope in effect — the submitted snapshot wins after a hard refresh.
  const activeScope = snapshotScope ?? scope;

  // Modules the candidate actually took (context + snapshot). Nothing started
  // (demo report / direct visit) → show every module.
  const taken = useMemo(() => {
    const record: Partial<Record<IeltsModule, boolean>> = { ...startedMap, ...snapshotStarted };
    const anyStarted = ALL_MODULES.some((module) => record[module]);
    return new Set<IeltsModule>(ALL_MODULES.filter((module) => !anyStarted || record[module]));
  }, [startedMap, snapshotStarted]);

  // Route mở lại CHÍNH đề thi ở chế độ xem lại — kỹ năng mục tiêu đầu đã làm.
  const firstObjective: IeltsModule = taken.has("listening") ? "listening" : "reading";
  const reviewRoute = `/ielts/test/${firstObjective}${scopeSearch(firstObjective, activeScope)}`;

  // Kỹ năng THẬT của đề — mock full = đủ 4; đề API gồm đúng skill trong sections.
  // Kết hợp `taken` → chỉ hiện card/box của skill có trong đề VÀ đã làm
  // (đề Reading-only không hiện transcript Listening / tiêu chí Writing-Speaking).
  const examSkills = useMemo(() => {
    if (!(isApiMode && apiExam)) return new Set<IeltsModule>(ALL_MODULES);
    const present = skillsInSections(apiExam.sections).map((s) => s.toLowerCase());
    return new Set<IeltsModule>(ALL_MODULES.filter((m) => present.includes(m)));
  }, [isApiMode, apiExam]);
  const showSkill = (module: IeltsModule): boolean =>
    taken.has(module) && examSkills.has(module);

  // Question ids covered by the scope, per taken objective module.
  const reviewIds = useMemo(() => {
    const ids = new Set<number>();
    (["listening", "reading"] as const).forEach((module) => {
      if (taken.has(module)) scopeQuestionIds(module, activeScope).forEach((id) => ids.add(id));
    });
    return ids;
  }, [taken, activeScope]);

  const reviewed = useMemo<QuestionReviewEntry[]>(
    () =>
      questions
        .filter((question) => taken.has(question.module) && reviewIds.has(question.id))
        .map((question) => {
          const yourAnswer = answers[question.id] ?? "";
          const skipped = !yourAnswer.trim();
          const state: ReviewState = skipped
            ? "skipped"
            : isAnswerCorrect(question, yourAnswer)
              ? "correct"
              : "wrong";
          return { question, state, yourAnswer, flagged: Boolean(flags[question.id]) };
        }),
    [questions, answers, flags, taken, reviewIds],
  );

  const sectionStats = useMemo(
    () =>
      LISTENING_SECTIONS.filter(
        (section) => taken.has("listening") && inScope("listening", section.section, activeScope),
      ).map((section) => {
        const bucket = result.bySection[section.section] ?? { correct: 0, total: 0 };
        return { ...section, ...bucket };
      }),
    [result, taken, activeScope],
  );

  const passageStats = useMemo(
    () =>
      READING_PASSAGES.filter(
        (passage) => taken.has("reading") && inScope("reading", passage.passage, activeScope),
      ).map((passage) => {
        const bucket = result.byPassage[passage.passage] ?? { correct: 0, total: 0 };
        return { ...passage, ...bucket };
      }),
    [result, taken, activeScope],
  );

  const writingCriteria = useMemo(
    () =>
      criteriaFromBand(
        result.writingBand,
        ["TR", "CC", "LR", "GRA"],
        [
          "Task Response",
          "Coherence & Cohesion",
          "Lexical Resource",
          "Grammatical Range & Accuracy",
        ],
      ),
    [result.writingBand],
  );

  const stacks = [
    { label: "Trả lời đúng", value: result.correct, className: "bg-emerald-500" },
    { label: "Trả lời sai", value: result.wrong, className: "bg-rose-400" },
    { label: "Chưa làm", value: result.skipped, className: "bg-muted-foreground/40" },
  ];

  const countByState = (state: ReviewState) =>
    reviewed.filter((item) => item.state === state).length;
  const flaggedCount = reviewed.filter((item) => flags[item.question.id]).length;

  // Chỉ hiện card + dòng band của module ĐÃ LÀM (đề 1 kỹ năng → chỉ card của
  // kỹ năng đó, không hiện "0/0" của kỹ năng không có trong đề).
  const skills = [
    {
      key: "listening",
      label: "Listening",
      band: result.listeningBand,
      detail: `${result.listeningRaw.correct}/${result.listeningRaw.total} câu đúng`,
      icon: <Headphones className="size-4.5" />,
      accent: "sky" as const,
    },
    {
      key: "reading",
      label: "Reading",
      band: result.readingBand,
      detail: `${result.readingRaw.correct}/${result.readingRaw.total} câu đúng`,
      icon: <BookOpen className="size-4.5" />,
      accent: "amber" as const,
    },
    {
      key: "writing",
      label: "Writing",
      band: result.writingBand,
      detail: `${result.writingDone}/2 task đã viết`,
      icon: <PenLine className="size-4.5" />,
      accent: "emerald" as const,
      estimated: true,
    },
  ].filter((skill) => showSkill(skill.key as IeltsModule));

  // Speaking KHÔNG chấm tự động — card riêng "Chấm bởi giáo viên" thay vì band.
  const speakingTaken = showSkill("speaking");
  const bandSummary = skills.map((skill) => `${skill.label} ${formatBand(skill.band)}`).join(" · ");
  const summaryLine = [bandSummary, speakingTaken ? "Speaking chờ giáo viên chấm" : ""]
    .filter(Boolean)
    .join(" · ");
  // Đề Speaking-only: không upsell Premium trên trang kết quả (gỡ UI premium của Speaking).
  const premiumUpsellVisible = (["listening", "reading", "writing"] as const).some((m) =>
    showSkill(m),
  );

  /** Chưa có bài nộp nào → trạng thái trung thực, KHÔNG bịa dữ liệu mẫu. */
  if (empty) {
    return (
      <div className="exam-screen min-h-screen bg-muted/50 text-foreground">
        <IeltsHeader />
        <main className="mx-auto w-full max-w-2xl px-6 py-16">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <BarChart3 className="size-7" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-foreground">Chưa có bài nộp nào</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {serverLoading
                ? "Đang tải bài thi đã nộp từ máy chủ…"
                : isApiMode && apiExam
                  ? `Bạn chưa nộp bài cho đề "${apiExam.title}". Band điểm sẽ hiển thị ngay sau khi bạn hoàn thành và nộp bài.`
                  : "Bạn chưa hoàn thành và nộp bài. Band điểm sẽ hiển thị ngay sau khi bạn bấm “Nộp bài”."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate(withExamId("/ielts/instructions"))}>
                <RotateCcw className="size-4" />
                Làm bài ngay
              </Button>
              <Button variant="outline" onClick={() => navigate(withExamId("/ielts"))}>
                <Home className="size-4" />
                Về trang IELTS
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="exam-screen min-h-screen bg-muted/50 text-foreground">
      <IeltsHeader />

      <main className="mx-auto w-full max-w-[1240px] px-6 py-6">
        {serverScore !== undefined && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>
              Bài đã nộp máy chủ — <strong>điểm máy chủ: {serverScore}/100</strong> (attempt tự
              chấm khi nộp, không phải ước tính).
            </span>
            <Link to={withExamId("/ielts")} className="font-bold underline underline-offset-2">
              Quay lại trang đề
            </Link>
          </div>
        )}

        {/* Xem lại đề thi (chế độ review): chính GIAO DIỆN đề — đáp án dưới câu +
            navigator màu đúng/sai, audio nghe lại được (như TOEIC ?review=1). */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
          <span className="flex items-center gap-2 font-semibold">
            <Lightbulb className="size-4 shrink-0 text-amber-600" />
            Xem lại chính đề thi của bạn — đáp án &amp; giải thích hiện dưới mỗi câu, audio nghe lại
            được, bộ câu hỏi bên trái đứng yên.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
            onClick={() => navigate(withExamId(withReview(reviewRoute)))}
          >
            <RotateCcw className="size-4" />
            Xem lại đề thi — đáp án &amp; audio
          </Button>
        </div>

        {/* Overall band + skill cards */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-8">
            {skills.length > 0 ? (
              <BandRing
                value={result.overallBand}
                label="Overall band"
                caption={result.estimated ? "Ước tính" : "Đã nộp bài"}
              />
            ) : (
              // Speaking-only: không kỹ năng nào chấm tự động → vòng tròn "—" trung thực.
              <div
                className="relative inline-flex items-center justify-center"
                style={{ width: 200, height: 200 }}
              >
                <div className="absolute inset-0 rounded-full border-[14px] border-dashed border-muted" />
                <div className="flex flex-col items-center px-6 text-center">
                  <span className="text-5xl font-extrabold text-muted-foreground">—</span>
                  <span className="mt-0.5 text-xs font-bold text-muted-foreground">Overall band</span>
                  <span className="mt-2 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    Chờ giáo viên chấm Speaking
                  </span>
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Trophy className="size-3.5" />
                  Kết quả IELTS
                </span>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ước tính
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                Overall {formatBand(result.overallBand)}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{summaryLine}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Độ chính xác", value: `${result.accuracy}%`, hint: `${result.correct}/${result.totalObjective} câu` },
                  { label: "Bỏ trống", value: String(result.skipped), hint: "câu không trả lời" },
                  { label: "Gắn cờ", value: String(result.flagged), hint: "câu đã đánh dấu" },
                  { label: "Thời gian", value: formatClock(result.timeSpentSec), hint: "đã dùng" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 text-xl font-extrabold tabular-nums">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Four skills — Speaking là card "chấm giáo viên", không hiện band */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {skills.map((skill) => (
            <BandScoreCard key={skill.key} skill={skill} overall={result.overallBand} />
          ))}
          {speakingTaken && (
            <div
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              data-testid="speaking-teacher-card"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600">
                    <Mic className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold tracking-tight text-foreground">Speaking</p>
                    <p className="text-[11px] text-muted-foreground">
                      {result.speakingDone}/3 part đã ghi âm
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Không chấm tự động
                </span>
              </div>
              <p className="mt-4 text-lg font-extrabold text-foreground">Chấm bởi giáo viên</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Bài nói của bạn đã được ghi âm — gửi cho giáo viên chấm tay để nhận band và phản hồi
                chi tiết.
              </p>
              <div className="mt-3">
                <TeacherGradeButton skillLabel="Speaking" size="sm" fullWidth />
              </div>
            </div>
          )}
        </div>

        {/* Speaking — vào lại CHÍNH đề thi để nghe lại câu trả lời của mình */}
        {speakingTaken && (
          <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Headphones className="size-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">Nghe lại câu trả lời Speaking</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Bấm “Xem chi tiết” để mở lại CHÍNH đề thi Speaking ở chế độ xem lại — phát lại bản
                  ghi của bạn, mic tắt.
                </p>
              </div>
            </div>
            <Button
              className="gap-2"
              onClick={() => navigate(withExamId(withReview("/ielts/test/speaking")))}
            >
              <RotateCcw className="size-4" />
              Xem chi tiết trong đề thi — nghe lại bài
            </Button>
          </section>
        )}

        {/* Analytics */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <AnalyticsCard
            title="Phân bố bài làm"
            icon={<BarChart3 className="size-4" />}
            description={`Đúng · Sai · Bỏ trống trên ${result.totalObjective} câu trắc nghiệm`}
          >
            <StackedBar segments={stacks} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {showSkill("listening") && (
                <MetricBar
                  label="Listening"
                  value={result.listeningRaw.correct}
                  max={result.listeningRaw.total}
                  display={`${result.listeningRaw.correct}/${result.listeningRaw.total}`}
                  highlight="sky"
                />
              )}
              {showSkill("reading") && (
                <MetricBar
                  label="Reading"
                  value={result.readingRaw.correct}
                  max={result.readingRaw.total}
                  display={`${result.readingRaw.correct}/${result.readingRaw.total}`}
                  highlight="amber"
                />
              )}
            </div>
          </AnalyticsCard>

          {sectionStats.length > 0 && (
            <AnalyticsCard
              title="Listening theo Section"
              icon={<Headphones className="size-4" />}
              description="Số câu đúng từng section đã làm"
            >
              <div className="space-y-3">
                {sectionStats.map((section) => (
                  <div key={section.section} className="space-y-1">
                    <MetricBar
                      label={`${section.label} · ${section.title}`}
                      value={section.correct}
                      max={section.total}
                      display={`${section.correct}/${section.total}`}
                      highlight="sky"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          withExamId(
                            withReview(`/ielts/test/listening?section=${section.section}`),
                          ),
                        )
                      }
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Xem chi tiết trong đề thi →
                    </button>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          )}

          {passageStats.length > 0 && (
            <AnalyticsCard
              title="Reading theo Passage"
              icon={<BookOpen className="size-4" />}
              description="Số câu đúng từng passage đã làm"
            >
              <div className="space-y-3">
                {passageStats.map((passage) => (
                  <div key={passage.passage} className="space-y-1">
                    <MetricBar
                      label={passage.label}
                      value={passage.correct}
                      max={passage.total}
                      display={`${passage.correct}/${passage.total}`}
                      highlight="amber"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          withExamId(withReview(`/ielts/test/reading?passage=${passage.passage}`)),
                        )
                      }
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Xem chi tiết trong đề thi →
                    </button>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          )}

          {showSkill("writing") && (
          <AnalyticsCard
            title="Tiêu chí Writing"
            icon={<ListChecks className="size-4" />}
            description="Ước tính theo 4 tiêu chí IELTS chính thức"
          >
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-extrabold">Writing {formatBand(result.writingBand)}</p>
              <div className="mt-2 space-y-2">
                {writingCriteria.map((criterion) => (
                  <MetricBar
                    key={criterion.code}
                    label={`${criterion.code} · ${criterion.label}`}
                    value={criterion.score}
                    max={9}
                    display={formatBand(criterion.score)}
                    highlight="emerald"
                  />
                ))}
              </div>
            </div>
          </AnalyticsCard>
          )}
        </div>

        {/* Criteria detail cards — Writing (Speaking chấm giáo viên, không breakdown) */}
        {showSkill("writing") && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <CriteriaCard
            title="Writing — Breakdown theo tiêu chí"
            description="Task 1 & Task 2 · ước tính từ độ hoàn thành"
            icon={<PenLine className="size-4" />}
            criteria={writingCriteria}
          />
        </div>
        )}

        {/* Premium upsell — chỉ hiện box của skill CÓ trong đề; phần Speaking
            KHÔNG còn upsell Premium (chấm bằng giáo viên). */}
        {(showSkill("listening") || showSkill("writing")) && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {showSkill("listening") && (
          <PremiumLockCard
            title="Transcript nghe chi tiết"
            description="Đoạn hội thoại đầy đủ cho từng câu Listening, đối chiếu nhanh với đáp án."
            sample={[
              "— First name? — It's R-a-c-h-a-e-l, that's Rachel with…",
              "— Type of room? — A twin, please, non-smoking if possible…",
              "— Length of stay? — Six weeks, from the twelfth of March…",
            ]}
            onUnlock={() => setUpgradeOpen(true)}
          />
          )}
          {showSkill("writing") && (
          <PremiumLockCard
            title="Phản hồi Writing"
            description="Nhận xét theo 4 tiêu chí + gợi ý nâng band từ AI mentor."
            sample={[
              "Task Response: position is clear but supporting ideas need…",
              "Coherence: paragraphing is logical; linking words are overused…",
              "Grammar: range of complex structures, minor article errors…",
            ]}
            onUnlock={() => setUpgradeOpen(true)}
          />
          )}
        </div>
        )}

        {/* Per-question explanations */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Lightbulb className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold">Giải thích chi tiết</h3>
                <p className="text-xs text-muted-foreground">
                  Đáp án đúng/sai, giải thích và từ vựng theo từng câu trong phạm vi đã làm
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold text-muted-foreground">
                {reviewed.length} câu
              </span>
              <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {countByState("correct")} đúng
              </span>
              <span className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                {countByState("wrong")} sai
              </span>
              <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold text-muted-foreground">
                {countByState("skipped")} bỏ trống
              </span>
              {flaggedCount > 0 && (
                <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  {flaggedCount} gắn cờ
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            {reviewed.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Chưa có câu nào trong phạm vi đã làm — hãy làm bài rồi nộp để xem giải thích.
              </p>
            ) : (
              <QuestionReviewList items={reviewed} />
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {premiumUpsellVisible && (
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Crown className="size-5" />
              </span>
              <div>
                <p className="font-extrabold tracking-tight">Muốn chắc chắn đạt band mục tiêu?</p>
                <p className="text-sm text-muted-foreground">
                  Làm lại bài test, xem transcript và nhận phản hồi chi tiết với Premium.
                </p>
              </div>
            </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => navigate(withExamId("/ielts"))}>
                <Home className="size-4" />
                Quay lại trang đề
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(withExamId("/ielts/instructions"))}
              >
                <RotateCcw className="size-4" />
                Làm lại bài test
              </Button>
              {premiumUpsellVisible && (
              <Button className="gap-2" onClick={() => setUpgradeOpen(true)}>
                <Crown className="size-4" />
                Nâng cấp Premium
              </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <PremiumUpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
