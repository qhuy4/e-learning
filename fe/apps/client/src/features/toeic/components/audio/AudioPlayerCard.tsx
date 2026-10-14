import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { formatClock } from "../../utils";

interface AudioPlayerCardProps {
  /** e.g. "Question 32–34" or "Question 12". */
  label: string;
  title?: string;
  durationSec?: number;
  /** File audio THẬT từ materials.file_url — lỗi 404 → tự chuyển về mô phỏng. */
  src?: string;
  /**
   * true = chế độ XEM SAU THI: nghe lại tự do (hết lượt vẫn bấm Play nghe lại
   * từ đầu). Mặc định false = giữ đúng luật thi: chỉ phát 1 lần.
   */
  replay?: boolean;
}

type Status = "idle" | "playing" | "paused" | "ended";

const BAR_COUNT = 44;

function barHeight(i: number): number {
  const wave = Math.sin(i * 1.7) * 34 + Math.cos(i * 0.9) * 22 + Math.sin(i * 0.35) * 18;
  return Math.min(100, Math.max(18, 52 + wave));
}

/**
 * Exam audio player — one play only (no replay once finished), locked 1x speed,
 * progress + waveform. Phát file audio THẬT khi DB có `src`; không có file hoặc
 * file lỗi → tự động chuyển về player mô phỏng theo `durationSec`.
 */
export function AudioPlayerCard({ label, title, durationSec = 30, src, replay = false }: AudioPlayerCardProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [realDuration, setRealDuration] = useState<number | null>(null);
  const [useReal, setUseReal] = useState(Boolean(src));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const duration = useReal && realDuration ? realDuration : durationSec;

  /** Player mô phỏng — chỉ chạy khi không có audio thật đang hoạt động. */
  useEffect(() => {
    if (useReal || status !== "playing") return;
    timerRef.current = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= durationSec) {
          setStatus("ended");
          return durationSec;
        }
        return next;
      });
    }, 100);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [status, durationSec, useReal]);

  /** audioUrl đổi (sang group khác) → reset trạng thái về đầu. */
  useEffect(() => {
    setStatus("idle");
    setElapsed(0);
    setRealDuration(null);
    setUseReal(Boolean(src));
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    // Chế độ replay (xem sau thi): hết lượt vẫn nghe lại được từ đầu.
    if (status === "ended") {
      if (!replay) return;
      setElapsed(0);
      if (audio) audio.currentTime = 0;
      if (useReal && audio) {
        audio
          .play()
          .then(() => setStatus("playing"))
          .catch(() => {
            setUseReal(false);
            setStatus("playing");
          });
        return;
      }
      setStatus("playing");
      return;
    }
    if (useReal && audio) {
      if (status === "playing") {
        audio.pause();
        setStatus("paused");
        return;
      }
      audio
        .play()
        .then(() => setStatus("playing"))
        .catch(() => {
          // File lỗi / trình duyệt chặn → rơi về mô phỏng theo durationSec.
          setUseReal(false);
          setStatus("playing");
        });
      return;
    }
    if (status === "idle") setStatus("playing");
    else if (status === "playing") setStatus("paused");
    else if (status === "paused") setStatus("playing");
  };

  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;

  const statusText: Record<Status, string> = replay
    ? {
        idle: "Sẵn sàng — nghe lại bao nhiêu lần cũng được",
        playing: "Đang phát — kết thúc vẫn nghe lại được",
        paused: "Tạm dừng",
        ended: "Đã phát xong — bấm Play để nghe lại từ đầu",
      }
    : {
        idle: src
          ? "Sẵn sàng — bấm Play để nghe audio thật (chỉ phát 1 lần)"
          : "Sẵn sàng — bấm Play để bắt đầu (chỉ phát 1 lần)",
        playing: "Đang phát — không thể tua lại",
        paused: "Tạm dừng",
        ended: "Đã phát xong — audio không phát lại",
      };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      {useReal && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setRealDuration(d);
          }}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onEnded={() => setStatus("ended")}
          onError={() => {
            setUseReal(false);
            setStatus((prev) => (prev === "playing" ? "playing" : "idle"));
          }}
          className="hidden"
        />
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Headphones className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-foreground">{title ?? "Audio"}</p>
            <p className="truncate text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            1x
          </span>
          <Volume2 className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={status === "ended" && !replay}
          aria-label={
            status === "playing"
              ? "Tạm dừng"
              : status === "ended" && replay
                ? "Nghe lại audio"
                : "Phát audio"
          }
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {status === "playing" ? (
            <Pause className="size-5" />
          ) : status === "ended" && replay ? (
            <RotateCcw className="size-5" />
          ) : (
            <Play className="size-5 translate-x-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex h-9 items-center gap-[2px]" aria-hidden="true">
            {Array.from({ length: BAR_COUNT }).map((_, i) => {
              const passed = i / BAR_COUNT <= progress;
              return (
                <span
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    passed ? "bg-primary" : "bg-muted"
                  }`}
                  style={{ height: `${barHeight(i)}%` }}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums">
              {formatClock(elapsed)} / {formatClock(duration)}
            </span>
            <span
              className={`font-semibold ${
                status === "ended"
                  ? "text-amber-600"
                  : status === "playing"
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {statusText[status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
