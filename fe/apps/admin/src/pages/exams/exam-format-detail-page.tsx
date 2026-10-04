import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Separator } from "@fe/components/ui/separator";
import {
  useExamFormat,
  useDeleteExamFormat,
  useExamFormatSections,
} from "@/features/exams/hooks/use-exam-formats";
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

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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

export default function ExamFormatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: examFormat, isLoading } = useExamFormat(Number(id));
  const { data: sections, isLoading: isLoadingSections } = useExamFormatSections(Number(id));
  const deleteExamFormat = useDeleteExamFormat();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Xóa định dạng đề thi",
      description:
        'Định dạng đề thi sẽ được chuyển vào mục "Đã xóa" (có thể khôi phục). Các đề thi thuộc định dạng này sẽ bị ẩn cho tới khi bạn khôi phục.',
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa định dạng đề thi...");
    try {
      await deleteExamFormat.mutateAsync(Number(id));
      toast.success('Đã chuyển định dạng đề thi vào mục "Đã xóa" — có thể khôi phục.', { id: tid });
      navigate("/exam-formats");
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

  if (!examFormat) {
    return (
      <div className="p-6">
        <p>Không tìm thấy định dạng đề thi</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/exam-formats")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{examFormat.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                examFormat.isActive
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {examFormat.isActive ? "Hoạt động" : "Tạm tắt"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/exam-formats/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Thông tin định dạng">
          <Field label="Tên định dạng">
            <p className="font-medium">{examFormat.name}</p>
          </Field>
          <Field label="Loại đề thi ID">
            <p className="font-mono">{examFormat.examTypeId}</p>
          </Field>
          {examFormat.version && (
            <Field label="Phiên bản">
              <p className="font-mono">{examFormat.version}</p>
            </Field>
          )}
          <Separator />
          <Field label="Mô tả">
            <p>{examFormat.description || "—"}</p>
          </Field>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Cài đặt">
            <Field label="Thời lượng">
              <p>{formatDuration(examFormat.durationSeconds)}</p>
            </Field>
            <Field label="Trạng thái">
              <p>{examFormat.isActive ? "Hoạt động" : "Tạm tắt"}</p>
            </Field>
            <Separator />
            <Field label="Có hiệu lực từ">
              <p>{formatDate(examFormat.effectiveFrom)}</p>
            </Field>
            <Field label="Có hiệu lực đến">
              <p>{formatDate(examFormat.effectiveTo)}</p>
            </Field>
          </SectionCard>

          <SectionCard title="Thời gian">
            <Field label="Ngày tạo">
              <p>{formatDate(examFormat.createdAt)}</p>
            </Field>
            <Field label="Cập nhật lần cuối">
              <p>{formatDate(examFormat.updatedAt)}</p>
            </Field>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Các phần thi">
        {isLoadingSections ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : !sections || sections.length === 0 ? (
          <p className="text-muted-foreground text-sm">Chưa có phần thi</p>
        ) : (
          <div className="space-y-3">
            {sections
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {section.position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{section.name}</span>
                      {section.sectionType && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {section.sectionType}
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{formatDuration(section.durationSeconds)}</p>
                    {section.questionCount != null && (
                      <p className="text-xs text-muted-foreground">
                        {section.questionCount} câu hỏi
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </SectionCard>
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
