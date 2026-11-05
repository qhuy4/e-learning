import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Clock,
  Eye,
  Headphones,
  Home,
  Mic,
  Pencil,
  Play,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { AnalyticsCard, MetricBar } from "../components/result/AnalyticsCard";
import { PartScoreCard } from "../components/result/PartScoreCard";
import { PremiumUpsellCard } from "../components/result/PremiumUpsellCard";
import { QuestionReviewSection } from "../components/result/QuestionReviewSection";
import { ResultScoreCard } from "../components/result/ResultScoreCard";
import { ScoreRing } from "../components/result/ScoreRing";
import { TaskReviewSection } from "../components/result/TaskReviewSection";
import type { ToeicMode } from "../types";
import { TaskScoreCard } from "../components/result/TaskScoreCard";
import { SectionBadge } from "../components/common/SectionBadge";
import { InstructorGradeButton } from "../../exams/components/InstructorGradeButton";
import {
  DEFAULT_TOEIC_CONFIG,
  QUESTION_TOTAL,
  SPEAKING_TASK_COUNT,
  TOEIC_PARTS,
  WRITING_TASK_COUNT,
  effectiveTasks,
} from "../constants";
import { TIME_PER_PART, TOEIC_WRITING_TASKS } from "../mocks/exam-mock";
import { getToeicApiSource, getToeicQuestions } from "../data/source";
import { useToeicExam } from "../contexts/toeic-exam-context";
import { SPEAKING_TASKS } from "../mocks/speaking-mock";
import { examService } from "../../exams/services/exam.service";
import {
  computeToeicResult,
  countWords,
  loadSubmittedSnapshot,
  rebuildAnswersFromRows,
  startRouteForConfig,
} from "../utils";

