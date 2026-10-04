import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import { useCreateExamType } from "@/features/exams/hooks/use-exam-types";

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

export default function ExamTypeCreatePage() {
  const navigate = useNavigate();
  const createExamType = useCreateExamType();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

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

    const tid = toast.loading("Đang tạo loại đề thi...");
    try {
      await createExamType.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      toast.success("Tạo loại đề thi thành công!", { id: tid });
      navigate("/exam-types");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/exam-types")} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <Section title="Tạo loại đề thi mới">
        <p className="text-sm text-muted-foreground -mt-2">Nhập thông tin để tạo loại đề thi mới.</p>

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
              onClick={() => navigate("/exam-types")}
              disabled={createExamType.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={createExamType.isPending}>
              {createExamType.isPending ? "Đang tạo..." : "Tạo loại đề thi"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
