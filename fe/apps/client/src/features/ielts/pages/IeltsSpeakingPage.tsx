import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Check, ListChecks, MessageCircleQuestion, Mic } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useIeltsExam } from "../contexts/ielts-exam-context";
import { useExamHasSkill, useIeltsSkillGuard } from "../hooks";
import { IELTS_SPEAKING_PARTS } from "../mocks/speaking-data";
import { parseScopeParam, scopeSearch } from "../scope";
import { formatClock, recordedSpeakingParts } from "../utils";
import { CueCard } from "../components/speaking/CueCard";
import { SpeakingRecorder } from "../components/speaking/SpeakingRecorder";
import { TeacherGradeButton } from "../../exams/components/TeacherGradeButton";
import { PartTabs } from "../components/common/PartTabs";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

const QUESTION_SECONDS: Record<number, number> = { 1: 45, 2: 120, 3: 60 };

/** Speaking practice page — Part 1 interview, Part 2 cue card, Part 3 discussion. */
export function IeltsSpeakingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    speakingPart,
    setSpeakingPart,
    speakingIndex,
    setSpeakingIndex,
    speakingAnswered,
    speakingTranscript,
    speakingAudio,
    speakingNotes,
    setSpeakingNotes,
    markSpeakingAnswered,
    unmarkSpeakingAnswered,
    setSpeakingTranscript,
    setSpeakingAudio,
    startModule,
    timeLeft,
    savedAt,
    setScope,
    scope,
    isApiMode,
    apiExam,
    reviewMode,
  } = useIeltsExam();
  // Đề API không có Speaking (đề 1 kỹ năng) → chuyển về kỹ năng đầu của đề.
  useIeltsSkillGuard("speaking");
  // Speaking-only → ẩn "Quay lại Writing" (bấm vào sẽ bị guard đá về mất scope ?part=).
  const hasWriting = useExamHasSkill("writing");

  /** Giữ examId trên mọi route điều hướng (mất examId → mất nguồn data API). */
  const withExamId = (route: string): string =>
    isApiMode && apiExam ? `${route}${route.includes("?") ? "&" : "?"}examId=${apiExam.id}` : route;

  // Deep link: /ielts/test/speaking?part=2 → scope + start straight at that part.
  const partParam = searchParams.get("part");

  useEffect(() => {
    startModule("speaking");
  }, [startModule]);

  useEffect(() => {
    const groups = parseScopeParam("speaking", partParam);
    setScope("speaking", groups);
    if (groups.length > 0) setSpeakingPart(groups[0] as 1 | 2 | 3);
  }, [partParam, setScope, setSpeakingPart]);

  // Keeps URL & scope in sync when the candidate switches part on a scoped run.
  const syncPartParam = (part: number) => {
    if (partParam === null) return;
    const next = new URLSearchParams(searchParams);
    next.set("part", String(part));
    setSearchParams(next, { replace: true });
  };

  const switchPart = (part: 1 | 2 | 3) => {
    setSpeakingPart(part);
    syncPartParam(part);
  };

  const part = IELTS_SPEAKING_PARTS.find((p) => p.part === speakingPart) ?? IELTS_SPEAKING_PARTS[0];
  const questions = part.questions;
  const index = Math.min(speakingIndex[part.part] ?? 0, questions.length - 1);
  const question = questions[index];
  // Mỗi câu MỘT bản ghi (qid → đã ghi âm) — bộ đếm sống qua review/F5 nhờ
  // snapshot + auto-save (trước đây hiện 0/N vì map theo part không được khôi phục).
  const answeredCount = questions.filter((q) => speakingAnswered[q.id]).length;
  const recordedParts = recordedSpeakingParts(speakingAnswered);
  const isCue = part.part === 2;

  const goToQuestion = (next: number) => setSpeakingIndex(part.part, next);

  const handleStop = (transcript: string, _seconds: number, audioUrl: string | null) => {
    markSpeakingAnswered(question.id);
    setSpeakingTranscript(question.id, transcript);
    setSpeakingAudio(question.id, audioUrl);
  };

  const handleReset = () => {
    unmarkSpeakingAnswered(question.id);
    setSpeakingTranscript(question.id, "");
    setSpeakingAudio(question.id, null);
  };

  return (
    <div>
      {/* Part strip */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge label="Speaking" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              {part.label} — {part.title}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Bộ đếm: {formatClock(timeLeft.speaking)} · Part {part.part}/
              {IELTS_SPEAKING_PARTS.length}
            </span>
          </div>
          <PartTabs
            value={String(speakingPart)}
            onChange={(v) => switchPart(Number(v) as 1 | 2 | 3)}
            options={IELTS_SPEAKING_PARTS.map((p) => ({ value: String(p.part), label: p.label }))}
          />
        </div>
        <ProgressBar
          className="mt-3"
          value={answeredCount}
          max={questions.length}
          caption={`Đã trả lời ${answeredCount}/${questions.length} câu ${part.label} · đã ghi âm ${recordedParts}/${IELTS_SPEAKING_PARTS.length} part`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Main column */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageCircleQuestion className="size-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">{part.label} · {part.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {part.introduction}
                </p>
              </div>
            </div>
          </section>

          {isCue && part.cue ? (
            <CueCard cue={part.cue} notes={speakingNotes} onNotesChange={setSpeakingNotes} />
          ) : (
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-sm font-extrabold text-background">
                    {index + 1}
                  </span>
                  <div>
                    <SectionBadge label={`Question ${index + 1}/${questions.length}`} tone="primary" />
                    <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                      Trả lời 2–3 câu, có lý do và ví dụ
                    </p>
                  </div>
                </div>
                <SectionBadge
                  label={speakingAnswered[question.id] ? "Đã trả lời" : "Chưa trả lời"}
                  tone={speakingAnswered[question.id] ? "emerald" : "muted"}
                />
              </div>

              <p className="text-lg font-semibold leading-relaxed text-foreground">{question.text}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={index === 0}
                  onClick={() => goToQuestion(index - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Câu trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={index >= questions.length - 1}
                  onClick={() => goToQuestion(index + 1)}
                >
                  Câu tiếp
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </section>
          )}

          {/* Recorder */}
          <div key={`${part.part}-${index}`}>
            <SpeakingRecorder
              durationSec={QUESTION_SECONDS[part.part]}
              prepSec={isCue && part.cue ? part.cue.prepSeconds : undefined}
              recorded={Boolean(speakingAnswered[question.id])}
              audioUrl={speakingAudio[question.id]}
              transcript={speakingTranscript[question.id]}
              review={reviewMode}
              onStop={handleStop}
              onReset={handleReset}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            {hasWriting ? (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() =>
                  navigate(withExamId(`/ielts/test/writing${scopeSearch("writing", scope)}`))
                }
              >
                <ArrowLeft className="size-4" />
                Quay lại Writing
              </Button>
            ) : (
              <span aria-hidden />
            )}
            <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
              {reviewMode
                ? "Xem lại bài đã nộp — phát lại bản ghi của bạn"
                : "Ghi âm bằng mic trình duyệt — nghe lại được trong phiên làm bài"}
            </span>
            {reviewMode ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(withExamId("/ielts/result"))}
              >
                Quay lại kết quả
              </Button>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(withExamId("/ielts/review"))}
              >
                Kiểm tra &amp; nộp
              </Button>
            )}
          </div>
        </div>

        {/* Side column: history + feedback */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">Lịch sử trả lời</h3>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">
                {answeredCount}/{questions.length}
              </span>
            </div>

            <ul className="space-y-2">
              {questions.map((q, i) => {
                const done = Boolean(speakingAnswered[q.id]);
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => !isCue && goToQuestion(i)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                        i === index && !isCue
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30 hover:border-primary/40"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                          done
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="size-3" /> : i + 1}
                      </span>
                      <span className="line-clamp-2 text-xs leading-relaxed text-foreground">
                        {q.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Speaking không chấm tự động — gửi bài cho giáo viên chấm. */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Mic className="size-4 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">Chấm bài Speaking</h3>
              </div>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Speaking không chấm điểm tự động — sau khi nộp, gửi bài cho giáo viên chấm tay và
              nhận phản hồi.
            </p>
            <TeacherGradeButton skillLabel="Speaking" fullWidth />
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">Mẹo làm bài</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>• Part 1: trả lời ngắn gọn (2–3 câu), đừng chỉ trả lời có/không.</li>
              <li>• Part 2: ghi key words trong 1 phút chuẩn bị, nói hết 2 phút.</li>
              <li>• Part 3: phát triển ý theo cấu trúc “quan điểm → lý do → ví dụ”.</li>
              <li>
                • Trạng thái được lưu tự động lần cuối lúc{" "}
                <strong className="text-foreground">
                  {savedAt
                    ? new Date(savedAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </strong>
                .
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
