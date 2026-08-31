import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@fe/components/ui/card";

import {
  Type,
  Link as LinkIcon,
  LayoutList,
  Save,
  X,
  BookOpen,
  Clock,
  Eye,
} from "lucide-react";

import { VideoUploader } from "./video-uploader";
import { ThumbnailUploader } from "./thumbnail-uploader";

interface LessonFormData {
  title: string;
  slug: string;
  type: "video";
  duration?: number;
  position?: number;
  content?: string;
  isPreview: boolean;
  videoSource?: File | string;
  thumbnail?: File | string;
}

interface LessonFormProps {
  initialData?: any;
  onSave: (data: LessonFormData) => void;
  onCancel: () => void;
}

export function LessonForm({ initialData, onSave, onCancel }: LessonFormProps) {
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [duration, setDuration] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [position, setPosition] = useState("");
  const [videoSource, setVideoSource] = useState<File | string | undefined>(undefined);
  const [thumbnail, setThumbnail] = useState<File | string | undefined>(undefined);

  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title ?? "");
    setSlug(initialData.slug ?? "");
    setDuration(initialData.duration ? String(initialData.duration) : "");
    setContent(initialData.content ?? "");
    setIsPreview(initialData.isPreview ?? false);
    setPosition(initialData.position ? String(initialData.position) : "");
    // videoSource from API is a signed URL (string) or undefined
    setVideoSource(initialData.videoSource ?? undefined);
    setThumbnail(initialData.thumbnail ?? undefined);
  }, [initialData]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên bài học.");
      return;
    }

    // When creating: must have video. When editing: existing URL is fine, or new File
    if (!isEditing && !videoSource) {
      toast.error("Vui lòng tải video bài học.");
      return;
    }

    onSave({
      title: title.trim(),
      slug: slug.trim(),
      type: "video",
      duration: duration ? Number(duration) : undefined,
      position: position ? Number(position) : undefined,
      content: content.trim() || undefined,
      isPreview,
      videoSource,
      thumbnail,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ─── Main content ────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              Nội dung chính
            </CardTitle>
            <CardDescription className="text-sm">
              Thông tin cốt lõi của bài học như tiêu đề, video và mô tả.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* TITLE */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Tên bài học <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="Nhập tên bài học..."
                  className="pl-10 h-11"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* SLUG */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="font-medium">
                Đường dẫn (Slug)
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="slug"
                  placeholder="vd: huong-dan-cai-dat"
                  className="pl-10 h-11 font-mono text-sm"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            {/* VIDEO */}
            <div className="space-y-2 pt-2">
              <Label className="font-medium">
                Video bài học{!isEditing && <span className="text-destructive ml-1">*</span>}
                {isEditing && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(để trống nếu không thay đổi)</span>
                )}
              </Label>
              <VideoUploader value={videoSource} onChange={setVideoSource} />
            </div>

            {/* CONTENT */}
            <div className="space-y-2">
              <Label htmlFor="content" className="font-medium flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-muted-foreground" />
                Mô tả chi tiết
              </Label>
              <textarea
                id="content"
                className="flex min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Nhập nội dung mô tả hoặc ghi chú của bài học..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Settings sidebar ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <Card className="bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-semibold">Cài đặt thêm</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            {/* DURATION */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Thời lượng (phút)
              </Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="VD: 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* POSITION */}
            <div className="space-y-2">
              <Label htmlFor="position" className="font-medium">Thứ tự bài học</Label>
              <Input
                id="position"
                type="number"
                min="1"
                placeholder="VD: 1"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Để trống nếu backend tự xác định vị trí.
              </p>
            </div>

            {/* THUMBNAIL */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="font-medium">Hình xem trước</Label>
              <ThumbnailUploader value={thumbnail} onChange={setThumbnail} />
            </div>

            {/* PREVIEW */}
            <div className="p-4 border border-border rounded-lg bg-muted/20 flex items-start gap-3">
              <input
                type="checkbox"
                id="isPreview"
                checked={isPreview}
                onChange={(e) => setIsPreview(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-emerald-600"
              />
              <div>
                <Label htmlFor="isPreview" className="font-medium flex items-center gap-2 cursor-pointer">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Cho phép xem thử
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Học viên chưa mua khóa học vẫn có thể xem bài này.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-border pt-6 bg-muted/20">
            <Button
              onClick={handleSubmit}
              className="w-full gap-2 rounded-md shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <Save className="w-4 h-4" />
              {isEditing ? "Lưu thay đổi" : "Tạo bài học"}
            </Button>

            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full gap-2 rounded-md shadow-sm font-medium"
            >
              <X className="w-4 h-4" />
              Hủy bỏ
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
