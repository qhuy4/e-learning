import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Check, Headphones, Maximize, Play, Server, Wifi, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { CandidateInfoCard } from "../components/instructions/CandidateInfoCard";
import { ExamInstructionCard } from "../components/instructions/ExamInstructionCard";
import { SectionIntroCard } from "../components/instructions/SectionIntroCard";
import { ExamSetupCard } from "../components/setup/ExamSetupCard";
import { SectionBadge } from "../components/common/SectionBadge";
import { useToeicExam } from "../contexts/toeic-exam-context";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { ToeicExamConfig, ToeicMode } from "../types";
import { DEFAULT_MODE_MINUTES } from "../constants";
import { startRouteForConfig } from "../utils";

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

/** Pre-test setup + instructions: config (mode/parts/time), rules, checklist, begin. */
export function ToeicInstructionsPage() {
  const navigate = useNavigate();
  const { config, setConfig, isApiMode, apiExam, startAttempt } = useToeicExam();
  const { user } = useAuth();
  const [beginning, setBeginning] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [audioOk, setAudioOk] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  // Deep links from the exams page / landing:
  // /toeic/instructions?mode=lr&parts=2,5 · ?mode=writing&tasks=1,3 · ?mode=speaking&tasks=1,2
  const paramMode = searchParams.get("mode");
  const paramParts = searchParams.get("parts");
  const paramTasks = searchParams.get("tasks");

  useEffect(() => {
    if (paramMode !== "lr" && paramMode !== "writing" && paramMode !== "speaking") return;
    const patch: Partial<ToeicExamConfig> = { mode: paramMode as ToeicMode };

    if (paramMode === "lr") {
      const parts = (paramParts ?? "")
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
      patch.parts = parts; // empty = full test (7 parts)
      patch.tasks = [];
    } else {
      const maxTask = paramMode === "writing" ? 8 : 11;
      const tasks = (paramTasks ?? "")
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= maxTask);
      patch.tasks = tasks; // empty = every task of that mode
      patch.parts = [];
    }
    // Thời lượng gợi ý theo mode (writing 60', speaking 20', lr 120') — tránh
    // ô cứt 120' của cấu hình mặc định rơi vào đề kỹ năng 60'/20'.
    patch.minutes = DEFAULT_MODE_MINUTES[paramMode];
    setConfig(patch);
  }, [paramMode, paramParts, paramTasks, setConfig]);

  // Đề API mở /toeic/instructions KHÔNG kèm ?mode= (URL gõ tay) → suy mode từ
  // CẤU TRÚC đề thật: có Part → lr, có Writing → writing, có Speaking → speaking.
  useEffect(() => {
    if (!isApiMode || !apiExam) return;
    if (paramMode === "lr" || paramMode === "writing" || paramMode === "speaking") return;
    // Ưu tiên sectionType có cấu trúc (LISTENING/READING = đề Part);
    // dữ liệu cũ chưa có cột → fallback đoán qua tên section.
    const sections = apiExam.sections;
    const has = (type: string, word: string) =>
      sections.some(
        (section) =>
          (section.sectionType ?? "").trim().toUpperCase() === type ||
          (section.name ?? "").toLowerCase().includes(word),
      );
    const mode: ToeicMode = has("LISTENING", "part") || has("READING", "part")
      ? "lr"
      : has("WRITING", "writing")
        ? "writing"
        : has("SPEAKING", "speaking")
          ? "speaking"
          : "lr";
    if (mode === config.mode) return;
    setConfig({ mode, parts: [], tasks: [], minutes: DEFAULT_MODE_MINUTES[mode] });
  }, [isApiMode, apiExam, paramMode, config.mode, setConfig]);

  /** Gắn examId vào route khi đang ở chế độ đề API (để provider nối tiếp nguồn). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

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

  // Bắt đầu: với đề API thì tạo lượt thi trên máy chủ trước khi vào bài.
  const handleBegin = async () => {
    if (beginning) return;
    const route = startRouteForConfig(config);
    const target = isApiMode && apiExam ? `${route}?examId=${apiExam.id}` : route;
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

  const checklist = [
    {
      icon: Headphones,
      label: "Kiểm tra âm thanh (tai nghe / loa)",
      state: audioOk === null ? "chưa kiểm tra" : audioOk ? "âm thanh OK" : "không phát được",
      ok: audioOk === true,
      action: (
        <Button size="sm" variant="outline" onClick={handleAudioTest} className="gap-1.5">
          <Headphones className="size-3.5" />
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
          {isFullscreen ? "Thoát" : "Toàn màn hình"}
        </Button>
      ),
    },
  ];

  return (
    <div className="exam-screen min-h-screen bg-muted/50">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link
            to={withExamId("/toeic")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-2.5 py-1.5 text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-105"
            title="Quay lại trang TOEIC"
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
          <span className="text-sm font-extrabold text-foreground">Hướng dẫn làm bài</span>
          <Link
            to={withExamId("/toeic")}
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
            Thoát
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <SectionBadge label="Bước 1/2 · Cấu hình & chuẩn bị" tone="primary" />
          <h1 className="mt-3 text-2xl font-extrabold text-foreground">
            Đọc hướng dẫn trước khi bắt đầu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn phần thi, part và thời gian làm bài ở dưới — giới thiệu đề tương ứng cập nhật
            ngay kế bên. Sau đó kiểm tra thông tin thí sinh và quy định. Khi tất cả đã sẵn
            sàng, bấm <strong className="text-foreground">Bắt đầu thi</strong>.
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

        {/* Setup: mode + parts + duration */}
        <ExamSetupCard />

        {/* Intro của đề sắp làm — suy ra từ cấu hình hiện tại */}
        <SectionIntroCard />

        <div className="grid gap-6 lg:grid-cols-2">
          <CandidateInfoCard
            info={
              isApiMode && apiExam
                ? {
                    name: user?.name || user?.email || "—",
                    candidateId: user?.email || "—",
                    testCode: `#${apiExam.id}`,
                    testDate: new Date().toLocaleDateString("vi-VN"),
                    note: "Bài làm được ghi nhận lên máy chủ.",
                  }
                : undefined
            }
          />
          <ExamInstructionCard />
        </div>

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
            <p className="text-xs text-muted-foreground">
              {beginError ? (
                <span className="font-extrabold text-red-600">{beginError}</span>
              ) : (
                "Sau khi bấm bắt đầu, đồng hồ đếm ngược chạy ngay theo thời gian đã chọn — không thể tạm dừng."
              )}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate(withExamId("/toeic"))}>
                Quay lại
              </Button>
              <Button
                size="lg"
                className="gap-2"
                onClick={handleBegin}
                disabled={beginning}
              >
                <Play className="size-4" />
                {beginning ? "Đang bắt đầu…" : "Bắt đầu thi"}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
