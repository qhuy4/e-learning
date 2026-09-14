import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { usePremiumSubscriptions } from "@/features/premium-subscriptions/hooks/use-premium-subscriptions";
import { premiumSubscriptionColumns } from "@/features/premium-subscriptions/components/premium-subscription-columns";
import { subscriptionStatusLabel } from "@/features/premium-subscriptions/types/premium-subscription";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...Object.entries(subscriptionStatusLabel).map(([value, label]) => ({ value, label })),
];

export function PremiumSubscriptionsPage() {
  const navigate = useNavigate();
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } = useListPage();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch, isFetching } = usePremiumSubscriptions(
    page,
    limit,
    statusFilter !== "all" ? Number(statusFilter) : undefined,
    debouncedSearch || undefined,
  );

  const subscriptions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gói Premium</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý gói đăng ký premium của học viên</p>
        </div>
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
        columns={premiumSubscriptionColumns}
        data={subscriptions}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/premium-subscriptions/${row.id}`)}
        search={search}
        onSearchChange={setSearch}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        text={{
          searchPlaceholder: "Tìm học viên...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có gói đăng ký nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
