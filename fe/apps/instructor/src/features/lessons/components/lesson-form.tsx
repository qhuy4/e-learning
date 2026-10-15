import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@fe/components/ui/card";
import { Type, LayoutList, Save, X, BookOpen, Eye, Loader2, Paperclip, Settings, Image as ImageIcon } from "lucide-react";
import { VideoUploader } from "./video-uploader";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { LessonMaterialsManager } from "./lesson-materials-manager";
import { LessonType, MEDIA_TYPES } from "../types/lesson.types";

interface LessonFormData {
  title: string;
  type: LessonType;
  duration?: number;
  position?: number;
  content?: string;
  isPreview: boolean;
  videoSource?: File | string;
  thumbnail?: File | string;
  materials?: File[];
}

interface LessonFormProps {
  initialData?: any;
  onSave: (data: LessonFormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function LessonForm({ initialData, onSave, onCancel, isSaving }: LessonFormProps) {
  const isEditing = Boolean(initialData?.id);
  const [title, setTitle] = useState("");
  // Bài học mới luôn là video; khi sửa giữ nguyên loại đã lưu (ẩn select theo yêu cầu)
  const [lessonType, setLessonType] = useState<LessonType>("video");
  // Thời lượng do backend tự gen từ file — chỉ giữ giá trị đã lưu, không hiển thị input
  const [duration, setDuration] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [position, setPosition] = useState("");
  const [videoSource, setVideoSource] = useState<File | string | undefined>(undefined);
  const [thumbnail, setThumbnail] = useState<File | string | undefined>(undefined);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const isMedia = MEDIA_TYPES.includes(lessonType);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title ?? "");
    setLessonType(initialData.type ?? "video");
    setDuration(initialData.duration != null ? String(initialData.duration) : "");
    setContent(initialData.content ?? "");
    setIsPreview(initialData.isPreview ?? false);
    setPosition(initialData.position ? String(initialData.position) : "");
    setVideoSource(initialData.videoSource ?? undefined);
    setThumbnail(initialData.thumbnail ?? undefined);
  }, [initialData]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên bài học.");
      return;
    }
    if (!isEditing && !videoSource && isMedia) {
      toast.error("Vui lòng tải file bài học.");
      return;
    }
    onSave({
      title: title.trim(),
      type: lessonType,
      duration: isMedia ? undefined : (duration ? Number(duration) : undefined),
      position: position ? Number(position) : undefined,
      content: content.trim() || undefined,
      isPreview,
      videoSource,
      thumbnail,
      // File tài liệu chờ (khi tạo mới) sẽ được tải lên sau khi bài học được tạo
      materials: isEditing ? undefined : pendingFiles.length ? pendingFiles : undefined,
    });
  };

  const isUploading = isSaving && videoSource instanceof File;
  const isDisabled = isSaving;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột trái — nội dung bài học */}
      <div className="lg:col-span-2">
        <Card className="bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Nội dung bài học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Tên bài học <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="title" placeholder="Nhập tên bài học..." className="pl-10 h-10" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isDisabled} />
              </div>
            </div>

            {isMedia && (
              <div className="space-y-2">
                <Label className="font-medium">
                  File bài học <span className="text-destructive">*</span>
                  {isEditing && <span className="ml-2 text-xs font-normal text-muted-foreground">(để trống nếu không thay đổi)</span>}
                </Label>
                <VideoUploader value={videoSource} onChange={setVideoSource} />
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Hình xem trước
              </Label>
              <ThumbnailUploader value={thumbnail} onChange={setThumbnail} />
              <p className="text-xs text-muted-foreground">
                Hiển thị trước khi học viên bấm phát. PNG, JPG, WebP, tối đa 5MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="font-medium flex items-center gap-1.5">
                <LayoutList className="h-4 w-4 text-muted-foreground" />
                Mô tả chi tiết
              </Label>
              <textarea id="content" className="flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Nhập nội dung mô tả hoặc ghi chú của bài học..." value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cột phải — tài liệu, cài đặt, hành động */}
      <div className="space-y-6">
        <Card className="bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Tài liệu đính kèm
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <LessonMaterialsManager
              lessonId={isEditing ? Number(initialData?.id) : undefined}
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
              disabled={isDisabled}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Cài đặt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="space-y-2">
              <Label htmlFor="position" className="font-medium">Thứ tự bài học</Label>
              <Input id="position" type="number" min="1" placeholder="VD: 1" className="h-10" value={position} onChange={(e) => setPosition(e.target.value)} disabled={isDisabled} />
              <p className="text-xs text-muted-foreground">Để trống nếu backend tự xác định vị trí.</p>
            </div>
            <div className="p-3.5 border border-border rounded-lg bg-muted/20 flex items-start gap-3">
              <input type="checkbox" id="isPreview" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-emerald-600" />
              <div>
                <Label htmlFor="isPreview" className="font-medium flex items-center gap-2 cursor-pointer">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Cho phép xem thử
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Học viên chưa mua khóa học vẫn có thể xem bài này.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2.5 border-t border-border py-4 bg-muted/20">
            <Button onClick={handleSubmit} disabled={isDisabled} className="w-full gap-2 rounded-md shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải lên video...
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {!isEditing && pendingFiles.length > 0 ? "Đang tải tài liệu..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? "Lưu thay đổi" : "Tạo bài học"}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isDisabled} className="w-full gap-2 rounded-md shadow-sm font-medium">
              <X className="w-4 h-4" />
              Hủy bỏ
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
