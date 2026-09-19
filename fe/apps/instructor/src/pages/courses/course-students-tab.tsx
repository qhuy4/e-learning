import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useStudents } from "@/features/students/hook/use-students";
import { createStudentColumns } from "@/features/students/columns/student-columns";
import { DataTable } from "@/components/common/data-table/data-table";

export default function CourseStudentsTab() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const { data, isLoading, isFetching, refetch } = useStudents({
    page,
    limit: pageSize,
    courseId: courseId ? Number(courseId) : undefined,
    keyword: keyword || undefined,
  });

  const enrollments = (data as any)?.data ?? [];
  const meta = (data as any)?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  const columns = createStudentColumns();

  return (
    <DataTable
      columns={columns}
      data={enrollments}
      page={page}
      pageSize={pageSize}
      totalPages={meta.totalPages}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      loading={isLoading}
      isFetching={isFetching}
      refetch={refetch}
      search={keyword}
      onSearchChange={(v) => {
        setKeyword(v);
        setPage(1);
      }}
      onRowClick={(row) => navigate(`/students/${row.id}`)}
      text={{
        searchPlaceholder: "Tìm theo tên hoặc email...",
      }}
    />
  );
}
