import { useCallback, useEffect, useRef, useState } from "react";

export type MicRecorderState = "idle" | "recording";

export interface MicStopResult {
  /** Blob URL của file âm thanh — object URL chỉ sống trong phiên tab. */
  url: string;
  /** Số giây đã thu (làm tròn). */
  seconds: number;
}

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
}

function blobOf(chunks: Blob[], mime: string | undefined): Blob {
  return new Blob(chunks, { type: mime ?? "audio/webm" });
}

/**
 * Ghi âm THẬT bằng mic trình duyệt (MediaRecorder) cho phần Speaking.
 *
 * - `start()` — xin quyền mic; trả `false` + `unavailable = true` khi bị từ
 *   chối / trình duyệt không hỗ trợ → caller rơi về chế độ mô phỏng (không
 *   có file nghe lại) và nói trung thực điều đó với học viên.
 * - `stop()` — trả blob URL của file âm thanh (null nếu không ghi được gì) và
 *   TỰ đóng mic (tắt đèn báo mic của hệ điều hành).
 * - Blob URL giữ trong context → phát lại được ở trang làm bài / review /
 *   kết quả trong cùng phiên; F5 thì mất (UI nói rõ điều này).
 */
export function useMicRecorder() {
  const [state, setState] = useState<MicRecorderState>("idle");
  const [unavailable, setUnavailable] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const mimeRef = useRef<string | undefined>(undefined);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Đổi trang khi đang nói → đóng mic ngay (không treo đèn báo mic).
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* đã dừng trước đó */
        }
      }
      releaseStream();
    };
  }, [releaseStream]);

  const start = useCallback(async (): Promise<boolean> => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setUnavailable(true);
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      mimeRef.current = mime;
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start(250);
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setUnavailable(false);
      setState("recording");
      return true;
    } catch {
      // Bị từ chối quyền mic / không có mic → mô phỏng, không có file.
      releaseStream();
      setUnavailable(true);
      return false;
    }
  }, [releaseStream]);

  const stop = useCallback(async (): Promise<MicStopResult | null> => {
    const recorder = recorderRef.current;
    if (!recorder) return null;
    const seconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    let blob: Blob;
    if (recorder.state === "inactive") {
      blob = blobOf(chunksRef.current, mimeRef.current);
    } else {
      blob = await new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(blobOf(chunksRef.current, mimeRef.current));
        try {
          recorder.stop();
        } catch {
          resolve(blobOf(chunksRef.current, mimeRef.current));
        }
      });
    }
    releaseStream();
    recorderRef.current = null;
    chunksRef.current = [];
    setState("idle");
    if (blob.size === 0) return null;
    return { url: URL.createObjectURL(blob), seconds };
  }, [releaseStream]);

  return { state, unavailable, start, stop };
}
