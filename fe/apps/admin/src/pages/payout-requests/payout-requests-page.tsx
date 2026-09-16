import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { usePayouts } from "@/features/earnings/hooks/use-earnings";
import { createPayoutColumns } from "@/features/earnings/components/payout-columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { payoutStatusLabel } from "@/features/earnings/types/earnings";

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...Object.entries(payoutStatusLabel).map(([value, label]) => ({ value, label })),
];

export default function PayoutRequestsPage() {
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

  const [statusFilter, setStatusFilter] = useState("0");

  const { data, isLoading, refetch, isFetching } = usePayouts(
    page,
    limit,
    undefined,
    statusFilter !== "all" ? Number(statusFilter) : undefined,
    sortBy,
    sortOrder,
  );

  const payouts = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createPayoutColumns();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Yêu cầu rút tiền</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các yêu cầu rút tiền từ giảng viên
        </p>
      </div>

      <div className="mb-4 flex items-center justify-end">
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
      </div>

      <DataTable
        columns={columns}
        data={payouts}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/payout-requests/${row.id}`)}
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
          searchPlaceholder: "Tìm kiếm yêu cầu...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có yêu cầu rút tiền nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
