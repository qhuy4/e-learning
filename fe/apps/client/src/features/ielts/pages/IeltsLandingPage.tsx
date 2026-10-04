import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Headphones,
  Mic,
  Pencil,
  Play,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useExamDetail, useMyAttempts } from "../../exams/hooks";
import { countExamQuestions, skillsInSections } from "../../exams/utils";
import { SectionBadge } from "../components/common/SectionBadge";
import {
  LANDING_INFO_ROWS,
  MOCK_STATS,
  MOCK_TESTS,
} from "../mocks/meta-data";

/** Practice-per-part chips ("Luyện từng phần") for the landing hero. */
const PRACTICE_GROUPS: { label: string; links: { to: string; text: string }[] }[] = [
  {
    label: "Nghe & Đọc",
    links: [
      ...[1, 2, 3, 4].map((section) => ({
        to: `/ielts/test/listening?section=${section}`,
        text: `Listening Section ${section}`,
      })),
      ...[1, 2, 3].map((passage) => ({
        to: `/ielts/test/reading?passage=${passage}`,
        text: `Reading Passage ${passage}`,
      })),
    ],
  },
  {
    label: "Viết & Nói",
    links: [
      ...[1, 2].map((task) => ({
        to: `/ielts/test/writing?task=${task}`,
        text: `Writing Task ${task}`,
      })),
      ...[1, 2, 3].map((part) => ({
        to: `/ielts/test/speaking?part=${part}`,
        text: `Speaking Part ${part}`,
      })),
    ],
  },
];

