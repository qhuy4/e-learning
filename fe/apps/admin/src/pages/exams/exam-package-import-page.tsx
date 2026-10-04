import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileArchive,
  FileText,
  Headphones,
  ImageIcon,
  Layers,
  ListChecks,
  Music,
  Pencil,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import {
  useConfirmPackageImport,
  usePreviewPackageImport,
} from "@/features/exams/hooks/use-exam-package-import";
import { useExam } from "@/features/exams/hooks/use-exams";
import { RowEditDialog } from "@/features/exams/components/import-row-edit-dialog";
import { examPackageImportService } from "@/features/exams/services/exam-package-import.service";
import {
  MATERIAL_TYPE_LABELS,
  QUESTION_GROUP_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/features/exams/types/exam";
import type {
  PackageImportPatch,
  PackageImportPreview,
  PackageImportIssue,
  PackageImportRow,
  PackageMediaRef,
} from "@/features/exams/types/exam-package-import";
import type {
  NormalizedGroup,
  NormalizedQuestion,
  NormalizedSection,
} from "@/features/exams/types/exam-import";

const ACCEPT = ".zip";
const MAX_ZIP_BYTES = 200 * 1024 * 1024;

const FLOW_STEPS = [
  "Tải template ZIP",
  "Điền dữ liệu + media",
  "Tải lên & xem trước",
  "Xác nhận import",
];

const GROUP_CHIP: Record<string, string> = {
  AUDIO: "border-purple-200 bg-purple-100 text-purple-700",
  PASSAGE: "border-sky-200 bg-sky-100 text-sky-700",
  IMAGE: "border-emerald-200 bg-emerald-100 text-emerald-700",
};
const MATERIAL_CHIP: Record<string, string> = {
  ...GROUP_CHIP,
  TEXT: "border-border bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  ok: "Đúng đường dẫn",
  moved: "Sai khác hoa/thường/thư mục",
  wrong_path: "Sai thư mục",
  ambiguous: "Trùng tên file",
  missing: "Thiếu file",
  bad_format: "Sai định dạng",
  type_mismatch: "Sai loại file",
};

function errMsg(e: unknown): string {
  const data = (
    e as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return message.join("; ");
  if (typeof message === "string" && message) return message;
  return e instanceof Error ? e.message : "Có lỗi xảy ra";
}

/** Extract the richer confirm-error payload (issues/report) when present. */
function errPayload(
  e: unknown,
): { issues?: PackageImportIssue[]; report?: PackageImportPreview["report"] } {
  return (
    (e as { response?: { data?: { issues?: unknown; report?: unknown } } })?.response
      ?.data ?? {}
  ) as { issues?: PackageImportIssue[]; report?: PackageImportPreview["report"] };
}

function skey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function countSection(section: NormalizedSection): number {
  return (
    section.directQuestions.length +
    section.groups.reduce((n, g) => n + g.questions.length, 0)
  );
}

function correctLetters(question: NormalizedQuestion): string {
  const letters = ["A", "B", "C", "D"];
  return question.options
    .map((o, i) => (o.isCorrect && (o.content ?? "").trim() !== "" ? letters[i] : ""))
    .join("");
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Canonical form of a patch (sorted + empty parts dropped) so comparing two
 * patches as JSON tells whether Admin changed anything since the last check.
 */
function normalizePatch(patch: PackageImportPatch): PackageImportPatch {
  const removedRows = [...new Set(patch.removedRows ?? [])].sort((a, b) => a - b);
  const edits = (patch.edits ?? [])
    .filter((e) => Object.keys(e.fields).length > 0)
    .map((e) => ({
      excelRow: e.excelRow,
      fields: Object.keys(e.fields)
        .sort()
        .reduce<Record<string, string>>((acc, key) => {
          acc[key] = e.fields[key];
          return acc;
        }, {}),
    }))
    .sort((a, b) => a.excelRow - b.excelRow);
  return {
    ...(removedRows.length > 0 ? { removedRows } : {}),
    ...(edits.length > 0 ? { edits } : {}),
  };
}

function patchJson(patch: PackageImportPatch): string {
  return JSON.stringify(normalizePatch(patch));
}

function FlowStepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-2 text-xs">
      {FLOW_STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                active
                  ? "bg-primary/10 text-primary ring-primary/30"
                  : done
                    ? "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30"
                    : "bg-muted text-muted-foreground ring-border"
              }`}
            >
              {done ? <CheckCircle2 className="size-3.5" /> : step}
            </span>
            <span
              className={`ml-1.5 whitespace-nowrap ${
                active
                  ? "font-semibold text-foreground"
                  : done
                    ? "font-medium text-foreground/80"
                    : "font-medium text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < FLOW_STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Validation issues grouped by Excel row — every group gets in-place
 * Sửa (open the row editor) / Xóa dòng (drop the row) actions so the Admin
 * can clear the report without leaving the page.
 */
function IssueGroups({
  issues,
  removedRows,
  getRow,
  onEdit,
  onRemove,
  onRestore,
}: {
  issues: PackageImportIssue[];
  removedRows: Set<number>;
  getRow: (excelRow: number) => PackageImportRow | undefined;
  onEdit: (excelRow: number) => void;
  onRemove: (excelRow: number) => void;
  onRestore: (excelRow: number) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<number, PackageImportIssue[]>();
    for (const issue of issues) {
      const row = issue.excelRow;
      if (row == null) continue;
      const list = map.get(row);
      if (list) list.push(issue);
      else map.set(row, [issue]);
    }
    const globalIssues = issues.filter((i) => i.excelRow == null);
    const sorted = [...map.entries()].sort((a, b) => a[0] - b[0]);
    return { sorted, globalIssues };
  }, [issues]);

  if (issues.length === 0) return null;

  return (
    <div className="mt-3 space-y-2.5">
      {groups.sorted.map(([row, list]) => {
        const raw = getRow(row);
        const removed = removedRows.has(row);
        const excerpt = (raw?.question ?? raw?.materialTitle ?? raw?.materialContent ?? "")
          .replace(/\s+/g, " ")
          .trim();
        return (
          <div
            key={`g-${row}`}
            className={`rounded-xl border p-3 ${
              removed
                ? "border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-900/40"
                : "border-red-200 bg-white shadow-sm dark:border-red-900 dark:bg-red-950/30"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-red-700 dark:bg-red-900/60 dark:text-red-300">
                Dòng {row}
              </span>
              {raw?.section && (
                <span className="rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                  {raw.section}
                </span>
              )}
              {excerpt && (
                <span className="min-w-0 max-w-72 truncate text-xs text-muted-foreground" title={excerpt}>
                  {excerpt}
                </span>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                {removed ? (
                  <Button variant="outline" size="xs" onClick={() => onRestore(row)}>
                    <RotateCcw className="size-3" />
                    Hoàn tác xóa
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="xs" onClick={() => onEdit(row)}>
                      <Pencil className="size-3" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onRemove(row)}
                    >
                      <Trash2 className="size-3" />
                      Xóa dòng
                    </Button>
                  </>
                )}
              </div>
            </div>
            <ul className="mt-2 space-y-1">
              {list.map((issue, i) => (
                <li key={`iss-${row}-${i}`} className="flex gap-1.5 text-xs text-red-700 dark:text-red-300">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                  <span>
                    {issue.field && (
                      <b className="mr-1 rounded border border-red-200 bg-red-50 px-1 font-mono text-[10px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-300">
                        {issue.field}
                      </b>
                    )}
                    {issue.message}
                  </span>
                </li>
              ))}
            </ul>
            {removed && (
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                Dòng này sẽ bị bỏ qua khi xác nhận import.
              </p>
            )}
          </div>
        );
      })}

      {groups.globalIssues.map((issue, i) => (
        <div
          key={`glob-${i}`}
          className="rounded-xl border border-red-200 bg-white p-3 text-xs text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertTriangle className="mr-1.5 inline size-3.5 align-[-2px]" />
          {issue.message}
        </div>
      ))}
    </div>
  );
}

function MediaRefChip({ refItem }: { refItem: PackageMediaRef }) {
  const bad = refItem.status !== "ok" && refItem.status !== "moved";
  return (
    <span
      title={refItem.message ?? refItem.ref}
      className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        bad
          ? "border-red-300 bg-red-50 text-red-700"
          : refItem.status === "moved"
            ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-emerald-300 bg-emerald-50 text-emerald-700"
      }`}
    >
      {refItem.kind === "image" ? (
        <ImageIcon className="size-3 shrink-0" />
      ) : (
        <Music className="size-3 shrink-0" />
      )}
      <span className="truncate">{refItem.ref}</span>
      <span className="font-bold">{bad ? "✗" : "✓"}</span>
    </span>
  );
}

export default function ExamPackageImportPage() {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();

  const { data: exam, isLoading: loadingExam } = useExam(examId);
  const previewMutation = usePreviewPackageImport();
  const confirmMutation = useConfirmPackageImport();

  const [preview, setPreview] = useState<PackageImportPreview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* in-place patch (remove/fix rows) + last-checked snapshot for dirty flag */
  const [patch, setPatch] = useState<PackageImportPatch>({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [checkedJson, setCheckedJson] = useState<string | null>(null);
  const reqSeqRef = useRef(0);

  const report = preview?.report ?? null;
  const normalized = preview?.normalized ?? null;
  const pending = previewMutation.isPending || confirmMutation.isPending;

  const currentPatchJson = useMemo(() => patchJson(patch), [patch]);
  /** Patch changed since the last re-check → a debounced re-check is queued. */
  const dirty = preview != null && checkedJson != null && currentPatchJson !== checkedJson;
  const hasPatch = (patch.removedRows?.length ?? 0) > 0 || (patch.edits?.length ?? 0) > 0;
  const checking = previewMutation.isPending && preview != null;

  const rowsByNumber = useMemo(() => {
    const map = new Map<number, PackageImportRow>();
    for (const row of preview?.rows ?? []) {
      if (row.__excelRow != null) map.set(row.__excelRow, row);
    }
    return map;
  }, [preview]);
  const removedRowsSet = useMemo(() => new Set(patch.removedRows ?? []), [patch]);
  const editsByRow = useMemo(() => {
    const map = new Map<number, Record<string, string>>();
    for (const edit of patch.edits ?? []) map.set(edit.excelRow, edit.fields);
    return map;
  }, [patch]);
  const getRow = (excelRow: number) => rowsByNumber.get(excelRow);

  const errors = useMemo(() => report?.issues.filter((i) => i.severity === "error") ?? [], [report]);
  const warnings = useMemo(
    () => report?.issues.filter((i) => i.severity === "warning") ?? [],
    [report],
  );
  const errorsByRow = useMemo(() => {
    const map = new Map<number, PackageImportIssue[]>();
    for (const issue of errors) {
      const row = issue.excelRow;
      if (row == null) continue;
      const list = map.get(row);
      if (list) list.push(issue);
      else map.set(row, [issue]);
    }
    return map;
  }, [errors]);
  const errorRowsSet = useMemo(() => new Set(errorsByRow.keys()), [errorsByRow]);
  const badRefs = useMemo(
    () =>
      preview?.media.refs.filter((r) => r.status !== "ok" && r.status !== "moved") ?? [],
    [preview],
  );
  const progressChips = useMemo(() => {
    if (!report || !normalized) return [];
    return report.sections.map((p) => {
      const imported = normalized.sections.find((s) => skey(s.name) === skey(p.name));
      const actual = imported ? countSection(imported) : 0;
      const ok = !!imported && p.target !== null && actual === p.target;
      return { name: p.name, actual, target: p.target, ok };
    });
  }, [report, normalized]);

  /* ------------------------------- actions ------------------------------- */

  const handleDownload = async () => {
    const tid = toast.loading("Đang tạo template ZIP theo format của đề...");
    try {
      await examPackageImportService.downloadTemplate(examId);
      toast.success("Đã tải template ZIP — giải nén và điền dữ liệu theo README.txt.", { id: tid });
    } catch (e) {
      toast.error(errMsg(e), { id: tid });
    }
  };

  const onFiles = (list: FileList | null) => {
    const picked = list?.[0];
    if (!picked) return;
    if (!picked.name.toLowerCase().endsWith(".zip")) {
      toast.error('Chỉ chấp nhận file .ZIP (gồm questions.xlsx + thư mục media).');
      return;
    }
    if (picked.size > MAX_ZIP_BYTES) {
      toast.error(`File ZIP quá lớn (${(picked.size / 1024 / 1024).toFixed(0)}MB — tối đa 200MB).`);
      return;
    }
    setFile(picked);
    setPreview(null);
    setPatch({});
    setCheckedJson(null);
  };

  /**
   * (Re-)validate the ZIP with the current patch. `silent` skips toasts —
   * used by the debounced auto re-check that follows every in-place edit.
   * Returns the fresh preview, or null when the request failed/was superseded.
   */
  const runPreview = async (opts?: { silent?: boolean }): Promise<PackageImportPreview | null> => {
    if (!file) return null;
    const seq = ++reqSeqRef.current;
    const sentPatch = patch;
    try {
      const result = await previewMutation.mutateAsync({
        examId,
        file,
        patch: normalizePatch(sentPatch),
      });
      if (seq !== reqSeqRef.current) return null; // superseded by a newer check
      setPreview(result);
      setCheckedJson(patchJson(sentPatch));
      if (!opts?.silent) {
        if (result.report.canSave) {
          toast.success(
            `Hợp lệ — ${result.summary.questions} câu hỏi, ${result.media.matched} media khớp. Sẵn sàng xác nhận import.`,
          );
        } else {
          toast.warning(
            `Tìm thấy ${result.report.errorCount} lỗi — sửa trực tiếp từng dòng trong danh sách lỗi bên dưới.`,
          );
        }
      }
      return result;
    } catch (e) {
      if (seq === reqSeqRef.current) toast.error(errMsg(e));
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    await runPreview();
  };

  /* ------------------------- in-place patch actions ------------------------ */

  const editRow = (excelRow: number, fields: Record<string, string>, visibleKeys?: string[]) => {
    setPatch((p) => {
      const existing = (p.edits ?? []).find((e) => e.excelRow === excelRow)?.fields ?? {};
      const merged: Record<string, string> = {};
      if (visibleKeys) {
        // keep edits on cells that were not visible in the dialog
        for (const [key, value] of Object.entries(existing)) {
          if (!visibleKeys.includes(key)) merged[key] = value;
        }
      } else {
        Object.assign(merged, existing);
      }
      for (const [key, value] of Object.entries(fields)) merged[key] = value;
      const edits = (p.edits ?? []).filter((e) => e.excelRow !== excelRow);
      if (Object.keys(merged).length > 0) edits.push({ excelRow, fields: merged });
      return { ...p, edits };
    });
    setEditingRow(null);
  };

  const removeRow = (excelRow: number) => {
    setPatch((p) => ({
      ...p,
      removedRows: [...new Set([...(p.removedRows ?? []), excelRow])],
      edits: (p.edits ?? []).filter((e) => e.excelRow !== excelRow),
    }));
    setEditingRow(null);
    toast(`Đã bỏ dòng ${excelRow} khỏi bản import — Ctrl+Z không cần, bấm Hoàn tác để lấy lại.`, {
      action: { label: "Hoàn tác", onClick: () => restoreRow(excelRow) },
    });
  };

  const restoreRow = (excelRow: number) => {
    setPatch((p) => ({
      ...p,
      removedRows: (p.removedRows ?? []).filter((n) => n !== excelRow),
    }));
  };

  const undoEditRow = (excelRow: number) => {
    setPatch((p) => ({ ...p, edits: (p.edits ?? []).filter((e) => e.excelRow !== excelRow) }));
  };

  const resetPatch = () => {
    setPatch({});
    setEditingRow(null);
    toast.success("Đã hoàn tác mọi thay đổi cục bộ — về đúng dữ liệu trong ZIP.");
  };

  /* ------------------------- debounced auto re-check ----------------------- */

  useEffect(() => {
    if (!dirty || !file || previewMutation.isPending) return;
    const timer = window.setTimeout(() => {
      void runPreview({ silent: true });
    }, 800);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, currentPatchJson, file, previewMutation.isPending]);

  const handleConfirm = async () => {
    if (!file) return;
    let currentReport = report;
    if (dirty) {
      // patch changed since the last check — re-validate first (BE gates on errors)
      const fresh = await runPreview({ silent: true });
      if (!fresh) return;
      currentReport = fresh.report;
    }
    if (!currentReport?.canSave) {
      toast.error(
        `Còn ${currentReport?.errorCount ?? "?"} lỗi — sửa tiếp trong danh sách lỗi rồi bấm Xác nhận lại.`,
      );
      return;
    }
    try {
      const result = await confirmMutation.mutateAsync({
        examId,
        file,
        patch: normalizePatch(patch),
      });
      toast.success(
        `Import thành công! ${result.sections} phần · ${result.questions} câu hỏi · ${result.mediaUploaded} file media đã tải lên.`,
      );
      navigate(`/exams/${examId}/builder`);
    } catch (e) {
      const payload = errPayload(e);
      if (payload.report) {
        setPreview((prev) => (prev ? { ...prev, report: payload.report! } : prev));
      }
      toast.error(errMsg(e));
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setPatch({});
    setEditingRow(null);
    setCheckedJson(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* -------------------------------- views -------------------------------- */

  if (!Number.isFinite(examId)) {
    return (
      <div className="p-6">
        <p>Đề thi không hợp lệ.</p>
      </div>
    );
  }

  if (loadingExam) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
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

  const renderQuestion = (question: NormalizedQuestion, key: string, num: string) => {
    const row = question.sourceRow ?? null;
    const editFields = row != null ? editsByRow.get(row) : undefined;
    const removed = row != null && removedRowsSet.has(row);
    const hasError = row != null && errorRowsSet.has(row);
    const edited = editFields != null && Object.keys(editFields).length > 0;

    // pending edits overlaid on the server's normalized question (pre-recheck)
    const text = editFields?.question ?? question.question;
    const letters = editFields?.correctAnswer
      ? editFields.correctAnswer
      : correctLetters(question);
    const pill = (letter: string, content: string | undefined, isCorrect: boolean) =>
      content && content.trim() !== "" ? (
        <span
          key={`opt-${letter}`}
          title={content}
          className={`inline-flex max-w-full items-baseline gap-1 rounded-lg border px-2 py-0.5 text-[11px] ${
            isCorrect
              ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          <b className="font-bold">{letter}</b>
          <span className="min-w-0 truncate">{content}</span>
          {isCorrect && <span className="font-bold">✓</span>}
        </span>
      ) : null;

    return (
      <div
        key={key}
        className={`group rounded-xl border px-3 py-2.5 transition-colors ${
          removed
            ? "border-slate-200 bg-slate-50 opacity-60 line-through dark:border-slate-800 dark:bg-slate-900/40"
            : hasError
              ? "border-red-300 bg-red-50/50 ring-1 ring-red-200 dark:border-red-900 dark:bg-red-950/30 dark:ring-red-900"
              : edited
                ? "border-amber-300 bg-amber-50/40 ring-1 ring-amber-200 dark:border-amber-800 dark:bg-amber-950/30 dark:ring-amber-900"
                : "border-border bg-muted/20 hover:border-primary/40"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
            {question.questionNumber ? `Câu ${question.questionNumber}` : `#${num}`}
          </span>
          <span className="rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {QUESTION_TYPE_LABELS[question.type] ?? question.type}
          </span>
          <span className="text-muted-foreground">
            {question.options.length} đáp án
            {letters && ` · đúng: ${letters}`}
          </span>
          {row != null && (
            <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
              Dòng {row}
            </span>
          )}
          {hasError && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/60 dark:text-red-300">
              có lỗi
            </span>
          )}
          {edited && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              đã sửa
            </span>
          )}
          {row != null && (
            <span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {removed ? (
                <Button variant="outline" size="xs" onClick={() => restoreRow(row)}>
                  <RotateCcw className="size-3" />
                  Hoàn tác
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={`Sửa dòng ${row}`}
                    onClick={() => setEditingRow(row)}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-red-600 hover:text-red-700"
                    title={`Xóa dòng ${row}`}
                    onClick={() => removeRow(row)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </>
              )}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed" title={text}>
          {text || <span className="italic text-red-500">(thiếu nội dung câu hỏi)</span>}
        </p>
        {question.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {question.options.map((option, oi) => {
              const letter = ["A", "B", "C", "D"][oi] ?? String(oi + 1);
              const content =
                editFields?.[`option${letter}` as "optionA" | "optionB" | "optionC" | "optionD"] ??
                option.content;
              const isCorrect =
                letters && /^[A-D]+$/i.test(letters.trim())
                  ? letters.toUpperCase().includes(letter)
                  : option.isCorrect;
              return pill(letter, content, isCorrect);
            })}
          </div>
        )}
        {question.explanation && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground" title={question.explanation}>
            <b className="text-foreground/70">Giải thích:</b>{" "}
            <span className="line-clamp-2">{question.explanation}</span>
          </p>
        )}
      </div>
    );
  };

  const renderGroup = (group: NormalizedGroup, key: string) => (
    <div
      key={key}
      className={`group rounded-xl border bg-background p-2.5 ${
        group.groupType === "AUDIO"
          ? "border-l-4 border-l-purple-500"
          : group.groupType === "PASSAGE"
            ? "border-l-4 border-l-sky-500"
            : group.groupType === "IMAGE"
              ? "border-l-4 border-l-emerald-500"
              : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold">{group.name}</span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
            GROUP_CHIP[group.groupType] ?? "border-border bg-muted text-muted-foreground"
          }`}
        >
          {QUESTION_GROUP_TYPE_LABELS[group.groupType] ?? group.groupType}
        </span>
        <span className="text-muted-foreground">
          {group.questions.length} câu · {group.materials.length} tài liệu
        </span>
        {group.sourceRow != null && (
          <span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon-xs"
              title={`Sửa dòng ${group.sourceRow}`}
              onClick={() => setEditingRow(group.sourceRow!)}
            >
              <Pencil className="size-3" />
            </Button>
          </span>
        )}
      </div>
      {group.materials.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {group.materials.map((material, mi) => {
            const isPlaceholder = !!material.fileUrl?.startsWith("package://");
            return (
              <span
                key={`m-${mi}`}
                title={material.fileUrl ?? undefined}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${
                  isPlaceholder
                    ? "border-red-300 bg-red-50 text-red-700"
                    : MATERIAL_CHIP[material.type] ?? "border-border bg-muted"
                }`}
              >
                {material.type === "AUDIO" ? (
                  <Headphones className="size-3" />
                ) : material.type === "IMAGE" ? (
                  <ImageIcon className="size-3" />
                ) : (
                  <FileText className="size-3" />
                )}
                <span className="max-w-56 truncate">
                  {material.title ??
                    (material.fileUrl
                      ? material.fileUrl.split("/").pop()
                      : MATERIAL_TYPE_LABELS[material.type])}
                </span>
                {isPlaceholder && <b>chưa khớp</b>}
              </span>
            );
          })}
        </div>
      )}
      <div className="mt-2 space-y-1.5">
        {group.questions.map((question, qi) =>
          renderQuestion(question, `gq-${qi}`, String(qi + 1)),
        )}
        {group.questions.length === 0 && (
          <p className="text-xs text-muted-foreground">Group chưa có câu hỏi.</p>
        )}
      </div>
    </div>
  );

  const renderSection = (section: NormalizedSection, si: number) => {
    const chip = progressChips.find((c) => skey(c.name) === skey(section.name));
    const isCollapsed = !!collapsed[String(si)];
    const total = countSection(section);
    return (
      <div key={`s-${si}`} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
          <button
            type="button"
            className="rounded p-1 hover:bg-muted"
            onClick={() => setCollapsed((c) => ({ ...c, [String(si)]: !c[String(si)] }))}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <span className="font-semibold">{section.name}</span>
          <span className="text-xs text-muted-foreground">
            {section.groups.length} group · {section.directQuestions.length} câu trực tiếp
          </span>
          <span
            className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              chip && chip.target !== null && chip.ok && total > 0
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : chip && chip.target !== null
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {total}/{chip?.target ?? "?"}
          </span>
        </div>
        {!isCollapsed && (
          <div className="space-y-3 p-3">
            {section.groups.map((group, gi) => renderGroup(group, `g-${gi}`))}
            {section.groups.length === 0 && section.directQuestions.length === 0 && (
              <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-red-600">
                Phần này chưa có dữ liệu — cần ít nhất 1 câu hỏi.
              </p>
            )}
            {section.directQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Câu hỏi trực tiếp (không group)
                </p>
                {section.directQuestions.map((question, qi) =>
                  renderQuestion(question, `dq-${qi}`, String(qi + 1)),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            className="mt-0.5 shrink-0"
            title="Quay lại builder"
            onClick={() => navigate(`/exams/${examId}/builder`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Import ZIP theo format của đề</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex max-w-96 items-center gap-1.5 truncate rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                <FileArchive className="size-3.5 shrink-0 text-blue-600" />
                {exam.title}
              </span>
              <span>
                Tải template (Excel + thư mục audio/ảnh) → điền dữ liệu → tải lên ZIP → xem trước →
                xác nhận
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void handleDownload()} disabled={pending}>
            <Download className="mr-2 h-4 w-4" />
            Tải template ZIP
          </Button>
        </div>
      </div>

      {!preview ? (
        /* ------------------------------ upload step ------------------------------ */
        <div className="space-y-4">
          <FlowStepper current={file ? 3 : 1} />

          {/* step 1: download the format-driven template */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 p-5 dark:border-blue-900 dark:from-blue-950/60 dark:via-indigo-950/60 dark:to-blue-950/60">
            <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-blue-500/10" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/25">
                  <FileArchive className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-blue-950 dark:text-blue-100">
                      Bước 1 · Tải template ZIP theo format
                    </p>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Tự sinh từ DB
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-blue-800/90 dark:text-blue-200/80">
                    ZIP gồm <b>questions.xlsx</b> (sheet Import đã điền sẵn tên phần thi + sheet
                    Hướng dẫn), <b>README.txt</b> và thư mục <b>audio/ + images/</b> cho từng phần
                    thi của đề này. Điền dữ liệu rồi nén lại thành ZIP để tải lên ở Bước 3.
                  </p>
                  {exam.sections && exam.sections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exam.sections.map((section) => (
                        <span
                          key={section.id}
                          className="rounded-md border border-blue-200 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-blue-900 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                        >
                          {section.name} · {section.questionCount} câu
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                className="shadow-md shadow-blue-600/25"
                onClick={() => void handleDownload()}
              >
                <Download className="mr-2 h-4 w-4" />
                Tải template (.zip)
              </Button>
            </div>
          </div>

          {/* step 2/3: upload */}
          <div
            className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40"
                : "border-border bg-card"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              onFiles(e.dataTransfer.files);
            }}
          >
            <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl">
              <Upload className="size-6" />
            </div>
            <p className="text-primary mt-3 text-xs font-semibold uppercase tracking-wide">
              Bước 3 · Tải lên ZIP đã điền
            </p>
            <p className="mt-1 font-medium">Kéo file ZIP vào đây hoặc chọn từ máy</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Gồm questions.xlsx + audio/ảnh · tối đa 200MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Chọn file ZIP
            </Button>

            {file && (
              <div className="mx-auto mt-4 flex w-fit max-w-full items-center gap-2 rounded-lg border bg-muted/60 px-3 py-2 text-sm">
                <FileArchive className="size-4 shrink-0 text-blue-600" />
                <span className="max-w-64 truncate font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  className="rounded p-0.5 hover:bg-muted"
                  title="Bỏ file"
                  onClick={() => setFile(null)}
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-5">
              <Button size="lg" onClick={() => void handleUpload()} disabled={!file || pending}>
                {previewMutation.isPending ? (
                  <>Đang giải nén &amp; kiểm tra...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Tải lên &amp; xem trước
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* rules */}
          <div className="rounded-2xl border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="size-4 text-primary" />
              Quy tắc của gói ZIP
            </p>
            <ul className="mt-3 grid gap-2.5 text-xs sm:grid-cols-2">
              {[
                <>
                  <b>Section/Part</b> phải trùng tên phần thi của đề — sai tên hiện lỗi kèm dòng
                  Excel.
                </>,
                <>
                  <b>Media filename</b> ghi đường dẫn tương đối trong ZIP, ví dụ{" "}
                  <code>Part-1/images/p1-1.jpg</code>; file phải tồn tại đúng chỗ đó.
                </>,
                <>
                  Audio: mp3, wav, m4a, ogg, aac, flac, webm · Ảnh: png, jpg, jpeg, webp, gif, svg,
                  bmp, avif.
                </>,
                <>
                  Cột <b>Group</b> để trống = nối group phía trên; ghi <b>-</b> = câu hỏi trực tiếp;
                  media cần group.
                </>,
                <>
                  <b>Question Number</b> chỉ để đối chiếu (duy nhất từng phần), không quyết định
                  thứ tự.
                </>,
                <>
                  Xem trước phải <b>hết lỗi đỏ</b> mới xác nhận import — hệ thống không import khi
                  còn lỗi.
                </>,
              ].map((node, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  <span className="text-muted-foreground">{node}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* ------------------------------ preview step ----------------------------- */
        <div className="space-y-4">
          <FlowStepper current={4} />

          {/* toolbar + stats */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
                <FileArchive className="size-3.5" />
                {preview.fileName}
              </span>
              <span className="text-xs text-muted-foreground">
                {preview.summary
                  ? `Đã đọc ${preview.summary.sections} phần · ${preview.summary.groups} group · ${preview.summary.materials} tài liệu · ${preview.summary.questions} câu hỏi · ${preview.summary.options} đáp án`
                  : ""}
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void runPreview()}
                  disabled={pending}
                  title="Chạy lại kiểm tra với các thay đổi cục bộ"
                >
                  <RefreshCw className={`size-3.5 ${checking ? "animate-spin" : ""}`} />
                  Kiểm tra lại
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} disabled={pending}>
                  Chọn ZIP khác
                </Button>
                <Button variant="outline" size="sm" onClick={() => void handleDownload()}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Template
                </Button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: Layers, label: "Phần thi", value: preview.summary.sections },
                { icon: ListChecks, label: "Group", value: preview.summary.groups },
                { icon: Headphones, label: "Tài liệu", value: preview.summary.materials },
                { icon: FileText, label: "Câu hỏi", value: preview.summary.questions },
                { icon: CheckCircle2, label: "Đáp án", value: preview.summary.options },
                {
                  icon: Music,
                  label: `Media (${preview.media.audio}A/${preview.media.image}I)`,
                  value: preview.media.matched,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-none">{stat.value}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* progress chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tiến độ theo phần
            </span>
            {progressChips.map((chip, i) => (
              <span
                key={`${chip.name}-${i}`}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                  chip.target !== null && chip.ok && chip.actual > 0
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : chip.target !== null
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {chip.target !== null && chip.ok && chip.actual > 0 ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <XCircle className="size-3.5" />
                )}
                {chip.name} · {chip.actual}/{chip.target ?? "?"}
              </span>
            ))}
          </div>

          {/* validation report */}
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              errors.length > 0
                ? "border-red-200 bg-red-50"
                : warnings.length > 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              {checking ? (
                <>
                  <RefreshCw className="size-4 animate-spin text-primary" />
                  <span className="text-primary">Đang kiểm tra lại với thay đổi của bạn...</span>
                </>
              ) : errors.length > 0 ? (
                <>
                  <XCircle className="size-4 text-red-600" />
                  <span className="text-red-700">
                    {errors.length} lỗi — sửa / xóa trực tiếp từng dòng bên dưới rồi bấm Kiểm
                    tra lại
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="text-emerald-700">
                    Hợp lệ — sẵn sàng xác nhận import
                    {warnings.length > 0 ? ` (${warnings.length} cảnh báo)` : ""}
                  </span>
                </>
              )}
              {dirty && !checking && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  <AlertTriangle className="size-3" />
                  Có thay đổi chưa kiểm tra lại
                </span>
              )}
            </div>
            {errors.length > 0 && (
              <IssueGroups
                issues={errors}
                removedRows={removedRowsSet}
                getRow={getRow}
                onEdit={(row) => setEditingRow(row)}
                onRemove={removeRow}
                onRestore={restoreRow}
              />
            )}
            {warnings.length > 0 && (
              <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto pl-6 text-xs">
                {warnings.map((issue, i) => (
                  <li key={`w-${i}`} className="list-disc text-amber-700">
                    {issue.excelRow != null && (
                      <b className="font-mono">[Dòng {issue.excelRow}] </b>
                    )}
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* local patch summary (in-place edits / removals) */}
          {hasPatch && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                <Pencil className="size-4" />
                Thay đổi cục bộ trong bản xem trước
                <span className="text-xs font-normal text-indigo-600/80 dark:text-indigo-300/80">
                  (không đụng file ZIP — chỉ áp dụng khi xác nhận)
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void runPreview()}
                    disabled={pending}
                  >
                    <RefreshCw className={`size-3.5 ${checking ? "animate-spin" : ""}`} />
                    Kiểm tra lại
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetPatch} disabled={pending}>
                    <RotateCcw className="size-3.5" />
                    Hoàn tất (bỏ thay đổi)
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {(patch.removedRows?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-red-600">
                      Đã xóa dòng:
                    </span>
                    {[...(patch.removedRows ?? [])].sort((a, b) => a - b).map((row) => (
                      <span
                        key={`rm-${row}`}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-xs font-medium text-red-700 line-through dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                      >
                        Dòng {row}
                        <button
                          type="button"
                          title="Hoàn tác xóa"
                          className="rounded-full p-0.5 hover:bg-red-100"
                          onClick={() => restoreRow(row)}
                        >
                          <RotateCcw className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {(patch.edits?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
                      Đã sửa dòng:
                    </span>
                    {[...(patch.edits ?? [])]
                      .sort((a, b) => a.excelRow - b.excelRow)
                      .map((edit) => (
                        <span
                          key={`ed-${edit.excelRow}`}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                          Dòng {edit.excelRow} · {Object.keys(edit.fields).length} ô
                          <button
                            type="button"
                            title="Mở lại để sửa"
                            className="rounded-full p-0.5 hover:bg-amber-100"
                            onClick={() => setEditingRow(edit.excelRow)}
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            title="Bỏ sửa dòng này"
                            className="rounded-full p-0.5 hover:bg-amber-100"
                            onClick={() => undoEditRow(edit.excelRow)}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* media inventory */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <Headphones className="size-4 text-purple-600" />
              Media trong ZIP
              <span className="text-xs font-normal text-muted-foreground">
                {preview.media.audio} audio · {preview.media.image} ảnh · {preview.media.matched} khớp
                đường dẫn · {badRefs.length} lỗi
              </span>
            </div>

            {badRefs.length > 0 && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                  <AlertTriangle className="size-3.5" />
                  Media thiếu / sai đường dẫn / sai định dạng
                </p>
                <ul className="mt-2 space-y-1 text-xs text-red-700">
                  {badRefs.map((r, i) => (
                    <li key={`bad-${i}`}>
                      <b className="font-mono">Dòng {r.excelRow ?? "?"}</b> · {r.ref} ·{" "}
                      {STATUS_LABEL[r.status] ?? r.status}
                      {r.message ? ` — ${r.message}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.media.refs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {preview.media.refs.slice(0, 40).map((r, i) => (
                  <MediaRefChip key={`ref-${i}`} refItem={r} />
                ))}
                {preview.media.refs.length > 40 && (
                  <span className="text-xs text-muted-foreground">
                    … và {preview.media.refs.length - 40} file khác
                  </span>
                )}
              </div>
            )}

            {preview.media.files.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border bg-muted/20 p-2">
                <ul className="space-y-1 text-xs">
                  {preview.media.files.slice(0, 60).map((f) => (
                    <li key={f.path} className="flex items-center gap-2">
                      {f.kind === "image" ? (
                        <ImageIcon className="size-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <Music className="size-3.5 shrink-0 text-purple-600" />
                      )}
                      <span className="truncate font-mono">{f.path}</span>
                      <span className="text-muted-foreground">{formatSize(f.size)}</span>
                      {!f.used && (
                        <span className="rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                          không được tham chiếu
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* structure preview */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 shadow-sm">
              <Layers className="size-4 text-primary" />
              <span className="text-sm font-semibold">Cấu trúc đề (xem trước)</span>
              <span className="text-xs text-muted-foreground">
                {normalized?.sections.length ?? 0} phần · {preview.summary.questions} câu hỏi ·
                hover câu hỏi để hiện nút Sửa / Xóa dòng
              </span>
              <div className="ml-auto flex gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setCollapsed({})}
                  disabled={!normalized?.sections.some((_, i) => collapsed[String(i)])}
                >
                  Mở tất cả
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    setCollapsed(
                      Object.fromEntries((normalized?.sections ?? []).map((_, i) => [String(i), true])),
                    )
                  }
                  disabled={!!normalized?.sections.every((_, i) => collapsed[String(i)])}
                >
                  Thu gọn tất cả
                </Button>
              </div>
            </div>
            {normalized?.sections.map((section, si) => renderSection(section, si))}
          </div>

          {/* sticky action bar */}
          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur">
            <div className="text-xs text-muted-foreground">
              {report?.canSave
                ? "Xác nhận sẽ tải media lên R2 và ghi nội dung vào các phần thi có trong file — phần thi khác giữ nguyên."
                : "Còn lỗi — hệ thống KHÔNG import khi còn lỗi. Sửa / xóa từng dòng ngay trong danh sách lỗi."}
              {errors.length > 0 && (
                <span className="ml-1 font-medium text-red-600">· {errors.length} lỗi đỏ</span>
              )}
              {dirty && (
                <span className="ml-1 font-medium text-amber-600">
                  · có thay đổi chưa kiểm tra lại
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {dirty && (
                <Button
                  variant="outline"
                  onClick={() => void runPreview()}
                  disabled={pending}
                  title="Kiểm tra lại với các thay đổi cục bộ"
                >
                  <RefreshCw className={`mr-1.5 size-4 ${checking ? "animate-spin" : ""}`} />
                  Kiểm tra lại
                </Button>
              )}
              <Button variant="outline" onClick={handleReset} disabled={pending}>
                Chọn ZIP khác
              </Button>
              <Button
                onClick={() => void handleConfirm()}
                disabled={pending || !file || (!report?.canSave && !dirty)}
                title={
                  report && !report.canSave && !dirty
                    ? "Báo cáo còn lỗi — không thể xác nhận import"
                    : undefined
                }
              >
                {confirmMutation.isPending ? (
                  <>Đang import...</>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Xác nhận import
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* in-place row editor */}
          {editingRow != null &&
            rowsByNumber.has(editingRow) && (
              <RowEditDialog
                key={editingRow}
                rowNumber={editingRow}
                rawRow={rowsByNumber.get(editingRow)!}
                currentFields={editsByRow.get(editingRow) ?? {}}
                issues={errorsByRow.get(editingRow) ?? []}
                onSave={(fields, visibleKeys) => editRow(editingRow, fields, visibleKeys)}
                onRemove={() => removeRow(editingRow)}
                onClose={() => setEditingRow(null)}
              />
            )}
        </div>
      )}
    </div>
  );
}
