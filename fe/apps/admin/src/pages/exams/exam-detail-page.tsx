import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Rocket, Archive, Hammer, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Separator } from "@fe/components/ui/separator";
import {
  useExam,
  useDeleteExam,
  usePublishExam,
  useArchiveExam,
  useDuplicateExam,
} from "@/features/exams/hooks/use-exams";
import { useExamFormat, useExamFormatSections } from "@/features/exams/hooks/use-exam-formats";
import { ExamStatus } from "@/features/exams/types/exam";
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

function statusBadge(status: ExamStatus) {
  const map: Record<ExamStatus, { label: string; className: string }> = {
    [ExamStatus.DRAFT]: {
      label: "Nháp",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    [ExamStatus.PUBLISHED]: {
      label: "Đã xuất bản",
      className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    [ExamStatus.ARCHIVED]: {
      label: "Đã lưu trữ",
      className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  const { label, className } = map[status] ?? map[ExamStatus.DRAFT];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
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

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useExam(Number(id));
  const { data: format } = useExamFormat(exam?.examFormatId ?? 0);
  const { data: formatSections = [] } = useExamFormatSections(exam?.examFormatId ?? 0);
  const deleteExam = useDeleteExam();
  const publishExam = usePublishExam();
  const archiveExam = useArchiveExam();
  const duplicateExam = useDuplicateExam();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();

  const handleDuplicate = async () => {
    const tid = toast.loading("Đang sao chép đề thi...");
    try {
      const copy = await duplicateExam.mutateAsync(Number(id));
      toast.success(`Đã sao chép thành "${copy.title}" — bản sao ở trạng thái nháp.`, { id: tid });
      navigate(`/exams/${copy.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Xóa đề thi",
      description: `Đề thi "${exam?.title ?? `#${id}`}" sẽ được chuyển vào mục "Đã xóa" (có thể khôi phục bất cứ lúc nào). Toàn bộ câu hỏi, nhóm, tài liệu và lượt làm bài được giữ nguyên.`,
      confirmLabel: "Xóa đề thi",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa đề thi...");
    try {
      await deleteExam.mutateAsync(Number(id));
      toast.success('Đã chuyển đề thi vào mục "Đã xóa" — có thể khôi phục.', { id: tid });
      navigate("/exams");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handlePublish = async () => {
    const tid = toast.loading("Đang xuất bản...");
    try {
      await publishExam.mutateAsync(Number(id));
      toast.success("Xuất bản thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleArchive = async () => {
    const tid = toast.loading("Đang lưu trữ...");
    try {
      await archiveExam.mutateAsync(Number(id));
      toast.success("Lưu trữ thành công!", { id: tid });
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

  if (!exam) {
    return (
      <div className="p-6">
        <p>Không tìm thấy đề thi</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/exams")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {statusBadge(exam.status)}
          </p>
        </div>
        <div className="flex gap-2">
          {exam.status === ExamStatus.DRAFT && (
            <Button variant="default" onClick={handlePublish} disabled={publishExam.isPending}>
              <Rocket className="mr-2 h-4 w-4" />
              Xuất bản
            </Button>
          )}
          {exam.status === ExamStatus.PUBLISHED && (
            <Button variant="secondary" onClick={handleArchive} disabled={archiveExam.isPending}>
              <Archive className="mr-2 h-4 w-4" />
              Lưu trữ
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/exams/${id}/builder`)}>
            <Hammer className="mr-2 h-4 w-4" />
            Builder
          </Button>
          <Button variant="outline" onClick={() => navigate(`/exams/${id}/preview`)}>
            Xem trước
          </Button>
          <Button variant="outline" onClick={() => navigate(`/exams/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateExam.isPending}
            title="Sao chép toàn bộ đề thi này thành 1 đề mới (bản nháp)"
          >
            <Copy className="mr-2 h-4 w-4" />
            {duplicateExam.isPending ? "Đang sao chép…" : "Sao chép"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Thông tin đề thi">
          <Field label="Tiêu đề">
            <p className="font-medium">{exam.title}</p>
          </Field>
          <Field label="Định dạng">
            <p className="font-medium">
              {format?.name ?? `#${exam.examFormatId}`}
              {format?.version ? ` (${format.version})` : ""}
            </p>
            {format?.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{format.description}</p>
            )}
            {formatSections.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {formatSections.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {s.name}
                    {s.questionCount ? ` · ${s.questionCount} câu` : ""}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              className="mt-1.5 text-xs font-medium text-primary hover:underline"
              onClick={() => navigate(`/exam-formats/${exam.examFormatId}`)}
            >
              Xem trang định dạng →
            </button>
          </Field>
          <Field label="Trạng thái">{statusBadge(exam.status)}</Field>
          <Field label="Premium">
            <p>{exam.isPremium ? "Có" : "Không"}</p>
          </Field>
          <Separator />
          <Field label="Mô tả">
            <p>{exam.description || "—"}</p>
          </Field>
        </Section>

        <div className="space-y-6">
          <Section title="Cài đặt">
            <Field label="Thời lượng">
              <p>{formatDuration(exam.durationSeconds)}</p>
            </Field>
            <Field label="Đã xuất bản lúc">
              <p>{formatDate(exam.publishedAt)}</p>
            </Field>
          </Section>

          <Section title="Thời gian">
            <Field label="Ngày tạo">
              <p>{formatDate(exam.createdAt)}</p>
            </Field>
            <Field label="Cập nhật lần cuối">
              <p>{formatDate(exam.updatedAt)}</p>
            </Field>
          </Section>
        </div>
      </div>

      {exam.sections && exam.sections.length > 0 && (
        <div className="mt-6">
          <Section title="Các phần thi">
            <div className="space-y-3">
              {exam.sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{section.name}</p>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Vị trí: {section.position}</p>
                    <p>Số câu: {section.questionCount}</p>
                    <p>Thời lượng: {formatDuration(section.durationSeconds)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
