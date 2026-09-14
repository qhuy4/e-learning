import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useStudentCertificates } from "@/features/student-certificates/hooks/use-student-certificates";
import { studentCertificateColumns } from "@/features/student-certificates/components/student-certificate-columns";

export function StudentCertificatesPage() {
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

  const { data, isLoading, refetch, isFetching } = useStudentCertificates(
    page,
    limit,
    debouncedSearch || undefined,
    sortBy,
    sortOrder,
  );

  const certificates = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Chứng chỉ học viên</h1>
        <p className="text-sm text-muted-foreground mt-1">Danh sách chứng chỉ đã cấp cho học viên</p>
      </div>

      <DataTable
        columns={studentCertificateColumns}
        data={certificates}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/student-certificates/${row.id}`)}
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
          searchPlaceholder: "Tìm học viên, khóa học...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có chứng chỉ nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
