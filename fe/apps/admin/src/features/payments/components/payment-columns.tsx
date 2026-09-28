import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import {
  type Payment,
  paymentStatusLabel,
  paymentStatusClassName,
  paymentGatewayLabel,
  formatPaymentAmount,
} from "@/features/payments/types/payments";

const columnHelper = createColumnHelper<DataTableFeatures, Payment>();

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
  info: HeaderContext<DataTableFeatures, Payment, TValue>;
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createPaymentColumns() {
  return columnHelper.columns([
    columnHelper.accessor("orderId", {
      header: "Đơn hàng",
      cell: (info) => (
        <span className="text-sm font-medium">#{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("gateway", {
      header: "Cổng thanh toán",
      cell: (info) => {
        const gateway = info.getValue();
        return (
          <span className="text-sm">{paymentGatewayLabel[gateway as keyof typeof paymentGatewayLabel] ?? gateway}</span>
        );
      },
    }),
    columnHelper.accessor("amount", {
      header: (info) => <SortHeader label="Số tiền" columnId="amount" info={info} />,
      cell: (info) => (
        <span className="text-sm font-medium">{formatPaymentAmount(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("currency", {
      header: "Tiền tệ",
      cell: (info) => (
        <span className="text-sm text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => {
        const status = info.getValue() as keyof typeof paymentStatusLabel;
        return (
          <Badge className={paymentStatusClassName[status]}>
            {paymentStatusLabel[status] ?? status}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("transactionId", {
      header: "Mã GD",
      cell: (info) => (
        <span className="text-sm text-muted-foreground font-mono text-xs">
          {info.getValue() ?? "—"}
        </span>
      ),
    }),
    columnHelper.accessor("paidAt", {
      header: (info) => <SortHeader label="Ngày thanh toán" columnId="paidAt" info={info} />,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue() as Date)}
        </span>
      ),
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
