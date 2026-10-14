import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Separator } from "@fe/components/ui/separator";
import { Textarea } from "@fe/components/ui/textarea";
import { Checkbox } from "@fe/components/ui/checkbox";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@fe/components/ui/alert-dialog";
import {
  useExamFormat,
  useUpdateExamFormat,
  useExamFormatSections,
  useCreateExamFormatSection,
  useUpdateExamFormatSection,
  useDeleteExamFormatSection,
} from "@/features/exams/hooks/use-exam-formats";
import { useExamTypes } from "@/features/exams/hooks/use-exam-types";
import {
  SECTION_TYPE_NONE,
  SECTION_TYPE_OPTIONS,
  type CreateExamFormatSectionDto,
} from "@/features/exams/types/exam";

type SectionForm = CreateExamFormatSectionDto;

const emptySectionForm: SectionForm = {
  name: "",
  position: 0,
  durationSeconds: undefined,
  questionCount: undefined,
  description: "",
  instructions: "",
  sectionType: undefined,
};

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function PageSkeleton() {
  return (
    <div className="p-6 mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
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

function SectionForm({
  form,
  setField,
  errors,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  form: SectionForm;
  setField: (key: keyof SectionForm, value: any) => void;
  errors: Record<string, string | undefined>;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Tên phần thi <span className="text-destructive">*</span>
          </label>
          <Input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="VD: Listening Comprehension"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Thứ tự</label>
          <Input
            type="number"
            value={form.position}
            onChange={(e) => setField("position", Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Thời lượng (giây)</label>
          <Input
            type="number"
            value={form.durationSeconds ?? ""}
            onChange={(e) =>
              setField("durationSeconds", e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="VD: 3600"
            min={0}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Số câu hỏi</label>
          <Input
            type="number"
            value={form.questionCount ?? ""}
            onChange={(e) =>
              setField("questionCount", e.target.value ? Number(e.target.value) : undefined)
            }
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
            value={form.sectionType || SECTION_TYPE_NONE}
            onValueChange={(value) =>
              setField("sectionType", value === SECTION_TYPE_NONE ? null : value)
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
          value={form.description ?? ""}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Mô tả về phần thi..."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Hướng dẫn</label>
        <Textarea
          value={form.instructions ?? ""}
          onChange={(e) => setField("instructions", e.target.value)}
          placeholder="Hướng dẫn cho phần thi..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Hủy
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={isPending}>
          {isPending ? "Đang lưu..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default function ExamFormatEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formatId = Number(id);

  const { data: examFormat, isLoading } = useExamFormat(formatId);
  const updateExamFormat = useUpdateExamFormat();
  const { data: examTypes = [] } = useExamTypes();

  const { data: sections = [], isLoading: isSectionsLoading } = useExamFormatSections(formatId);
  const createSection = useCreateExamFormatSection();
  const updateSection = useUpdateExamFormatSection();
  const deleteSection = useDeleteExamFormatSection();

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
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionForm, setSectionForm] = useState<SectionForm>({ ...emptySectionForm });
  const [sectionErrors, setSectionErrors] = useState<Record<string, string | undefined>>({});
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionForm, setEditingSectionForm] = useState<SectionForm>({ ...emptySectionForm });
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    if (examFormat) {
      setForm({
        examTypeId: String(examFormat.examTypeId),
        name: examFormat.name,
        version: examFormat.version ?? "",
        description: examFormat.description ?? "",
        durationSeconds: examFormat.durationSeconds ?? "",
        isActive: examFormat.isActive,
        effectiveFrom: examFormat.effectiveFrom ?? "",
        effectiveTo: examFormat.effectiveTo ?? "",
      });
    }
  }, [examFormat]);

  const setField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setSectionField = (key: keyof SectionForm, value: any) => {
    setSectionForm((prev) => ({ ...prev, [key]: value }));
    setSectionErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setEditingField = (key: keyof SectionForm, value: any) => {
    setEditingSectionForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Tên định dạng không được để trống";
    if (form.effectiveFrom && form.effectiveTo) {
      if (new Date(form.effectiveFrom) > new Date(form.effectiveTo)) {
        errs.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tid = toast.loading("Đang cập nhật định dạng đề thi...");
    try {
      await updateExamFormat.mutateAsync({
        id: formatId,
        data: {
          name: form.name.trim(),
          version: form.version.trim() || undefined,
          description: form.description.trim() || undefined,
          durationSeconds: form.durationSeconds !== "" ? Number(form.durationSeconds) : undefined,
          isActive: form.isActive,
          effectiveFrom: form.effectiveFrom || undefined,
          effectiveTo: form.effectiveTo || undefined,
        },
      });
      toast.success("Cập nhật định dạng đề thi thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const validateSection = (s: SectionForm) => {
    const errs: Record<string, string> = {};
    if (!s.name.trim()) errs.name = "Tên phần thi không được để trống";
    return errs;
  };

  const handleCreateSection = async () => {
    const errs = validateSection(sectionForm);
    if (Object.keys(errs).length > 0) {
      setSectionErrors(errs);
      return;
    }

    const maxPosition = sections.length > 0 ? Math.max(...sections.map((s) => s.position)) : -1;

    const tid = toast.loading("Đang thêm phần thi...");
    try {
      await createSection.mutateAsync({
        formatId,
        data: {
          name: sectionForm.name.trim(),
          position: sectionForm.position || maxPosition + 1,
          durationSeconds: sectionForm.durationSeconds,
          questionCount: sectionForm.questionCount,
          description: sectionForm.description?.trim() || undefined,
          instructions: sectionForm.instructions?.trim() || undefined,
          sectionType: sectionForm.sectionType || null,
        },
      });
      toast.success("Thêm phần thi thành công!", { id: tid });
      setSectionForm({ ...emptySectionForm });
      setShowAddSection(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleStartEdit = (section: (typeof sections)[0]) => {
    setEditingSectionId(section.id);
    setEditingSectionForm({
      name: section.name,
      position: section.position,
      durationSeconds: section.durationSeconds ?? undefined,
      questionCount: section.questionCount ?? undefined,
      description: section.description ?? "",
      instructions: section.instructions ?? "",
      sectionType: section.sectionType ?? "",
    });
  };

  const handleUpdateSection = async (sectionId: number) => {
    const errs = validateSection(editingSectionForm);
    if (Object.keys(errs).length > 0) {
      setSectionErrors(errs);
      return;
    }

    const tid = toast.loading("Đang cập nhật phần thi...");
    try {
      await updateSection.mutateAsync({
        sectionId,
        data: {
          name: editingSectionForm.name.trim(),
          position: editingSectionForm.position,
          durationSeconds: editingSectionForm.durationSeconds,
          questionCount: editingSectionForm.questionCount,
          description: editingSectionForm.description?.trim() || undefined,
          instructions: editingSectionForm.instructions?.trim() || undefined,
          sectionType: editingSectionForm.sectionType || null,
        },
      });
      toast.success("Cập nhật phần thi thành công!", { id: tid });
      setEditingSectionId(null);
      setSectionErrors({});
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleDeleteSection = async () => {
    if (deleteTargetId === null) return;
    const tid = toast.loading("Đang xóa phần thi...");
    try {
      await deleteSection.mutateAsync(deleteTargetId);
      toast.success("Xóa phần thi thành công!", { id: tid });
      setDeleteTargetId(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!examFormat) {
    return (
      <div className="p-6">
        <p>Không tìm thấy định dạng đề thi</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/exam-formats/${id}`)} className="-ml-2">
        <ArrowLeft className="size-4" />
        Quay lại chi tiết
      </Button>

      <Section title="Chỉnh sửa định dạng đề thi">
        <p className="text-sm text-muted-foreground -mt-2">
          Cập nhật thông tin định dạng đề thi <span className="font-medium">{examFormat.name}</span>.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Loại đề thi
              </label>
              <Select
                value={form.examTypeId}
                items={examTypes.map((et) => ({ value: String(et.id), label: et.name }))}
                onValueChange={(v) => setField("examTypeId", v ?? "")}
              >
                <SelectTrigger>
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/exam-formats/${id}`)}
              disabled={updateExamFormat.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="outline" disabled={updateExamFormat.isPending}>
              {updateExamFormat.isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </Section>

      <Separator />

      <Section title="Các phần thi (Sections)">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Quản lý các phần thi thuộc định dạng đề thi này.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setShowAddSection(!showAddSection);
              setSectionForm({
                ...emptySectionForm,
                position: sections.length > 0 ? Math.max(...sections.map((s) => s.position)) + 1 : 0,
              });
              setSectionErrors({});
            }}
          >
            <Plus className="size-4 mr-1" />
            Thêm phần thi
          </Button>
        </div>

        {showAddSection && (
          <SectionForm
            form={sectionForm}
            setField={setSectionField}
            errors={sectionErrors}
            onSubmit={() => void handleCreateSection()}
            onCancel={() => {
              setShowAddSection(false);
              setSectionErrors({});
            }}
            isPending={createSection.isPending}
            submitLabel="Thêm"
          />
        )}

        {isSectionsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Chưa có phần thi nào. Nhấn "Thêm phần thi" để bắt đầu.
          </div>
        ) : (
          <div className="space-y-3">
            {[...sections]
              .sort((a, b) => a.position - b.position)
              .map((section) =>
                editingSectionId === section.id ? (
                  <SectionForm
                    key={section.id}
                    form={editingSectionForm}
                    setField={setEditingField}
                    errors={sectionErrors}
                    onSubmit={() => void handleUpdateSection(section.id)}
                    onCancel={() => {
                      setEditingSectionId(null);
                      setSectionErrors({});
                    }}
                    isPending={updateSection.isPending}
                    submitLabel="Cập nhật"
                  />
                ) : (
                  <div
                    key={section.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-9 rounded-md bg-primary/10 text-primary text-sm font-bold">
                        {section.position}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{section.name}</span>
                          {section.sectionType && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              {section.sectionType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{formatDuration(section.durationSeconds)}</span>
                          {section.questionCount != null && (
                            <span>{section.questionCount} câu hỏi</span>
                    )}
                  </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleStartEdit(section)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTargetId(section.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              )}
          </div>
        )}
      </Section>

      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phần thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phần thi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>Hủy</AlertDialogClose>
            <Button variant="destructive" onClick={() => void handleDeleteSection()}>
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}
