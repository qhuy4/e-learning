import { useState } from "react";
import { useNavigate } from "react-router";

import { useInstructorQuestions } from "@/features/qa/hook/use-qa";
import { createQuestionColumns } from "@/features/qa/columns/qa-columns";
import { DataTable } from "@/components/common/data-table/data-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";

const STATUS_OPTIONS = [
  { value: "1", label: "Mở" },
  { value: "2", label: "Đã khóa" },
  { value: "3", label: "Đã ẩn" },
];

export default function QuestionsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, refetch } = useInstructorQuestions({
    page,
    limit: pageSize,
    keyword: keyword || undefined,
    status: status !== "" ? Number(status) : undefined,
  });

  const questions = data?.data ?? [];
  const meta = data?.meta;

  const columns = createQuestionColumns();

  return (
    <div className="space-y-6 mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Câu hỏi & Thảo luận</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý câu hỏi từ học viên trong các khóa học của bạn</p>
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
        data={questions}
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
        onRowClick={(row) => navigate(`/qa/${row.id}`)}
        text={{
          searchPlaceholder: "Tìm kiếm câu hỏi...",
          noResults: "Chưa có câu hỏi nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
