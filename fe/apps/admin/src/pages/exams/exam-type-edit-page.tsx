import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useExamType, useUpdateExamType } from "@/features/exams/hooks/use-exam-types";

function PageSkeleton() {
  return (
    <div className="p-6 mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
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

export default function ExamTypeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: examType, isLoading } = useExamType(Number(id));
  const updateExamType = useUpdateExamType();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (examType) {
      setForm({
        name: examType.name,
        description: examType.description ?? "",
      });
    }
  }, [examType]);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Tên loại đề thi không được để trống";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tid = toast.loading("Đang cập nhật loại đề thi...");
    try {
      await updateExamType.mutateAsync({
        id: Number(id),
        data: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        },
      });
      toast.success("Cập nhật loại đề thi thành công!", { id: tid });
      navigate(`/exam-types/${id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!examType) {
    return (
      <div className="p-6">
        <p>Không tìm thấy loại đề thi</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/exam-types/${id}`)} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại chi tiết
      </Button>

      <Section title="Chỉnh sửa loại đề thi">
        <p className="text-sm text-muted-foreground -mt-2">
          Cập nhật thông tin loại đề thi <span className="font-medium">{examType.name}</span>.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="et-name">
              Tên loại đề thi <span className="text-destructive">*</span>
            </label>
            <Input
              id="et-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="VD: Test of English for International Communication"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="et-description">
              Mô tả
            </label>
            <textarea
              id="et-description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả về loại đề thi..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/exam-types/${id}`)}
              disabled={updateExamType.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={updateExamType.isPending}>
              {updateExamType.isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
