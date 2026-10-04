import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown, Copy } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { Button } from "@fe/components/ui/button";
import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { ExamStatus } from "../types/exam";
import type { AdminExam } from "../types/exam";

const columnHelper = createColumnHelper<DataTableFeatures, AdminExam>();

export interface ExamColumnDeps {
  /** examFormatId → tên định dạng (VD "TOEIC Format 2026"); thiếu thì hiện "#id". */
  formatNameById?: Record<number, string>;
  /** Bấm "Sao chép" trên 1 dòng (đã stopPropagation nên không kích hoạt row click). */
  onDuplicate?: (exam: AdminExam) => void;
  /** Id đề đang được sao chép → disable nút của dòng đó. */
  duplicatingId?: number | null;
}

interface TableMetaType {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

function SortHeader<TValue>({
  label,
  columnId,
  info,
}: {
  label: string;
  columnId: string;
  info: HeaderContext<DataTableFeatures, AdminExam, TValue>;
}) {
  const meta = info.table.options.meta as TableMetaType | undefined;
  const isSorted = meta?.sortBy === columnId;
  const sortOrder = isSorted ? meta?.sortOrder : null;

  return (
    <button
      type="button"
      className="flex items-center gap-1 cursor-pointer select-none hover:text-foreground font-medium text-left bg-transparent border-none p-0 outline-none"
      onClick={(e) => {
        e.stopPropagation();
        const nextOrder = sortOrder === "asc" ? "desc" : "asc";
        meta?.onSortChange?.(columnId, nextOrder);
      }}
    >
      <span>{label}</span>
      {sortOrder === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 ml-1" />
      ) : sortOrder === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5 ml-1" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground/30" />
      )}
    </button>
  );
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function statusBadge(status: ExamStatus) {
  const map: Record<ExamStatus, { label: string; className: string }> = {
    [ExamStatus.DRAFT]: {
      label: "Nháp",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    [ExamStatus.PUBLISHED]: {
      label: "Đã xuất bản",
      className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    [ExamStatus.ARCHIVED]: {
      label: "Đã lưu trữ",
      className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  const { label, className } = map[status] ?? map[ExamStatus.DRAFT];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function createExamColumns(deps: ExamColumnDeps = {}) {
  return columnHelper.columns([
    columnHelper.accessor("title", {
      header: (info) => <SortHeader label="Tiêu đề" columnId="title" info={info} />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("examFormatId", {
      header: (info) => <SortHeader label="Định dạng" columnId="examFormatId" info={info} />,
      cell: (info) => {
        const formatId = info.getValue();
        const name = deps.formatNameById?.[formatId];
        return (
          <span className="text-sm" title={`Định dạng #${formatId}`}>
            {name ?? `#${formatId}`}
          </span>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: (info) => <SortHeader label="Trạng thái" columnId="status" info={info} />,
      cell: (info) => statusBadge(info.getValue()),
    }),
    columnHelper.accessor("isPremium", {
      header: (info) => <SortHeader label="Premium" columnId="isPremium" info={info} />,
      cell: (info) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            info.getValue()
              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {info.getValue() ? "Có" : "Không"}
        </span>
      ),
    }),
    columnHelper.accessor("durationSeconds", {
      header: (info) => <SortHeader label="Thời lượng" columnId="durationSeconds" info={info} />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDuration(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader label="Ngày tạo" columnId="createdAt" info={info} />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Thao tác",
      cell: (info) => {
        const exam = info.row.original;
        const busy = deps.duplicatingId === exam.id;
        return (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={busy}
            title="Sao chép toàn bộ đề thi này thành 1 đề mới (bản nháp)"
            onClick={(e) => {
              e.stopPropagation(); // không kích hoạt onRowClick (vào chi tiết)
              deps.onDuplicate?.(exam);
            }}
          >
            <Copy className="h-3.5 w-3.5" />
            {busy ? "Đang sao chép…" : "Sao chép"}
          </Button>
        );
      },
    }),
  ]);
}
