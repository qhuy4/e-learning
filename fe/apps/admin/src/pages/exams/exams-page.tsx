import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import {
  useExams,
  useDeletedExams,
  useRestoreExam,
  useDuplicateExam,
} from "@/features/exams/hooks/use-exams";
import { useExamFormats } from "@/features/exams/hooks/use-exam-formats";
import { createExamColumns } from "@/features/exams/components/exam-columns";
import { QuickCreateExamDialog } from "@/features/exams/components/quick-create-exam-dialog";
import { Button } from "@fe/components/ui/button";
import { Plus, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { AdminExam } from "@/features/exams/types/exam";

function formatDeletedAt(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TAB_CLASS = "rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export default function ExamsPage() {
  const navigate = useNavigate();
  const { page, limit, search, sortBy, sortOrder, setPage, setLimit, setSearch, handleSortChange } = useListPage();
  const { data, isLoading, refetch, isFetching } = useExams();
  const { data: deletedExams = [], isPending: loadingDeleted } = useDeletedExams();
  const restoreExam = useRestoreExam();
  const { data: formats = [] } = useExamFormats();
  const duplicateExam = useDuplicateExam();
  const exams = data ?? [];

  const [tab, setTab] = useState<"active" | "deleted">("active");
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // examFormatId → tên định dạng để cột "Định dạng" hiện tên thay vì số ID.
  const formatNameById: Record<number, string> = {};
  for (const format of formats) formatNameById[format.id] = format.name;

  const handleDuplicate = async (exam: AdminExam) => {
    const tid = toast.loading("Đang sao chép đề thi...");
    try {
      const copy = await duplicateExam.mutateAsync(exam.id);
      toast.success(`Đã sao chép thành "${copy.title}" (bản nháp)!`, { id: tid });
      navigate(`/exams/${copy.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleRestore = async (exam: AdminExam) => {
    const tid = toast.loading("Đang khôi phục đề thi...");
    try {
      await restoreExam.mutateAsync(exam.id);
      toast.success(`Đã khôi phục "${exam.title}"!`, { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const columns = createExamColumns({
    formatNameById,
    onDuplicate: (exam) => void handleDuplicate(exam),
    duplicatingId: duplicateExam.isPending ? duplicateExam.variables : null,
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đề thi</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các đề thi và nội dung</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickCreateOpen(true)}
            title="Tạo đề mới nhanh từ định dạng — tự sinh part, vào thẳng trang Import ZIP"
          >
            <Zap className="mr-1.5 h-4 w-4" />
            Tạo nhanh
          </Button>
          <Link to="/exams/create" className="inline-flex items-center justify-center gap-1.5 px-2.5 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium transition-all">
            <Plus className="h-4 w-4" />
            Tạo đề thi
          </Link>
        </div>
      </div>

      {/* Tab: đang hoạt động / đã xóa mềm */}
      <div className="mb-4 flex w-fit items-center gap-1 rounded-lg border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`${TAB_CLASS} ${
            tab === "active"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Đang hoạt động
        </button>
        <button
          type="button"
          onClick={() => setTab("deleted")}
          className={`${TAB_CLASS} ${
            tab === "deleted"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Đã xóa{deletedExams.length > 0 ? ` (${deletedExams.length})` : ""}
        </button>
      </div>

      {tab === "active" ? (
        <DataTable
          columns={columns}
          data={exams.slice((page - 1) * limit, page * limit)}
          page={page}
          totalPages={Math.ceil(exams.length / limit) || 1}
          loading={isLoading}
          isFetching={isFetching}
          refetch={refetch}
          pageSize={limit}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/exams/${row.id}`)}
          search={search}
          onSearchChange={setSearch}
          onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          text={{
            searchPlaceholder: "Tìm kiếm đề thi...",
            reload: "Tải lại",
            rowsPerPage: "Dòng trên trang",
            noResults: "Không có đề thi nào.",
            pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
            previous: "Trước",
            next: "Sau",
          }}
        />
      ) : loadingDeleted ? (
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      ) : deletedExams.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Không có đề thi nào trong mục "Đã xóa".
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Tiêu đề</th>
                <th className="px-4 py-2.5 font-medium">Định dạng</th>
                <th className="px-4 py-2.5 font-medium">Ngày xóa</th>
                <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {deletedExams.map((exam) => (
                <tr key={exam.id} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                  <td className="max-w-80 truncate px-4 py-2.5 font-medium" title={exam.title}>
                    {exam.title}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {formatNameById[exam.examFormatId] ?? `#${exam.examFormatId}`}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDeletedAt(exam.deletedAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={restoreExam.isPending}
                      onClick={() => void handleRestore(exam)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Khôi phục
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuickCreateExamDialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen} />
    </div>
  );
}
