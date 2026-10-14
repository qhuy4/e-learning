import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  Copy,
  Headphones,
  Image,
  FileText,
  Type,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Upload,
  ClipboardPaste,
  FileArchive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueries, useQueryClient } from "@tanstack/react-query";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Textarea } from "@fe/components/ui/textarea";
import { Separator } from "@fe/components/ui/separator";
import { Badge } from "@fe/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fe/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fe/components/ui/dropdown-menu";
import { Checkbox } from "@fe/components/ui/checkbox";
import {
  useExam,
  useExamSections,
  useExamQuestionGroups,
  useCreateExamQuestionGroup,
  useUpdateExamQuestionGroup,
  useDeleteExamQuestionGroup,
  useExamGroupMaterials,
  useExamQuestions,
  useExamSectionQuestions,
  useCreateExamGroupMaterial,
  useUpdateExamGroupMaterial,
  useDeleteExamGroupMaterial,
  useCreateExamQuestion,
  useCreateExamQuestionInSection,
  useUpdateExamQuestion,
  useDeleteExamQuestion,
  examKeys,
} from "@/features/exams/hooks/use-exams";
import {
  ExamStatus,
  ExamMaterialType,
  QuestionType,
  QUESTION_TYPE_LABELS,
  QUESTION_GROUP_TYPE_LABELS,
  ExamGroupType,
} from "@/features/exams/types/exam";
import type {
  AdminExamSection,
  AdminExamQuestionGroup,
  AdminExamGroupMaterial,
  AdminExamQuestion,
} from "@/features/exams/types/exam";
import { examService } from "@/features/exams/services/exam.service";
import { BulkPasteQuestionsDialog } from "@/features/exams/components/bulk-paste-questions-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";


const QUESTIONS_PER_PAGE = 20;

/**
 * Native HTML5 drag & drop reordering.
 * Drag starts only from the handle (so inputs inside cards stay selectable);
 * the drop target is the row/card itself.
 */
function useDragReorder(onReorder: (from: number, to: number) => void) {
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const dragHandleProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      dragIndex.current = index;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    onDragEnd: () => {
      dragIndex.current = null;
      setOverIndex(null);
    },
  });

  const dropTargetProps = (index: number) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragIndex.current !== null) setOverIndex(index);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIndex.current;
      dragIndex.current = null;
      setOverIndex(null);
      if (from === null || from === index) return;
      onReorder(from, index);
    },
  });

  const isOver =
    (index: number) =>
    overIndex === index && dragIndex.current !== null && dragIndex.current !== index;

  return { dragHandleProps, dropTargetProps, isOver };
}

const GROUP_TYPE_ICONS: Record<ExamGroupType, LucideIcon> = {
  AUDIO: Headphones,
  PASSAGE: FileText,
  IMAGE: Image,
  CUSTOM: Users,
};

const GROUP_TYPE_OPTIONS: ExamGroupType[] = [
  ExamGroupType.AUDIO,
  ExamGroupType.PASSAGE,
  ExamGroupType.IMAGE,
  ExamGroupType.CUSTOM,
];

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  [ExamMaterialType.TEXT]: "Văn bản",
  [ExamMaterialType.PASSAGE]: "Đoạn văn",
  [ExamMaterialType.AUDIO]: "Âm thanh",
  [ExamMaterialType.IMAGE]: "Hình ảnh",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "\u2014";
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

function MaterialTypeIcon({ type }: { type: ExamMaterialType }) {
  switch (type) {
    case ExamMaterialType.AUDIO:
      return <Headphones className="h-4 w-4" />;
    case ExamMaterialType.IMAGE:
      return <Image className="h-4 w-4" />;
    case ExamMaterialType.PASSAGE:
    case ExamMaterialType.TEXT:
      return <FileText className="h-4 w-4" />;
    default:
      return <Type className="h-4 w-4" />;
  }
}

interface MaterialFormProps {
  groupId: number;
  nextPosition?: number;
  editingMaterial: AdminExamGroupMaterial | null;
  onDone: () => void;
}

