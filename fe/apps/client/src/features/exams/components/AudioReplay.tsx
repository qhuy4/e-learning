import { Volume2 } from "lucide-react";

interface AudioReplayProps {
  /** Blob URL của bản ghi trong phiên — null/undefined = không còn file để phát. */
  src?: string | null;
  /** Tiêu đề khối, ví dụ "Nghe lại câu trả lời". */
  title?: string;
  className?: string;
}

/**
 * Khối phát lại bản ghi âm Speaking. Blob URL chỉ sống trong phiên tab —
 * khi file đã mất (tải lại trang) hiển thị lời giải thích trung thực thay
 * vì một player chết.
 */
export function AudioReplay({
  src,
  title = "Nghe lại câu trả lời của bạn",
  className = "",
}: AudioReplayProps) {
  return (
    <div className={`rounded-xl border border-border bg-muted/30 p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Volume2 className="size-4" />
        </span>
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      </div>
      {src ? (
        <audio controls preload="metadata" src={src} className="mt-3 w-full" data-testid="audio-replay" />
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          Bản ghi chỉ giữ trong phiên làm bài — nếu bạn tải lại trang, file âm thanh sẽ không còn
          để phát lại.
        </p>
      )}
    </div>
  );
}
