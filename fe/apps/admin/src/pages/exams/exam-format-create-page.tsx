import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import { Textarea } from "@fe/components/ui/textarea";
import { Checkbox } from "@fe/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { useCreateExamFormat } from "@/features/exams/hooks/use-exam-formats";
import { useExamTypes } from "@/features/exams/hooks/use-exam-types";
import {
  SECTION_TYPE_NONE,
  SECTION_TYPE_OPTIONS,
  type CreateExamFormatSectionDto,
} from "@/features/exams/types/exam";

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

interface SectionForm {
  name: string;
  description: string;
  instructions: string;
  position: number;
  durationSeconds: number | "";
  questionCount: number | "";
  /** "" = chưa gán; giá trị: LISTENING / READING / WRITING / SPEAKING. */
  sectionType: string;
}

function emptySection(position: number): SectionForm {
  return {
    name: "",
    description: "",
    instructions: "",
    position,
    durationSeconds: "",
    questionCount: "",
    sectionType: "",
  };
}

export default function ExamFormatCreatePage() {
  const navigate = useNavigate();
  const createExamFormat = useCreateExamFormat();
  const { data: examTypes = [] } = useExamTypes();

  const [form, setForm] = useState({
    examTypeId: "",
    name: "",
    version: "",
    description: "",
    durationSeconds: "" as number | "",
    isActive: true,
    effectiveFrom: "",
    effectiveTo: "",
  });
  const [sections, setSections] = useState<SectionForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<number, Record<string, string | undefined>>>({});

  const setField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setSectionField = (index: number, key: keyof SectionForm, value: string | number) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
    setSectionErrors((prev) => ({
      ...prev,
      [index]: { ...prev[index], [key]: undefined },
    }));
  };

  const addSection = () => {
    setSections((prev) => [...prev, emptySection(prev.length + 1)]);
  };

  const removeSection = (index: number) => {
    setSections((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, position: i + 1 }))
    );
    setSectionErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.examTypeId) errs.examTypeId = "Vui lòng chọn loại đề thi";
    if (!form.name.trim()) errs.name = "Tên định dạng không được để trống";
    if (form.effectiveFrom && form.effectiveTo) {
      if (new Date(form.effectiveFrom) > new Date(form.effectiveTo)) {
        errs.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }
    return errs;
  };

  const validateSections = () => {
    const allErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    sections.forEach((section, index) => {
      const errs: Record<string, string> = {};
      if (!section.name.trim()) errs.name = "Tên phần thi không được để trống";
      if (Object.keys(errs).length > 0) {
        allErrors[index] = errs;
        hasErrors = true;
      }
    });

    setSectionErrors(allErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    const sectionsValid = validateSections();
    if (Object.keys(errs).length > 0 || !sectionsValid) {
      setErrors(errs);
      return;
    }

    const tid = toast.loading("Đang tạo định dạng đề thi...");
    try {
      const sectionsPayload: CreateExamFormatSectionDto[] = sections.map((s) => ({
        name: s.name.trim(),
        description: s.description.trim() || undefined,
        instructions: s.instructions.trim() || undefined,
        position: s.position,
        durationSeconds: s.durationSeconds !== "" ? Number(s.durationSeconds) : undefined,
        questionCount: s.questionCount !== "" ? Number(s.questionCount) : undefined,
        sectionType: s.sectionType || null,
      }));

      await createExamFormat.mutateAsync({
        examTypeId: Number(form.examTypeId),
        name: form.name.trim(),
        version: form.version.trim() || undefined,
        description: form.description.trim() || undefined,
        durationSeconds: form.durationSeconds !== "" ? Number(form.durationSeconds) : undefined,
        isActive: form.isActive,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
        sections: sectionsPayload.length > 0 ? sectionsPayload : undefined,
      });
      toast.success("Tạo định dạng đề thi thành công!", { id: tid });
      navigate("/exam-formats");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/exam-formats")} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại danh sách
      </Button>

      <Section title="Tạo định dạng đề thi mới">
        <p className="text-sm text-muted-foreground -mt-2">Nhập thông tin để tạo định dạng đề thi mới.</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Loại đề thi <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.examTypeId}
                items={examTypes.map((et) => ({ value: String(et.id), label: et.name }))}
                onValueChange={(v) => setField("examTypeId", v ?? "")}
              >
                <SelectTrigger aria-invalid={!!errors.examTypeId}>
                  <SelectValue placeholder="Chọn loại đề thi" />
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
              <label className="text-sm font-medium" htmlFor="ef-name">
                Tên định dạng <span className="text-destructive">*</span>
              </label>
              <Input
                id="ef-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="VD: TOEIC Full Test 2024"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ef-version">
                Phiên bản
              </label>
              <Input
                id="ef-version"
                value={form.version}
                onChange={(e) => setField("version", e.target.value)}
                placeholder="VD: 1.0"
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ef-duration">
                Thời lượng (giây)
              </label>
              <Input
                id="ef-duration"
                type="number"
                value={form.durationSeconds}
                onChange={(e) => setField("durationSeconds", e.target.value ? Number(e.target.value) : "")}
                placeholder="VD: 7200"
                min={0}
              />
            </div>

            <div className="space-y-1.5 flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ef-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setField("isActive", !!checked)}
                />
                <label className="text-sm font-medium" htmlFor="ef-active">
                  Hoạt động
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="ef-description">
              Mô tả
            </label>
            <Textarea
              id="ef-description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả về định dạng đề thi..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ef-from">
                Có hiệu lực từ
              </label>
              <Input
                id="ef-from"
                type="date"
                value={form.effectiveFrom}
                onChange={(e) => setField("effectiveFrom", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ef-to">
                Có hiệu lực đến
              </label>
              <Input
                id="ef-to"
                type="date"
                value={form.effectiveTo}
                onChange={(e) => setField("effectiveTo", e.target.value)}
                aria-invalid={!!errors.effectiveTo}
              />
              {errors.effectiveTo && <p className="text-xs text-destructive">{errors.effectiveTo}</p>}
            </div>
          </div>

          <Separator />
        </form>
      </Section>

      <Section title="Các phần thi">
        <p className="text-sm text-muted-foreground -mt-2">Thêm các phần thi cho định dạng này.</p>

        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có phần thi nào. Nhấn nút bên dưới để thêm.</p>
        )}

        {sections.map((section, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Phần thi #{section.position}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSection(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Tên phần thi <span className="text-destructive">*</span>
                </label>
                <Input
                  value={section.name}
                  onChange={(e) => setSectionField(index, "name", e.target.value)}
                  placeholder="VD: Listening, Reading"
                  aria-invalid={!!sectionErrors[index]?.name}
                />
                {sectionErrors[index]?.name && (
                  <p className="text-xs text-destructive">{sectionErrors[index].name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Thời lượng (giây)</label>
                <Input
                  type="number"
                  value={section.durationSeconds}
                  onChange={(e) => setSectionField(index, "durationSeconds", e.target.value ? Number(e.target.value) : "")}
                  placeholder="VD: 2400"
                  min={0}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số câu hỏi</label>
                <Input
                  type="number"
                  value={section.questionCount}
                  onChange={(e) => setSectionField(index, "questionCount", e.target.value ? Number(e.target.value) : "")}
                  placeholder="VD: 100"
                  min={0}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kỹ năng (section_type)</label>
                <Select
                  items={[
                    { value: SECTION_TYPE_NONE, label: "— Chưa gán —" },
                    ...SECTION_TYPE_OPTIONS,
                  ]}
                  value={section.sectionType || SECTION_TYPE_NONE}
                  onValueChange={(value) =>
                    setSectionField(
                      index,
                      "sectionType",
                      !value || value === SECTION_TYPE_NONE ? "" : value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kỹ năng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SECTION_TYPE_NONE}>— Chưa gán —</SelectItem>
                    {SECTION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                value={section.description}
                onChange={(e) => setSectionField(index, "description", e.target.value)}
                placeholder="Mô tả phần thi..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hướng dẫn</label>
              <Textarea
                value={section.instructions}
                onChange={(e) => setSectionField(index, "instructions", e.target.value)}
                placeholder="Hướng dẫn cho thí sinh..."
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addSection} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Thêm phần thi
        </Button>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/exam-formats")}
            disabled={createExamFormat.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit(e as unknown as React.FormEvent);
            }}
            disabled={createExamFormat.isPending}
          >
            {createExamFormat.isPending ? "Đang tạo..." : "Tạo định dạng đề thi"}
          </Button>
        </div>
      </Section>
    </div>
  );
}
