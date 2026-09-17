import { FileImage, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface ThumbnailUploaderProps {
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
}

export function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const isExistingUrl = typeof value === "string" && value.startsWith("http");
  const isNewFile = value instanceof File;
  const previewUrl = isNewFile ? URL.createObjectURL(value) : isExistingUrl ? value : null;

  if (previewUrl) {
    return (
      <div className="relative rounded-md overflow-hidden border border-border">
        <img
          src={previewUrl}
          alt="Hình xem trước"
          className="w-full max-h-32 object-contain"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => onChange(e.target.files?.[0])}
            />
            <span className="text-xs text-white bg-black/60 px-3 py-1.5 rounded-md pointer-events-none">
              Thay ảnh
            </span>
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            className="text-white hover:text-red-300 hover:bg-black/40 h-auto p-1.5"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <label className="relative border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50 hover:border-emerald-500/50 transition-colors cursor-pointer group block">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onChange(e.target.files?.[0])}
      />
      <FileImage className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
      <p className="text-xs text-center text-muted-foreground group-hover:text-emerald-600 transition-colors">
        PNG, JPG, WebP
      </p>
    </label>
  );
}
