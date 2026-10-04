import { useMemo, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flag,
  Headphones,
  History,
  Mic,
  Pencil,
  Play,
  Trophy,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useExamDetail, useMyAttempts } from "../../exams/hooks";
import { countExamQuestions } from "../../exams/utils";
import { SectionBadge } from "../components/common/SectionBadge";
import { buildToeicTasks } from "../data/api-source";
import {
  SECTION_DESCRIPTIONS,
  MOCK_LANDING_INFO,
  TIME_PER_PART,
  TOEIC_WRITING_TASKS,
} from "../mocks/exam-mock";
import { SPEAKING_GROUPS, SPEAKING_TASKS } from "../mocks/speaking-mock";
import {
  SECTION_META,
  TOEIC_PARTS,
  SPEAKING_TASK_COUNT,
  effectiveTasks,
} from "../constants";
import type { ToeicMode } from "../types";

/** Decorative mini-preview of the CBT interface (right side of the hero). */
function InterfacePreview() {
  return (
    <div className="rounded-xl border border-border bg-background/90 p-3 shadow-inner">
      <div className="flex items-center gap-2 rounded-lg bg-foreground px-2 py-1.5">
        <span className="rounded bg-background px-1.5 py-0.5 text-[9px] font-black text-foreground">
          TOEIC
        </span>
        <span className="h-1.5 flex-1 rounded-full bg-background/25" />
        <span className="rounded bg-background/20 px-1.5 py-0.5 font-mono text-[9px] text-background">
          44:59
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <div className="grid w-16 shrink-0 grid-cols-3 gap-1 self-start rounded-lg border border-border bg-card p-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={`size-4 rounded-sm ${
                i < 5 ? "bg-primary" : i === 7 ? "bg-amber-300" : "border border-border bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 rounded-lg border border-border bg-card p-2">
          <div className="flex items-center gap-1.5">
            <span className="size-4 rounded-sm bg-foreground" />
            <span className="h-2 w-20 rounded-full bg-muted" />
          </div>
          {[true, false, false, false].map((active, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-md border p-1 ${
                active ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span
                className={`size-3 rounded-full ${
                  active ? "bg-primary" : "border border-border bg-muted"
                }`}
              />
              <span className={`h-1.5 flex-1 rounded-full ${active ? "bg-primary/40" : "bg-muted"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartGroup({
  icon,
  title,
  meta,
  children,
}: {
  icon: ReactNode;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{meta}</span>
      </div>
      {children}
    </div>
  );
}

/** "5,6" → [5,6]; bỏ mọi giá trị không phải số nguyên dương. */
function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ];
}

/** Ước tính phút làm bài (dữ liệu minh họa) — làm tròn lên bội số 5. */
function roundUp5(minutes: number): number {
  return Math.max(5, Math.ceil(minutes / 5) * 5);
}

/**
 * TOEIC landing / trang preview của đề.
 *
 * Chỉ hiển thị nội dung của đề đang xem — đọc `?mode=lr|writing|speaking`
 * (mặc định lr) kèm `?parts=` / `?tasks=` để thu hẹp đúng phần đã chọn.
 * Card đề thi trong trang /exams trỏ vào đây trước, rồi mới sang cấu hình.
 */
export function ToeicLandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?examId=… → đề thật từ máy chủ (chế độ L&R, ghi nhận attempt qua API).
  const parsedExamId = Number(searchParams.get("examId"));
  const examId = Number.isInteger(parsedExamId) && parsedExamId > 0 ? parsedExamId : null;
  const apiMode = examId !== null;
  const { data: apiExam } = useExamDetail(examId ?? 0);
  const { data: myAttempts } = useMyAttempts();

  const apiAttempts = (myAttempts ?? []).filter((attempt) => attempt.examId === examId);
  const apiLastAttempt = [...apiAttempts].sort(
    (a, b) =>
      new Date(b.submittedAt ?? b.createdAt).getTime() -
      new Date(a.submittedAt ?? a.createdAt).getTime(),
  )[0];

  const modeParam = searchParams.get("mode");
  const requestedMode: ToeicMode | null =
    modeParam === "lr" || modeParam === "writing" || modeParam === "speaking"
      ? modeParam
      : null;

  // Đề API: mode suy từ CẤU TRÚC section của CHÍNH đề — đề Writing-only →
  // writing, Speaking-only → speaking, L&R 7 Part → lr (không ép cứng "lr").
  // ?mode=… vẫn được tôn trọng nếu đề thật có section đó (URL cũ / luyện riêng).
  const apiTasks = useMemo(
    () => (apiMode && apiExam ? buildToeicTasks(apiExam) : null),
    [apiMode, apiExam],
  );
  const apiQuestionCount = useMemo(() => countExamQuestions(apiExam?.sections), [apiExam]);
  const caps: Record<ToeicMode, boolean> = apiTasks
    ? {
        lr: apiTasks.hasParts,
        writing: apiTasks.writingTasks.length > 0,
        speaking: apiTasks.speakingTasks.length > 0,
      }
    : { lr: true, writing: false, speaking: false };
  const mode: ToeicMode = apiMode
    ? !apiExam
      ? (requestedMode ?? "lr") // đang tải đề — giữ mode theo URL, chốt lại khi có dữ liệu
      : requestedMode && caps[requestedMode]
        ? requestedMode
        : caps.lr
          ? "lr"
          : caps.writing
            ? "writing"
            : "speaking"
    : modeParam === "writing"
      ? "writing"
      : modeParam === "speaking"
        ? "speaking"
        : "lr";
  const info = MOCK_LANDING_INFO[mode];

  // ---------------------------------------------------------- phạm vi đề
  const parsedParts = parseIds(searchParams.get("parts")).filter((n) =>
    TOEIC_PARTS.some((p) => p.part === n),
  );
  const selectedParts = parsedParts.length > 0 ? parsedParts : TOEIC_PARTS.map((p) => p.part);
  const visibleParts = TOEIC_PARTS.filter((p) => selectedParts.includes(p.part));
  const listeningParts = visibleParts.filter((p) => p.section === "listening");
  const readingParts = visibleParts.filter((p) => p.section === "reading");
  const questionCount = visibleParts.reduce((sum, p) => sum + (p.to - p.from + 1), 0);
  const isFullLr = visibleParts.length === TOEIC_PARTS.length;

  // Bộ task Writing/Speaking: đề API lấy từ CHÍNH đề (đọc từ DB), không có
  // examId → giữ bộ mock. Id ngoài đề thật bị loại khỏi lựa chọn.
  const writingPool = apiTasks?.writingTasks ?? TOEIC_WRITING_TASKS;
  const speakingPool = apiTasks?.speakingTasks ?? SPEAKING_TASKS;
  const writingTaskIds = effectiveTasks("writing", parseIds(searchParams.get("tasks"))).filter(
    (id) => writingPool.some((task) => task.id === id),
  );
  const visibleWritingTasks = writingPool.filter((task) => writingTaskIds.includes(task.id));
  const isFullWriting = writingTaskIds.length === writingPool.length;

  const speakingTaskIds = effectiveTasks("speaking", parseIds(searchParams.get("tasks"))).filter(
    (id) => speakingPool.some((task) => task.id === id),
  );
  const visibleSpeakingGroups = SPEAKING_GROUPS.filter((group) =>
    speakingTaskIds.some((t) => t >= group.from && t <= group.to),
  );
  const isFullSpeaking = speakingTaskIds.length === speakingPool.length;

  // -------------------------------------------------- số liệu theo mode
  const sumPartMinutes = (parts: typeof visibleParts) =>
    parts.reduce((sum, p) => sum + (TIME_PER_PART[String(p.part)] ?? 0), 0);

  const lrMinutes = isFullLr
    ? SECTION_META.listening.minutes + SECTION_META.reading.minutes
    : roundUp5(sumPartMinutes(visibleParts));
  const writingMinutes = isFullWriting
    ? SECTION_META.writing.minutes
    : roundUp5(writingTaskIds.length * 7.5);
  const speakingMinutes = isFullSpeaking
    ? SECTION_META.speaking.minutes
    : roundUp5(
        speakingTaskIds.length * (SECTION_META.speaking.minutes / SPEAKING_TASK_COUNT),
      );

  const taskCount = mode === "writing" ? writingTaskIds.length : speakingTaskIds.length;
  const minutes =
    mode === "lr" ? lrMinutes : mode === "writing" ? writingMinutes : speakingMinutes;
  const isFullScope =
    mode === "lr" ? isFullLr : mode === "writing" ? isFullWriting : isFullSpeaking;
  const countBadge =
    mode === "lr"
      ? `${apiMode && apiExam ? apiQuestionCount : questionCount} câu hỏi`
      : `${taskCount} task`;
  const minutesBadge = `${isFullScope ? "" : "~"}${minutes} phút`;

  const scopeText =
    mode === "lr"
      ? `Đề đang xem: ${visibleParts.map((p) => p.label).join(", ")} — ${questionCount} câu.`
      : mode === "writing"
        ? `Đề đang xem: ${writingTaskIds.map((t) => `Task ${t}`).join(", ")}.`
        : `Đề đang xem: ${speakingTaskIds.map((t) => `Task ${t}`).join(", ")}.`;

  const hero = apiMode
    ? {
        title: apiExam?.title ?? "Đề thi TOEIC (đang tải…)",
        desc:
          apiExam?.description ??
          "Đề thi TOEIC thật từ máy chủ — làm bài trên giao diện CBT rồi nộp để hệ thống chấm điểm và lưu lịch sử.",
      }
    : mode === "writing"
      ? {
          title: "TOEIC Writing",
          desc: "Bài thi Writing tách riêng với 8 task (Write an E-mail, Write a Response, Opinion Essay…) làm trên giao diện thi máy tính: đọc đề, soạn nháp rồi nộp từng task.",
        }
      : mode === "speaking"
        ? {
            title: "TOEIC Speaking",
            desc: "Bài thi Speaking tách riêng với 11 task (Read Aloud, Describe a Picture, Respond to Questions…) — ghi âm bằng mic ngay trên giao diện CBT, nghe lại được, có đếm giờ từng task.",
          }
        : {
            title: "TOEIC Listening & Reading",
            desc: "Bài thi thử Listening & Reading theo chuẩn ETS trên giao diện CBT: header đếm giờ, bộ câu hỏi bên trái, cờ đánh dấu và trang kiểm tra trước khi nộp. Bấm vào từng part để luyện riêng part đó.",
          };

  const partsParam = searchParams.get("parts");
  const tasksParam = searchParams.get("tasks");
  const qs = searchParams.toString();
  // Đề API: LUÔN kèm mode theo cấu trúc đề thật (đề Writing-only → mode=writing,
  // không rơi về L&R) + phạm vi luyện riêng (parts/tasks) nếu người dùng chọn.
  const startUrl = apiMode
    ? `/toeic/instructions?examId=${examId}&mode=${mode}` +
      (mode === "lr" && partsParam ? `&parts=${encodeURIComponent(partsParam)}` : "") +
      (mode !== "lr" && tasksParam ? `&tasks=${encodeURIComponent(tasksParam)}` : "")
    : qs
      ? `/toeic/instructions?${qs}`
      : "/toeic/instructions";
  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    apiMode ? `${route}${route.includes("?") ? "&" : "?"}examId=${examId}` : route;

  const infoRows = apiMode
    ? [
        {
          icon: BookOpen,
          label: mode === "lr" ? "Số câu hỏi" : "Số task",
          value: mode === "lr" ? `${apiQuestionCount} câu` : `${taskCount} task`,
        },
        {
          icon: Clock,
          label: "Thời lượng",
          value: `${Math.max(1, Math.round((apiExam?.durationSeconds ?? 7200) / 60))} phút`,
        },
        { icon: Flag, label: "Loại đề", value: apiExam?.examTypeName ?? "TOEIC" },
        {
          icon: History,
          label: "Số lần đã làm",
          value: myAttempts === undefined ? "…" : `${apiAttempts.length} lần`,
        },
        {
          icon: Trophy,
          label: "Điểm gần nhất",
          value: apiLastAttempt ? `${apiLastAttempt.score}/100` : "—",
        },
      ]
    : [
        {
          icon: BookOpen,
          label: mode === "lr" ? "Số câu hỏi" : "Số task",
          value: mode === "lr" ? `${questionCount} câu` : `${taskCount} task`,
        },
        { icon: Clock, label: "Thời lượng", value: minutesBadge },
        { icon: Flag, label: "Cấp độ", value: info.level },
        { icon: History, label: "Số lần đã làm", value: `${info.attempts} lần` },
        { icon: Trophy, label: "Điểm gần nhất", value: `${info.lastScore} / ${info.scoreMax}` },
      ];

  /** Premium badge của thẻ "Thông tin bài thi" — theo đề thật khi ở chế độ API. */
  const isPremiumBadge = apiMode ? Boolean(apiExam?.isPremium) : info.isPremium;

  const partRowLink = (part: (typeof TOEIC_PARTS)[number]) => (
    <Link
      to={withExamId(`/toeic/instructions?mode=lr&parts=${part.part}`)}
      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5 transition-colors hover:border-primary hover:bg-primary/10"
      title={`Luyện riêng ${part.label} — ${part.title}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <SectionBadge label={part.label} tone="primary" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{part.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {SECTION_DESCRIPTIONS[String(part.part)]}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary">
        Câu {part.from}–{part.to} →
      </span>
    </Link>
  );

  const listeningCount = listeningParts.reduce((sum, p) => sum + (p.to - p.from + 1), 0);
  const readingCount = readingParts.reduce((sum, p) => sum + (p.to - p.from + 1), 0);
  const allListening = TOEIC_PARTS.filter((p) => p.section === "listening");
  const allReading = TOEIC_PARTS.filter((p) => p.section === "reading");
  const listeningMeta = `${
    listeningParts.length === allListening.length
      ? SECTION_META.listening.minutes
      : `~${roundUp5(sumPartMinutes(listeningParts))}`
  } phút`;
  const readingMeta = `${
    readingParts.length === allReading.length
      ? SECTION_META.reading.minutes
      : `~${roundUp5(sumPartMinutes(readingParts))}`
  } phút`;
  const writingMeta = `${isFullWriting ? "" : "~"}${writingMinutes} phút`;
  const speakingMeta = `${isFullSpeaking ? "" : "~"}${speakingMinutes} phút`;

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4 lg:px-6">
        {/* Hero — chỉ hiện nội dung của đề đang xem */}
        <section className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.7fr_1fr] lg:p-8">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SectionBadge label={`TOEIC · ${mode === "lr" ? "Listening & Reading" : mode === "writing" ? "Writing" : "Speaking"}`} tone="primary" />
              <SectionBadge label={isFullScope ? "Cả đề" : "Luyện riêng từng phần"} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              {hero.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {hero.desc}
            </p>
            {!isFullScope && (
              <p className="mt-2 max-w-xl text-sm font-semibold text-primary">{scopeText}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <SectionBadge label={countBadge} tone="primary" />
              <SectionBadge label={minutesBadge} />
              {apiMode ? (
                <>
                  <SectionBadge
                    label={apiExam?.isPremium ? "Premium" : "Miễn phí"}
                    tone={apiExam?.isPremium ? "amber" : "muted"}
                  />
                  <SectionBadge label="Nộp bài lên máy chủ" tone="primary" />
                </>
              ) : (
                <>
                  <SectionBadge label="Bài thi thử miễn phí" />
                  <SectionBadge label="Chưa tính điểm chính thức" tone="amber" />
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" onClick={() => navigate(startUrl)}>
                <Play className="size-4" />
                Bắt đầu thi
              </Button>
              {mode === "lr" && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(withExamId("/toeic/instructions?mode=lr&parts=2"))}
                >
                  Luyện Part riêng
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  navigate(
                    withExamId(
                      mode === "writing"
                        ? "/toeic/writing"
                        : mode === "speaking"
                          ? "/toeic/speaking"
                          : "/toeic/run/listening",
                    ),
                  )
                }
              >
                Tiếp tục lần thi
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate(withExamId("/toeic/result"))}
              >
                <History className="size-4" />
                Xem lần thi trước
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <InterfacePreview />
          </div>
        </section>

        {/* Các phần của đề đang xem + thông tin */}
        <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {mode === "writing" ? (
                <Pencil className="size-5 text-primary" />
              ) : mode === "speaking" ? (
                <Mic className="size-5 text-primary" />
              ) : (
                <Headphones className="size-5 text-primary" />
              )}
              <h2 className="text-lg font-extrabold text-foreground">Các phần của bài thi</h2>
              <span className="ml-auto text-xs font-semibold text-muted-foreground">
                Bấm vào từng phần để luyện riêng
              </span>
            </div>

            {mode === "lr" && (
              <>
                {listeningParts.length > 0 && (
                  <PartGroup
                    icon={<Play className="size-4" />}
                    title={`Listening — ${listeningCount} câu`}
                    meta={listeningMeta}
                  >
                    <ul className="space-y-2">
                      {listeningParts.map((p) => (
                        <li key={p.part}>{partRowLink(p)}</li>
                      ))}
                    </ul>
                  </PartGroup>
                )}

                {readingParts.length > 0 && (
                  <PartGroup
                    icon={<BookOpen className="size-4" />}
                    title={`Reading — ${readingCount} câu`}
                    meta={readingMeta}
                  >
                    <ul className="space-y-2">
                      {readingParts.map((p) => (
                        <li key={p.part}>{partRowLink(p)}</li>
                      ))}
                    </ul>
                  </PartGroup>
                )}
              </>
            )}

            {mode === "writing" && (
              <PartGroup
                icon={<Pencil className="size-4" />}
                title={`Writing — ${writingTaskIds.length} task`}
                meta={writingMeta}
              >
                <div className="flex flex-wrap gap-2">
                  {visibleWritingTasks.map((task) => (
                    <Link
                      key={task.id}
                      to={withExamId(`/toeic/instructions?mode=writing&tasks=${task.id}`)}
                      className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                      title={`Luyện riêng Task ${task.id} — ${task.title}`}
                    >
                      Task {task.id} · {task.type}
                    </Link>
                  ))}
                </div>
                <p className="mt-3 rounded-lg bg-muted/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  Writing là bài thi riêng — không chung trang với Listening &amp; Reading. Bấm vào
                  từng task để luyện riêng task đó, hoặc bấm &quot;Bắt đầu thi&quot; để làm cả đề.
                </p>
              </PartGroup>
            )}

            {mode === "speaking" && (
              <PartGroup
                icon={<Mic className="size-4" />}
                title={`Speaking — ${speakingTaskIds.length} task`}
                meta={speakingMeta}
              >
                <ul className="space-y-2">
                  {visibleSpeakingGroups.map((group) => {
                    const tasks = Array.from(
                      { length: group.to - group.from + 1 },
                      (_, i) => group.from + i,
                    ).filter((t) => speakingTaskIds.includes(t));
                    return (
                      <li key={group.key}>
                        <Link
                          to={withExamId(
                            `/toeic/instructions?mode=speaking&tasks=${tasks.join(",")}`,
                          )}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5 transition-colors hover:border-primary hover:bg-primary/10"
                          title={`Luyện riêng nhóm ${group.label}`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <SectionBadge label={`Task ${group.from}–${group.to}`} tone="primary" />
                            <p className="truncate text-sm font-bold text-foreground">
                              {group.label}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                            {tasks.length} câu →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </PartGroup>
            )}
          </div>

          {/* Info card — số liệu của đúng mode đang xem */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">Thông tin bài thi</h2>
              <SectionBadge
                label={isPremiumBadge ? "Premium" : "Miễn phí"}
                tone={isPremiumBadge ? "amber" : "primary"}
              />
            </div>

            <dl className="mt-4 space-y-3">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
                >
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <row.icon className="size-4" />
                    {row.label}
                  </dt>
                  <dd className="text-sm font-extrabold text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>

            <Button size="lg" className="mt-5 w-full gap-2" onClick={() => navigate(startUrl)}>
              Bắt đầu thi
              <ArrowRight className="size-4" />
            </Button>

            <Link
              to="/exams"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Xem danh sách đề thi tổng
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