/** Result / score report page (standalone — reads the submitted snapshot). */
export function ToeicResultPage() {
  const navigate = useNavigate();
  const {
    answers: ctxAnswers,
    drafts: ctxDrafts,
    speaking: ctxSpeaking,
    speakingAudio: ctxSpeakingAudio,
    result: ctxResult,
    config: ctxConfig,
    isApiMode,
    apiExam,
  } = useToeicExam();
  /** Giữ chế độ đề API khi điều hướng từ trang kết quả. */
  const withExamId = (route: string): string =>
    isApiMode && apiExam
      ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}`
      : route;

  const examId = apiExam?.id ?? null;

  // 1) Snapshot đã lưu lúc nộp (kèm điểm máy chủ) — chỉ hợp lệ khi đúng đề.
  const snapshot = useMemo(() => loadSubmittedSnapshot(), []);
  const snapshotOk = Boolean(
    snapshot && (!isApiMode || snapshot.examId == null || snapshot.examId === examId),
  );
  // 2) Kết quả còn trong context (vừa nộp trong phiên này).
  const ctxReady = ctxResult !== null;

  // 3) Không có 1) hay 2) → dựng lại báo cáo TỪ MÁY CHỦ:
  //    attempt đã nộp + danh sách answers, đảo binding (questionId/optionId →
  //    số câu hiển thị/letter). Không có attempt → trạng thái trung thực.
  type ServerReport = {
    answers: Record<number, string>;
    drafts: Record<number, string>;
    speaking: Record<number, boolean>;
    result: ReturnType<typeof computeToeicResult>;
    serverScore: number;
    config: typeof DEFAULT_TOEIC_CONFIG;
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
        const source = getToeicApiSource();
        if (!source) return;
        // Đảo binding (questionId/optionId → số câu hiển thị/letter) — helper
        // dùng chung với chế độ xem lại đề thi (?review=1), không bịa dữ liệu.
        const { answers, drafts, speaking } = rebuildAnswersFromRows(source, rows);
        // Mode suy từ nguồn: có câu hỏi → lr; có task Writing → writing; còn lại speaking.
        const parts = [...new Set(source.questions.map((q) => q.part))].sort((a, b) => a - b);
        const mode: ToeicMode =
          source.questions.length > 0
            ? "lr"
            : source.writingTasks.length > 0
              ? "writing"
              : "speaking";
        const tasks =
          mode === "writing"
            ? source.writingTasks.map((task) => task.id)
            : mode === "speaking"
              ? source.speakingTasks.map((task) => task.id)
              : [];
        const config = { ...DEFAULT_TOEIC_CONFIG, mode, parts, tasks };
        const result = computeToeicResult(answers, drafts, speaking, config);
        if (!cancelled) {
          setServerReport({
            answers,
            drafts,
            speaking,
            result,
            serverScore: submitted.score,
            config,
          });
        }
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

  const { answers, drafts, speaking, result, config, empty, serverScore } = useMemo(() => {
    if (snapshot && snapshotOk) {
      return {
        answers: snapshot.answers,
        drafts: snapshot.drafts,
        speaking: snapshot.speaking,
        result: snapshot.result,
        config: snapshot.config,
        serverScore: snapshot.serverScore,
        empty: false,
      };
    }
    if (ctxResult) {
      return {
        answers: ctxAnswers,
        drafts: ctxDrafts,
        speaking: ctxSpeaking,
        result: ctxResult,
        config: ctxConfig,
        serverScore: undefined,
        empty: false,
      };
    }
    if (serverReport) {
      return {
        answers: serverReport.answers,
        drafts: serverReport.drafts,
        speaking: serverReport.speaking,
        result: serverReport.result,
        config: serverReport.config,
        serverScore: serverReport.serverScore,
        empty: false,
      };
    }
    // Chưa có bài nộp nào → KHÔNG bịa dữ liệu mẫu; hiển thị trạng thái trung thực.
    return {
      answers: {},
      drafts: {},
      speaking: {},
      result: computeToeicResult({}, {}, {}, {}),
      config: DEFAULT_TOEIC_CONFIG,
      serverScore: undefined,
      empty: true,
    };
  }, [snapshot, snapshotOk, ctxAnswers, ctxDrafts, ctxSpeaking, ctxResult, ctxConfig, serverReport]);

  // Strict mode scoping: L&R shows only objective stats, Writing/Speaking only their own flow.
  const mode = config.mode;
  const isLr = mode === "lr";
  const isWriting = mode === "writing";
  const isSpeaking = mode === "speaking";

  // Scoped to the parts actually taken (older snapshots fall back to everything).
  const testedParts = useMemo(
    () => (result.parts && result.parts.length > 0 ? result.parts : TOEIC_PARTS.map((p) => p.part)),
    [result.parts],
  );
  const testedSet = useMemo(() => new Set(testedParts), [testedParts]);
  const questionTotal = result.questionTotal ?? QUESTION_TOTAL;
  const writingTaskTotal = result.writingTaskTotal ?? WRITING_TASK_COUNT;
  const speakingTaskTotal = result.speakingTaskTotal ?? SPEAKING_TASK_COUNT;

  const partStats = useMemo(
    () =>
      TOEIC_PARTS.filter((p) => testedSet.has(p.part)).map((p) => {
        const bucket = result.correctByPart[String(p.part)] ?? { correct: 0, total: 0 };
        const pct = bucket.total > 0 ? Math.round((bucket.correct / bucket.total) * 100) : 0;
        return { ...p, ...bucket, pct };
      }),
    [result, testedSet],
  );

  const listeningStats = partStats.filter((p) => p.section === "listening");
  const readingStats = partStats.filter((p) => p.section === "reading");
  const listeningTotal = listeningStats.reduce((sum, p) => sum + p.total, 0);
  const readingTotal = readingStats.reduce((sum, p) => sum + p.total, 0);
  const listeningCorrect = listeningStats.reduce((sum, p) => sum + p.correct, 0);
  const readingCorrect = readingStats.reduce((sum, p) => sum + p.correct, 0);

  const strongest = partStats.reduce((a, b) => (b.pct > a.pct ? b : a), partStats[0]);
  const weakest = partStats.reduce((a, b) => (b.pct < a.pct ? b : a), partStats[0]);
  const correctTotal = partStats.reduce((sum, p) => sum + p.correct, 0);
  const wrong = Math.max(0, result.answered - correctTotal);
  const unanswered = Math.max(0, questionTotal - result.answered);
  const accuracy = result.answered > 0 ? Math.round((correctTotal / result.answered) * 100) : 0;
  const maxMinutes = Math.max(1, ...partStats.map((p) => TIME_PER_PART[String(p.part)] ?? 0));

  // L&R review scope: every multiple-choice question inside the tested parts.
  // Writing/Speaking modes never fall back to objective questions.
  const reviewQuestions = useMemo(
    () =>
      isLr ? getToeicQuestions().filter((q) => testedSet.has(q.part)) : [],
    [isLr, testedSet],
  );

  // Task scope: only the tasks of the active mode — NO fallback to out-of-mode
  // tasks just because a draft/recording exists.
  const writingTasks = useMemo(() => {
    if (!isWriting) return [];
    const scoped = new Set(effectiveTasks("writing", config.tasks));
    return TOEIC_WRITING_TASKS.filter((task) => scoped.has(task.id));
  }, [isWriting, config.tasks]);

  const speakingTasks = useMemo(() => {
    if (!isSpeaking) return [];
    const scoped = new Set(effectiveTasks("speaking", config.tasks));
    return SPEAKING_TASKS.filter((task) => scoped.has(task.id));
  }, [isSpeaking, config.tasks]);

  // Task-oriented stats (Writing / Speaking modes).
  const writingStats = useMemo(() => {
    const words = writingTasks.map((task) => countWords((drafts[task.id] ?? "").trim()));
    const totalWords = words.reduce((sum, w) => sum + w, 0);
    return {
      words,
      totalWords,
      avg: words.length > 0 ? Math.round(totalWords / words.length) : 0,
      done: writingTasks.filter((_, i) => words[i] >= 3).length,
      atLength: writingTasks.filter((task, i) => words[i] >= task.minWords).length,
    };
  }, [writingTasks, drafts]);

  const speakingStats = useMemo(() => {
    const recordedSec = speakingTasks.map((task) => (speaking[task.id] ? task.responseSec : 0));
    const recorded = recordedSec.filter((s) => s > 0).length;
    const totalSec = recordedSec.reduce((sum, s) => sum + s, 0);
    return {
      recordedSec,
      recorded,
      totalSec,
      avg: recorded > 0 ? Math.round(totalSec / recorded) : 0,
    };
  }, [speakingTasks, speaking]);

  const maxSpeakingSec = Math.max(1, ...speakingTasks.map((task) => task.responseSec));

  const stacked = [
    { label: "Trả lời đúng", value: correctTotal, className: "bg-emerald-500" },
    { label: "Trả lời sai", value: wrong, className: "bg-red-400" },
    { label: "Chưa làm", value: unanswered, className: "bg-muted-foreground/40" },
  ];

  // Score ring + subtitle follow the active mode (L&R / Writing / Speaking).
  const ring = isLr
    ? { value: result.total, max: 990, label: "Tổng điểm", caption: "Listening + Reading" }
    : isWriting
      ? {
          value: result.writing,
          max: 200,
          label: "Điểm Writing",
          caption: `Writing · ${writingTaskTotal} task`,
        }
      : {
          value: result.speaking ?? 0,
          max: 200,
          label: "Điểm Speaking",
          caption: `Speaking · ${speakingTaskTotal} task`,
        };

  const subtitle = isLr
    ? `Làm xong ${result.answered}/${questionTotal} câu trắc nghiệm · đánh dấu ${result.flagged} câu · độ chính xác ${accuracy}% số câu đã làm.`
    : isWriting
      ? `Hoàn thành ${writingStats.done}/${writingTaskTotal} task Writing (≥ 3 từ) · tổng ${writingStats.totalWords} từ · trung bình ${writingStats.avg} từ/task.`
      : `Đã ghi âm ${speakingStats.recorded}/${speakingTaskTotal} task Speaking (ghi bằng mic) · trung bình ${speakingStats.avg}s/task.`;

  const scoreSection = isLr
    ? {
        title: "Điểm theo từng part",
        desc: "Bấm “Xem chi tiết” để mở lại chính đề thi của part — có đáp án, audio nghe lại và màu đúng/sai.",
      }
    : {
        title: "Điểm theo từng task",
        desc: "Trạng thái từng task và nút nhảy tới chi tiết bài làm.",
      };

  const writingStatRows = [
    { label: "Task hoàn thành (≥ 3 từ)", value: `${writingStats.done}/${writingTaskTotal}` },
    { label: "Task đạt độ dài yêu cầu", value: `${writingStats.atLength}/${writingTaskTotal}` },
    { label: "Tổng số từ đã viết", value: String(writingStats.totalWords) },
    { label: "Số từ trung bình mỗi task", value: String(writingStats.avg) },
  ];
  const speakingStatRows = [
    { label: "Task đã ghi âm", value: `${speakingStats.recorded}/${speakingTaskTotal}` },
    {
      label: "Task chưa ghi âm",
      value: `${Math.max(0, speakingTaskTotal - speakingStats.recorded)}/${speakingTaskTotal}`,
    },
    { label: "Tổng thời gian trả lời", value: `${speakingStats.totalSec}s` },
    { label: "Thời gian trung bình mỗi task", value: `${speakingStats.avg}s` },
  ];

  // /toeic/instructions?mode=…&parts=…&tasks=… (chỉ thêm tham số khi có chọn lọc).
  const instructionParams = new URLSearchParams({ mode });
  if (config.parts.length > 0) instructionParams.set("parts", config.parts.join(","));
  if (config.tasks.length > 0) instructionParams.set("tasks", config.tasks.join(","));
  const instructionsPath = withExamId(`/toeic/instructions?${instructionParams.toString()}`);

  /** Cuộn mượt tới khối chi tiết có id tương ứng (`part-{n}` / `task-{n}`). */
  const scrollToBlock = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Chưa có bài nộp nào → trạng thái trung thực, KHÔNG bịa dữ liệu mẫu. */
  if (empty) {
    return (
      <div className="exam-screen min-h-screen bg-muted/50">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link
              to={withExamId("/toeic")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
              title="Quay lại trang TOEIC"
            >
              <ArrowLeft className="size-3.5" />
              Quay lại
            </Link>
            <span className="text-sm font-extrabold text-foreground">Kết quả bài thi</span>
            <span aria-hidden className="w-[86px]" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <BarChart3 className="size-7" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-foreground">Chưa có bài nộp nào</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {serverLoading
                ? "Đang tải bài thi đã nộp từ máy chủ…"
                : isApiMode && apiExam
                  ? `Bạn chưa nộp bài cho đề "${apiExam.title}". Kết quả sẽ hiển thị ngay sau khi bạn hoàn thành và nộp bài.`
                  : "Bạn chưa hoàn thành và nộp bài thi. Kết quả sẽ hiển thị ngay sau khi bạn bấm “Nộp bài”."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate(withExamId(startRouteForConfig(config)))}>
                <Play className="size-4" />
                Làm bài ngay
              </Button>
              <Button variant="outline" onClick={() => navigate(withExamId("/toeic"))}>
                <Home className="size-4" />
                Về trang TOEIC
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="exam-screen min-h-screen bg-muted/50">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            to={withExamId("/toeic")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
            title="Quay lại trang TOEIC"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <span className="text-sm font-extrabold text-foreground">Kết quả bài thi</span>
          <span aria-hidden className="w-[86px]" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Title */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SectionBadge label="Kết quả" tone="primary" />
              {!isSpeaking && <SectionBadge label={`CEFR ${result.cefr}`} tone="amber" />}
              {serverScore !== undefined && (
                <SectionBadge label={`Điểm máy chủ: ${serverScore}/100`} tone="primary" />
              )}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-foreground">
              {isSpeaking ? "Báo cáo bài Speaking của bạn" : "Báo cáo điểm TOEIC của bạn"}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Xem lại đề thi (chế độ review): chính giao diện đề — đáp án dưới câu +
              navigator tô màu đúng/sai — audio nghe lại được. */}
          {isLr && (
            <Button
              size="lg"
              className="gap-2"
              onClick={() =>
                navigate(withExamId(`${startRouteForConfig(config)}?review=1`))
              }
            >
              <Eye className="size-4" />
              Xem lại đề thi — đáp án &amp; audio
            </Button>
          )}
          {/* Speaking — vào lại CHÍNH trang Speaking để nghe lại câu trả lời. */}
          {isSpeaking && (
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate(withExamId("/toeic/speaking?review=1"))}
            >
              <Eye className="size-4" />
              Xem chi tiết trong đề thi — nghe lại bài
            </Button>
          )}
        </div>

        {/* Score overview — fixed track sizes (a `320fr_1fr` track collapsed the score cards) */}
        <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            {isSpeaking ? (
              // Speaking KHÔNG chấm tự động → thay vòng điểm bằng card nhờ giáo viên chấm.
              <div className="w-full">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <Mic className="size-7" />
                </span>
                <p className="mt-4 text-sm font-bold text-foreground">
                  Speaking — không chấm tự động
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Bài nói của bạn đã ghi âm — gửi cho giáo viên chấm tay để nhận điểm và phản hồi.
                </p>
                <div className="mt-4">
                  <InstructorGradeButton skillLabel="Speaking" size="sm" fullWidth />
                </div>
              </div>
            ) : (
              <>
                <ScoreRing value={ring.value} max={ring.max} label={ring.label} />
                <p className="mt-4 text-sm font-bold text-foreground">{ring.caption}</p>
                <span className="mt-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-extrabold text-primary">
                  CEFR {result.cefr}
                </span>
                {isLr && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Mục tiêu 700 điểm:{" "}
                    <strong className={result.total >= 700 ? "text-emerald-600" : "text-amber-600"}>
                      {result.total >= 700 ? "Đạt" : "Còn " + (700 - result.total) + " điểm"}
                    </strong>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Chỉ hiện thẻ điểm của phần thật sự đã thi trong mode hiện tại. */}
          <div className="grid gap-4 sm:grid-cols-2">
            {isLr && listeningStats.length > 0 && (
              <ResultScoreCard
                label="Listening"
                value={result.listening}
                max={495}
                icon={<Headphones className="size-4" />}
                hint={`${listeningCorrect}/${listeningTotal} câu đúng các part đã chọn`}
              />
            )}
            {isLr && readingStats.length > 0 && (
              <ResultScoreCard
                label="Reading"
                value={result.reading}
                max={495}
                icon={<BookOpen className="size-4" />}
                hint={`${readingCorrect}/${readingTotal} câu đúng các part đã chọn`}
              />
            )}
            {isWriting && (
              <ResultScoreCard
                label="Writing"
                value={result.writing}
                max={200}
                icon={<Pencil className="size-4" />}
                hint={`${writingStats.done}/${writingTaskTotal} task đã viết ≥ 3 từ`}
              />
            )}
            {isSpeaking && (
              <ResultScoreCard
                label="Task đã ghi âm"
                value={speakingStats.recorded}
                max={speakingTaskTotal}
                icon={<Mic className="size-4" />}
                hint={`${speakingStats.totalSec}s đã thu · bản ghi giữ trong phiên`}
              />
            )}
          </div>
        </section>

        {/* Điểm theo từng part (L&R) / từng task (Writing · Speaking) */}
        <section>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isLr ? (
                <BarChart3 className="size-4" />
              ) : isWriting ? (
                <Pencil className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </span>
            <div>
              <h2 className="text-base font-extrabold text-foreground">{scoreSection.title}</h2>
              <p className="text-xs text-muted-foreground">{scoreSection.desc}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLr &&
              partStats.map((p) => (
                <PartScoreCard
                  key={p.part}
                  label={p.label}
                  title={p.title}
                  section={p.section}
                  correct={p.correct}
                  total={p.total}
                  pct={p.pct}
                  onViewDetail={() =>
                    // Mở lại CHÍNH đề thi của part (chế độ xem lại ?review=1&part=N):
                    // đáp án hiện dưới câu, navigator tô màu đúng/sai, audio nghe lại.
                    navigate(
                      withExamId(
                        `/toeic/run/${p.section === "listening" ? "listening" : "reading"}?review=1&part=${p.part}`,
                      ),
                    )
                  }
                />
              ))}

            {isWriting &&
              writingTasks.map((task, index) => {
                const words = writingStats.words[index] ?? 0;
                const done = words >= 3;
                return (
                  <TaskScoreCard
                    key={task.id}
                    taskNumber={task.id}
                    kind="writing"
                    title={task.title}
                    done={done}
                    statusLabel={done ? "Đã viết" : "Chưa viết"}
                    metricLabel={`${words} từ · yêu cầu ${task.minWords}+`}
                    progressValue={words}
                    progressMax={task.minWords}
                    progressDisplay={`${words}/${task.minWords}+ từ`}
                    onViewDetail={() => scrollToBlock(`task-${task.id}`)}
                  />
                );
              })}

            {isSpeaking &&
              speakingTasks.map((task) => {
                const recorded = Boolean(speaking[task.id]);
                return (
                  <TaskScoreCard
                    key={task.id}
                    taskNumber={task.id}
                    kind="speaking"
                    title={task.group}
                    done={recorded}
                    statusLabel={recorded ? "Đã ghi âm" : "Chưa ghi âm"}
                    metricLabel={`Chuẩn bị ${task.prepSec}s · Trả lời ${task.responseSec}s`}
                    onViewDetail={() => scrollToBlock(`task-${task.id}`)}
                  />
                );
              })}
          </div>
        </section>

        {/* Analytics — L&R: chỉ số khách quan; Writing/Speaking: thống kê theo task */}
        {isLr && (
          <section className="grid gap-4 md:grid-cols-2">
            <AnalyticsCard
              title="Đúng / Sai / Chưa làm"
              icon={<Target className="size-4" />}
              description={`${accuracy}% số câu đã làm trả lời đúng`}
            >
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {stacked.map((s) => (
                  <div
                    key={s.label}
                    className={s.className}
                    style={{ width: `${questionTotal > 0 ? (s.value / questionTotal) * 100 : 0}%` }}
                  />
                ))}
              </div>
              <ul className="mt-3 space-y-2">
                {stacked.map((s) => (
                  <li key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`size-3 rounded-sm ${s.className}`} />
                      {s.label}
                    </span>
                    <strong className="tabular-nums text-foreground">
                      {s.value} ({questionTotal > 0 ? Math.round((s.value / questionTotal) * 100) : 0}%)
                    </strong>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                Hoàn thành {result.answered}/{questionTotal} câu trắc nghiệm của các part đã chọn.
              </p>
            </AnalyticsCard>

            <AnalyticsCard
              title="Thời gian trung bình theo Part"
              icon={<Clock className="size-4" />}
              description="Phút (dữ liệu minh họa)"
            >
              <div className="space-y-2.5">
                {partStats.map((p) => (
                  <MetricBar
                    key={p.part}
                    label={p.label}
                    value={TIME_PER_PART[String(p.part)] ?? 0}
                    max={maxMinutes}
                    display={`${TIME_PER_PART[String(p.part)] ?? 0} phút`}
                    highlight="muted"
                  />
                ))}
              </div>
            </AnalyticsCard>
          </section>
        )}

        {isWriting && (
          <section className="grid gap-4 md:grid-cols-2">
            <AnalyticsCard
              title="Tổng quan Writing"
              icon={<Pencil className="size-4" />}
              description={`${writingStats.done}/${writingTaskTotal} task hoàn thành`}
            >
              <ul className="space-y-2">
                {writingStatRows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <strong className="tabular-nums text-foreground">{row.value}</strong>
                  </li>
                ))}
              </ul>
            </AnalyticsCard>

            <AnalyticsCard
              title="Số từ theo Task"
              icon={<BarChart3 className="size-4" />}
              description="So với độ dài yêu cầu của từng task"
            >
              <div className="space-y-2.5">
                {writingTasks.map((task, index) => {
                  const words = writingStats.words[index] ?? 0;
                  return (
                    <MetricBar
                      key={task.id}
                      label={`Task ${task.id}`}
                      value={words}
                      max={Math.max(1, task.minWords)}
                      display={`${words}/${task.minWords}+ từ`}
                      highlight={words >= task.minWords ? "primary" : "amber"}
                    />
                  );
                })}
              </div>
            </AnalyticsCard>
          </section>
        )}

        {isSpeaking && (
          <section className="grid gap-4 md:grid-cols-2">
            <AnalyticsCard
              title="Tổng quan Speaking"
              icon={<Mic className="size-4" />}
              description={`${speakingStats.recorded}/${speakingTaskTotal} task đã ghi âm`}
            >
              <ul className="space-y-2">
                {speakingStatRows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <strong className="tabular-nums text-foreground">{row.value}</strong>
                  </li>
                ))}
              </ul>
              {/* Speaking không chấm tự động — nhờ giáo viên chấm. */}
              <div className="mt-4 border-t border-border pt-4">
                <InstructorGradeButton skillLabel="Speaking" size="sm" fullWidth />
              </div>
            </AnalyticsCard>

            <AnalyticsCard
              title="Thời gian trả lời theo Task"
              icon={<BarChart3 className="size-4" />}
              description="Giây (thời lượng task đã ghi — chưa ghi âm = 0s)"
            >
              <div className="space-y-2.5">
                {speakingTasks.map((task, index) => {
                  const sec = speakingStats.recordedSec[index] ?? 0;
                  return (
                    <MetricBar
                      key={task.id}
                      label={`Task ${task.id}`}
                      value={sec}
                      max={maxSpeakingSec}
                      display={sec > 0 ? `${sec}s` : "Chưa ghi âm"}
                      highlight={sec > 0 ? "primary" : "muted"}
                    />
                  );
                })}
              </div>
            </AnalyticsCard>
          </section>
        )}

        {/* Weakest / strongest — chỉ dành cho Listening & Reading (theo part) */}
        {isLr && (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                <Trophy className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Phần mạnh nhất
                </p>
                <p className="text-sm font-extrabold text-foreground">
                  {strongest?.label} · {strongest?.pct}% đúng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-amber-600">
                <Target className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Cần cải thiện
                </p>
                <p className="text-sm font-extrabold text-foreground">
                  {weakest?.label} · {weakest?.pct}% đúng
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Chi tiết: nhóm theo part (L&R) hoặc theo task (Writing/Speaking) — xếp chồng, không tab */}
        {isLr && <QuestionReviewSection questions={reviewQuestions} answers={answers} />}
        {(isWriting || isSpeaking) && (
          <TaskReviewSection
            writingTasks={writingTasks}
            drafts={drafts}
            speakingTasks={speakingTasks}
            speaking={speaking}
            speakingAudio={ctxSpeakingAudio}
          />
        )}

        {/* Premium — không upsell trên kết quả Speaking (đã gỡ UI premium của phần này). */}
        {!isSpeaking && <PremiumUpsellCard />}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate(withExamId(startRouteForConfig(config)))}
          >
            <RotateCcw className="size-4" />
            Làm lại
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate(instructionsPath)}>
            <Play className="size-4" />
            Chọn lại phần &amp; thời gian
          </Button>
          <Button size="lg" className="gap-2" onClick={() => navigate(withExamId("/toeic"))}>
            <Home className="size-4" />
            Quay lại trang đề
          </Button>
        </div>
      </main>
    </div>
  );
}
