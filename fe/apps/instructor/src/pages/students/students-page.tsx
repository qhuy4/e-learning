import { useState } from "react";
import { useNavigate } from "react-router";

import { useStudents } from "@/features/students/hook/use-students";
import { createStudentColumns } from "@/features/students/columns/student-columns";
import { DataTable } from "@/components/common/data-table/data-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";

const STATUS_OPTIONS = [
  { value: "0", label: "Chưa kích hoạt" },
  { value: "1", label: "Đang học" },
  { value: "2", label: "Hoàn thành" },
];

export default function StudentsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: studentsData, isLoading, isFetching, refetch } = useStudents({
    page,
    limit: pageSize,
    keyword: keyword || undefined,
    status: status !== "" ? Number(status) : undefined,
  });

  const students = studentsData?.data ?? [];
  const meta = studentsData?.meta;

  const columns = createStudentColumns();

  return (
    <div className="space-y-6 mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Học viên</h1>
        <p className="text-sm text-muted-foreground mt-1">Danh sách học viên đã đăng ký khóa học của bạn</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select value={status} onValueChange={(v) => { setStatus(v ?? ""); setPage(1); }}>
          <SelectTrigger className="h-9 min-w-[160px]">
            {status !== "" ? STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Tất cả" : "Tất cả trạng thái"}
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={students}
        page={page}
        pageSize={pageSize}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        loading={isLoading}
        refetch={refetch}
        isFetching={isFetching}
        search={keyword}
        onSearchChange={(v) => { setKeyword(v); setPage(1); }}
        onPageSizeChange={(v) => { setPageSize(v); setPage(1); }}
        onRowClick={(row) => navigate(`/students/${row.id}`)}
        text={{
          searchPlaceholder: "Tìm kiếm theo tên hoặc email...",
          noResults: "Chưa có học viên nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
