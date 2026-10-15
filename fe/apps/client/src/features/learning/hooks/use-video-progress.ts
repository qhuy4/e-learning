import { useEffect, useRef, useCallback } from 'react';
import { useUpdateLessonProgress } from './use-learning';

interface UseVideoProgressOptions {
  courseId: number;
  lessonId: number;
  enabled?: boolean;
}

const HEARTBEAT_INTERVAL = 15_000;

export const useVideoProgress = ({
  courseId,
  lessonId,
  enabled = true,
}: UseVideoProgressOptions) => {
  const lastSentRef = useRef(0);
  const latestRef = useRef<{
    watchSeconds: number;
    percent: number;
    duration: number;
  } | null>(null);

  const { mutate: sendProgress } = useUpdateLessonProgress();

  const flushProgress = useCallback(() => {
    const data = latestRef.current;
    if (!data) return;

    sendProgress({
      courseId,
      lessonId,
      watchSeconds: data.watchSeconds,
      progressPercent: Math.round(data.percent),
    });
  }, [courseId, lessonId, sendProgress]);

  const handleProgressUpdate = useCallback(
    (info: { currentTime: number; duration: number; percent: number; watchSeconds: number }) => {
      latestRef.current = {
        watchSeconds: info.watchSeconds,
        percent: info.percent,
        duration: info.duration,
      };

      const now = Date.now();
      if (now - lastSentRef.current >= HEARTBEAT_INTERVAL) {
        lastSentRef.current = now;
        sendProgress({
          courseId,
          lessonId,
          watchSeconds: info.watchSeconds,
          progressPercent: Math.round(info.percent),
        });
      }
    },
    [courseId, lessonId, sendProgress],
  );

  const handleVideoEnd = useCallback(() => {
    const data = latestRef.current;
    if (!data) return;

    sendProgress({
      courseId,
      lessonId,
      // duration của <video> là số thực → DTO watchSeconds @IsInt (400 nếu gửi lẻ)
      watchSeconds: Math.floor(data.duration),
      progressPercent: 100,
    });
  }, [courseId, lessonId, sendProgress]);

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => flushProgress();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      flushProgress();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, flushProgress]);

  return { handleProgressUpdate, handleVideoEnd, flushProgress };
};
