import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useExamDetail, useExamAnswers } from "../hooks";
import {
  ArrowLeft,
  Eye,
  PanelLeft,
  PanelRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Flag,
  StickyNote,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  QuestionReviewList,
  FILTER_MATCH,
  type ReviewFilter,
  type ReviewQuestion,
} from "../components/review";
import type { ExamQuestion, ExamOption } from "../types";
import { isTextAnswerType } from "../utils";

interface LocationState {
  examId?: number;
}

/** Đánh dấu/ghi chú lúc làm bài — đọc từ localStorage (chỉ đọc, không sửa). */
interface QuestionMark {
  flagged?: boolean;
  note?: string;
}
type MarkMap = Record<number, QuestionMark>;

function loadMarks(attemptId: number): MarkMap {
  if (typeof window === "undefined" || !attemptId) return {};
  try {
    return JSON.parse(localStorage.getItem(`exam-marks-${attemptId}`) ?? "{}");
  } catch {
    return {};
  }
}

/** Trạng thái hiển thị của một câu (dùng cho cột tiến độ + footer). */
type ItemStatus = "correct" | "wrong" | "empty" | "open";

function statusOf(item: ReviewQuestion): ItemStatus {
  if (item.isText) return item.answered ? "open" : "empty";
  if (!item.answered) return "empty";
  return item.isCorrect ? "correct" : "wrong";
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  correct: "Đúng",
  wrong: "Sai",
  empty: "Chưa làm",
  open: "Trả lời mở",
};

/** Câu trả lời văn bản (không có options) — hiển thị riêng, không tính đúng/sai. */
function isOpenEnded(
  type: string,
  options: ExamOption[],
  answerText: string | null,
): boolean {
  if (isTextAnswerType(type)) {
    // FILL_BLANK / SHORT_ANSWER có đáp án keyed (options isCorrect) → server
    // vẫn chấm đúng/sai khi nộp → KHÔNG xếp vào nhóm "trả lời mở".
    return !options.some((option) => option.isCorrect);
  }
  return options.length === 0 && Boolean(answerText && answerText.trim());
}

/**
 * Full per-question review: every question of the exam (from the detail
 * payload) joined with the candidate's picks (`useExamAnswers`), each with its
 * options, the correct answer and the explanation.
 *
 * App-shell y hệt trang làm bài: header + cột Tiến độ (trái) + cột Đánh dấu &
 * Ghi chú (phải) luôn cố định, footer "Câu trước / Câu sau" cố định đáy —
 * chỉ phần giữa cuộn.
 */