/** Decorative preview of the IELTS CBT workspace (right side of the hero). */
function InterfacePreview() {
  return (
    <div className="rounded-xl border border-border bg-background/90 p-3 shadow-inner">
      <div className="flex items-center gap-2 rounded-lg bg-foreground px-2 py-1.5">
        <span className="rounded bg-background px-1.5 py-0.5 text-[9px] font-black text-foreground">
          IELTS
        </span>
        <span className="h-1.5 flex-1 rounded-full bg-background/25" />
        <span className="rounded bg-background/20 px-1.5 py-0.5 font-mono text-[9px] text-background">
          29:41
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <div className="w-16 shrink-0 self-start rounded-lg border border-border bg-card p-1.5">
          <p className="mb-1 text-[8px] font-black text-muted-foreground">SECTION 1</p>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`size-3.5 rounded-sm ${
                  i < 4 ? "bg-primary" : i === 6 ? "bg-amber-300" : "border border-border bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[8px] font-black text-muted-foreground">PASSAGE 1</p>
          <div className="mt-1 grid grid-cols-5 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`size-3.5 rounded-sm ${
                  i < 2 ? "bg-primary" : "border border-border bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 rounded-lg border border-border bg-card p-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-primary px-1 text-[8px] font-black text-primary-foreground">
              Q6
            </span>
            <span className="h-2 w-24 rounded-full bg-muted" />
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`rounded-md border p-1.5 ${
                i === 1 ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`size-3 rounded-full ${
                    i === 1 ? "bg-primary" : "border border-border bg-muted"
                  }`}
                />
                <span className={`h-1.5 flex-1 rounded-full ${i === 1 ? "bg-primary/40" : "bg-muted"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** IELTS landing page (inside the site layout — choose an exam / a skill). */
export function IeltsLandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?examId=… → đề thật từ máy chủ (gồm đủ 4 kỹ năng, nộp bài qua API).
  const parsedExamId = Number(searchParams.get("examId"));
  const examId = Number.isInteger(parsedExamId) && parsedExamId > 0 ? parsedExamId : null;
  const apiMode = examId !== null;
  const { data: apiExam } = useExamDetail(examId ?? 0);
  const { data: myAttempts } = useMyAttempts();

  // Kỹ năng THẬT của đề (?examId đọc từ section trong DB) — landing chỉ hiện
  // đúng skill của đề, số liệu Exam Information lấy từ chính đề đó.
  const apiSkills = useMemo(() => skillsInSections(apiExam?.sections), [apiExam]);
  const apiQuestionCount = useMemo(() => countExamQuestions(apiExam?.sections), [apiExam]);

  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    apiMode ? `${route}${route.includes("?") ? "&" : "?"}examId=${examId}` : route;

  const apiAttempts = (myAttempts ?? []).filter((attempt) => attempt.examId === examId);
  // Sắp xếp mới nhất trước — "điểm gần nhất" lấy bản ghi đầu.
  const apiSorted = [...apiAttempts].sort(
    (a, b) =>
      new Date(b.submittedAt ?? b.createdAt).getTime() -
      new Date(a.submittedAt ?? a.createdAt).getTime(),
  );
  const apiScored = apiSorted.filter((attempt) => attempt.score !== null);
  const apiLastScore = apiScored.length > 0 ? apiScored[0].score : null;
  const apiBestScore = apiAttempts.reduce((best, attempt) => Math.max(best, attempt.score ?? 0), 0);

  const stats = apiMode
    ? [
        { label: "Lần đã làm", value: myAttempts === undefined ? "…" : String(apiAttempts.length), icon: Users, tone: "text-sky-600" },
        { label: "Điểm gần nhất", value: apiLastScore !== null ? `${apiLastScore}/100` : "—", icon: Trophy, tone: "text-primary" },
        { label: "Điểm cao nhất", value: apiScored.length > 0 ? `${apiBestScore}/100` : "—", icon: Sparkles, tone: "text-emerald-600" },
        {
          label: "Thời lượng",
          value: `${Math.max(1, Math.round((apiExam?.durationSeconds ?? 9600) / 60))} phút`,
          icon: BookOpen,
          tone: "text-amber-600",
        },
      ]
    : [
        { label: "Last Band", value: MOCK_STATS.lastBand.toFixed(1), icon: Trophy, tone: "text-primary" },
        { label: "Best Band", value: MOCK_STATS.bestBand.toFixed(1), icon: Sparkles, tone: "text-emerald-600" },
        { label: "Attempts", value: String(MOCK_STATS.attempts), icon: Users, tone: "text-sky-600" },
        { label: "Completion", value: `${MOCK_STATS.completion}%`, icon: BookOpen, tone: "text-amber-600" },
      ];

  // Đề API (?examId): chỉ hiện nút đúng kỹ năng của đề (đọc từ section DB),
  // nhãn = tên kỹ năng — đề Listening-only chỉ có 1 nút "Listening".
  // Không có examId → giữ 4 nút luyện demo như cũ.
  const skillIcon: Record<string, typeof Headphones> = {
    Listening: Headphones,
    Reading: BookOpen,
    Writing: Pencil,
    Speaking: Mic,
  };
  const practiceButtons =
    apiMode && apiExam
      ? apiSkills.map((skill) => ({
          label: skill,
          route: `/ielts/test/${skill.toLowerCase()}`,
          icon: skillIcon[skill] ?? Headphones,
        }))
      : [
          { label: "Luyện Listening", route: "/ielts/test/listening", icon: Headphones },
          { label: "Luyện Reading", route: "/ielts/test/reading", icon: BookOpen },
          { label: "Luyện Writing", route: "/ielts/test/writing", icon: Pencil },
          { label: "Luyện Speaking", route: "/ielts/test/speaking", icon: Mic },
        ];

  // Exam Information: đề API → số liệu thật từ chính đề (thời lượng, kỹ năng,
  // số câu, định dạng); không có examId → bảng demo giữ nguyên.
  const infoRows =
    !apiMode
      ? LANDING_INFO_ROWS
      : apiExam
        ? [
            {
              label: "Thời lượng",
              value: `${Math.max(1, Math.round((apiExam.durationSeconds ?? 0) / 60))} phút`,
            },
            { label: "Kỹ năng thi", value: apiSkills.length > 0 ? apiSkills.join(", ") : "—" },
            { label: "Số câu hỏi", value: `${apiQuestionCount} câu` },
            { label: "Định dạng", value: apiExam.examFormatName ?? apiExam.examTypeName ?? "IELTS" },
            { label: "Loại đề", value: apiExam.examTypeName ?? "IELTS" },
            { label: "Nộp bài", value: "Lên máy chủ" },
          ]
        : [];

  // Chế độ đề API (?examId): chỉ hiện đúng đề thật từ DB — không trộn thẻ demo.
  const tests =
    apiMode && apiExam
      ? [
          {
            id: `api-${apiExam.id}`,
            title: apiExam.title,
            subtitle:
              apiExam.description ??
              (apiSkills.length > 0
                ? `Đề thi ${apiSkills.join(", ")} từ máy chủ — hệ thống chấm điểm và lưu lịch sử attempt.`
                : "Đề thi thật từ máy chủ — hệ thống chấm điểm và lưu lịch sử attempt."),
            duration: `${Math.max(1, Math.round((apiExam.durationSeconds ?? 9600) / 60))} phút`,
            skills: apiSkills.length > 0 ? apiSkills : ["IELTS"],
            level: apiExam.examTypeName ?? "IELTS Academic",
            premium: apiExam.isPremium,
            isApi: true,
          },
        ]
      : !apiMode
        ? MOCK_TESTS.map((test) => ({ ...test, isApi: false }))
        : [];

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4 lg:px-6">
        {/* Hero */}
        <section className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.7fr_1fr] lg:p-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              {apiMode ? (apiExam?.title ?? "Đề thi IELTS (đang tải…)") : "IELTS Computer Delivered"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {apiMode
                ? (apiExam?.description ??
                  "Đề thi IELTS thật từ máy chủ — làm bài trên giao diện CBT rồi nộp để hệ thống ghi nhận attempt.")
                : "Làm quen giao diện thi IELTS trên máy tính theo đúng chuẩn IDP / British Council: header đếm giờ, cột điều hướng câu hỏi bên trái, audio phát một lần, cột bài đọc và câu hỏi cuộn độc lập — và báo cáo Band Report sau khi nộp."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SectionBadge label={apiExam?.examTypeName ?? "Academic"} tone="primary" />
              <SectionBadge label="Computer Delivered" tone="sky" />
              {apiMode ? (
                <>
                  <SectionBadge
                    label={apiExam?.isPremium ? "Premium" : "Miễn phí"}
                    tone="amber"
                  />
                  <SectionBadge label="Nộp bài lên máy chủ" tone="emerald" />
                </>
              ) : (
                <>
                  <SectionBadge label="Premium / Free" tone="amber" />
                  <SectionBadge label="Band 0–9, bước 0.5" />
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate(withExamId("/ielts/instructions"))}
              >
                <Play className="size-4" />
                Bắt đầu thi
              </Button>
              {practiceButtons.map((btn) => (
                <Button
                  key={btn.route}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate(withExamId(btn.route))}
                >
                  <btn.icon className="size-4" />
                  {btn.label}
                </Button>
              ))}
            </div>

            {/* Luyện từng phần — chỉ ở chế độ demo (không có examId); đề API đã
                có nút đúng kỹ năng ở trên, tránh lộ chip dữ liệu mẫu. */}
            {!apiMode && (
              <div className="mt-4 space-y-2">
                {PRACTICE_GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-wrap items-center gap-2">
                    <span className="w-24 shrink-0 text-xs font-bold text-muted-foreground">
                      {group.label}
                    </span>
                    {group.links.map((link) => (
                      <Link
                        key={link.to}
                        to={withExamId(link.to)}
                        className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        {link.text}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <InterfacePreview />
          </div>
        </section>

        {/* Exam information */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">Exam Information</h2>
              <SectionBadge label="Test format" tone="primary" />
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="text-sm font-extrabold text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>

            {/* Khối nói về Speaking Practice là nội dung demo — ẩn khi mở đề API. */}
            {!apiMode && (
              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs font-bold text-sky-700">Speaking Practice available</p>
                <p className="mt-1 text-xs leading-relaxed text-sky-800">
                  Phần Speaking ghi âm bằng mic trình duyệt với cue card, bộ đếm thời gian chuẩn 1
                  phút chuẩn bị / 2 phút nói — nghe lại được trong phiên, không cần đặt lịch.
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">Thống kê của bạn</h2>
              <SectionBadge label={apiMode ? "Từ máy chủ" : "Demo data"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-muted/30 p-4 text-center"
                >
                  <span className={`mx-auto flex size-8 items-center justify-center rounded-lg bg-card ${s.tone}`}>
                    <s.icon className="size-4" />
                  </span>
                  <p className={`mt-2 text-2xl font-extrabold tabular-nums ${s.tone}`}>{s.value}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {!apiMode && (
              <>
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${MOCK_STATS.completion}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Hoàn thành {MOCK_STATS.completion}% mục tiêu học tập trong tháng này.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Available tests */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <h2 className="text-lg font-extrabold text-foreground">Available Tests</h2>
            </div>
            <Link
              to="/exams"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Xem danh sách đề thi tổng
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tests.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Đang tải đề thi từ máy chủ…
              </p>
            )}
            {tests.map((test) => (
              <article
                key={test.id}
                className="group rounded-xl border border-border bg-muted/30 p-5 transition-colors hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-foreground">{test.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{test.subtitle}</p>
                  </div>
                  <SectionBadge
                    label={test.premium ? "Premium" : "Free"}
                    tone={test.premium ? "amber" : "emerald"}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {test.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span>{test.duration}</span>
                    <span>·</span>
                    <span>{test.level}</span>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      navigate(test.isApi ? withExamId("/ielts/instructions") : "/ielts/instructions")
                    }
                  >
                    <Play className="size-3.5" />
                    Bắt đầu
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-300/70 bg-gradient-to-br from-card to-amber-50 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Crown className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-foreground">
                Mở khóa Premium để xem Band Report chi tiết
              </p>
              <p className="text-xs text-muted-foreground">
                Giải thích từng câu, transcript Listening, từ vựng theo passage và AI chấm Writing /
                Speaking.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
