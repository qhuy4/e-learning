import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { HeaderContext } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/components/common/data-table/data-table-features.ts";
import { Badge } from "@fe/components/ui/badge.tsx";
import {
  couponStatusClassName,
  formatCouponDiscount,
  couponScopeLabel,
  CouponScope,
} from "@/features/coupons/types/coupon";

const columnHelper = createColumnHelper<DataTableFeatures, any>();

interface TableMetaType {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onToggleActive?: (id: string) => void;
  onDelete?: (id: string) => void;
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

export function createCouponColumns() {
  return columnHelper.columns([
    columnHelper.accessor("code", {
      header: (info) => <SortHeader label="Mã giảm giá" columnId="code" info={info} />,
      cell: (info) => (
        <div className="font-medium font-mono text-sm">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("discountValue", {
      header: (info) => <SortHeader label="Giảm giá" columnId="discountValue" info={info} />,
      cell: (info) => {
        const coupon = info.row.original;
        return <span>{formatCouponDiscount(coupon)}</span>;
      },
    }),
    columnHelper.accessor("scope", {
      header: "Phạm vi",
      cell: (info) => {
        const scope = String(info.getValue()) as CouponScope;
        return <span>{couponScopeLabel[scope] ?? "N/A"}</span>;
      },
    }),
    columnHelper.accessor("usedCount", {
      header: (info) => <SortHeader label="Đã dùng" columnId="usedCount" info={info} />,
      cell: (info) => {
        const coupon = info.row.original;
        const limit = coupon.usageLimit;
        return (
          <span>
            {info.getValue()}
            {limit != null ? `/${limit}` : ""}
          </span>
        );
      },
    }),
    columnHelper.accessor("isActive", {
      header: "Trạng thái",
      cell: (info) => {
        const isActive = Boolean(info.getValue());
        return (
          <Badge className={isActive ? couponStatusClassName.active : couponStatusClassName.inactive}>
            {isActive ? "Đang sử dụng" : "Tạm dừng"}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("validUntil", {
      header: (info) => <SortHeader label="Hết hạn" columnId="validUntil" info={info} />,
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
