import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { FileText, Pencil, Plus, Trash2, Download, Loader2, X, Check } from "lucide-react";
import {
  useLessonMaterials,
  useUploadLessonMaterial,
  useUpdateLessonMaterial,
  useDeleteLessonMaterial,
} from "../hook/use-lessons";
import { getErrorMessage } from "@/shared/utils/error";
import type { LessonMaterial } from "../types/lesson.types";

const MATERIAL_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip";
const MAX_MATERIAL_SIZE = 25 * 1024 * 1024; // 25MB

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toUpperCase() : "FILE";
}

interface LessonMaterialsManagerProps {
  /** Có lessonId = đang chỉnh sửa bài học đã tạo → file tải lên ngay khi chọn */
  lessonId?: number;
  /** File chờ tải lên (chỉ dùng khi TẠO bài học mới — tải lên sau khi tạo xong) */
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
  disabled?: boolean;
}

export function LessonMaterialsManager({
  lessonId,
  pendingFiles = [],
  onPendingFilesChange,
  disabled,
}: LessonMaterialsManagerProps) {
  const isEditMode = Boolean(lessonId);
  const { data, isLoading } = useLessonMaterials(isEditMode ? lessonId : undefined);
  const uploadMutation = useUploadLessonMaterial();
  const updateMutation = useUpdateLessonMaterial();
  const deleteMutation = useDeleteLessonMaterial();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LessonMaterial | null>(null);

  const materials: LessonMaterial[] = isEditMode ? (data?.data ?? []) : [];

  const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length) return;

    const oversized = picked.find((f) => f.size > MAX_MATERIAL_SIZE);
    if (oversized) {
      toast.error(`File "${oversized.name}" vượt quá 25MB.`);
      return;
    }

    if (isEditMode && lessonId) {
      setUploading(true);
      let failed = 0;
      try {
        for (const file of picked) {
          try {
            await uploadMutation.mutateAsync({ lessonId, file });
          } catch {
            failed++;
          }
        }
      } finally {
        setUploading(false);
      }
      if (failed > 0) {
        toast.error(`Có ${failed} file tải lên thất bại.`);
      } else {
        toast.success(
          picked.length > 1 ? `Đã tải lên ${picked.length} tài liệu.` : "Đã tải lên tài liệu.",
        );
      }
    } else {
      onPendingFilesChange?.([...pendingFiles, ...picked]);
    }
  };

  const removePending = (index: number) => {
    onPendingFilesChange?.(pendingFiles.filter((_, i) => i !== index));
  };

  const saveRename = async () => {
    if (editingId == null || !editingTitle.trim()) return;
    try {
      await updateMutation.mutateAsync({ id: editingId, data: { title: editingTitle.trim() } });
      toast.success("Đã cập nhật tên tài liệu.");
      setEditingId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Đã xóa tài liệu.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const actionDisabled = disabled || uploading || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <p className="text-xs text-muted-foreground">
          PDF, Word, PowerPoint, Excel, TXT, ZIP · tối đa 25MB mỗi file.{" "}
          {isEditMode
            ? "File được tải lên ngay khi bạn chọn."
            : "Các file sẽ được tải lên sau khi bạn tạo bài học."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 self-start"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Chọn tài liệu
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={MATERIAL_ACCEPT}
        className="hidden"
        onChange={handlePickFiles}
        disabled={disabled || uploading}
      />

      {/* ── Đang chỉnh sửa bài học: danh sách từ server ───────────────────── */}
      {isEditMode &&
        (isLoading ? (
          <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-md">
            Đang tải danh sách tài liệu...
          </p>
        ) : materials.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-md">
            Chưa có tài liệu nào.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-md">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="shrink-0 w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                </span>
                <div className="min-w-0 flex-1">
                  {editingId === m.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={saveRename}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="w-3.5 h-3.5" /> Lưu
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {fileExt(m.fileName)} · {formatFileSize(m.fileSize)}
                        {m.description ? ` · ${m.description}` : ""}
                      </p>
                    </>
                  )}
                </div>
                {editingId !== m.id && (
                  <div className="shrink-0 flex items-center gap-0.5">
                    {m.downloadUrl && (
                      <a
                        href={m.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Tải xuống"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Đổi tên"
                      onClick={() => {
                        setEditingId(m.id);
                        setEditingTitle(m.title);
                      }}
                      disabled={actionDisabled}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Xóa"
                      onClick={() => setDeleteTarget(m)}
                      disabled={actionDisabled}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ))}

      {/* ── Đang tạo bài học: danh sách chờ (local) ───────────────────────── */}
      {!isEditMode &&
        (pendingFiles.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-md">
            Chưa chọn tài liệu nào.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-md">
            {pendingFiles.map((f, idx) => (
              <li key={`${f.name}-${idx}`} className="flex items-center gap-3 px-3 py-2.5">
                <span className="shrink-0 w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {fileExt(f.name)} · {formatFileSize(f.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Bỏ chọn"
                  onClick={() => removePending(idx)}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        ))}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Xóa tài liệu?"
        description={`"${deleteTarget?.title ?? ""}" sẽ bị xóa vĩnh viễn (kèm file đã tải lên).`}
        confirmLabel="Xóa tài liệu"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
