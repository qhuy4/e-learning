import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Textarea } from "@fe/components/ui/textarea";
import type {
  PackageImportIssue,
  PackageImportRow,
} from "../types/exam-package-import";

/** One editable field of an Excel row (key = ImportRow cell key). */
interface RowField {
  key: keyof PackageImportRow;
  label: string;
  textarea?: boolean;
  placeholder?: string;
}

/** Field blocks — a block shows when any of its cells has content (or all, via toggle). */
const FIELD_BLOCKS: { title: string; fields: RowField[] }[] = [
  {
    title: "Cấu trúc",
    fields: [
      { key: "section", label: "Phần thi (Section/Part)", placeholder: "Part 1" },
      { key: "group", label: "Group", placeholder: "Để trống = nối group trên · ghi - = câu trực tiếp" },
      { key: "groupType", label: "Loại group", placeholder: "AUDIO / PASSAGE / IMAGE" },
    ],
  },
  {
    title: "Tài liệu / Media",
    fields: [
      { key: "materialType", label: "Loại tài liệu", placeholder: "AUDIO / IMAGE / TEXT" },
      { key: "materialTitle", label: "Tên tài liệu" },
      { key: "media", label: "Media filename (trong ZIP)", placeholder: "Part-1/images/p1-1.jpg" },
      { key: "materialContent", label: "Nội dung tài liệu", textarea: true },
    ],
  },
  {
    title: "Câu hỏi",
    fields: [
      { key: "question", label: "Nội dung câu hỏi", textarea: true },
      { key: "questionType", label: "Loại câu hỏi", placeholder: "MCQ / FILL_BLANK / ..." },
      { key: "optionA", label: "Đáp án A" },
      { key: "optionB", label: "Đáp án B" },
      { key: "optionC", label: "Đáp án C" },
      { key: "optionD", label: "Đáp án D" },
      { key: "correctAnswer", label: "Đáp án đúng", placeholder: "A / AB / ..." },
      { key: "explanation", label: "Giải thích", textarea: true },
    ],
  },
  {
    title: "Hiển thị",
    fields: [
      { key: "questionNumber", label: "Số câu (Question Number)", placeholder: "42" },
      { key: "position", label: "Thứ tự", placeholder: "1" },
      { key: "points", label: "Điểm", placeholder: "1" },
    ],
  },
];

const ALL_KEYS: string[] = FIELD_BLOCKS.flatMap((b) => b.fields.map((f) => String(f.key)));

export interface RowEditDialogProps {
  /** 1-based Excel row being edited (stable key — remounts per row). */
  rowNumber: number;
  /** Raw row as parsed from the ZIP (the diff base for saved cells). */
  rawRow: PackageImportRow;
  /** Pending edits for this row (prefill on top of the raw row). */
  currentFields: Record<string, string>;
  /** Issues reported on this row so Admin knows what to fix. */
  issues: PackageImportIssue[];
  /** Save the diff of the VISIBLE cells vs the raw row (empty map = revert). */
  onSave: (fields: Record<string, string>, visibleKeys: string[]) => void;
  /** Drop the row entirely from the import. */
  onRemove: () => void;
  onClose: () => void;
}

/**
 * In-place Excel-row editor for the ZIP preview step: fix the cells that
 * fail validation (or drop the row) without leaving the page.
 */
export function RowEditDialog({
  rowNumber,
  rawRow,
  currentFields,
  issues,
  onSave,
  onRemove,
  onClose,
}: RowEditDialogProps) {
  const effective = useMemo(() => {
    const base: Record<string, string | undefined> = {};
    for (const key of ALL_KEYS) {
      base[key] = rawRow[key as keyof PackageImportRow] as string | undefined;
    }
    return { ...base, ...currentFields };
  }, [rawRow, currentFields]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const key of ALL_KEYS) init[key] = String(effective[key] ?? "");
    return init;
  });
  const [showAll, setShowAll] = useState(() => {
    // Nothing visible beyond structure → show everything from the start.
    return !FIELD_BLOCKS.slice(1).some((block) =>
      block.fields.some((f) => String(effective[f.key] ?? "").trim() !== ""),
    );
  });

  const setValue = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const visibleBlocks = FIELD_BLOCKS.filter((block, bi) => {
    if (bi === 0) return true; // structure always
    if (showAll) return true;
    return block.fields.some((f) => String(effective[f.key] ?? "").trim() !== "");
  });
  const visibleKeys = visibleBlocks.flatMap((b) => b.fields.map((f) => String(f.key)));

  const handleSave = () => {
    const fields: Record<string, string> = {};
    for (const key of visibleKeys) {
      const value = values[key] ?? "";
      if (value !== String(rawRow[key as keyof PackageImportRow] ?? "")) fields[key] = value;
    }
    onSave(fields, visibleKeys);
  };

  const questionPreview =
    effective.question ?? effective.materialTitle ?? effective.materialContent ?? "";
  const questionExcerpt =
    typeof questionPreview === "string"
      ? questionPreview.replace(/\s+/g, " ").trim().slice(0, 90)
      : "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-primary" />
            Sửa dòng {rowNumber}
            {effective.section ? (
              <span className="rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {String(effective.section)}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {questionExcerpt ? `“${questionExcerpt}”` : "Ô trống — nhập nội dung vào các trường bên dưới."}
          </DialogDescription>
        </DialogHeader>

        {issues.length > 0 && (
          <ul className="space-y-1 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs dark:border-red-900 dark:bg-red-950/40">
            {issues.map((issue, i) => (
              <li key={`iss-${i}`} className="flex gap-1.5 text-red-700 dark:text-red-300">
                <span className="font-semibold">•</span>
                <span>
                  {issue.field && <b className="mr-1 font-mono">[{issue.field}]</b>}
                  {issue.message}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-4">
          {visibleBlocks.map((block) => (
            <div key={block.title} className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {block.title}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {block.fields.map((field) => (
                  <div
                    key={String(field.key)}
                    className={field.textarea ? "sm:col-span-2" : undefined}
                  >
                    <Label htmlFor={`row-${field.key}`} className="mb-1 text-xs">
                      {field.label}
                    </Label>
                    {field.textarea ? (
                      <Textarea
                        id={`row-${field.key}`}
                        rows={3}
                        className="text-sm"
                        placeholder={field.placeholder}
                        value={values[String(field.key)] ?? ""}
                        onChange={(e) => setValue(String(field.key), e.target.value)}
                      />
                    ) : (
                      <Input
                        id={`row-${field.key}`}
                        className="text-sm"
                        placeholder={field.placeholder}
                        value={values[String(field.key)] ?? ""}
                        onChange={(e) => setValue(String(field.key), e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!showAll && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setShowAll(true)}
            >
              + Hiện tất cả trường trống
            </button>
          )}
        </div>

        <DialogFooter>
          <div className="mr-auto flex w-full justify-start sm:w-auto">
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <Trash2 className="mr-1.5 size-3.5" />
              Xóa dòng này
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
