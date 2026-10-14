import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Separator } from "@fe/components/ui/separator";
import { useExamType, useDeleteExamType } from "@/features/exams/hooks/use-exam-types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default function ExamTypeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: examType, isLoading } = useExamType(Number(id));
  const deleteExamType = useDeleteExamType();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Xóa loại đề thi",
      description:
        'Loại đề thi sẽ được chuyển vào mục "Đã xóa" (có thể khôi phục). Các đề thi thuộc loại này sẽ bị ẩn cho tới khi bạn khôi phục.',
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa loại đề thi...");
    try {
      await deleteExamType.mutateAsync(Number(id));
      toast.success('Đã chuyển loại đề thi vào mục "Đã xóa" — có thể khôi phục.', { id: tid });
      navigate("/exam-types");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!examType) {
    return (
      <div className="p-6">
        <p>Không tìm thấy loại đề thi</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/exam-types")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{examType.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/exam-types/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Thông tin loại đề thi">
          <Field label="Tên loại đề thi">
            <p className="font-medium">{examType.name}</p>
          </Field>
          <Separator />
          <Field label="Mô tả">
            <p>{examType.description || "—"}</p>
          </Field>
        </Section>

        <div className="space-y-6">
          <Section title="Thời gian">
            <Field label="Ngày tạo">
              <p>{formatDate(examType.createdAt)}</p>
            </Field>
            <Field label="Cập nhật lần cuối">
              <p>{formatDate(examType.updatedAt)}</p>
            </Field>
          </Section>
        </div>
      </div>
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
