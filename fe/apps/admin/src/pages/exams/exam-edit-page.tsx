import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet, Layers } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Textarea } from "@fe/components/ui/textarea";
import { Checkbox } from "@fe/components/ui/checkbox";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useExam, useUpdateExam } from "@/features/exams/hooks/use-exams";
import { useExamFormat, useExamFormatSections } from "@/features/exams/hooks/use-exam-formats";

function PageSkeleton() {
  return (
    <div className="p-6 mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
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

export default function ExamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useExam(Number(id));
  const { data: format } = useExamFormat(exam?.examFormatId ?? 0);
  const { data: formatSections = [] } = useExamFormatSections(exam?.examFormatId ?? 0);
  const updateExam = useUpdateExam();

  const [form, setForm] = useState({
    title: "",
    description: "",
    isPremium: false,
    durationSeconds: "" as number | "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (exam) {
      setForm({
        title: exam.title,
        description: exam.description ?? "",
        isPremium: exam.isPremium,
        durationSeconds: exam.durationSeconds ?? "",
      });
    }
  }, [exam]);

  const setField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Tiêu đề không được để trống";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tid = toast.loading("Đang cập nhật đề thi...");
    try {
      await updateExam.mutateAsync({
        id: Number(id),
        data: {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          isPremium: form.isPremium,
          durationSeconds: form.durationSeconds !== "" ? Number(form.durationSeconds) : undefined,
        },
      });
      toast.success("Cập nhật đề thi thành công!", { id: tid });
      navigate(`/exams/${id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!exam) {
    return (
      <div className="p-6">
        <p>Không tìm thấy đề thi</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/exams/${id}`)} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại chi tiết
      </Button>

      <Section title="Chỉnh sửa đề thi">
        <p className="text-sm text-muted-foreground -mt-2">
          Cập nhật thông tin đề thi <span className="font-medium">{exam.title}</span>.
        </p>

        {/* Định dạng + cấu trúc đề (read-only) — để admin biết đề thuộc định dạng nào. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Định dạng đề thi
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/exam-formats/${exam.examFormatId}`)}
              >
                Xem định dạng
              </Button>
            </div>
            <p className="font-medium">
              {format?.name ?? `Định dạng #${exam.examFormatId}`}
              {format?.version ? ` (${format.version})` : ""}
            </p>
            {format?.description && (
              <p className="text-sm text-muted-foreground">{format.description}</p>
            )}
            {formatSections.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formatSections.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {s.name}
                    {s.questionCount ? ` · ${s.questionCount} câu` : ""}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Định dạng được chọn lúc tạo đề và cố định — nó quyết định cấu trúc các phần.
              Muốn đề theo định dạng khác hãy tạo đề mới.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Layers className="h-4 w-4 text-primary" />
              Cấu trúc đề thi
            </span>
            <p className="text-sm text-muted-foreground">
              {exam.sections?.length ?? 0} phần thi ·{" "}
              {(exam.sections ?? []).reduce((sum, s) => sum + (s.questionCount ?? 0), 0)} câu hỏi
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(exam.sections ?? []).map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
                  title={s.description ?? undefined}
                >
                  {s.name}
                  {s.questionCount ? ` · ${s.questionCount} câu` : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="exam-title">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <Input
                id="exam-title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="VD: Đề thi TOEIC Practice Test 1"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="exam-duration">
                Thời lượng (giây)
              </label>
              <Input
                id="exam-duration"
                type="number"
                value={form.durationSeconds}
                onChange={(e) => setField("durationSeconds", e.target.value ? Number(e.target.value) : "")}
                placeholder="VD: 3600"
                min={0}
              />
            </div>

            <div className="space-y-1.5 flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="exam-premium"
                  checked={form.isPremium}
                  onCheckedChange={(checked) => setField("isPremium", !!checked)}
                />
                <label className="text-sm font-medium" htmlFor="exam-premium">
                  Premium
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="exam-description">
              Mô tả
            </label>
            <Textarea
              id="exam-description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả về đề thi..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/exams/${id}`)}
              disabled={updateExam.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={updateExam.isPending}>
              {updateExam.isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
