import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight, Bookmark, Highlighter, Flag, Trophy } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useToeicExam } from "../contexts/toeic-exam-context";
import { getToeicQuestions } from "../data/source";
import { effectiveParts, partOfQuestion } from "../constants";
import { groupQuestions } from "../utils";
import { ReadingQuestionCard } from "../components/question/ReadingQuestionCard";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionBadge } from "../components/common/SectionBadge";

/** Reading exam page (Parts 5–7, as selected) — passage 48% / questions 52% split. */
export function ToeicReadingPage() {
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

  useEffect(() => {
    startFlow("lr");
  }, [startFlow]);

  const selectedSet = useMemo(() => new Set(effectiveParts(config.parts)), [config.parts]);
  const hasListening = useMemo(() => effectiveParts(config.parts).some((p) => p <= 4), [config.parts]);

  const reading = useMemo(
    () => getToeicQuestions().filter((q) => q.section === "reading" && selectedSet.has(q.part)),
    // Nguồn đổi (vào API mode / đổi examId) → tính lại ngay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSet, isApiMode, examId],
  );
  const groups = useMemo(() => groupQuestions(reading), [reading]);
  const ids = useMemo(() => reading.map((q) => q.id), [reading]);

  // Xem lại theo part (result → "Xem chi tiết" part N) → nhảy sẵn câu đầu part.
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
    setCurrent("reading", target);
  }, [reviewMode, partRaw, ids, setCurrent]);

  // No reading part selected (e.g. only Parts 1–4) → back to Listening / review.
  // Ở chế độ xem lại → về thẳng trang kết quả (không rơi vào màn "Kiểm tra & nộp").
  useEffect(() => {
    if (ids.length === 0)
      navigate(
        reviewMode
          ? withExamId("/toeic/result")
          : hasListening
            ? withExamId("/toeic/run/listening")
            : withExamId("/toeic/review"),
      );
  }, [ids.length, hasListening, reviewMode, navigate, withExamId]);

  useEffect(() => {
    if (ids.length === 0) return;
    if (!ids.includes(current.reading)) setCurrent("reading", ids[0]);
  }, [ids, current.reading, setCurrent]);

  const currentQ = ids.includes(current.reading) ? current.reading : (ids[0] ?? 101);
  const question = reading.find((q) => q.id === currentQ) ?? reading[0];
  const group = groups.find((g) => g.questions.some((q) => q.id === currentQ)) ?? groups[0];

  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  const hasPassage = Boolean(group?.stimulus?.lines?.length);

  useEffect(() => {
    const el = document.getElementById(`q-${currentQ}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentQ]);

  const answeredIn = reading.filter((q) => answers[q.id]).length;
  const idx = ids.indexOf(currentQ);
  const go = (id: number) => setCurrent("reading", id);

  // Part 6/7: màn hình hiện passage + nhiều câu của group → Prev/Next nhảy theo GROUP.
  // Part 5: mỗi group 1 câu → Prev/Next theo câu.
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

  if (!group || !question) return null;

  /** Màu ô số trong nhóm: review → xanh (đúng) / đỏ (sai); đang thi → đã làm. */
  const chipClass = (q: (typeof reading)[number]): string => {
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

  /** Jumps to the question belonging to blank "(n)". */
  const goToBlank = (n: number) => {
    const target = blankTarget(n);
    if (target) go(target);
  };

  /** Số câu THẬT của chỗ trống (n) trong group hiện tại (không hardcode 130). */
  function blankTarget(n: number): number | null {
    return group.questions.find((q) => q.stem.includes(`(${n})`))?.id ?? null;
  }

  const renderLine = (line: string, lineKey: string) =>
    line.split(/(\(\d+\)_+)/g).map((seg, idx) => {
      const m = seg.match(/^\((\d+)\)_+$/);
      if (m) {
        const target = blankTarget(Number(m[1]));
        return (
          <button
            key={idx}
            type="button"
            disabled={target === null}
            onClick={() => target !== null && goToBlank(Number(m[1]))}
            className="mx-0.5 rounded border border-dashed border-primary/60 bg-primary/5 px-1.5 font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
            title={target !== null ? `Đi đến câu ${target} của đoạn này` : "Chưa tìm thấy câu hỏi"}
          >
            {seg}
          </button>
        );
      }
      return <span key={`${lineKey}-${idx}`}>{seg}</span>;
    });

  const questionCards = (
    <div className="space-y-4">
      {hasPassage && group.questions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Các câu của đoạn này:</span>
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

      {group.questions.map((q) => (
        <div
          key={q.id}
          id={`q-${q.id}`}
          className={`scroll-mt-28 rounded-xl transition-shadow ${
            group.questions.length > 1 && q.id === currentQ
              ? "ring-2 ring-primary ring-offset-2 ring-offset-muted/50"
              : ""
          }`}
        >
          <ReadingQuestionCard
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
  );

  return (
    <div>
      {/* Section progress strip */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SectionBadge label="Reading" tone="primary" />
            <span className="text-sm font-extrabold text-foreground">
              Phần Đọc — Câu {currentQ}/{ids.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {reviewMode
              ? `Xem lại bài đã nộp · Đã làm ${answeredIn}/${ids.length} câu phần Reading`
              : `Đã làm ${answeredIn}/${ids.length} câu phần Reading`}
          </span>
        </div>
        <ProgressBar className="mt-3" value={answeredIn} max={ids.length} />
      </div>

      {hasPassage ? (
        <div className="grid items-start gap-4 lg:grid-cols-[48fr_52fr]">
          {/* Passage — independent scroll */}
          <aside className="scrollbar-none rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-124px)] lg:overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <SectionBadge label={`Part ${question.part}`} tone="primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {group.questions.length} câu · hover để highlight/đánh dấu
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-foreground">
              {group.stimulus?.title ?? "Reading Passage"}
            </h3>

            <div className="mt-3 space-y-1">
              {(group.stimulus?.lines ?? []).map((line, i) => {
                const key = `${group.stimulusId}:${i}`;
                return (
                  <div
                    key={i}
                    className={`group relative -mx-2 rounded-md px-2 py-1.5 transition-colors ${
                      highlights[key] ? "bg-amber-100/70" : "hover:bg-muted/60"
                    }`}
                  >
                    <p
                      className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        line.text.trim().length > 0 && line.text === line.text.toUpperCase()
                          ? "font-extrabold text-foreground"
                          : "text-foreground/90"
                      }`}
                    >
                      {renderLine(line.text, key)}
                    </p>
                    <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        aria-label="Highlight đoạn này"
                        onClick={() =>
                          setHighlights((prevMap) => ({ ...prevMap, [key]: !prevMap[key] }))
                        }
                        className={`flex size-6 items-center justify-center rounded border ${
                          highlights[key]
                            ? "border-amber-400 bg-amber-200 text-amber-800"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Highlighter className="size-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Đánh dấu đoạn này"
                        onClick={() =>
                          setBookmarks((prevMap) => ({ ...prevMap, [key]: !prevMap[key] }))
                        }
                        className={`flex size-6 items-center justify-center rounded border ${
                          bookmarks[key]
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Bookmark className={`size-3 ${bookmarks[key] ? "fill-primary" : ""}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 rounded-lg bg-muted/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
              Chọn highlight (màu vàng) hoặc bookmark (cột cờ) cho từng dòng. Với Part 6, bấm vào
              chỗ trống <strong className="text-primary">(1)______</strong> để nhảy tới câu tương ứng.
            </p>
          </aside>

          {/* Questions */}
          <div>{questionCards}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">{questionCards}</div>
      )}

      {/* Prev / next — dính đáy: cố định, chỉ nội dung trên cuộn */}
      <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <Button
          variant="outline"
          disabled={prev === null}
          onClick={() => prev !== null && go(prev)}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          {multiQuestionGroup ? "Đoạn trước" : "Câu trước"}
        </Button>
        <span className="text-xs font-semibold text-muted-foreground">
          Câu {currentQ} / {ids.length} — đang ở Part {question.part}
        </span>
        {next !== null ? (
          <Button onClick={() => go(next)} className="gap-2">
            {multiQuestionGroup ? "Đoạn tiếp theo" : "Câu tiếp"}
            <ArrowRight className="size-4" />
          </Button>
        ) : reviewMode ? (
          <Button onClick={() => navigate(withExamId("/toeic/result"))} className="gap-2">
            Quay lại kết quả
            <Trophy className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => navigate(withExamId("/toeic/review"))} className="gap-2">
            Kiểm tra &amp; nộp
            <Flag className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
