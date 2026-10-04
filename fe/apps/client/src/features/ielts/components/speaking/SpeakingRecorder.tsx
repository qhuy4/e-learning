import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Mic, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { useMicRecorder } from "../../../exams/hooks/mic-recorder";
import { AudioReplay } from "../../../exams/components/AudioReplay";
import { formatClock } from "../../utils";
import { SectionBadge } from "../common/SectionBadge";

interface SpeakingRecorderProps {
  /** Speaking time allotted for this question / long turn. */
  durationSec: number;
  /** Optional preparation countdown (Part 2 cue card). */
  prepSec?: number;
  recorded: boolean;
  /** Blob URL bản ghi trong phiên — null = đã ghi nhưng file không còn. */
  audioUrl?: string | null;
  transcript?: string;
  /** Xem lại bài đã nộp — chỉ phát lại bản ghi, không ghi thêm. */
  review?: boolean;
  onStop: (transcript: string, seconds: number, audioUrl: string | null) => void;
  onReset?: () => void;
}

type Status = "idle" | "prep" | "recording" | "done";

const BAR_COUNT = 36;

function barHeight(i: number, live: boolean): number {
  const wave = Math.sin(i * 1.7) * 34 + Math.cos(i * 0.9) * 22 + Math.sin(i * 0.35) * 18;
  return Math.min(100, Math.max(14, (live ? 58 : 42) + wave * (live ? 1 : 0.6)));
}

/** Nội dung gửi kèm (answerText) — trung thực với những gì thực sự xảy ra. */
function makeTranscript(seconds: number, hasAudio: boolean): string {
  return hasAudio
    ? `Đã ghi âm bằng mic (${seconds} giây) — bản ghi lưu trong phiên làm bài.`
    : `Đã hoàn thành câu trả lời (${seconds} giây) — mic không khả dụng nên không có file âm thanh.`;
}

/**
 * Recorder Speaking: ghi âm THẬT bằng mic trình duyệt (MediaRecorder) với
 * waveform + đếm ngược chuẩn bị/nói, phát lại được ngay khi xong và trong
 * chế độ xem lại. Mic bị từ chối → rơi về mô phỏng có ghi chú trung thực.
 */
