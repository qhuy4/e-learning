import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useReviewReports } from "@/features/review-reports/hooks/use-review-reports";
import { reviewReportColumns } from "@/features/review-reports/components/report-columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "0", label: "Chờ xử lý" },
  { value: "1", label: "Đã xử lý" },
  { value: "2", label: "Đã từ chối" },
];

export default function ReviewReportsPage() {
  const navigate = useNavigate();
  const {
    page,
    limit,
    search,
    debouncedSearch,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearch,
    handleSortChange,
  } = useListPage();

  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch, isFetching } = useReviewReports(
    page,
    limit,
    statusFilter !== "all" ? Number(statusFilter) : undefined,
    debouncedSearch || undefined,
    sortBy,
    sortOrder,
  );

  const reports = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo đánh giá</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các báo cáo từ học viên</p>
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
        columns={reviewReportColumns}
        data={reports}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/review-reports/${row.id}`)}
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
          searchPlaceholder: "Tìm lý do, học viên...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có báo cáo nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
