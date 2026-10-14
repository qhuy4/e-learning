import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, BookOpen, Check, Headphones, Keyboard, Lightbulb, Maximize, Mic, PenLine, Play, Server, Wifi, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { CandidateInfoCard } from "../components/instructions/CandidateInfoCard";
import { ExamInstructionCard } from "../components/instructions/ExamInstructionCard";
import { ScopePickerCard, type ScopeRow } from "../components/instructions/ScopePickerCard";
import { SectionBadge } from "../components/common/SectionBadge";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { skillsInSections } from "../../exams/utils";
import { getSkillIntro } from "../skill-intros";
import { LISTENING_SECTIONS, READING_PASSAGES, readingLocalId } from "../constants";
import { SCOPE_PARAM } from "../scope";
import { IELTS_WRITING_TASKS } from "../mocks/writing-data";
import { IELTS_SPEAKING_PARTS } from "../mocks/speaking-data";
import type { IeltsModule } from "../types";

function playTestBeep(): boolean {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return false;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    return true;
  } catch {
    return false;
  }
}

/** Pre-test instructions: candidate info, rules, checklist, begin buttons. */
export function IeltsInstructionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isApiMode, apiExam, startAttempt, scope, setScope } = useIeltsExam();
  const { user } = useAuth();
  const [beginning, setBeginning] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);
  // Kỹ năng THẬT của đề API (đề Listening-only → chỉ 1 skill).
  const apiSkills = useMemo(() => skillsInSections(apiExam?.sections), [apiExam]);

  /**
   * Dòng "Chọn phần muốn làm" — mỗi kỹ năng ĐỀ CÓ (API) hoặc cả 4 (mock).
   * Số lượng lấy từ config ĐÃ splice theo đề thật (listening 4 section /
   * reading 3 passage / writing 2 task / speaking 3 part khi đề đầy đủ).
   */
  const scopeRows: ScopeRow[] = useMemo(() => {
    const present = (module: IeltsModule) =>
      !isApiMode || apiSkills.some((skill) => skill.toLowerCase() === module);
    const rows: ScopeRow[] = [];
    if (present("listening") && LISTENING_SECTIONS.length > 0)
      rows.push({
        module: "listening",
        label: "Listening",
        tag: "Nghe",
        icon: Headphones,
        units: LISTENING_SECTIONS.map((s) => ({
          id: s.section,
          label: `Section ${s.section}`,
          sub: s.typeLabel,
          hint: `${s.to - s.from + 1} câu`,
        })),
      });
    if (present("reading") && READING_PASSAGES.length > 0)
      rows.push({
        module: "reading",
        label: "Reading",
        tag: "Đọc",
        icon: BookOpen,
        units: READING_PASSAGES.map((p) => ({
          id: p.passage,
          label: `Passage ${p.passage}`,
          sub: p.title,
          hint: `${p.to - p.from + 1} câu`,
        })),
      });
    if (present("writing") && IELTS_WRITING_TASKS.length > 0)
      rows.push({
        module: "writing",
        label: "Writing",
        tag: "Viết",
        icon: PenLine,
        units: IELTS_WRITING_TASKS.map((t) => ({
          id: t.id,
          label: `Task ${t.id}`,
          sub: t.title,
          hint: `${t.minWords}+ từ · ${t.recommendedMinutes} phút`,
        })),
      });
    if (present("speaking") && IELTS_SPEAKING_PARTS.length > 0)
      rows.push({
        module: "speaking",
        label: "Speaking",
        tag: "Nói",
        icon: Mic,
        units: IELTS_SPEAKING_PARTS.map((p) => ({
          id: p.part,
          label: `Part ${p.part}`,
          sub: p.title,
          hint: `${p.questions.length} câu · ${p.durationMinutes} phút`,
        })),
      });
    return rows;
  }, [isApiMode, apiSkills]);

  // Lựa chọn của người dùng (override) — mặc định = toàn bộ phần.
  const [pickedOverride, setPickedOverride] = useState<Partial<Record<IeltsModule, number[]>>>({});
  // Đổi đề → bỏ lựa chọn cũ của đề trước.
  useEffect(() => setPickedOverride({}), [apiExam?.id]);

  const allIdsOf = (row: ScopeRow): number[] => row.units.map((unit) => unit.id);
  /** Chưa tự chọn gì → dùng scope đang có (nếu hợp lệ), không thì toàn bộ. */
  const basePickedOf = (row: ScopeRow): number[] => {
    const valid = new Set(allIdsOf(row));
    const fromScope = (scope[row.module] ?? []).filter((id) => valid.has(id));
    return fromScope.length > 0 ? fromScope : allIdsOf(row);
  };
  /** Đã chọn: override của người dùng; chưa chọn → basePickedOf. */
  const pickedOf = (row: ScopeRow): number[] => pickedOverride[row.module] ?? basePickedOf(row);
  const pickedMap: Record<string, number[]> = {};
  scopeRows.forEach((row) => {
    pickedMap[row.module] = pickedOf(row);
  });

  const toggleUnit = (module: IeltsModule, unitId: number) => {
    const row = scopeRows.find((r) => r.module === module);
    if (!row) return;
    // Dùng updater hàm: 2 lần bấm liên tiếp trong CÙNG render vẫn tính đúng
    // (không đọc nhầm giá trị override cũ từ closure).
    setPickedOverride((prev) => {
      const current = new Set(prev[module] ?? basePickedOf(row));
      if (current.has(unitId)) current.delete(unitId);
      else current.add(unitId);
      if (current.size === 0) return prev; // mỗi kỹ năng luôn giữ ≥1 phần
      return { ...prev, [module]: [...current].sort((a, b) => a - b) };
    });
  };
  const selectAllUnits = (module: IeltsModule) => {
    const row = scopeRows.find((r) => r.module === module);
    if (!row) return;
    setPickedOverride((prev) => ({ ...prev, [module]: allIdsOf(row) }));
  };
  const scopeSummary =
    scopeRows
      .map((row) => {
        const picked = pickedMap[row.module];
        if (picked.length === row.units.length) return `${row.label}: tất cả`;
        return `${row.label}: ${row.units
          .filter((unit) => picked.includes(unit.id))
          .map((unit) => unit.label)
          .join(", ")}`;
      })
      .join(" · ") || "Toàn bộ bài thi";
  // Intro của kỹ năng (?skill=… hoặc đề API 1 kỹ năng). Dòng "Section N · X câu"
  // / "Passage N · Câu a–b" lấy số THỰT TẾ từ config đã splice — số tĩnh trong
  // intro là bản mock (13/14/13), đề Reading thật có thể 13/13/14 → phải chốt
  // theo dữ liệu đề đang mở.
  const baseIntro =
    getSkillIntro(searchParams.get("skill")) ??
    (isApiMode && apiSkills.length === 1 ? getSkillIntro(apiSkills[0].toLowerCase()) : null);
  const skillIntro = baseIntro
    ? {
        ...baseIntro,
        format: baseIntro.format.map((row) => {
          const passage = /^Passage (\d+) · Câu /.exec(row.label);
          if (passage) {
            const cfg = READING_PASSAGES[Number(passage[1]) - 1];
            return cfg
              ? {
                  ...row,
                  label: `Passage ${cfg.passage} · Câu ${readingLocalId(cfg.from)}–${readingLocalId(cfg.to)}`,
                }
              : row;
          }
          const section = /^Section (\d+) · \d+ câu$/.exec(row.label);
          if (section) {
            const cfg = LISTENING_SECTIONS[Number(section[1]) - 1];
            return cfg
              ? { ...row, label: `Section ${cfg.section} · ${cfg.to - cfg.from + 1} câu` }
              : row;
          }
          return row;
        }),
      }
    : null;
  const [audioOk, setAudioOk] = useState<boolean | null>(null);
  const [keyboardOk, setKeyboardOk] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  // Trang làm bài mặc định = kỹ năng đầu tiên của đề (đề API), còn thiếu
  // skillIntro thì nghe theo ?skill=; mock giữ nguyên Listening.
  const startSkill = skillIntro
    ? skillIntro.skill
    : (apiSkills[0]?.toLowerCase() ?? "listening");
  const startRoute = `/ielts/test/${startSkill}`;
  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  // Bắt đầu: với đề API thì tạo lượt thi trên máy chủ trước khi vào bài.
  const handleBegin = async () => {
    if (beginning) return;
    // 1) Chốt phần đã chọn vào scope context (các trang làm bài đọc scope từ
    //    context — kể cả skill CHƯA mở, để transition "Sang …" giữ nguyên phạm vi).
    scopeRows.forEach((row) => {
      const picked = pickedMap[row.module];
      setScope(row.module, picked.length === row.units.length ? [] : picked);
    });
    // 2) URL vào bài = kỹ năng bắt đầu + scope riêng của nó (khi chọn < toàn bộ).
    const startRow = scopeRows.find((row) => row.module === startSkill);
    const pickedStart = startRow ? pickedMap[startRow.module] : [];
    const scopeQuery =
      startRow && pickedStart.length < startRow.units.length
        ? `?${SCOPE_PARAM[startRow.module]}=${pickedStart.join(",")}`
        : "";
    const target = withExamId(`${startRoute}${scopeQuery}`);
    if (isApiMode) {
      setBeginning(true);
      setBeginError(null);
      try {
        await startAttempt();
      } catch {
        setBeginError(
          "Không tạo được lượt thi trên máy chủ — hãy đăng nhập rồi bấm “Bắt đầu thi” lại.",
        );
        setBeginning(false);
        return;
      }
      setBeginning(false);
    }
    navigate(target);
  };

  const handleAudioTest = () => setAudioOk(playTestBeep());

  const handleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      setIsFullscreen(false);
    }
  };

  const checklist = [
    {
      icon: Headphones,
      label: "Kiểm tra âm thanh (tai nghe / loa)",
      state: audioOk === null ? "chưa kiểm tra" : audioOk ? "âm thanh OK" : "không phát được",
      ok: audioOk === true,
      action: (
        <Button size="sm" variant="outline" onClick={handleAudioTest} className="gap-1.5">
          <Play className="size-3.5" />
          Test Audio
        </Button>
      ),
    },
    {
      icon: Keyboard,
      label: "Kiểm tra bàn phím (nhập văn bản & điều hướng)",
      state: keyboardOk ? "bàn phím OK" : "chưa kiểm tra",
      ok: keyboardOk,
      action: (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            const value = window.prompt("Nhập bất kỳ ký tự nào để kiểm tra bàn phím:");
            if (value !== null && value.trim().length > 0) setKeyboardOk(true);
          }}
        >
          <Keyboard className="size-3.5" />
          Kiểm tra
        </Button>
      ),
    },
    {
      icon: Wifi,
      label: "Kết nối Internet ổn định",
      state: online ? "đang kết nối" : "mất kết nối",
      ok: online,
      action: null,
    },
    {
      icon: Maximize,
      label: "Chuẩn bị màn hình toàn phần (khuyến nghị)",
      state: isFullscreen ? "đã toàn màn hình" : "chưa toàn màn hình",
      ok: isFullscreen,
      action: (
        <Button size="sm" variant="outline" onClick={handleFullscreen} className="gap-1.5">
          <Maximize className="size-3.5" />
          {isFullscreen ? "Thoát" : "Enter Fullscreen"}
        </Button>
      ),
    },
  ];

  return (
    <div className="exam-screen min-h-screen bg-muted/50">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link
            to={withExamId("/ielts")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
            title="Quay lại trang IELTS"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <span className="text-sm font-extrabold text-foreground">Hướng dẫn trước khi thi</span>
          <Link
            to={withExamId("/ielts")}
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
            Thoát
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <SectionBadge
            label={skillIntro ? `Bước 1/2 · ${skillIntro.shortLabel}` : "Bước 1/2 · Chuẩn bị"}
            tone="primary"
          />
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
            {skillIntro ? `${skillIntro.title} — đọc hướng dẫn trước khi bắt đầu` : "Đọc hướng dẫn trước khi bắt đầu"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {skillIntro
              ? `Bạn đang luyện riêng phần ${skillIntro.shortLabel}. Đọc kỹ cấu trúc bài thi bên dưới, kiểm tra tai nghe / bàn phím rồi bấm `
              : "Kiểm tra thông tin thí sinh, quy định làm bài và bấm "}
            <strong className="text-foreground">Test Audio</strong> để chắc chắn bạn nghe rõ. Khi tất
            cả đã sẵn sàng, bấm <strong className="text-foreground">Bắt đầu thi</strong>.
          </p>

          {/* Đề thật từ máy chủ (?examId=…) — thay cho nội dung mock. */}
          {isApiMode && apiExam && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Server className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                  Đề thi từ máy chủ
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-foreground">{apiExam.title}</p>
                {apiExam.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {apiExam.description}
                  </p>
                )}
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  Thời lượng: {apiExam.durationMinutes} phút · Bài làm được ghi nhận lên máy chủ.
                </p>
              </div>
            </div>
          )}
        </div>

        {skillIntro ? (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <skillIntro.icon className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Giới thiệu đề thi
                  </p>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    {skillIntro.title}
                  </h2>
                </div>
              </div>
              <SectionBadge label={skillIntro.duration} tone="primary" />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {skillIntro.description}
            </p>

            <dl className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
              {skillIntro.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-extrabold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-4 space-y-2">
              {skillIntro.format.map((row) => (
                <li
                  key={row.label}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="min-w-40 text-sm font-extrabold text-foreground">
                    {row.label}
                  </span>
                  <span className="flex-1 text-xs leading-relaxed text-muted-foreground">
                    {row.detail}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-primary">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
              <span>
                <strong className="font-extrabold">Mẹo: </strong>
                {skillIntro.tip}
              </span>
            </p>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <CandidateInfoCard
              rows={
                isApiMode && apiExam
                  ? [
                      { label: "Họ và tên", value: user?.name || user?.email || "—" },
                      { label: "Số báo danh", value: user?.email || "—" },
                      { label: "Tên bài thi", value: apiExam.title },
                      { label: "Ngày thi", value: new Date().toLocaleDateString("vi-VN") },
                      { label: "Mã bài thi", value: `#${apiExam.id}` },
                      { label: "Hình thức", value: "Trực tuyến" },
                    ]
                  : undefined
              }
            />
            <ExamInstructionCard />
          </div>
        )}

        {/* Chọn phần muốn làm — tick Section/Passage/Task/Part trước khi bấm Bắt đầu. */}
        <ScopePickerCard
          rows={scopeRows}
          picked={pickedMap}
          onToggle={toggleUnit}
          onSelectAll={selectAllUnits}
          summary={scopeSummary}
        />

        {/* Checklist */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-foreground">Danh sách kiểm tra</h2>
          <ul className="mt-4 space-y-3">
            {checklist.map((item) => (
              <li
                key={item.label}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      item.ok ? "bg-emerald-50 text-emerald-600" : "bg-card text-muted-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                    <p
                      className={`text-xs font-semibold ${
                        item.ok ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {item.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.ok && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="size-3.5" />
                    </span>
                  )}
                  {item.action}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
              {skillIntro
                ? `Sau khi bấm bắt đầu, đồng hồ đếm ngược của ${skillIntro.shortLabel} (${skillIntro.duration.split(" · ")[0]}) sẽ chạy ngay${
                    skillIntro.skill === "listening" ? " — audio chỉ phát một lần và không thể tạm dừng." : "."
                  }`
                : "Sau khi bấm bắt đầu, đồng hồ đếm ngược của Listening (30:00) sẽ chạy ngay — audio chỉ phát một lần và không thể tạm dừng."}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate(withExamId("/ielts"))}>
                Quay lại
              </Button>
              <Button size="lg" className="gap-2" onClick={handleBegin} disabled={beginning}>
                <Play className="size-4" />
                {beginning
                  ? "Đang bắt đầu…"
                  : skillIntro
                    ? `Bắt đầu thi ${skillIntro.shortLabel}`
                    : "Bắt đầu thi"}
              </Button>
            </div>
            {beginError && (
              <p className="w-full text-right text-xs font-extrabold text-red-600">{beginError}</p>
            )}
          </div>
        </section>

        {/* Nhảy thẳng phần (chỉ khi chưa chọn skill cụ thể) — block demo có
            số task/part hardcode nên ẩn khi mở đề API (?examId). */}
        {!skillIntro && !isApiMode && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Nhảy thẳng phần (demo)
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bỏ qua bước Bắt đầu — vào thẳng task Writing hoặc part Speaking muốn luyện.
                </p>
              </div>
              <SectionBadge label="Writing · Speaking" tone="amber" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Writing · 2 task
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2].map((taskId) => (
                    <Button
                      key={taskId}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate(withExamId(`/ielts/test/writing?task=${taskId}`))}
                    >
                      <PenLine className="size-3.5" />
                      Task {taskId}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Speaking · 3 part
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((part) => (
                    <Button
                      key={part}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate(withExamId(`/ielts/test/speaking?part=${part}`))}
                    >
                      <Mic className="size-3.5" />
                      Part {part}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
