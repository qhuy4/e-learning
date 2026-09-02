import { useState, useEffect } from "react";
import { MonitorPlay, UploadCloud, Film } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { CustomVideoPlayer } from "./custom-video-player";

interface VideoUploaderProps {
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
}

export function VideoUploader({ value, onChange }: VideoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string" && value.startsWith("http")) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  if (previewUrl) {
    const isNewFile = value instanceof File;
    return (
      <div className="space-y-4">
        <CustomVideoPlayer src={previewUrl} className="max-w-3xl mx-auto" />

        <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-md border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate px-2">
            <Film className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
            <span className="truncate font-medium text-foreground">
              {isNewFile ? value.name : "Video hiện tại (Đã lưu)"}
            </span>
            {isNewFile && (
              <span className="text-xs opacity-70 ml-1">
                ({(value.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            )}
          </div>
          <label className="cursor-pointer shrink-0">
            <input
              type="file"
              accept="video/mp4,video/webm"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.[0]) onChange(e.target.files[0]);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="pointer-events-none border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Thay video
            </Button>
          </label>
        </div>
      </div>
    );
  }
  return (
    <label className="relative border-2 border-dashed border-input rounded-md p-8 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 hover:border-emerald-500/50 transition-colors cursor-pointer group block">
      <input
        type="file"
        accept="video/mp4,video/webm"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          if (e.target.files?.[0]) onChange(e.target.files[0]);
        }}
      />
      <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
        <MonitorPlay className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
          Nhấn để chọn video
        </p>
        <p className="text-xs text-muted-foreground mt-1">MP4, WebM · Tối đa 500MB</p>
      </div>
    </label>
  );
}