export function ExamReviewPage() {
  const { examId: examIdParam, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const examId = Number(examIdParam ?? 0) || state?.examId;
  const attemptIdNum = Number(attemptId);

  const { data: exam, isLoading: examLoading } = useExamDetail(examId ?? 0);
  const { data: answers, isLoading: answersLoading } = useExamAnswers(attemptIdNum);

  const isLoading = examLoading || answersLoading;
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));

  // Hai cột phụ — bật/tắt từ header, ghi nhớ lựa chọn (chung với trang làm bài).
  const [leftOpen, setLeftOpen] = useState(
    () => typeof window === "undefined" || localStorage.getItem("exam-panel-left") !== "0"
  );
  const [rightOpen, setRightOpen] = useState(
    () => typeof window === "undefined" || localStorage.getItem("exam-panel-right") !== "0"
  );
  const toggleLeft = () =>
    setLeftOpen((v) => {
      try {
        localStorage.setItem("exam-panel-left", v ? "0" : "1");
      } catch { /* localStorage blocked — bỏ qua */ }
      return !v;
    });
  const toggleRight = () =>
    setRightOpen((v) => {
      try {
        localStorage.setItem("exam-panel-right", v ? "0" : "1");
      } catch { /* localStorage blocked — bỏ qua */ }
      return !v;
    });

  // Bộ lọc + câu đang xem (footer prev/next đi theo danh sách đang lọc).
  const [filter, setFilter] = useState<ReviewFilter>("ALL");
  const [activeNumber, setActiveNumber] = useState(1);

  const items = useMemo<ReviewQuestion[]>(() => {
    const answerByQuestion = new Map((answers ?? []).map((a) => [a.questionId, a]));
    const list: ReviewQuestion[] = [];
    let number = 0;

    const push = (question: ExamQuestion, sectionName: string) => {
      const answer = answerByQuestion.get(question.id);
      number += 1;
      const options = question.options ?? [];
      const answerText = answer?.answerText ?? null;
      const isText = isOpenEnded(question.type, options, answerText);
      list.push({
        questionId: question.id,
        number,
        sectionName,
        questionText: question.question || "(Không có nội dung câu hỏi)",
        explanation: question.explanation ?? null,
        type: question.type,
        options,
        selectedOptionId: answer?.selectedOptionId ?? null,
        answerText,
        // Câu text (kể cả điền khuyết có key) = có answerText; câu có phương
        // án = đã chọn option.
        answered: isTextAnswerType(question.type)
          ? Boolean(answerText && answerText.trim())
          : Boolean(answer && answer.selectedOptionId !== null),
        isText,
        isCorrect: answer?.isCorrect ?? false,
        earnedPoints: answer?.earnedPoints ?? 0,
      });
      answerByQuestion.delete(question.id);
    };

    // Same order as the taking page: sections → direct questions → grouped questions.
    const sections = [...(exam?.sections ?? [])].sort((a, b) => a.position - b.position);
    for (const section of sections) {
      const direct = [...(section.questions ?? [])].sort((a, b) => a.position - b.position);
      direct.forEach((question) => push(question, section.name));

      const groups = [...(section.groups ?? [])].sort((a, b) => a.position - b.position);
      for (const group of groups) {
        const grouped = [...(group.questions ?? [])].sort((a, b) => a.position - b.position);
        grouped.forEach((question) => push(question, section.name));
      }
    }

    // Answers whose question is missing from the detail payload — still shown.
    for (const answer of answerByQuestion.values()) {
      number += 1;
      const answerText = answer.answerText ?? null;
      const isText = isOpenEnded("", [], answerText);
      list.push({
        questionId: answer.questionId,
        number,
        sectionName: "Đề thi",
        questionText: `Câu hỏi #${answer.questionId}`,
        explanation: null,
        type: "",
        options: [],
        selectedOptionId: answer.selectedOptionId,
        answerText,
        answered: isText
          ? Boolean(answerText && answerText.trim())
          : answer.selectedOptionId !== null,
        isText,
        isCorrect: answer.isCorrect,
        earnedPoints: answer.earnedPoints,
      });
    }

    return list;
  }, [exam, answers]);

  // Thống kê đúng/sai theo cách server chấm — câu tự luận không có đáp án
  // keyed không tham gia điểm % hay Đúng/Sai.
  const optionItems = items.filter((item) => !item.isText);
  const textItems = items.filter((item) => item.isText);
  const totalQuestions = optionItems.length;
  const correctCount = optionItems.filter((item) => item.isCorrect).length;
  const wrongCount = optionItems.filter(
    (item) => item.answered && !item.isCorrect,
  ).length;
  const emptyCount = items.filter((item) => statusOf(item) === "empty").length;
  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const textAnsweredCount = textItems.filter((item) => item.answered).length;

  // Danh sách theo bộ lọc — prev/next ở footer đi theo đúng danh sách này.
  const visible = useMemo(
    () => items.filter(FILTER_MATCH[filter]),
    [items, filter],
  );
  const activeIndex = visible.findIndex((item) => item.number === activeNumber);
  const prevItem = activeIndex > 0 ? visible[activeIndex - 1] : null;
  const nextItem =
    activeIndex === -1
      ? (visible[0] ?? null)
      : (visible[activeIndex + 1] ?? null);
  const activeItem = items.find((item) => item.number === activeNumber);

  const handleFilterChange = (next: ReviewFilter) => {
    setFilter(next);
    // Câu đang xem lọt ra ngoài bộ lọc mới → nhảy về câu đầu của bộ lọc.
    const nextVisible = items.filter(FILTER_MATCH[next]);
    if (!nextVisible.some((item) => item.number === activeNumber)) {
      if (nextVisible[0]) setActiveNumber(nextVisible[0].number);
    }
  };

  /** Nhảy tới câu: nếu câu đó bị lọc ẩn thì bật lại bộ lọc "Tất cả". */
  const jumpTo = (number: number) => {
    const item = items.find((candidate) => candidate.number === number);
    if (!item) return;
    if (!FILTER_MATCH[filter](item)) setFilter("ALL");
    setActiveNumber(number);
    window.setTimeout(() => {
      document
        .getElementById(`review-q-${number}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 70);
  };

  // Đánh dấu / ghi chú lúc làm bài — chỉ đọc để nhảy nhanh.
  const marks = useMemo<MarkMap>(() => loadMarks(attemptIdNum), [attemptIdNum]);
  const markEntries = useMemo(() => {
    const numberByQuestionId = new Map(items.map((item) => [item.questionId, item.number]));
    return Object.entries(marks)
      .map(([questionId, mark]) => ({
        number: numberByQuestionId.get(Number(questionId)) ?? null,
        mark,
      }))
      .filter((entry): entry is { number: number; mark: QuestionMark } => entry.number !== null)
      .sort((a, b) => a.number - b.number);
  }, [marks, items]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (answers === undefined || items.length === 0) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {hasToken ? "Không tìm thấy dữ liệu bài làm" : "Đăng nhập để xem lại bài làm"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasToken
              ? "Lượt thi này chưa có đáp án hoặc không tồn tại."
              : "Chi tiết đáp án và giải thích được lưu theo tài khoản của bạn."}
          </p>
          {hasToken ? (
            <button
              onClick={() => navigate("/exams")}
              className="mt-4 font-semibold text-primary hover:underline"
            >
              Quay lại danh sách
            </button>
          ) : (
            <Link
              to="/student/login"
              className="mt-4 inline-block font-semibold text-primary hover:underline"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40 text-foreground">
      {/* ---------------- Header — dính trên, không trôi khi cuộn ---------------- */}
      <header className="z-30 shrink-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
            title="Quay lại"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggleLeft}
            data-panel-toggle="left"
            aria-label={leftOpen ? "Ẩn cột trái" : "Hiện cột trái"}
            title={leftOpen ? "Ẩn cột trái" : "Hiện cột trái"}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors lg:inline-flex ${
              leftOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <PanelLeft className="size-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-extrabold sm:text-base">
              Xem chi tiết bài làm
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {exam?.title} · {items.length} câu hỏi
            </p>
          </div>

          <span className="hidden shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-bold tabular-nums text-muted-foreground md:inline">
            {correctCount}/{totalQuestions} · {percentage}%
          </span>

          <Link
            to={`/exams/${examId}/result/${attemptId}`}
            state={{ examId }}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            <Trophy className="size-3.5 text-primary" />
            Về kết quả
          </Link>

          <button
            type="button"
            onClick={toggleRight}
            data-panel-toggle="right"
            aria-label={rightOpen ? "Ẩn cột phải" : "Hiện cột phải"}
            title={rightOpen ? "Ẩn cột phải" : "Hiện cột phải"}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors xl:inline-flex ${
              rightOpen
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <PanelRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ---------------- Cột trái: tiến độ + chuyển câu hỏi (cố định) ---------------- */}
        {leftOpen && (
          <aside
            data-panel="left"
            className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-background lg:flex"
          >
            <div className="space-y-5 p-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Tiến độ
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {correctCount}/{totalQuestions} câu đúng
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                    Đúng {correctCount}
                  </span>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-600">
                    Sai {wrongCount}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    Chưa làm {emptyCount}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Chuyển câu hỏi
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {items.map((item) => {
                    const status = statusOf(item);
                    const isActive = item.number === activeNumber;
                    const mark = marks[item.questionId];
                    return (
                      <button
                        key={item.questionId}
                        type="button"
                        onClick={() => jumpTo(item.number)}
                        aria-label={`Câu ${item.number}`}
                        className={`relative h-9 w-full rounded-lg text-xs font-bold transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/40"
                            : status === "correct"
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : status === "wrong"
                                ? "bg-red-400 text-white hover:bg-red-500"
                                : status === "open"
                                  ? "bg-primary/15 text-primary hover:bg-primary/25"
                                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {item.number}
                        {mark?.flagged && (
                          <Flag className="absolute right-0.5 top-0.5 size-2.5 fill-current" />
                        )}
                        {!mark?.flagged && (mark?.note ?? "").trim() && (
                          <StickyNote className="absolute right-0.5 top-0.5 size-2.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-emerald-500" />
                  <span>Trả lời đúng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-red-400" />
                  <span>Trả lời sai</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-muted" />
                  <span>Chưa làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-primary/30" />
                  <span>Câu tự luận / trả lời mở</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="size-3 fill-primary text-primary" />
                  <span>Đánh dấu lúc làm bài</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ---------------- Cột giữa: nội dung — chỉ phần này cuộn ---------------- */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-extrabold text-foreground">
                Kết quả chi tiết
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-extrabold text-foreground">
                    {correctCount}/{totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">Câu đúng</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-extrabold text-foreground">{percentage}%</p>
                  <p className="text-sm text-muted-foreground">Tỷ lệ đúng</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-extrabold text-foreground">{wrongCount}</p>
                  <p className="text-sm text-muted-foreground">Câu sai</p>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Thống kê đúng/sai theo kết quả chấm của bài thi — câu tự luận không có đáp
                án keyed không được chấm điểm tự động.
              </p>
              {textItems.length > 0 && (
                <p className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary">
                  Đã trả lời {textAnsweredCount}/{textItems.length} câu tự luận
                </p>
              )}
            </div>

            <QuestionReviewList
              items={items}
              filter={filter}
              onFilterChange={handleFilterChange}
              activeNumber={activeNumber}
            />

            <div className="h-4" />
          </div>
        </main>

        {/* ---------------- Cột phải: đánh dấu & ghi chú lúc thi (cố định) ---------------- */}
        {rightOpen && (
          <aside
            data-panel="right"
            className="hidden w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-background xl:flex"
          >
            <div className="border-b border-border p-4 pb-3">
              <h3 className="text-sm font-extrabold text-foreground">
                Đánh dấu &amp; Ghi chú
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {markEntries.length} mục · lấy từ lúc làm bài
              </p>
            </div>
            <div className="space-y-2 p-3">
              {markEntries.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs leading-relaxed text-muted-foreground">
                  Lượt thi này không có câu nào được đánh dấu hay ghi chú.
                  <br />
                  Dùng nút “Đánh dấu” / “Ghi chú” khi làm bài để giữ lại mẹo ở đây.
                </div>
              )}
              {markEntries.map((entry) => {
                const item = items.find((candidate) => candidate.number === entry.number);
                const isActive = entry.number === activeNumber;
                return (
                  <button
                    key={entry.number}
                    type="button"
                    onClick={() => jumpTo(entry.number)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-primary">
                      {entry.mark.flagged && <Flag className="size-3 fill-current" />}
                      {!entry.mark.flagged && <StickyNote className="size-3" />}
                      Câu {entry.number}
                      {item && (
                        <span className="ml-auto truncate text-[10px] font-bold text-muted-foreground">
                          {item.sectionName}
                        </span>
                      )}
                    </span>
                    {(entry.mark.note ?? "").trim() && (
                      <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                        {entry.mark.note}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* ---------------- Footer cố định: Câu trước / Câu sau ---------------- */}
      <footer
        data-review-footer
        className="z-20 shrink-0 border-t border-border bg-background"
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={() => prevItem && jumpTo(prevItem.number)}
            disabled={!prevItem}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Câu trước
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold tabular-nums text-muted-foreground sm:text-sm">
              Câu {activeNumber}/{items.length}
            </span>
            {activeItem && (
              <span
                className={`hidden rounded-full border px-2.5 py-1 text-xs font-bold sm:inline ${
                  statusOf(activeItem) === "correct"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : statusOf(activeItem) === "wrong"
                      ? "border-red-300 bg-red-50 text-red-700"
                      : statusOf(activeItem) === "open"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                }`}
              >
                {STATUS_LABEL[statusOf(activeItem)]}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => nextItem && jumpTo(nextItem.number)}
            disabled={!nextItem}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Câu sau
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
