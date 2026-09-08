import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useEnrollments } from "@/features/enrollments/hooks/use-enrollment";
import { createEnrollmentColumns } from "@/features/enrollments/components/enrollment-columns";

export default function EnrollmentsPage() {
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

  const { data, isLoading, refetch, isFetching } = useEnrollments(
    page,
    limit,
    debouncedSearch || undefined,
    sortBy,
    sortOrder,
  );

  const enrollments = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createEnrollmentColumns();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý ghi danh</h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả lượt ghi danh trên nền tảng</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={enrollments}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/enrollments/${row.id}`)}
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
          searchPlaceholder: "Tìm kiếm tên học viên, khóa học...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có lượt ghi danh nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
