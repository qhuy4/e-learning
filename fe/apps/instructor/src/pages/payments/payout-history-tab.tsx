import { useState } from "react";
import { History, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { usePayouts } from "@/features/payments/hooks/use-payments";
import { PAYOUT_STATUS_CONFIG } from "@/features/payments/types/payment.types";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { DataTable } from "@/components/common/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { Payout } from "@/features/payments/types/payment.types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

const VARIANT_MAP: Record<string, string> = {
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const payoutColumns: ColumnDef<Payout, any>[] = [
  {
    accessorKey: "createdAt",
    header: "Ngày yêu cầu",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "period",
    header: "Kỳ thanh toán",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDate(row.original.periodStart)} - {formatDate(row.original.periodEnd)}
      </span>
    ),
  },
  {
    accessorKey: "totalInstructorAmount",
    header: "Số tiền",
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.totalInstructorAmount)}</span>
    ),
  },
  {
    accessorKey: "payoutAccount",
    header: "Tài khoản",
    cell: ({ row }) => {
      const account = row.original.payoutAccount;
      if (!account) return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <div className="text-sm">
          <p>{account.accountHolderName}</p>
          <p className="text-muted-foreground text-xs">
            {account.bankName ?? account.paypalEmail ?? ""}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const cfg = PAYOUT_STATUS_CONFIG[row.original.status];
      const variant = cfg?.variant ?? "secondary";
      return (
        <Badge className={VARIANT_MAP[variant] ?? ""}>
          {cfg?.label ?? "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "transactionRef",
    header: "Mã giao dịch",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.transactionRef ?? "—"}
      </span>
    ),
  },
];

export function PayoutHistoryTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = usePayouts({ page, limit: pageSize });

  const payouts = (data?.data ?? []) as Payout[];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          Lịch sử thanh toán
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Các yêu cầu rút tiền đã gửi và trạng thái xử lý.
        </p>
      </div>

      {payouts.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <History className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Chưa có lịch sử thanh toán.</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={payoutColumns}
          data={payouts}
          page={page}
          pageSize={pageSize}
          total={meta?.total ?? 0}
          totalPages={meta?.totalPages ?? 0}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          isLoading={isLoading}
          texts={{
            searchPlaceholder: "Tìm kiếm...",
            noResults: "Chưa có lịch sử thanh toán",
          }}
        />
      )}
    </div>
  );
}
