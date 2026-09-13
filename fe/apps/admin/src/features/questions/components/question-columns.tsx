import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import {
  type CourseQuestion,
  questionStatusLabel,
  questionStatusClassName,
} from "@/features/questions/types/question";

const columnHelper = createColumnHelper<DataTableFeatures, CourseQuestion>();

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
  info: HeaderContext<DataTableFeatures, CourseQuestion, TValue>;
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

export function createQuestionColumns() {
  return columnHelper.columns([
    columnHelper.accessor("content", {
      header: "Câu hỏi",
      cell: (info) => {
        const text = info.getValue() ?? "";
        return (
          <div className="text-sm max-w-[300px] truncate" title={text}>
            {text}
          </div>
        );
      },
    }),
    columnHelper.accessor("course", {
      header: "Khóa học",
      cell: (info) => {
        const course = info.getValue();
        return (
          <span className="text-sm">{course?.title ?? "—"}</span>
        );
      },
    }),
    columnHelper.accessor("user", {
      header: "Học viên",
      cell: (info) => {
        const user = info.getValue();
        return (
          <span className="text-sm">{user?.name ?? "—"}</span>
        );
      },
    }),
    columnHelper.accessor("answerCount", {
      header: "Trả lời",
      cell: (info) => (
        <Badge variant="secondary">{info.getValue() ?? 0}</Badge>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => {
        const status = info.getValue() as keyof typeof questionStatusLabel;
        return (
          <Badge className={questionStatusClassName[status]}>
            {questionStatusLabel[status] ?? status}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader label="Ngày tạo" columnId="createdAt" info={info} />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue() as Date)}
        </span>
      ),
    }),
  ]);
}
