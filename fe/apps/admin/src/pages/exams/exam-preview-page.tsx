import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  Headphones,
  Image,
  Type,
} from "lucide-react";

import { Button } from "@fe/components/ui/button";
import { useExamDetail } from "@/features/exams/hooks/use-exams";
import { useExamFormats } from "@/features/exams/hooks/use-exam-formats";
import { useExamTypes } from "@/features/exams/hooks/use-exam-types";
import {
  resolveExamTypeLayout,
  ExamLayoutStrip,
  sectionLayoutChip,
} from "@/features/exams/layouts/exam-type-layout";
import {
  MATERIAL_TYPE_LABELS,
  QUESTION_GROUP_TYPE_LABELS,
} from "@/features/exams/types/exam";
import type {
  AdminExamGroupMaterial,
  AdminExamQuestion,
  AdminExamQuestionGroup,
  AdminExamSection,
} from "@/features/exams/types/exam";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/* Số câu thực có trong một phần (direct + group), không tin field questionCount. */
function countSectionQuestions(section: AdminExamSection) {
  const grouped = (section.groups ?? []).reduce(
    (n, g) => n + (g.questions?.length ?? 0),
    0,
  );
  return grouped + (section.questions?.length ?? 0);
}

/* ------------------------------------------------------------------ */
/* Câu hỏi — 1 dòng gọn: số câu + nội dung + pills đáp án (đáp án     */
/* đúng được highlight). Thay cho radio disabled như bản cũ.          */
/* ------------------------------------------------------------------ */
function QuestionRow({ number, q }: { number: number; q: AdminExamQuestion }) {
  const options = q.options ?? [];
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-full bg-primary/10 px-2 text-[11px] font-bold text-primary">
          Câu {number}
        </span>
        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm">{q.question}</p>
        {q.points !== 1 && (
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {q.points} điểm
          </span>
        )}
      </div>
      {options.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.map((opt, i) => (
            <span
              key={opt.id}
              className={
                "inline-flex max-w-full items-start gap-1 rounded-md border px-2 py-1 text-xs " +
                (opt.isCorrect
                  ? "border-emerald-300 bg-emerald-50 font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-muted/30 text-muted-foreground")
              }
            >
              <span className="shrink-0 font-semibold">
                {String.fromCharCode(65 + i)}.
              </span>
              <span className="min-w-0 break-words">{opt.content}</span>
              {opt.isCorrect && <Check className="mt-0.5 h-3 w-3 shrink-0" />}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tài liệu của nhóm — audio/ảnh/đoạn văn hiển thị gọn theo loại.    */
/* Đoạn dài collapse (details) để không tràn màn hình.                 */
/* ------------------------------------------------------------------ */
function MaterialBlock({ mat }: { mat: AdminExamGroupMaterial }) {
  const label = mat.title || MATERIAL_TYPE_LABELS[mat.type] || "Tài liệu";

  if (mat.type === "AUDIO") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
        <Headphones className="h-4 w-4 shrink-0 text-blue-500" />
        <span className="max-w-40 shrink-0 truncate text-xs font-medium" title={label}>
          {label}
        </span>
        {mat.fileUrl ? (
          <audio controls preload="none" src={mat.fileUrl} className="h-8 min-w-0 flex-1" />
        ) : (
          <span className="text-xs font-medium text-destructive">Thiếu file</span>
        )}
      </div>
    );
  }

  if (mat.type === "IMAGE") {
    return (
      <figure className="inline-block rounded-lg border bg-background p-2">
        <figcaption className="mb-1.5 flex items-center gap-2 text-xs font-medium">
          <Image className="h-4 w-4 text-purple-500" />
          <span className="max-w-72 truncate" title={label}>
            {label}
          </span>
        </figcaption>
        {mat.fileUrl ? (
          <img
            src={mat.fileUrl}
            alt={label}
            loading="lazy"
            className="max-h-44 w-auto rounded"
          />
        ) : (
          <span className="text-xs font-medium text-destructive">Thiếu file</span>
        )}
      </figure>
    );
  }

  // TEXT / PASSAGE
  const content = mat.content ?? "";
  const isLong = content.length > 240 || content.split("\n").length > 4;
  return (
    <div className="rounded-lg border bg-background p-2.5">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium">
        <FileText className="h-4 w-4 text-emerald-600" />
        <span className="max-w-72 truncate" title={label}>
          {label}
        </span>
      </div>
      {content === "" ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : isLong ? (
        <details>
          <summary className="cursor-pointer select-none text-xs text-blue-600 hover:underline dark:text-blue-400">
            Đoạn dài ({content.length} ký tự) — nhấn để xem toàn bộ
          </summary>
          <div className="mt-1.5 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm">
            {content}
          </div>
        </details>
      ) : (
        <div className="whitespace-pre-wrap text-sm">{content}</div>
      )}
    </div>
  );
}

function GroupTypeIcon({ type }: { type: AdminExamQuestionGroup["groupType"] }) {
  if (type === "AUDIO") return <Headphones className="h-4 w-4 text-blue-500" />;
  if (type === "IMAGE") return <Image className="h-4 w-4 text-purple-500" />;
  if (type === "PASSAGE") return <FileText className="h-4 w-4 text-emerald-600" />;
  return <Type className="h-4 w-4 text-muted-foreground" />;
}

/* ------------------------------------------------------------------ */
/* Section — collapsible. Header gộp thống kê (nhóm/câu/media), bấm   */
/* để mở; nav phía trên jump vào và tự expand.                         */
/* ------------------------------------------------------------------ */
function SectionCard({
  section,
  layoutId,
  index,
  open,
  onToggle,
  startNumber,
}: {
  section: AdminExamSection;
  layoutId: ReturnType<typeof resolveExamTypeLayout>;
  index: number;
  open: boolean;
  onToggle: () => void;
  startNumber: number;
}) {
  const groups = section.groups ?? [];
  const direct = section.questions ?? [];
  const chip = sectionLayoutChip(layoutId, section.name, index);

  const materialCount = groups.reduce(
    (n, g) => n + (g.materials?.length ?? 0),
    0,
  );
  const totalQuestions = countSectionQuestions(section);

  // offset câu theo nhóm để đánh số liên tục trong phần (không restart mỗi nhóm)
  let acc = 0;
  const groupOffsets = groups.map((g) => {
    const off = acc;
    acc += g.questions?.length ?? 0;
    return off;
  });

  return (
    <section id={`preview-section-${section.id}`} className="scroll-mt-24">
      <div className="overflow-hidden rounded-2xl border bg-card">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
        >
          {chip && (
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${chip.className}`}
            >
              {chip.label}
            </span>
          )}
          <span className="min-w-0 truncate font-semibold">{section.name}</span>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            {groups.length} nhóm · {totalQuestions} câu
            {materialCount > 0 && ` · ${materialCount} media`}
          </span>
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="space-y-3 border-t px-4 py-4">
            {section.instructions && (
              <p className="text-xs italic text-muted-foreground">
                {section.instructions}
              </p>
            )}

            {groups.map((group, gi) => (
              <div
                key={group.id}
                className="space-y-2.5 rounded-xl border bg-muted/25 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <GroupTypeIcon type={group.groupType} />
                  <span className="text-sm font-medium">
                    {group.title || `Nhóm ${group.position + 1}`}
                  </span>
                  <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                    {QUESTION_GROUP_TYPE_LABELS[group.groupType ?? "CUSTOM"]}
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {(group.questions ?? []).length} câu
                  </span>
                </div>
                {group.instructions && (
                  <p className="text-xs text-muted-foreground">{group.instructions}</p>
                )}
                {(group.materials ?? []).map((mat) => (
                  <MaterialBlock key={mat.id} mat={mat} />
                ))}
                <div className="space-y-1.5">
                  {(group.questions ?? []).map((q, qi) => (
                    <QuestionRow
                      key={q.id}
                      number={startNumber + groupOffsets[gi] + qi}
                      q={q}
                    />
                  ))}
                </div>
              </div>
            ))}

            {direct.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Câu hỏi trực lập
                </p>
                {direct.map((q, qi) => (
                  <QuestionRow
                    key={q.id}
                    number={startNumber + acc + qi}
                    q={q}
                  />
                ))}
              </div>
            )}

            {totalQuestions === 0 && materialCount === 0 && (
              <p className="text-sm text-muted-foreground">
                Phần này chưa có nội dung.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ExamPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useExamDetail(Number(id));
  const { data: formats = [] } = useExamFormats();
  const { data: examTypes = [] } = useExamTypes();

  // true/false tường minh; undefined → mặc định section đầu tiên mở
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6">
        <p>Không tìm thấy đề thi</p>
      </div>
    );
  }

  const sections = exam.sections ?? [];

  // One shared backend/API — the layout is a frontend concern only.
  const format = formats.find((f) => f.id === exam.examFormatId);
  const examTypeName = examTypes.find((t) => t.id === format?.examTypeId)?.name ?? null;
  const layoutId = resolveExamTypeLayout(examTypeName);

  // Thống kê tổng quan từ dữ liệu thật
  let totalQuestions = 0;
  let totalGroups = 0;
  let totalMaterials = 0;
  for (const s of sections) {
    totalGroups += (s.groups ?? []).length;
    for (const g of s.groups ?? []) {
      totalMaterials += g.materials?.length ?? 0;
    }
    totalQuestions += countSectionQuestions(s);
  }

  // Số câu BẮT ĐẦU của từng phần (1-based) → đánh số liên tục toàn đề Câu 1…200
  let offset = 0;
  const sectionStarts = sections.map((s) => {
    const start = offset + 1;
    offset += countSectionQuestions(s);
    return start;
  });

  const isOpen = (sectionId: number, index: number) =>
    openMap[sectionId] ?? index === 0;

  const jumpTo = (sectionId: number) => {
    setOpenMap((prev) => ({ ...prev, [sectionId]: true }));
    window.setTimeout(() => {
      document
        .getElementById(`preview-section-${sectionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 70);
  };

  const setAllOpen = (open: boolean) =>
    setOpenMap(Object.fromEntries(sections.map((s) => [s.id, open])));

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(`/exams/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      {/* ---------------- Tổng quan đề ---------------- */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">{exam.title}</h1>
          {examTypeName && (
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
              {examTypeName}
            </span>
          )}
          {exam.isPremium && (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Premium
            </span>
          )}
        </div>
        {exam.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{exam.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span>Thời lượng: {formatDuration(exam.durationSeconds)}</span>
          <span>
            <strong className="font-semibold text-foreground">{sections.length}</strong> phần thi
          </span>
          <span>
            <strong className="font-semibold text-foreground">{totalQuestions}</strong> câu hỏi
          </span>
          <span>
            <strong className="font-semibold text-foreground">{totalGroups}</strong> nhóm
          </span>
          <span>
            <strong className="font-semibold text-foreground">{totalMaterials}</strong> tài liệu
          </span>
        </div>
        <ExamLayoutStrip layoutId={layoutId} />
      </div>

      {sections.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground">Đề thi này chưa có nội dung.</p>
        </div>
      ) : (
        <>
          {/* ---------------- Nav sticky: nhảy tới phần + thu/mở ---------------- */}
          <div className="sticky top-0 z-20 mt-4 flex items-center gap-2 rounded-xl border bg-background/95 py-2 pl-2 pr-2 backdrop-blur">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
              {sections.map((s, i) => {
                const navChip = sectionLayoutChip(layoutId, s.name, i);
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={s.name}
                    onClick={() => jumpTo(s.id)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted ${
                      navChip?.className ??
                      "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {navChip?.label ?? `Phần ${i + 1}`} · {countSectionQuestions(s)} câu
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setAllOpen(true)}
              >
                Mở tất cả
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setAllOpen(false)}
              >
                Thu gọn
              </Button>
            </div>
          </div>

          {/* ---------------- Danh sách phần ---------------- */}
          <div className="mt-4 space-y-3">
            {sections.map((section, i) => (
              <SectionCard
                key={section.id}
                section={section}
                layoutId={layoutId}
                index={i}
                open={isOpen(section.id, i)}
                onToggle={() =>
                  setOpenMap((prev) => ({
                    ...prev,
                    [section.id]: !isOpen(section.id, i),
                  }))
                }
                startNumber={sectionStarts[i]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
