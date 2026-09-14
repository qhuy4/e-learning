import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/common/data-table/data-table";
import { createCertificateColumns } from "@/features/certificates/columns/certificate-columns";
import {
  useCertificates,
  useDeleteCertificate,
} from "@/features/certificates/hook/use-certificates";
import { CERTIFICATE_STATUS } from "@/features/certificates/types/certificate";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";

export default function CertificatesPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useCertificates();
  const deleteMutation = useDeleteCertificate();

  const allCertificates = data?.data ?? [];

  const filteredCertificates = statusFilter
    ? allCertificates.filter((c: any) => c.certificateStatus === Number(statusFilter))
    : allCertificates;

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    const tid = toast.loading("Đang xóa...");
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success("Đã xóa chứng chỉ.", { id: tid });
        setDeletingId(null);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err), { id: tid });
        setDeletingId(null);
      },
    });
  };

  const columns = createCertificateColumns(handleDelete);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chứng chỉ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý chứng chỉ và bằng cấp của bạn
          </p>
        </div>
        <Button
          onClick={() => navigate("/certificates/create")}
          className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm chứng chỉ
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? ""); setPage(1); }}>
          <SelectTrigger className="h-9 min-w-[160px]">
            {statusFilter ? CERTIFICATE_STATUS[Number(statusFilter) as keyof typeof CERTIFICATE_STATUS]?.label : "Tất cả trạng thái"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Đang chờ</SelectItem>
            <SelectItem value="2">Đã duyệt</SelectItem>
            <SelectItem value="3">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredCertificates}
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil(filteredCertificates.length / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(v) => {
          setPageSize(v);
          setPage(1);
        }}
        loading={isLoading}
        refetch={refetch}
        isFetching={isFetching}
        search={keyword}
        onSearchChange={(v) => {
          setKeyword(v);
          setPage(1);
        }}
        onRowClick={(row) => navigate(`/certificates/${row.id}`)}
        text={{
          searchPlaceholder: "Tìm chứng chỉ...",
          noResults: "Chưa có chứng chỉ nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null); }}
        title="Xóa chứng chỉ?"
        description="Bạn có chắc chắn muốn xóa chứng chỉ này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
