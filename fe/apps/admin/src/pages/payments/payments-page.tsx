import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { usePayments } from "@/features/payments/hooks/use-payments";
import { createPaymentColumns } from "@/features/payments/components/payment-columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { paymentStatusLabel, paymentGatewayLabel } from "@/features/payments/types/payments";

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  ...Object.entries(paymentStatusLabel).map(([value, label]) => ({ value, label })),
];

const gatewayOptions = [
  { value: "all", label: "Tất cả cổng" },
  ...Object.entries(paymentGatewayLabel).map(([value, label]) => ({ value, label })),
];

export default function PaymentsPage() {
  const navigate = useNavigate();
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearch,
    handleSortChange,
  } = useListPage();

  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");

  const { data, isLoading, refetch, isFetching } = usePayments(
    page,
    limit,
    undefined,
    statusFilter !== "all" ? Number(statusFilter) : undefined,
    gatewayFilter !== "all" ? gatewayFilter : undefined,
    sortBy,
    sortOrder,
  );

  const payments = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createPaymentColumns();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả giao dịch thanh toán</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                {statusOptions.find((o) => o.value === statusFilter)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={gatewayFilter} onValueChange={(v) => { setGatewayFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                {gatewayOptions.find((o) => o.value === gatewayFilter)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {gatewayOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/payments/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        text={{
          searchPlaceholder: "Tìm kiếm mã giao dịch...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có giao dịch nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
