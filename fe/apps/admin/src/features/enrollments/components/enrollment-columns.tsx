import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import { EnrollmentStatus, enrollmentStatusLabel, enrollmentStatusClassName } from "@/features/enrollments/types/enrollment";

const columnHelper = createColumnHelper<DataTableFeatures, any>();

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
  info: HeaderContext<DataTableFeatures, any, TValue>;
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

export function createEnrollmentColumns() {
  return columnHelper.columns([
    columnHelper.accessor("userName", {
      header: (info) => <SortHeader label="Học viên" columnId="userName" info={info} />,
      cell: (info) => (
        <div className="max-w-[200px] truncate font-medium">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("courseTitle", {
      header: (info) => <SortHeader label="Khóa học" columnId="courseTitle" info={info} />,
      cell: (info) => (
        <div className="max-w-[250px] truncate">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("progress", {
      header: (info) => <SortHeader label="Tiến độ" columnId="progress" info={info} />,
      cell: (info) => {
        const value = info.getValue() as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm">{value}%</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: (info) => <SortHeader label="Trạng thái" columnId="status" info={info} />,
      cell: (info) => {
        const status = Number(info.getValue()) as EnrollmentStatus;
        const label = enrollmentStatusLabel[status] ?? "N/A";
        const className = enrollmentStatusClassName[status] ?? "";
        return <Badge className={className}>{label}</Badge>;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader label="Ngày ghi danh" columnId="createdAt" info={info} />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue() as Date)}
        </span>
      ),
    }),
  ]);
}
