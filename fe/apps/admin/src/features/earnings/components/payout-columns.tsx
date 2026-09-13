import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import {
  type InstructorPayout,
  payoutStatusLabel,
  payoutStatusClassName,
  paymentMethodLabel,
  formatCurrency,
} from "@/features/earnings/types/earnings";

const columnHelper = createColumnHelper<DataTableFeatures, InstructorPayout>();

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
  info: HeaderContext<DataTableFeatures, InstructorPayout, TValue>;
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

function formatPeriod(start: string, end: string) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function createPayoutColumns() {
  return columnHelper.columns([
    columnHelper.accessor("instructor", {
      header: "Giảng viên",
      cell: (info) => {
        const instructor = info.getValue();
        return (
          <div className="font-medium text-sm">
            {instructor?.name ?? "—"}
          </div>
        );
      },
    }),
    columnHelper.accessor("periodStart", {
      header: (info) => <SortHeader label="Kỳ thanh toán" columnId="periodStart" info={info} />,
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="text-sm">
            {formatPeriod(row.periodStart, row.periodEnd)}
          </span>
        );
      },
    }),
    columnHelper.accessor("totalGross", {
      header: (info) => <SortHeader label="Tổng gross" columnId="totalGross" info={info} />,
      cell: (info) => (
        <span className="text-sm">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("totalPlatformFee", {
      header: "Platform fee",
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("totalInstructorAmount", {
      header: (info) => <SortHeader label="Giảng viên nhận" columnId="totalInstructorAmount" info={info} />,
      cell: (info) => (
        <span className="text-sm font-medium text-green-600">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => {
        const status = info.getValue() as keyof typeof payoutStatusLabel;
        return (
          <Badge className={payoutStatusClassName[status]}>
            {payoutStatusLabel[status] ?? status}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("paymentMethod", {
      header: "Phương thức",
      cell: (info) => {
        const method = info.getValue() as keyof typeof paymentMethodLabel;
        return (
          <span className="text-sm">
            {paymentMethodLabel[method] ?? method}
          </span>
        );
      },
    }),
    columnHelper.accessor("paidAt", {
      header: (info) => <SortHeader label="Ngày thanh toán" columnId="paidAt" info={info} />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue() as Date)}
        </span>
      ),
    }),
  ]);
}