function MaterialForm({ groupId, nextPosition, editingMaterial, onDone }: MaterialFormProps) {
  const createMaterial = useCreateExamGroupMaterial();
  const updateMaterial = useUpdateExamGroupMaterial();

  const [type, setType] = useState<ExamMaterialType>(ExamMaterialType.TEXT);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingMaterial) {
      setType(editingMaterial.type);
      setTitle(editingMaterial.title ?? "");
      setPosition(editingMaterial.position);
      setContent(editingMaterial.content ?? "");
      setFileUrl(editingMaterial.fileUrl ?? "");
      setTranscript(editingMaterial.transcript ?? "");
    }
  }, [editingMaterial]);

  const handleFileUpload = async (file: File) => {
    const maxSize = type === ExamMaterialType.IMAGE ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Kích thước file không được vượt quá ${type === ExamMaterialType.IMAGE ? "10MB" : "50MB"}`);
      return;
    }

    const tid = toast.loading("Đang tải file lên...");
    setUploading(true);
    try {
      const result = await examService.uploadFile(file);
      setFileUrl(result.url);
      toast.success("Tải file lên thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Tải file lên thất bại";
      toast.error(message, { id: tid });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileUrl("");
  };

  const isEditing = !!editingMaterial;
  const isPending = createMaterial.isPending || updateMaterial.isPending;
  const showContent = type === ExamMaterialType.TEXT || type === ExamMaterialType.PASSAGE;
  const showFileUrl = type === ExamMaterialType.AUDIO || type === ExamMaterialType.IMAGE;
  const showTranscript = type === ExamMaterialType.AUDIO;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }

    const tid = toast.loading(isEditing ? "Đang cập nhật tài liệu..." : "Đang tạo tài liệu...");
    try {
      if (isEditing) {
        await updateMaterial.mutateAsync({
          id: editingMaterial.id,
          data: {
            type,
            title: title.trim(),
            position: position !== "" ? Number(position) : 0,
            content: showContent ? content.trim() : undefined,
            fileUrl: showFileUrl ? (fileUrl.trim() || undefined) : undefined,
            transcript: showTranscript ? (transcript.trim() || undefined) : undefined,
          },
        });
        toast.success("Cập nhật tài liệu thành công!", { id: tid });
      } else {
        await createMaterial.mutateAsync({
          groupId,
          data: {
            type,
            title: title.trim(),
            position: position !== "" ? Number(position) : (nextPosition ?? 0),
            content: showContent ? (content.trim() || undefined) : undefined,
            fileUrl: showFileUrl ? (fileUrl.trim() || undefined) : undefined,
            transcript: showTranscript ? (transcript.trim() || undefined) : undefined,
          },
        });
        toast.success("Tạo tài liệu thành công!", { id: tid });
      }
      onDone();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <h4 className="font-semibold mb-4">{isEditing ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}</h4>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Loại tài liệu <span className="text-destructive">*</span>
            </label>
            <Select
              value={type}
              items={MATERIAL_TYPE_LABELS}
              onValueChange={(v) => v && setType(v as ExamMaterialType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ExamMaterialType.TEXT}>Văn bản</SelectItem>
                <SelectItem value={ExamMaterialType.PASSAGE}>Đoạn văn</SelectItem>
                <SelectItem value={ExamMaterialType.AUDIO}>Âm thanh</SelectItem>
                <SelectItem value={ExamMaterialType.IMAGE}>Hình ảnh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tiêu đề <span className="text-destructive">*</span>
            </label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề" />
          </div>
        </div>

        {showContent && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nội dung</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập nội dung" rows={4} />
          </div>
        )}

        {showFileUrl && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tệp tin</label>
            {fileUrl ? (
              <div className="space-y-2">
                {type === ExamMaterialType.IMAGE && (
                  <img src={fileUrl} alt="Preview" className="max-h-48 rounded-lg border" />
                )}
                {type === ExamMaterialType.AUDIO && (
                  <audio controls src={fileUrl} className="w-full" />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Thay file trực tiếp — không cần xóa trước */}
                  <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-muted">
                    <input
                      type="file"
                      className="hidden"
                      accept={type === ExamMaterialType.IMAGE ? "image/png,image/jpeg,image/webp" : "audio/mpeg,audio/mp3,audio/wav,audio/ogg"}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleFileUpload(file);
                      }}
                    />
                    Thay file
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={uploading}
                  >
                    Xóa
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {type === ExamMaterialType.IMAGE
                    ? "PNG, JPG, WEBP (tối đa 10MB)"
                    : "MP3, WAV, OGG (tối đa 50MB)"}
                </p>
              </div>
            ) : (
              <label className="relative border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept={type === ExamMaterialType.IMAGE ? "image/png,image/jpeg,image/webp" : "audio/mpeg,audio/mp3,audio/wav,audio/ogg"}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) handleFileUpload(file);
                  }}
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Chọn file hoặc kéo thả vào đây</p>
                <p className="text-xs text-muted-foreground">
                  {type === ExamMaterialType.IMAGE ? "PNG, JPG, WEBP (tối đa 10MB)" : "MP3, WAV, OGG (tối đa 50MB)"}
                </p>
              </label>
            )}
            {uploading && <p className="text-xs text-muted-foreground">Đang tải file lên...</p>}
          </div>
        )}

        {showTranscript && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Transcript</label>
            <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Nhập transcript cho âm thanh" rows={3} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEditing ? "Đang cập nhật..." : "Đang tạo...") : (isEditing ? "Cập nhật" : "Tạo mới")}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface MaterialsSectionProps {
  groupId: number;
  materials: AdminExamGroupMaterial[];
  loadingMaterials: boolean;
}

function MaterialsSection({ groupId, materials, loadingMaterials }: MaterialsSectionProps) {
  const deleteMaterial = useDeleteExamGroupMaterial();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AdminExamGroupMaterial | null>(null);

  const handleEdit = (material: AdminExamGroupMaterial) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDelete = async (material: AdminExamGroupMaterial) => {
    const ok = await confirm({
      title: "Xóa tài liệu",
      description: `Bạn có chắc chắn muốn xóa tài liệu${material.title ? ` "${material.title}"` : ""}? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa tài liệu...");
    try {
      await deleteMaterial.mutateAsync(material.id);
      toast.success("Xóa tài liệu thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  if (loadingMaterials) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-16 bg-muted rounded" />
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Tài liệu tham khảo ({materials.length})</h4>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingMaterial(null);
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài liệu
          </Button>
        )}
      </div>

      {showForm && (
        <MaterialForm
          groupId={groupId}
          nextPosition={Math.max(0, ...materials.map((m) => m.position)) + 1}
          editingMaterial={editingMaterial}
          onDone={handleFormDone}
        />
      )}

      {materials.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Chưa có tài liệu nào. Nhấn nút "Thêm tài liệu" để bắt đầu.
        </p>
      ) : (
        <div className="space-y-3">
          {materials.map((mat) => (
            <div key={mat.id} className="space-y-3 rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <MaterialTypeIcon type={mat.type} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{mat.title || MATERIAL_TYPE_LABELS[mat.type] || "Tài liệu"}</p>
                    <p className="text-xs text-muted-foreground">{MATERIAL_TYPE_LABELS[mat.type] || mat.type}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" className="size-8 p-0" title="Chỉnh sửa" onClick={() => handleEdit(mat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    title="Xóa"
                    onClick={() => void handleDelete(mat)}
                    disabled={deleteMaterial.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Preview by material type */}
              {mat.type === ExamMaterialType.AUDIO &&
                (mat.fileUrl ? (
                  <audio controls src={mat.fileUrl} className="w-full" />
                ) : (
                  <p className="text-xs text-muted-foreground">Chưa có tệp âm thanh.</p>
                ))}
              {mat.type === ExamMaterialType.IMAGE && mat.fileUrl && (
                <img src={mat.fileUrl} alt={mat.title ?? "Hình ảnh"} className="max-h-40 rounded-lg border" />
              )}
              {(mat.type === ExamMaterialType.PASSAGE || mat.type === ExamMaterialType.TEXT) && mat.content && (
                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{mat.content}</p>
              )}
              {mat.type === ExamMaterialType.AUDIO && mat.transcript && (
                <p className="line-clamp-3 text-xs text-muted-foreground">
                  <span className="font-medium">Transcript:</span> {mat.transcript}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

interface QuestionFormProps {
  sectionId?: number;
  groupId?: number;
  nextPosition?: number;
  editingQuestion: AdminExamQuestion | null;
  onDone: () => void;
}

function QuestionForm({ sectionId, groupId, nextPosition, editingQuestion, onDone }: QuestionFormProps) {
  const createQuestion = useCreateExamQuestion();
  const createQuestionInSection = useCreateExamQuestionInSection();
  const updateQuestion = useUpdateExamQuestion();

  const [type, setType] = useState<QuestionType | "">("");
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState<number | "">(1);
  const [position, setPosition] = useState<number | "">("");
  const [options, setOptions] = useState<{ content: string; isCorrect: boolean }[]>([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([
    { left: "", right: "" },
    { left: "", right: "" },
  ]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | "">("");
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");

  const isEditing = !!editingQuestion;
  const isPending = createQuestion.isPending || createQuestionInSection.isPending || updateQuestion.isPending;

  const hasOptions = type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.MULTI_SELECT;
  const isTrueFalse = type === QuestionType.TRUE_FALSE;
  const isFillBlank = type === QuestionType.FILL_BLANK;
  const isMatching = type === QuestionType.MATCHING;

  useEffect(() => {
    if (editingQuestion) {
      setType(editingQuestion.type);
      setQuestion(editingQuestion.question);
      setExplanation(editingQuestion.explanation ?? "");
      setPoints(editingQuestion.points);
      setPosition(editingQuestion.position);

      if (editingQuestion.options && editingQuestion.options.length > 0) {
        setOptions(editingQuestion.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect })));
      }

      if (editingQuestion.type === QuestionType.TRUE_FALSE && editingQuestion.options) {
        const correct = editingQuestion.options.find((o) => o.isCorrect);
        if (correct) {
          setTrueFalseAnswer(correct.content.toLowerCase().includes("true"));
        }
      }

      if (editingQuestion.type === QuestionType.FILL_BLANK) {
        const correct = editingQuestion.options?.find((o) => o.isCorrect);
        if (correct) setFillBlankAnswer(correct.content);
      }

      if (editingQuestion.type === QuestionType.MATCHING && editingQuestion.options) {
        const pairs: { left: string; right: string }[] = [];
        for (let i = 0; i < editingQuestion.options.length; i += 2) {
          pairs.push({
            left: editingQuestion.options[i]?.content ?? "",
            right: editingQuestion.options[i + 1]?.content ?? "",
          });
        }
        if (pairs.length > 0) setMatchingPairs(pairs);
      }
    }
  }, [editingQuestion]);

  const addOption = () => setOptions((prev) => [...prev, { content: "", isCorrect: false }]);
  const removeOption = (index: number) => {
    if (options.length <= 2) { toast.error("Phải có ít nhất 2 đáp án"); return; }
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };
  const updateOption = (index: number, field: "content" | "isCorrect", value: string | boolean) => {
    if (type === QuestionType.MULTIPLE_CHOICE && field === "isCorrect") {
      setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index ? !!value : false })));
    } else {
      setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
    }
  };

  const addPair = () => setMatchingPairs((prev) => [...prev, { left: "", right: "" }]);
  const removePair = (index: number) => {
    if (matchingPairs.length <= 2) { toast.error("Phải có ít nhất 2 cặp"); return; }
    setMatchingPairs((prev) => prev.filter((_, i) => i !== index));
  };
  const updatePair = (index: number, field: "left" | "right", value: string) => {
    setMatchingPairs((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const buildOptions = (): { content: string; isCorrect: boolean; position: number }[] => {
    if (!type) return [];

    if (hasOptions) {
      return options.filter((o) => o.content.trim()).map((o, i) => ({
        content: o.content.trim(),
        isCorrect: o.isCorrect,
        position: i + 1,
      }));
    }

    if (isTrueFalse) {
      return [
        { content: "True", isCorrect: trueFalseAnswer === true, position: 1 },
        { content: "False", isCorrect: trueFalseAnswer === false, position: 2 },
      ];
    }

    if (isFillBlank) {
      return [{ content: fillBlankAnswer.trim(), isCorrect: true, position: 1 }];
    }

    if (isMatching) {
      const result: { content: string; isCorrect: boolean; position: number }[] = [];
      matchingPairs.forEach((pair, i) => {
        result.push({ content: pair.left, isCorrect: false, position: i * 2 + 1 });
        result.push({ content: pair.right, isCorrect: true, position: i * 2 + 2 });
      });
      return result;
    }

    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) { toast.error("Vui lòng chọn loại câu hỏi"); return; }
    if (!question.trim()) { toast.error("Nội dung câu hỏi không được để trống"); return; }

    if (hasOptions) {
      const validOpts = options.filter((o) => o.content.trim());
      if (validOpts.length < 2) { toast.error("Phải có ít nhất 2 đáp án có nội dung"); return; }
      if (!validOpts.some((o) => o.isCorrect)) { toast.error("Phải chọn ít nhất 1 đáp án đúng"); return; }
    }

    if (isTrueFalse && trueFalseAnswer === "") { toast.error("Vui lòng chọn True hoặc False"); return; }
    if (isFillBlank && !fillBlankAnswer.trim()) { toast.error("Đáp án không được để trống"); return; }

    if (isMatching) {
      const validPairs = matchingPairs.filter((p) => p.left.trim() && p.right.trim());
      if (validPairs.length < 2) { toast.error("Phải có ít nhất 2 cặp matching hợp lệ"); return; }
    }

    const finalPosition = position !== "" ? Number(position) : (nextPosition ?? 0);
    const builtOptions = buildOptions();

    const tid = toast.loading(isEditing ? "Đang cập nhật câu hỏi..." : "Đang tạo câu hỏi...");
    try {
      if (isEditing) {
        await updateQuestion.mutateAsync({
          id: editingQuestion.id,
          data: {
            type: type as QuestionType,
            question: question.trim(),
            explanation: explanation.trim() || undefined,
            points: points !== "" ? Number(points) : 1,
            position: finalPosition,
            options: builtOptions,
          },
        });
        toast.success("Cập nhật câu hỏi thành công!", { id: tid });
      } else {
        const payload = {
          type: type as QuestionType,
          question: question.trim(),
          explanation: explanation.trim() || undefined,
          points: points !== "" ? Number(points) : 1,
          position: finalPosition,
          options: builtOptions,
        };
        if (groupId !== undefined) {
          await createQuestion.mutateAsync({ groupId, data: payload });
        } else if (sectionId !== undefined) {
          await createQuestionInSection.mutateAsync({ sectionId, data: payload });
        } else {
          throw new Error("Thiếu vị trí lưu câu hỏi");
        }
        toast.success("Tạo câu hỏi thành công!", { id: tid });
      }
      onDone();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <h4 className="font-semibold mb-4">{isEditing ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</h4>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Loại câu hỏi <span className="text-destructive">*</span>
            </label>
            <Select
              value={type}
              items={QUESTION_TYPE_LABELS}
              onValueChange={(v) => v && setType(v as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại câu hỏi" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((qt) => (
                  <SelectItem key={qt} value={qt}>
                    {QUESTION_TYPE_LABELS[qt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Điểm</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value ? Number(e.target.value) : "")}
              min={0}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {isTrueFalse ? "Câu hỏi" : isFillBlank ? "Câu hỏi (dùng ___ để đánh dấu chỗ trống)" : "Nội dung câu hỏi"} <span className="text-destructive">*</span>
          </label>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={isTrueFalse ? "Nhập câu hỏi" : isFillBlank ? "VD: The capital of France is ___" : "Nhập nội dung câu hỏi"} rows={3} />
        </div>

        {hasOptions && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Đáp án {type === QuestionType.MULTI_SELECT ? "(chọn nhiều đáp án đúng)" : "(chọn 1 đáp án đúng)"}
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="mr-1 h-3 w-3" />
                Thêm đáp án
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <Input
                    value={opt.content}
                    onChange={(e) => updateOption(idx, "content", e.target.value)}
                    placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      checked={opt.isCorrect}
                      onCheckedChange={(checked) => updateOption(idx, "isCorrect", !!checked)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Đúng</span>
                  </div>
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isTrueFalse && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Đáp án <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={trueFalseAnswer === true ? "default" : "outline"}
                onClick={() => setTrueFalseAnswer(true)}
              >
                True
              </Button>
              <Button
                type="button"
                variant={trueFalseAnswer === false ? "default" : "outline"}
                onClick={() => setTrueFalseAnswer(false)}
              >
                False
              </Button>
            </div>
          </div>
        )}

        {isFillBlank && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Đáp án đúng <span className="text-destructive">*</span>
            </label>
            <Input
              value={fillBlankAnswer}
              onChange={(e) => setFillBlankAnswer(e.target.value)}
              placeholder="Nhập đáp án đúng"
            />
          </div>
        )}

        {isMatching && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Cặp matching <span className="text-destructive">*</span>
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addPair}>
                <Plus className="mr-1 h-3 w-3" />
                Thêm cặp
              </Button>
            </div>
            <div className="space-y-2">
              {matchingPairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
                  <Input
                    value={pair.left}
                    onChange={(e) => updatePair(idx, "left", e.target.value)}
                    placeholder="Bên trái"
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">↔</span>
                  <Input
                    value={pair.right}
                    onChange={(e) => updatePair(idx, "right", e.target.value)}
                    placeholder="Bên phải"
                    className="flex-1"
                  />
                  {matchingPairs.length > 2 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePair(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(type === QuestionType.SHORT_ANSWER || type === QuestionType.ESSAY || type === QuestionType.AUDIO_RECORD) && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {type === QuestionType.SHORT_ANSWER && "Câu trả lời ngắn - học viên sẽ nhập text. Đáp án sẽ được chấm thủ công hoặc tự động."}
            {type === QuestionType.ESSAY && "Câu hỏi tự luận - học viên sẽ viết đoạn văn. Đáp án sẽ được chấm thủ công."}
            {type === QuestionType.AUDIO_RECORD && "Câu hỏi ghi âm - học viên sẽ thu âm. Đáp án sẽ được chấm thủ công."}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Giải thích</label>
          <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Nhập giải thích (tùy chọn)" rows={2} />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEditing ? "Đang cập nhật..." : "Đang tạo...") : (isEditing ? "Cập nhật" : "Tạo mới")}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface QuestionsSectionProps {
  groupId: number;
  questions: AdminExamQuestion[];
  loadingQuestions: boolean;
}

function QuestionsSection({ groupId, questions, loadingQuestions }: QuestionsSectionProps) {
  const deleteQuestion = useDeleteExamQuestion();
  const createQuestion = useCreateExamQuestion();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminExamQuestion | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * QUESTIONS_PER_PAGE;
  const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, questions.length);
  const paginatedQuestions = questions.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [questions.length]);

  const handleEdit = (question: AdminExamQuestion) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (question: AdminExamQuestion) => {
    const ok = await confirm({
      title: "Xóa câu hỏi",
      description: `Bạn có chắc chắn muốn xóa câu "${question.question.slice(0, 80)}"? Các phương án đi kèm sẽ bị xóa theo.`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa câu hỏi...");
    try {
      await deleteQuestion.mutateAsync(question.id);
      toast.success("Xóa câu hỏi thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleDuplicate = async (question: AdminExamQuestion) => {
    const tid = toast.loading("Đang nhân bản câu hỏi...");
    try {
      await createQuestion.mutateAsync({
        groupId,
        data: {
          type: question.type,
          question: question.question,
          explanation: question.explanation ?? undefined,
          points: question.points,
          position: Math.max(0, ...questions.map((q) => q.position)) + 1,
          options: (question.options ?? []).map((o) => ({
            content: o.content,
            isCorrect: o.isCorrect,
            position: o.position,
          })),
        },
      });
      toast.success("Đã nhân bản câu hỏi!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleReorder = async (fromLocal: number, toLocal: number) => {
    const list = [...questions];
    const [moved] = list.splice(startIdx + fromLocal, 1);
    list.splice(startIdx + toLocal, 0, moved);
    const tid = toast.loading("Đang lưu thứ tự...");
    try {
      for (let i = 0; i < list.length; i++) {
        if (list[i].position !== i + 1) {
          await examService.updateQuestion(list[i].id, { position: i + 1 });
        }
      }
      await queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Đã lưu thứ tự!", { id: tid });
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra", { id: tid });
    }
  };

  const { dragHandleProps, dropTargetProps, isOver } = useDragReorder(handleReorder);

  if (loadingQuestions) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Câu hỏi ({questions.length})</h4>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => { setEditingQuestion(null); setShowForm(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm câu hỏi
          </Button>
        )}
      </div>

      {showForm && (
        <QuestionForm
          groupId={groupId}
          nextPosition={Math.max(0, ...questions.map((q) => q.position)) + 1}
          editingQuestion={editingQuestion}
          onDone={handleFormDone}
        />
      )}

      {questions.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Chưa có câu hỏi nào. Nhấn nút "Thêm câu hỏi" để bắt đầu.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedQuestions.map((q, qi) => (
              <div
                key={q.id}
                {...dropTargetProps(qi)}
                className={`rounded-xl border bg-card p-6 space-y-4 transition-colors ${isOver(qi) ? "border-primary ring-1 ring-primary/40" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    {...dragHandleProps(qi)}
                    className="mt-1 cursor-grab text-muted-foreground/50 active:cursor-grabbing"
                    title="Kéo để sắp xếp"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <span className="inline-flex items-center justify-center size-7 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-bold shrink-0">
                    {startIdx + qi + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
                        {QUESTION_TYPE_LABELS[q.type] || q.type}
                      </span>
                      <span>{q.points} điểm</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="size-8 p-0" title="Chỉnh sửa" onClick={() => handleEdit(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="size-8 p-0" title="Nhân bản" onClick={() => void handleDuplicate(q)} disabled={createQuestion.isPending}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="size-8 p-0" title="Xóa" onClick={() => void handleDelete(q)} disabled={deleteQuestion.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {q.options && q.options.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {q.options.map((opt) => (
                      <div key={opt.id} className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${opt.isCorrect ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20" : ""}`}>
                        {opt.isCorrect ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <span className="h-4 w-4 shrink-0" />
                        )}
                        <span>{opt.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <div className="ml-10 text-sm text-muted-foreground italic border-t pt-3">
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {startIdx + 1}-{endIdx} / {questions.length} câu hỏi
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {safeCurrentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

interface GroupPanelProps {
  group: AdminExamQuestionGroup;
  defaultOpen?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

function GroupPanel({ group, defaultOpen = false, dragHandleProps }: GroupPanelProps) {
  const { data: materials = [], isLoading: loadingMaterials } = useExamGroupMaterials(group.id);
  const { data: questions = [], isLoading: loadingQuestions } = useExamQuestions(group.id);
  const deleteGroup = useDeleteExamQuestionGroup();
  const updateGroup = useUpdateExamQuestionGroup();
  const createGroup = useCreateExamQuestionGroup();
  const createMaterial = useCreateExamGroupMaterial();
  const createQuestion = useCreateExamQuestion();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();

  const [open, setOpen] = useState(defaultOpen);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(group.title ?? "");
  const [editInstructions, setEditInstructions] = useState(group.instructions ?? "");
  const [editType, setEditType] = useState<ExamGroupType>(group.groupType ?? ExamGroupType.CUSTOM);

  useEffect(() => {
    setEditTitle(group.title ?? "");
    setEditInstructions(group.instructions ?? "");
    setEditType(group.groupType ?? ExamGroupType.CUSTOM);
  }, [group.title, group.instructions, group.groupType]);

  const groupType = group.groupType ?? ExamGroupType.CUSTOM;
  const GroupIcon = GROUP_TYPE_ICONS[groupType] ?? Users;

  const handleSaveEdit = async () => {
    const tid = toast.loading("Đang cập nhật nhóm...");
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        data: {
          groupType: editType,
          title: editTitle.trim(),
          instructions: editInstructions.trim(),
        },
      });
      toast.success("Cập nhật nhóm thành công!", { id: tid });
      setShowEdit(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleDeleteGroup = async () => {
    const ok = await confirm({
      title: "Xóa nhóm câu hỏi",
      description: "Bạn có chắc chắn muốn xóa nhóm câu hỏi này? Tất cả tài liệu và câu hỏi trong nhóm cũng sẽ bị xóa.",
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa nhóm câu hỏi...");
    try {
      await deleteGroup.mutateAsync(group.id);
      toast.success("Xóa nhóm câu hỏi thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleDuplicateGroup = async () => {
    const tid = toast.loading("Đang nhân bản nhóm...");
    try {
      const newGroup = await createGroup.mutateAsync({
        sectionId: group.sectionId,
        data: {
          groupType,
          title: group.title ? `${group.title} (bản sao)` : undefined,
          instructions: group.instructions ?? undefined,
          position: group.position + 1,
        },
      });
      for (const mat of materials) {
        await createMaterial.mutateAsync({
          groupId: newGroup.id,
          data: {
            type: mat.type,
            title: mat.title ?? undefined,
            content: mat.content ?? undefined,
            fileUrl: mat.fileUrl ?? undefined,
            transcript: mat.transcript ?? undefined,
            position: mat.position,
          },
        });
      }
      for (const q of questions) {
        await createQuestion.mutateAsync({
          groupId: newGroup.id,
          data: {
            type: q.type,
            question: q.question,
            explanation: q.explanation ?? undefined,
            points: q.points,
            position: q.position,
            options: (q.options ?? []).map((o) => ({
              content: o.content,
              isCorrect: o.isCorrect,
              position: o.position,
            })),
          },
        });
      }
      toast.success("Đã nhân bản nhóm câu hỏi!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-1 px-4 py-3">
        <span
          {...dragHandleProps}
          className="cursor-grab text-muted-foreground/50 active:cursor-grabbing"
          title="Kéo để sắp xếp"
        >
          <GripVertical className="h-4 w-4" />
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <GroupIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold">{group.title || `Nhóm ${group.position}`}</span>
              <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                {QUESTION_GROUP_TYPE_LABELS[groupType]}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {materials.length} tài liệu · {questions.length} câu hỏi
              {group.instructions ? ` · ${group.instructions}` : ""}
            </span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" className="size-8 p-0" title="Chỉnh sửa" onClick={() => setShowEdit((v) => !v)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="size-8 p-0" title="Nhân bản" onClick={() => void handleDuplicateGroup()} disabled={createGroup.isPending}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="size-8 p-0" title="Xóa" onClick={() => void handleDeleteGroup()} disabled={deleteGroup.isPending}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t px-4 py-4">
          {showEdit && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tên nhóm</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Tên nhóm (tùy chọn)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Loại nhóm</label>
                  <Select
                    value={editType}
                    items={QUESTION_GROUP_TYPE_LABELS}
                    onValueChange={(v) => v && setEditType(v as ExamGroupType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {QUESTION_GROUP_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Hướng dẫn</label>
                <Textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="Nhập hướng dẫn (tùy chọn)"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowEdit(false)}>
                  Hủy
                </Button>
                <Button size="sm" onClick={() => void handleSaveEdit()} disabled={updateGroup.isPending}>
                  {updateGroup.isPending ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          )}

          <Tabs defaultValue="materials">
            <TabsList>
              <TabsTrigger value="materials">Tài liệu ({materials.length})</TabsTrigger>
              <TabsTrigger value="questions">Câu hỏi ({questions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="materials">
              <MaterialsSection groupId={group.id} materials={materials} loadingMaterials={loadingMaterials} />
            </TabsContent>
            <TabsContent value="questions">
              <QuestionsSection groupId={group.id} questions={questions} loadingQuestions={loadingQuestions} />
            </TabsContent>
          </Tabs>
        </div>
      )}
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

interface DirectQuestionsSectionProps {
  sectionId: number;
  questions: AdminExamQuestion[];
}

function DirectQuestionsSection({ sectionId, questions }: DirectQuestionsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminExamQuestion | null>(null);
  const deleteQuestion = useDeleteExamQuestion();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirmDialog();
  const createQuestionInSection = useCreateExamQuestionInSection();
  const queryClient = useQueryClient();

  const nextPosition = Math.max(0, ...questions.map((q) => q.position)) + 1;

  const handleEdit = (question: AdminExamQuestion) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };

  const handleDelete = async (question: AdminExamQuestion) => {
    const ok = await confirm({
      title: "Xóa câu hỏi",
      description: `Bạn có chắc chắn muốn xóa câu "${question.question.slice(0, 80)}"? Các phương án đi kèm sẽ bị xóa theo.`,
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (!ok) return;
    const tid = toast.loading("Đang xóa câu hỏi...");
    try {
      await deleteQuestion.mutateAsync(question.id);
      toast.success("Xóa câu hỏi thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleDuplicate = async (question: AdminExamQuestion) => {
    const tid = toast.loading("Đang nhân bản câu hỏi...");
    try {
      await createQuestionInSection.mutateAsync({
        sectionId,
        data: {
          type: question.type,
          question: question.question,
          explanation: question.explanation ?? undefined,
          points: question.points,
          position: nextPosition,
          options: (question.options ?? []).map((o) => ({
            content: o.content,
            isCorrect: o.isCorrect,
            position: o.position,
          })),
        },
      });
      toast.success("Đã nhân bản câu hỏi!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleReorder = async (from: number, to: number) => {
    const list = [...questions];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    const tid = toast.loading("Đang lưu thứ tự...");
    try {
      for (let i = 0; i < list.length; i++) {
        if (list[i].position !== i + 1) {
          await examService.updateQuestion(list[i].id, { position: i + 1 });
        }
      }
      await queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Đã lưu thứ tự!", { id: tid });
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra", { id: tid });
    }
  };

  const { dragHandleProps, dropTargetProps, isOver } = useDragReorder(handleReorder);

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h4 className="font-semibold">Câu hỏi trực lập</h4>
          <p className="text-xs text-muted-foreground">
            {questions.length} câu hỏi không thuộc nhóm nào
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              setEditingQuestion(null);
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm câu hỏi
          </Button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {showForm && (
          <QuestionForm
            sectionId={sectionId}
            nextPosition={nextPosition}
            editingQuestion={editingQuestion}
            onDone={handleFormDone}
          />
        )}

        {questions.length === 0 && !showForm ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Chưa có câu hỏi trực lập. Nhấn "Thêm câu hỏi" để bắt đầu.
          </p>
        ) : (
          questions.map((q, i) => (
            <div
              key={q.id}
              {...dropTargetProps(i)}
              className={`flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors ${isOver(i) ? "border-primary ring-1 ring-primary/40" : "hover:bg-muted/40"}`}
            >
              <span
                {...dragHandleProps(i)}
                className="mt-1 cursor-grab text-muted-foreground/50 active:cursor-grabbing"
                title="Kéo để sắp xếp"
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="font-medium">{q.question}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {QUESTION_TYPE_LABELS[q.type] || q.type}
                  </span>
                  <span>{q.points} điểm</span>
                </div>

                {q.options && q.options.length > 0 && (
                  <div className="space-y-1.5">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm ${opt.isCorrect ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20" : ""}`}
                      >
                        {opt.isCorrect ? (
                          <Check className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <span className="h-4 w-4 shrink-0" />
                        )}
                        <span>{opt.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <div className="border-t pt-2 text-sm italic text-muted-foreground">
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" className="size-8 p-0" title="Chỉnh sửa" onClick={() => handleEdit(q)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="size-8 p-0" title="Nhân bản" onClick={() => void handleDuplicate(q)} disabled={createQuestionInSection.isPending}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="size-8 p-0" title="Xóa" onClick={() => void handleDelete(q)} disabled={deleteQuestion.isPending}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}

interface SectionPanelProps {
  section: AdminExamSection;
}

const QUESTION_TYPE_OPTIONS = Object.values(QuestionType);

function SectionPanel({ section }: SectionPanelProps) {
  const { data: groups = [], isLoading: loadingGroups } = useExamQuestionGroups(section.id);
  const { data: directQuestions = [], isLoading: loadingDirect } = useExamSectionQuestions(section.id);
  const createGroup = useCreateExamQuestionGroup();
  const queryClient = useQueryClient();
  const [pasteOpen, setPasteOpen] = useState(false);

  // Group question counts feed the section progress (direct + grouped questions).
  const groupQuestionQueries = useQueries({
    queries: groups.map((group) => ({
      queryKey: examKeys.questions(group.id),
      queryFn: () => examService.getQuestionsByGroup(group.id),
    })),
  });
  const groupedCount = groupQuestionQueries.reduce(
    (total, query) => total + (query.data?.length ?? 0),
    0,
  );

  const target = section.questionCount ?? 0;
  const actual = directQuestions.length + groupedCount;
  const missing = Math.max(0, target - actual);
  const complete = target > 0 && actual >= target;
  const percent = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  // Mô tả + hướng dẫn gộp một dòng (ẩn bớt khi cả hai rỗng).
  const sectionText = [section.description, section.instructions].filter(Boolean).join(" — ");

  const handleCreateGroup = async (groupType: ExamGroupType) => {
    const tid = toast.loading("Đang tạo nhóm câu hỏi...");
    try {
      await createGroup.mutateAsync({
        sectionId: section.id,
        data: { groupType, position: groups.length + 1 },
      });
      toast.success("Tạo nhóm câu hỏi thành công!", { id: tid });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(message, { id: tid });
    }
  };

  const handleGroupReorder = async (from: number, to: number) => {
    const list = [...groups];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    const tid = toast.loading("Đang lưu thứ tự...");
    try {
      // Phase 1: move every changed group to a temporary position (original +
      // 1000) so the UNIQUE (section_id, position) constraint never fires
      // while renumbering (e.g. swapping two groups).
      for (let i = 0; i < list.length; i++) {
        if (list[i].position !== i + 1) {
          await examService.updateQuestionGroup(list[i].id, {
            position: list[i].position + 1000,
          });
        }
      }
      // Phase 2: assign the final positions 1..N.
      for (let i = 0; i < list.length; i++) {
        if (list[i].position !== i + 1) {
          await examService.updateQuestionGroup(list[i].id, { position: i + 1 });
        }
      }
      await queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Đã lưu thứ tự!", { id: tid });
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra", { id: tid });
    }
  };

  const { dragHandleProps, dropTargetProps, isOver } = useDragReorder(handleGroupReorder);

  if (loadingGroups || loadingDirect) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header — gói gọn: tên + badge, một hàng tiến độ + thông số */}
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold" title={section.name}>
              {section.name}
            </h3>
            {sectionText && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" title={sectionText}>
                {sectionText}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                complete
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              }
            >
              {complete ? "Đủ số câu hỏi" : `Thiếu ${missing} câu hỏi`}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasteOpen(true)}
              title="Thêm nhiều câu 1 lúc — dán 1 dòng 1 câu, không cần file Excel"
            >
              <ClipboardPaste className="mr-1.5 size-3.5" />
              Dán nhanh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${complete ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums">
            {actual}/{target} câu
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {(section.durationSeconds ?? 0) > 0 && (
              <span className="rounded-full border px-2 py-0.5">
                {formatDuration(section.durationSeconds)}
              </span>
            )}
            <span className="rounded-full border px-2 py-0.5">{groups.length} nhóm</span>
            {directQuestions.length > 0 && (
              <span className="rounded-full border px-2 py-0.5">
                {directQuestions.length} câu trực lập
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Direct questions */}
      <DirectQuestionsSection sectionId={section.id} questions={directQuestions} />

      {/* Groups (expandable, drag & drop ordering) */}
      {groups.map((group, i) => (
        <div
          key={group.id}
          {...dropTargetProps(i)}
          className={`transition-shadow ${isOver(i) ? "rounded-xl ring-2 ring-primary/40" : ""}`}
        >
          <GroupPanel
            group={group}
            defaultOpen={i === 0}
            dragHandleProps={dragHandleProps(i)}
          />
        </div>
      ))}

      {/* Single "add group" button — one function, pick the group type in the menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="w-full justify-center border-dashed py-3 text-muted-foreground"
              disabled={createGroup.isPending}
            />
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhóm câu hỏi
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-52">
          {GROUP_TYPE_OPTIONS.map((groupType) => {
            const Icon = GROUP_TYPE_ICONS[groupType];
            return (
              <DropdownMenuItem
                key={groupType}
                disabled={createGroup.isPending}
                onClick={() => void handleCreateGroup(groupType)}
              >
                <Icon className="text-muted-foreground" />
                {QUESTION_GROUP_TYPE_LABELS[groupType]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <BulkPasteQuestionsDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        section={section}
        groups={groups}
        directCount={directQuestions.length}
      />
    </div>
  );
}

export default function ExamBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading } = useExam(Number(id));
  const { data: sections = [], isLoading: loadingSections } = useExamSections(Number(id));
  const [activeTab, setActiveTab] = useState("");
  useEffect(() => {
    if (sections.length > 0 && !activeTab) {
      setActiveTab(String(sections[0].id));
    }
  }, [sections, activeTab]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
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

  const activeSection = sections.find((s) => String(s.id) === activeTab);

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(`/exams/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold break-words sm:text-2xl">{exam.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {statusBadge(exam.status)}
              <span className="mx-2">·</span>
              Thời lượng: {formatDuration(exam.durationSeconds)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/exams/${id}/import-package`)}
              title="Tải template ZIP (Excel + thư mục audio/ảnh) rồi nhập cả gói — có media"
            >
              <FileArchive className="mr-2 h-4 w-4" />
              Import ZIP
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {loadingSections ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-64" />
          <div className="h-64 bg-muted rounded" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-12 rounded-xl border bg-card">
          <p className="text-muted-foreground">Đề thi này chưa có phần thi</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
          {/* Part cuộn ngang trong khung riêng — trang không bị tràn khi có nhiều phần */}
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-max">
              {sections.map((section) => {
                // "Part 2 - Question-Response" → nhãn ngắn "Part 2", mô tả đầy đủ trong title
                const shortName = section.name.split(" - ")[0];
                return (
                  <TabsTrigger key={section.id} value={String(section.id)} title={section.name}>
                    <span className="block max-w-36 truncate font-semibold">{shortName}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {section.questionCount} câu
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          {sections.map((section) => (
            <TabsContent key={section.id} value={String(section.id)}>
              {activeSection && activeSection.id === section.id && (
                <SectionPanel section={section} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

