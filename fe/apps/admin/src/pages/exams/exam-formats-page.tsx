import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/common/data-table/data-table";
import { useListPage } from "@/components/common/page/use-list-page";
import {
  useExamFormats,
  useDeletedExamFormats,
  useRestoreExamFormat,
} from "@/features/exams/hooks/use-exam-formats";
import { createExamFormatColumns } from "@/features/exams/components/exam-format-columns";
import { Button } from "@fe/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

export default function ExamFormatsPage() {
  const navigate = useNavigate();
  const { page, limit, search, sortBy, sortOrder, setPage, setLimit, setSearch, handleSortChange } = useListPage();
  const { data, isLoading, refetch, isFetching } = useExamFormats();
  const { data: deletedFormats = [], isPending: loadingDeleted } = useDeletedExamFormats();
  const restoreExamFormat = useRestoreExamFormat();
  const examFormats = data ?? [];
  const columns = createExamFormatColumns();

  const [tab, setTab] = useState<"active" | "deleted">("active");

  const handleRestore = async (formatId: number, name: string) => {
    const tid = toast.loading("Đang khôi phục định dạng đề thi...");
    try {
      await restoreExamFormat.mutateAsync(formatId);
      toast.success(
        `Đã khôi phục "${name}" — các đề thi thuộc định dạng này đã hiển thị lại!`,
        { id: tid },
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Định dạng đề thi</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các định dạng đề thi và phần thi</p>
        </div>
        <Link to="/exam-formats/create" className="inline-flex items-center justify-center gap-1.5 px-2.5 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium transition-all">
          <Plus className="h-4 w-4" />
          Tạo định dạng đề thi
        </Link>
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
          Đã xóa{deletedFormats.length > 0 ? ` (${deletedFormats.length})` : ""}
        </button>
      </div>

      {tab === "active" ? (
        <DataTable
          columns={columns}
          data={examFormats.slice((page - 1) * limit, page * limit)}
          page={page}
          totalPages={Math.ceil(examFormats.length / limit) || 1}
          loading={isLoading}
          isFetching={isFetching}
          refetch={refetch}
          pageSize={limit}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/exam-formats/${row.id}`)}
          search={search}
          onSearchChange={setSearch}
          onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          text={{
            searchPlaceholder: "Tìm kiếm định dạng đề thi...",
            reload: "Tải lại",
            rowsPerPage: "Dòng trên trang",
            noResults: "Không có định dạng đề thi nào.",
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
      ) : deletedFormats.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Không có định dạng đề thi nào trong mục "Đã xóa".
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Tên định dạng đề thi</th>
                <th className="px-4 py-2.5 font-medium">Mô tả</th>
                <th className="px-4 py-2.5 font-medium">Ngày xóa</th>
                <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {deletedFormats.map((format) => (
                <tr key={format.id} className="border-b transition-colors last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{format.name}</td>
                  <td className="max-w-80 truncate px-4 py-2.5 text-muted-foreground" title={format.description ?? undefined}>
                    {format.description ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDeletedAt(format.deletedAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={restoreExamFormat.isPending}
                      onClick={() => void handleRestore(format.id, format.name)}
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
    </div>
  );
}
