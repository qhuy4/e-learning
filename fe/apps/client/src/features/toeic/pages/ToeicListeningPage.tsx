import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  Trophy,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useToeicExam } from "../contexts/toeic-exam-context";
import { getToeicQuestions } from "../data/source";
import { effectiveParts, partOfQuestion } from "../constants";
import { groupQuestions } from "../utils";
import { AudioPlayerCard } from "../components/audio/AudioPlayerCard";
import { ListeningQuestionCard } from "../components/question/ListeningQuestionCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

function audioDuration(part: number): number {
  if (part === 1) return 10;
  if (part === 2) return 6;
  if (part === 3) return 35;
  return 40;
}

/** Listening exam page — only the parts selected in the setup are shown. */
export function ToeicListeningPage() {
  const navigate = useNavigate();
  const {
    answers,
    selectAnswer,
    flags,
    toggleFlag,
    current,
    setCurrent,
    startFlow,
    config,
    isApiMode,
    reviewMode,
    apiExam,
  } = useToeicExam();

  /** Giữ examId + review trên mọi route điều hướng (mất → mất nguồn data API). */
  const examId = apiExam?.id ?? null;
  const withExamId = useCallback(
    (route: string): string => {
      let out = route;
      if (isApiMode && examId !== null) out += `${out.includes("?") ? "&" : "?"}examId=${examId}`;
      if (reviewMode) out += `${out.includes("?") ? "&" : "?"}review=1`;
      return out;
    },
    [isApiMode, examId, reviewMode],
  );

  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    startFlow("lr");
  }, [startFlow]);

  const selectedSet = useMemo(
    () => new Set(effectiveParts(config.parts)),
    [config.parts],
  );
  const hasReading = useMemo(() => effectiveParts(config.parts).some((p) => p >= 5), [config.parts]);

  const listening = useMemo(
    () =>
      getToeicQuestions().filter((q) => q.section === "listening" && selectedSet.has(q.part)),
    // Nguồn đổi (vào API mode / đổi examId) → tính lại ngay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSet, isApiMode, examId],
  );
  const groups = useMemo(() => groupQuestions(listening), [listening]);
  const ids = useMemo(() => listening.map((q) => q.id), [listening]);

  // Xem lại theo part (result → "Xem chi tiết" part N) → nhảy sẵn tới câu đầu
  // part đó — áp dụng 1 lần (ref) để không ghi đè khi người dùng tự điều hướng.
  const [searchParams] = useSearchParams();
  const partRaw = searchParams.get("part");
  const appliedPartRef = useRef<string | null>(null);
  useEffect(() => {
    if (!reviewMode || !partRaw || appliedPartRef.current === partRaw) return;
    const part = Number(partRaw);
    if (!Number.isInteger(part)) return;
    const target = ids.find((id) => partOfQuestion(id).part === part);
    if (target == null) return;
    appliedPartRef.current = partRaw;
    setCurrent("listening", target);
  }, [reviewMode, partRaw, ids, setCurrent]);

  // No listening part selected (e.g. only Parts 5–7) → skip to Reading / review.
  // Ở chế độ xem lại → về thẳng trang kết quả (không rơi vào màn "Kiểm tra & nộp").
  useEffect(() => {
    if (ids.length === 0)
      navigate(
        reviewMode
          ? withExamId("/toeic/result")
          : hasReading
            ? withExamId("/toeic/run/reading")
            : withExamId("/toeic/review"),
      );
  }, [ids.length, hasReading, reviewMode, navigate, withExamId]);

  // Keep the focused question inside the selected parts.
  useEffect(() => {
    if (ids.length === 0) return;
    if (!ids.includes(current.listening)) setCurrent("listening", ids[0]);
  }, [ids, current.listening, setCurrent]);

  const currentQ = ids.includes(current.listening) ? current.listening : (ids[0] ?? 1);
  const group = groups.find((g) => g.questions.some((q) => q.id === currentQ)) ?? groups[0];

  // Bring the focused question into view when it changes.
  useEffect(() => {
    const el = document.getElementById(`q-${currentQ}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentQ]);

  const answeredIn = listening.filter((q) => answers[q.id]).length;
  const idx = ids.indexOf(currentQ);
  const go = (id: number) => setCurrent("listening", id);

  // Part 3/4: màn hình hiện cả group (1 audio chung + 3 câu) → Prev/Next nhảy theo GROUP.
  // Part 1/2: mỗi group chỉ 1 câu → Prev/Next theo từng câu.
  const groupIdx = groups.findIndex((g) => g.questions.some((q) => q.id === currentQ));
  const multiQuestionGroup = group ? group.questions.length > 1 : false;
  const prev = multiQuestionGroup
    ? groupIdx > 0
      ? groups[groupIdx - 1].questions[0].id
      : null
    : idx > 0
      ? ids[idx - 1]
      : null;
  const next = multiQuestionGroup
    ? groupIdx >= 0 && groupIdx < groups.length - 1
      ? groups[groupIdx + 1].questions[0].id
      : null
    : idx >= 0 && idx < ids.length - 1
      ? ids[idx + 1]
      : null;

  // Sang group khác → đóng transcript (nếu đang mở).
  const stimulusId = group?.stimulusId ?? null;
  useEffect(() => {
    setShowTranscript(false);
  }, [stimulusId]);

  if (!group) return null;

  /** Màu ô số trong nhóm: review → xanh (đúng) / đỏ (sai); đang thi → đã làm. */
  const chipClass = (q: (typeof listening)[number]): string => {
    if (q.id === currentQ) return "border-primary bg-primary text-primary-foreground";
    if (reviewMode) {
      const pick = answers[q.id];
      if (!pick) return "border-border bg-muted text-muted-foreground hover:border-primary/50";
      return pick === q.correct
        ? "border-emerald-500 bg-emerald-500 text-white"
        : "border-red-400 bg-red-400 text-white";
    }
    return answers[q.id]
      ? "border-primary/60 bg-primary/10 text-primary"
      : "border-border bg-muted text-muted-foreground hover:border-primary/50";
  };

  return (
    <div>
      {/* Section progress strip */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SectionBadge label="Listening" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              Phần Nghe — Câu {currentQ}/{ids.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {reviewMode
              ? `Xem lại bài đã nộp · Đã làm ${answeredIn}/${ids.length} · Audio nghe lại được`
              : `Đã làm ${answeredIn}/${ids.length} · Audio chỉ phát 1 lần`}
          </span>
        </div>
        <ProgressBar className="mt-3" value={answeredIn} max={ids.length} />
      </div>

      {/* Audio + questions */}
      <div className="space-y-4">
        {group.stimulus && (
          <div className="space-y-3">
            <AudioPlayerCard
              key={group.stimulusId}
              label={group.stimulus.audioLabel ?? "Audio"}
              title={group.stimulus.title}
              durationSec={audioDuration(group.part)}
              src={group.stimulus.audioUrl}
              replay={reviewMode}
            />

            {(group.stimulus.lines?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  aria-expanded={showTranscript}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareText className="size-4 text-primary" />
                    Transcript đoạn hội thoại ({group.stimulus.lines?.length} dòng)
                  </span>
                  {showTranscript ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </button>
                {showTranscript && (
                  <div className="space-y-2 border-t border-border px-4 py-3">
                    {group.stimulus.lines?.map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                          {line.speaker ?? "Speaker"}
                        </span>
                        <p className="text-sm leading-relaxed text-foreground">{line.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {group.questions.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground">
                  Các câu trong đoạn này:
                </span>
                {group.questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => go(q.id)}
                    className={`relative flex size-8 items-center justify-center rounded-md border text-xs font-bold transition-colors ${chipClass(q)}`}
                    aria-label={`Câu ${q.id}`}
                  >
                    {q.id}
                    {flags[q.id] && (
                      <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500 ring-1 ring-card" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {group.questions.map((q) => (
          <div
            key={q.id}
            id={`q-${q.id}`}
            className={`scroll-mt-28 rounded-xl transition-shadow ${
              q.id === currentQ ? "ring-2 ring-primary ring-offset-2 ring-offset-muted/50" : ""
            }`}
          >
            <ListeningQuestionCard
              question={q}
              selected={answers[q.id] ?? null}
              review={reviewMode}
              onSelect={(letter) => {
                selectAnswer(q.id, letter);
                if (q.id !== currentQ) go(q.id);
              }}
              flagged={Boolean(flags[q.id])}
              onToggleFlag={reviewMode ? undefined : () => toggleFlag(q.id)}
            />
          </div>
        ))}
      </div>

      {/* Prev / next — dính đáy: cố định, chỉ nội dung trên cuộn */}
      <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <Button
          variant="outline"
          disabled={prev === null}
          onClick={() => prev !== null && go(prev)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          {multiQuestionGroup ? "Group trước" : "Câu trước"}
        </Button>
        <span className="text-xs font-semibold text-muted-foreground">
          Câu {currentQ} / {ids.length} — đang ở Part {partOfQuestion(currentQ).part}
        </span>
        {next !== null ? (
          <Button onClick={() => go(next)} className="gap-2">
            {multiQuestionGroup ? "Group tiếp theo" : "Câu tiếp"}
            <ArrowRight className="size-4" />
          </Button>
        ) : reviewMode ? (
          <Button onClick={() => navigate(withExamId("/toeic/result"))} className="gap-2">
            Quay lại kết quả
            <Trophy className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={() => navigate(hasReading ? withExamId("/toeic/run/reading") : withExamId("/toeic/review"))}
            className="gap-2"
          >
            {hasReading ? "Sang phần Reading" : "Kiểm tra & nộp"}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
