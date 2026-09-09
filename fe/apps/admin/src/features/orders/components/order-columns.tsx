import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import { OrderStatus, orderStatusLabel, orderStatusClassName } from "@/features/orders/types/admin-order";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function createOrderColumns() {
  return columnHelper.columns([
    columnHelper.accessor("orderCode", {
      header: (info) => <SortHeader label="Mã đơn" columnId="orderCode" info={info} />,
      cell: (info) => (
        <div className="font-medium">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("userName", {
      header: (info) => <SortHeader label="Học viên" columnId="userName" info={info} />,
      cell: (info) => (
        <div className="max-w-[200px] truncate">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("itemCount", {
      header: "Số khóa học",
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor("total", {
      header: (info) => <SortHeader label="Tổng tiền" columnId="total" info={info} />,
      cell: (info) => <span className="font-medium">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor("status", {
      header: (info) => <SortHeader label="Trạng thái" columnId="status" info={info} />,
      cell: (info) => {
        const status = String(info.getValue()) as OrderStatus;
        const label = orderStatusLabel[status] ?? "N/A";
        const className = orderStatusClassName[status] ?? "";
        return <Badge className={className}>{label}</Badge>;
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
