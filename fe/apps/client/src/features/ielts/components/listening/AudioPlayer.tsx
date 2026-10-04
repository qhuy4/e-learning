import { useEffect, useRef, useState } from "react";
import { Lock, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { formatClock } from "../../utils";
import { SectionBadge } from "../common/SectionBadge";

interface AudioPlayerProps {
  title: string;
  label?: string;
  instruction?: string;
  durationSec?: number;
  /** File audio THẬT từ materials.file_url — lỗi 404 → tự chuyển về mô phỏng. */
  src?: string;
  /** Chế độ xem lại (sau thi): hết lượt vẫn nghe lại được từ đầu. */
  replay?: boolean;
}

type Status = "idle" | "playing" | "paused" | "ended";

/**
 * IELTS exam audio player — phát file audio THẬT khi DB có `src` (play/pause,
 * progress + volume, locked 1×, play-once); không có file hoặc file lỗi →
 * tự động rơi về player mô phỏng theo `durationSec`.
 */
export function AudioPlayer({ title, label, instruction, durationSec = 90, src, replay = false }: AudioPlayerProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(75);
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
        const next = prev + 0.25;
        if (next >= durationSec) {
          setStatus("ended");
          return durationSec;
        }
        return next;
      });
    }, 250);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [status, durationSec, useReal]);

  /** audioUrl đổi (sang section khác) → reset trạng thái về đầu. */
  useEffect(() => {
    setStatus("idle");
    setElapsed(0);
    setRealDuration(null);
    setUseReal(Boolean(src));
  }, [src]);

  /** Đồng bộ thanh âm lượng vào <audio> thật. */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume, useReal]);

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
    if (status === "idle" || status === "paused") setStatus("playing");
    else if (status === "playing") setStatus("paused");
  };

  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;
  const remaining = Math.max(0, duration - elapsed);

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
        ended: "Đã phát xong — chuyển sang câu hỏi tiếp theo",
      };

  return (
    <div
      className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
      title={instruction}
    >
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
      {/* Compact 1 hàng: play nhỏ + tiêu đề + tiến độ/thời gian + chip 1× / âm lượng */}
      <div className="flex items-center gap-3">
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
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {status === "playing" ? (
            <Pause className="size-4" />
          ) : status === "ended" && replay ? (
            <RotateCcw className="size-4" />
          ) : (
            <Play className="size-4 translate-x-0.5" />
          )}
        </button>

        {/* Tiêu đề section — ẩn trên màn nhỏ (vẫn còn trong StimulusPanel bên dưới) */}
        <div className="hidden min-w-0 shrink items-center gap-2 md:flex md:w-56 lg:w-72">
          <SectionBadge label={label ?? "Audio"} tone="primary" />
          <p className="truncate text-[13px] font-extrabold text-foreground">{title}</p>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span className="shrink-0 font-mono tabular-nums">
              {formatClock(elapsed)} / {formatClock(duration)} · còn lại{" "}
              <strong className="font-mono text-foreground">{formatClock(remaining)}</strong>
            </span>
            <span
              className={`truncate font-semibold ${
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

        <span className="hidden shrink-0 items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground sm:inline-flex">
          <Lock className="size-3" />
          1× (locked)
        </span>
        <label className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground lg:flex">
          <Volume2 className="size-3.5" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Âm lượng"
            className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <span className="w-7 text-right tabular-nums">{volume}%</span>
        </label>
      </div>
    </div>
  );
}
