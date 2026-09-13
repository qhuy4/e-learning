import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import { useQuestions } from "@/features/questions/hooks/use-questions";
import { createQuestionColumns } from "@/features/questions/components/question-columns";

export default function QuestionsPage() {
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

  const { data, isLoading, refetch, isFetching } = useQuestions(
    page,
    limit,
    undefined,
    undefined,
    debouncedSearch || undefined,
    sortBy,
    sortOrder,
  );

  const questions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;
  const columns = createQuestionColumns();

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Hỏi đáp khóa học</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý câu hỏi và câu trả lời của học viên</p>
      </div>

      <DataTable
        columns={columns}
        data={questions}
        page={page}
        totalPages={totalPages}
        loading={isLoading}
        isFetching={isFetching}
        refetch={refetch}
        pageSize={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/questions/${row.id}`)}
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
          searchPlaceholder: "Tìm kiếm câu hỏi...",
          reload: "Tải lại",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có câu hỏi nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
