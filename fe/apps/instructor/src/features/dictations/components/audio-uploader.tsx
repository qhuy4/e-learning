import { useState, useEffect, useRef } from "react";
import { Headphones, UploadCloud, Music, X, Loader2 } from "lucide-react";
import { Button } from "@fe/components/ui/button";

interface AudioUploaderProps {
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
  uploading?: boolean;
  progress?: number;
}

export function AudioUploader({ value, onChange, uploading, progress }: AudioUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  if (uploading) {
    return (
      <div className="border-2 border-dashed border-emerald-300 rounded-md p-8 flex flex-col items-center justify-center gap-3 bg-emerald-50/30">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-emerald-700">Dang tai len audio...</p>
        {progress !== undefined && (
          <div className="w-full max-w-xs">
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-emerald-600 text-center mt-1">{Math.round(progress)}%</p>
          </div>
        )}
      </div>
    );
  }

  if (previewUrl) {
    const isNewFile = value instanceof File;
    return (
      <div className="space-y-3">
        <audio ref={audioRef} src={previewUrl} controls className="w-full h-10 rounded-md" />
        <div className="flex justify-between items-center bg-muted/40 p-2.5 rounded-md border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate px-2">
            <Music className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
            <span className="truncate font-medium text-foreground">
              {isNewFile ? value.name : "Audio hien tai (Da luu)"}
            </span>
            {isNewFile && (
              <span className="text-xs opacity-70 ml-1">({(value.size / 1024 / 1024).toFixed(1)} MB)</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <label className="cursor-pointer">
              <input
                ref={replaceInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/x-m4a,audio/mp4"
                className="sr-only"
                onChange={handleFileChange}
              />
              <Button variant="outline" size="sm" className="pointer-events-none border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm">
                <UploadCloud className="w-4 h-4 mr-2" />
                Thay audio
              </Button>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(undefined);
                if (replaceInputRef.current) replaceInputRef.current.value = "";
              }}
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className="relative border-2 border-dashed border-input rounded-md p-8 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 hover:border-emerald-500/50 transition-colors cursor-pointer group block">
      <input
        ref={createInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/x-m4a,audio/mp4"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
      <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
        <Headphones className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
          Nhan de chon file audio
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          MP3, WAV, OGG, WebM, M4A · Toi da 50MB
        </p>
      </div>
    </label>
  );
}
