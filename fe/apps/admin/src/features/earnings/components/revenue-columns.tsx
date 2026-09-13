import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import {
  type RevenueSplit,
  revenueSplitPayoutStatusLabel,
  revenueSplitPayoutStatusClassName,
  formatCurrency,
} from "@/features/earnings/types/earnings";

const columnHelper = createColumnHelper<DataTableFeatures, RevenueSplit>();

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
  info: HeaderContext<DataTableFeatures, RevenueSplit, TValue>;
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

export function createRevenueSplitColumns() {
  return columnHelper.columns([
    columnHelper.accessor("course", {
      header: "Khóa học",
      cell: (info) => {
        const course = info.getValue();
        return (
          <div className="font-medium text-sm">
            {course?.title ?? "—"}
          </div>
        );
      },
    }),
    columnHelper.accessor("instructor", {
      header: "Giảng viên",
      cell: (info) => {
        const instructor = info.getValue();
        return <span className="text-sm">{instructor?.name ?? "—"}</span>;
      },
    }),
    columnHelper.accessor("grossAmount", {
      header: (info) => <SortHeader label="Doanh thu" columnId="grossAmount" info={info} />,
      cell: (info) => (
        <span className="text-sm font-medium">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("platformFeeAmount", {
      header: "Platform fee",
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("instructorAmount", {
      header: (info) => <SortHeader label="Giảng viên nhận" columnId="instructorAmount" info={info} />,
      cell: (info) => (
        <span className="text-sm font-medium text-green-600">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("payoutStatus", {
      header: "Trạng thái",
      cell: (info) => {
        const status = info.getValue() as keyof typeof revenueSplitPayoutStatusLabel;
        return (
          <Badge className={revenueSplitPayoutStatusClassName[status]}>
            {revenueSplitPayoutStatusLabel[status] ?? status}
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