export function SpeakingRecorder({
  durationSec,
  prepSec,
  recorded = false,
  audioUrl,
  transcript,
  review = false,
  onStop,
  onReset,
}: SpeakingRecorderProps) {
  const mic = useMicRecorder();
  const [status, setStatus] = useState<Status>(recorded ? "done" : "idle");
  const [remaining, setRemaining] = useState(durationSec);
  /** Chống gọi onStop 2 lần khi effect re-fire trong lúc chờ mic.stop(). */
  const finalizingRef = useRef(false);

  const total =
    status === "prep" ? prepSec ?? durationSec : durationSec;

  useEffect(() => {
    if (status !== "prep" && status !== "recording") return;
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  /** Kết thúc bản ghi: đóng mic → lấy blob URL → báo lên context → "done". */
  const finishRecording = useCallback(
    async (seconds: number) => {
      if (finalizingRef.current) return;
      finalizingRef.current = true;
      const result = await mic.stop();
      const url = result?.url ?? null;
      onStop(makeTranscript(seconds, url !== null), seconds, url);
      setStatus("done");
      finalizingRef.current = false;
    },
    [mic, onStop],
  );

  // Prep hết → nói ngay (mở mic); Nói hết giờ → kết thúc bản ghi.
  useEffect(() => {
    if (remaining !== 0 || finalizingRef.current) return;
    if (status === "prep") {
      setStatus("recording");
      setRemaining(durationSec);
      void mic.start();
    } else if (status === "recording") {
      void finishRecording(durationSec);
    }
  }, [remaining, status, durationSec, mic, finishRecording, onStop]);

  const beginRecording = () => {
    setRemaining(durationSec);
    setStatus("recording");
    finalizingRef.current = false;
    void mic.start();
  };

  const startPrep = () => {
    setRemaining(prepSec ?? durationSec);
    setStatus("prep");
  };
  const startRecording = () => beginRecording();
  const stopEarly = () => {
    void finishRecording(Math.max(1, durationSec - remaining));
  };
  const reset = () => {
    finalizingRef.current = false;
    setStatus("idle");
    setRemaining(durationSec);
    onReset?.();
  };

  const live = status === "recording";
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  const statusLabel: Record<Status, { text: string; tone: string }> = {
    idle: review
      ? { text: "Chưa ghi âm part này", tone: "text-muted-foreground" }
      : { text: "Sẵn sàng ghi âm", tone: "text-muted-foreground" },
    prep: { text: "Đang chuẩn bị — hãy ghi key words", tone: "text-sky-600" },
    recording: { text: "Đang ghi âm — Speak now", tone: "text-red-600" },
    done: { text: recorded || status === "done" ? "Đã hoàn thành" : "Đã dừng", tone: "text-emerald-600" },
  };

  const micCaption = review
    ? "Xem lại bài đã nộp — chỉ phát lại"
    : live
      ? "Đang ghi mic thật"
      : mic.unavailable
        ? "Mic không khả dụng — không có file nghe lại"
        : "Ghi âm bằng mic trình duyệt";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <SectionBadge label="Recording" tone={live ? "amber" : "primary"} />
          <span className={`text-xs font-extrabold ${statusLabel[status].tone}`}>
            {statusLabel[status].text}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">{micCaption}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        {/* Remaining-time circle */}
        <div className="relative shrink-0" style={{ width: 108, height: 108 }}>
          <svg width={108} height={108} className="-rotate-90">
            <circle cx={54} cy={54} r={radius} fill="none" strokeWidth={8} className="stroke-muted" />
            <circle
              cx={54}
              cy={54}
              r={radius}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              className={live ? "stroke-red-500" : "stroke-primary"}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-extrabold tabular-nums text-foreground">
              {formatClock(remaining)}
            </span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              {status === "prep" ? "Chuẩn bị" : "Còn lại"}
            </span>
          </div>
        </div>

        {/* Waveform */}
        <div className="min-w-[240px] flex-1">
          <div className="flex h-16 items-center gap-[3px]" aria-hidden="true">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  live ? "bg-red-400" : status === "done" ? "bg-emerald-400" : "bg-muted"
                } ${live ? "animate-pulse" : ""}`}
                style={{
                  height: `${barHeight(i, live)}%`,
                  animationDelay: `${(i % 8) * 90}ms`,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mic className={`size-3.5 ${live ? "text-red-500" : ""}`} />
              {live ? "Đang thu…" : status === "done" ? "Đã thu xong" : "Chưa thu âm"}
            </span>
            <span>Mục tiêu: {formatClock(durationSec)}{prepSec ? ` · chuẩn bị ${formatClock(prepSec)}` : ""}</span>
          </div>
        </div>

        {/* Controls — review mode chỉ đọc, không hiện nút ghi */}
        {!review && (
          <div className="flex shrink-0 flex-col gap-2">
            {status === "idle" && (
              <Button
                size="lg"
                className="gap-2"
                onClick={prepSec !== undefined ? startPrep : startRecording}
              >
                <Play className="size-4" />
                {prepSec !== undefined ? "Bắt đầu chuẩn bị" : "Bắt đầu ghi âm"}
              </Button>
            )}
            {status === "prep" && (
              <Button size="lg" variant="outline" className="gap-2" onClick={startRecording}>
                <Mic className="size-4" />
                Bỏ qua — nói ngay
              </Button>
            )}
            {status === "recording" && (
              <Button size="lg" className="gap-2 bg-red-600 text-white hover:bg-red-700" onClick={stopEarly}>
                <Square className="size-4" />
                Dừng &amp; nộp câu trả lời
              </Button>
            )}
            {status === "done" && (
              <Button size="lg" variant="outline" className="gap-2" onClick={reset}>
                <RotateCcw className="size-4" />
                Ghi lại
              </Button>
            )}
            <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              Ghi âm mic thật — nghe lại được trong phiên
            </span>
          </div>
        )}
      </div>

      {mic.unavailable && !review && status !== "done" && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800">
          Không truy cập được mic (bị từ chối quyền hoặc trình duyệt không hỗ trợ) — bài sẽ được
          tính hoàn thành nhưng KHÔNG có file âm thanh để nghe lại.
        </p>
      )}

      {/* Bản ghi âm — phát lại được ngay khi xong và ở chế độ xem lại */}
      {status === "done" ? (
        <div className="mt-4 space-y-2">
          <AudioReplay src={audioUrl} />
          {transcript && (
            <p className="text-xs leading-relaxed text-muted-foreground">{transcript}</p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              Bản ghi âm
            </p>
            {status === "recording" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                <Check className="size-3.5" />
                Đang thu — dừng lại để lưu bản ghi
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {review
              ? "Part này chưa được ghi âm trong lần thi này."
              : "— Chưa có bản ghi — bắt đầu ghi âm để lưu câu trả lời của bạn —"}
          </p>
        </div>
      )}
    </div>
  );
}
