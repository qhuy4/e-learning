import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Textarea } from "@fe/components/ui/textarea";
import { Checkbox } from "@fe/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { useCreateExam } from "@/features/exams/hooks/use-exams";
import { useExamFormats } from "@/features/exams/hooks/use-exam-formats";
import { useExamTypes } from "@/features/exams/hooks/use-exam-types";

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

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const createExam = useCreateExam();
  const { data: examTypes = [] } = useExamTypes();
  const { data: examFormats = [] } = useExamFormats();

  const [form, setForm] = useState({
    examTypeId: "",
    examFormatId: "",
    title: "",
    description: "",
    isPremium: false,
    durationSeconds: "" as number | "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Loại đề (TOEIC/IELTS/...) lọc định dạng tương ứng — bắt buộc chọn để
  // template ZIP import sinh đúng cấu trúc phần thi.
  const filteredFormats = form.examTypeId
    ? examFormats.filter((ef) => String(ef.examTypeId) === form.examTypeId)
    : examFormats;

  const setField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.examTypeId) errs.examTypeId = "Vui lòng chọn loại đề thi";
    if (!form.examFormatId) errs.examFormatId = "Vui lòng chọn định dạng đề thi";
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

    const tid = toast.loading("Đang tạo đề thi...");
    try {
      const created = await createExam.mutateAsync({
        examFormatId: Number(form.examFormatId),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        isPremium: form.isPremium,
        durationSeconds: form.durationSeconds !== "" ? Number(form.durationSeconds) : undefined,
      });
      toast.success("Tạo đề thi thành công! Chuyển sang trang import gói ZIP.", { id: tid });
      // Sang thẳng trang import ZIP (template sinh theo format của đề vừa tạo);
      // builder vẫn mở được từ thanh điều hướng / nút quay lại.
      navigate(created?.id ? `/exams/${created.id}/import-package` : "/exams");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/exams")} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <Section title="Tạo đề thi mới">
        <p className="text-sm text-muted-foreground -mt-2">Nhập thông tin để tạo đề thi mới.</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Loại đề thi <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.examTypeId}
                items={examTypes.map((et) => ({ value: String(et.id), label: et.name }))}
                onValueChange={(v) => {
                  setField("examTypeId", v ?? "");
                  // Đổi loại đề → bỏ định dạng cũ (không còn hợp lệ).
                  setField("examFormatId", "");
                }}
              >
                <SelectTrigger aria-invalid={!!errors.examTypeId}>
                  <SelectValue placeholder="Chọn loại đề thi (TOEIC, IELTS...)" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((et) => (
                    <SelectItem key={et.id} value={String(et.id)}>
                      {et.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.examTypeId && <p className="text-xs text-destructive">{errors.examTypeId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Định dạng đề thi <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.examFormatId}
                items={filteredFormats.map((ef) => ({ value: String(ef.id), label: ef.name }))}
                onValueChange={(v) => setField("examFormatId", v ?? "")}
                disabled={!form.examTypeId}
              >
                <SelectTrigger aria-invalid={!!errors.examFormatId}>
                  <SelectValue
                    placeholder={
                      form.examTypeId
                        ? "Chọn định dạng đề thi"
                        : "Chọn loại đề thi trước"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredFormats.map((ef) => (
                    <SelectItem key={ef.id} value={String(ef.id)}>
                      {ef.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.examFormatId && <p className="text-xs text-destructive">{errors.examFormatId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="exam-title">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <Input
                id="exam-title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Ví dụ: Đề thi TOEIC Practice Test 1"
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
                placeholder="Ví dụ: 3600"
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
              onClick={() => navigate("/exams")}
              disabled={createExam.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createExam.isPending}>
              {createExam.isPending ? "Đang tạo..." : "Tạo đề thi"}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
