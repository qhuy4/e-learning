import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Rewind, FastForward, Loader2 } from 'lucide-react';

interface VideoProgressInfo {
  currentTime: number;
  duration: number;
  percent: number;
  watchSeconds: number;
}

interface VideoPlayerProps {
  videoSource: string | null;
  posterUrl?: string | null;
  title?: string;
  initialPosition?: number;
  /** Giây đã xem lưu trên server — giới hạn tua tới đó (bài hoàn thành ≈ tua toàn video). */
  watchedSeconds?: number;
  onProgressUpdate?: (info: VideoProgressInfo) => void;
  onVideoEnd?: () => void;
}

const SPEED_RATES = [0.75, 1, 1.25];
const ALL_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// presigned đổi chữ ký mỗi refetch → chỉ so origin+pathname, cùng file thì không reload
const videoKey = (url: string): string => {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
};

export const VideoPlayer = ({
  videoSource,
  posterUrl,
  title,
  initialPosition = 0,
  watchedSeconds = 0,
  onProgressUpdate,
  onVideoEnd,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  // Feedback tâm giữa khi bấm vào video: 'play' | 'pause' hiện ~550ms rồi tắt.
  const [flash, setFlash] = useState<'play' | 'pause' | null>(null);
  const flashTimerRef = useRef<number | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  // Đang tải data lúc play/tua → hiện spinner giữa video (controls gốc đã bị ẩn).
  const [isBuffering, setIsBuffering] = useState(false);

  const [activeSrc, setActiveSrc] = useState<string | null>(videoSource);
  const seekAppliedRef = useRef(false);
  // Vị trí xem tới xa nhất — tua tiến không được vượt qua phần này
  // (lùi thì tự do để xem lại phần đã lướt qua).
  const maxWatchedRef = useRef(0);
  // Vị trí xem gần nhất của video HIỆN TẠI — không đá về 0 khi phải đổi src.
  const lastTimeRef = useRef(0);
  // Key (origin+pathname) của video hiện tại — phân biệt "đổi chữ ký" vs "đổi bài".
  const srcKeyRef = useRef<string | null>(null);
  // Vị trí cần seek khi metadata sẵn sàng / khi đổi src.
  const restoreSeekRef = useRef(0);
  // Đọc prop muộn (cache progress về sau) mà không cần đưa vào deps effect reset.
  const initialPositionRef = useRef(initialPosition);
  const watchedSecondsRef = useRef(watchedSeconds);
  const timelineRef = useRef<HTMLDivElement>(null);
  const sliderInputRef = useRef<HTMLInputElement>(null);
  // Kéo thanh tua bằng chuột.
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  useEffect(() => {
    initialPositionRef.current = initialPosition;
    watchedSecondsRef.current = watchedSeconds;
  });

  useEffect(() => {
    setActiveSrc((prev) => {
      if (!videoSource) return null;
      if (prev && videoKey(prev) === videoKey(videoSource)) return prev;
      return videoSource;
    });
  }, [videoSource]);

  // Chữ ký presigned hết hạn → video báo lỗi → thay bằng URL mới nhất.
  const handleSourceError = useCallback(() => {
    setActiveSrc((prev) => (videoSource && prev !== videoSource ? videoSource : prev));
  }, [videoSource]);

  // Đổi src: cùng file (chữ ký presigned hết hạn) → GIỮ vị trí xem và phần đã xem;
  // đổi bài video khác → bắt đầu lại từ đầu như bình thường.
  useEffect(() => {
    const newKey = activeSrc ? videoKey(activeSrc) : null;
    const sameFile = newKey !== null && newKey === srcKeyRef.current;
    srcKeyRef.current = newKey;

    seekAppliedRef.current = false;
    if (!sameFile) {
      lastTimeRef.current = 0;
      maxWatchedRef.current = 0;
    }
    const restoreTo =
      initialPositionRef.current > 0 ? initialPositionRef.current : lastTimeRef.current;
    restoreSeekRef.current = restoreTo;

    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(restoreTo);
    setDuration(0);
    setFlash(null);
    setIsBuffering(false);
  }, [activeSrc]);

  // Server lưu đã xem tới đâu (watchSeconds) → giới hạn tua tới đó.
  // Bài hoàn thành (watchSeconds ≈ duration) ⇒ tua được toàn video ngay khi mở.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc || watchedSeconds <= 0) return;
    const seed = () => {
      if (!video.duration) return;
      maxWatchedRef.current = Math.max(
        maxWatchedRef.current,
        Math.min(watchedSeconds, video.duration),
      );
    };
    if (video.readyState >= 1) seed();
    else video.addEventListener('loadedmetadata', seed, { once: true });
    return () => video.removeEventListener('loadedmetadata', seed);
  }, [activeSrc, watchedSeconds]);

  // Seek vị trí đã học: chạy lại khi initialPosition về muộn, chỉ 1 lần mỗi nguồn.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc || seekAppliedRef.current) return;
    // initialPosition về muộn (cache course-progress) → cập nhật vị trí cần restore.
    if (initialPosition > restoreSeekRef.current) restoreSeekRef.current = initialPosition;

    const applySeek = () => {
      const v = videoRef.current;
      if (!v || seekAppliedRef.current) return;
      const target = restoreSeekRef.current;
      // Đã chạy qua vị trí lưu hoặc không có vị trí cần restore → không seek.
      if (target <= 0 || v.currentTime > target) {
        seekAppliedRef.current = true;
        return;
      }
      const clamped = v.duration ? Math.min(target, Math.max(0, v.duration - 0.5)) : target;
      v.currentTime = clamped;
      seekAppliedRef.current = true;
      // Vị trí resume từ server = nơi học viên đã xem tới → cho phép tua trong khoảng này.
      maxWatchedRef.current = Math.max(maxWatchedRef.current, clamped);
      lastTimeRef.current = clamped;
      setCurrentTime(clamped);
      setProgress(v.duration ? (clamped / v.duration) * 100 : 0);
    };

    if (video.readyState >= 1) applySeek();
    else video.addEventListener('loadedmetadata', applySeek, { once: true });

    return () => video.removeEventListener('loadedmetadata', applySeek);
  }, [activeSrc, initialPosition]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (playerRef.current && !playerRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const p = video.play();
      setIsPlaying(true);
      // Nguồn video không phát được → không treo state "đang phát".
      if (p && typeof p.catch === 'function') p.catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Bấm vào video → hiện icon play/pause NGAY GIỮA video trong vài trăm ms.
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const wasPaused = video.paused;
    togglePlay();
    setFlash(wasPaused ? 'play' : 'pause');
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlash(null), 550);
  }, [togglePlay]);

  useEffect(() => () => window.clearTimeout(flashTimerRef.current), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Chính sách tua: lùi tự do, tiến tối đa tới vị trí đã xem tới xa nhất
  // (maxWatchedRef) — không bỏ qua được nội dung chưa xem.
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime > maxWatchedRef.current) maxWatchedRef.current = video.currentTime;
    lastTimeRef.current = video.currentTime;
    const percent = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    setCurrentTime(video.currentTime);
    setProgress(percent);
    onProgressUpdate?.({
      currentTime: video.currentTime,
      duration: video.duration,
      percent,
      watchSeconds: Math.floor(video.currentTime),
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    // Kéo quá phần đã xem thì neo về vị trí xem xa nhất.
    const target = Math.min(
      (Number(e.target.value) / 100) * video.duration,
      maxWatchedRef.current,
    );
    video.currentTime = target;
    lastTimeRef.current = target;
    setProgress((target / video.duration) * 100);
  };

  const skip = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    // Tiến 10s chỉ trong phần đã xem; lùi thì không giới hạn.
    const maxReachable = Math.max(maxWatchedRef.current, video.currentTime);
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), maxReachable);
    lastTimeRef.current = video.currentTime;
    setCurrentTime(video.currentTime);
    setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
  }, []);

  // Seek theo % trên thanh tua — clamp trong khoảng đã xem.
  const seekToPct = useCallback((pct: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const maxPct = Math.min(100, (maxWatchedRef.current / video.duration) * 100);
    const target = Math.min(Math.max(pct, 0), maxPct);
    video.currentTime = (target / 100) * video.duration;
    lastTimeRef.current = video.currentTime;
    setProgress(target);
    setCurrentTime(video.currentTime);
  }, []);

  // Vị trí chuột trên thanh (0-100) — dùng cho hover/drag.
  const pctFromClientX = useCallback((clientX: number) => {
    const el = timelineRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);
  }, []);

  // Kéo thả: chấm bám đúng vị trí chuột, seek liên tục theo di chuyển.
  const handleTimelinePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!duration) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      seekToPct(pctFromClientX(e.clientX));
      // Giữ phím mũi tên tua được sau khi bấm chuột.
      sliderInputRef.current?.focus();
    },
    [duration, pctFromClientX, seekToPct],
  );

  const handleTimelinePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const pct = pctFromClientX(e.clientX);
      setHoverPct(pct);
      if (isDragging) seekToPct(pct);
    },
    [isDragging, pctFromClientX, seekToPct],
  );

  const handleTimelinePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsDragging(false);
    },
    [],
  );

  // Phím mũi tên khi thanh tua đang focus: ±5 giây (Home = về đầu).
  const handleSliderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        skip(-5);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        skip(5);
      } else if (e.key === 'Home') {
        e.preventDefault();
        seekToPct(0);
      }
    },
    [skip, seekToPct],
  );

  // Mũi tên ←/→ tua ±5s ngay khi đang ở trang học (không cần bấm vào thanh tua),
  // giống thói quen trên YouTube. Bỏ qua khi đang gõ trong ô nhập liệu.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const value = Number(e.target.value);
    setVolume(value);
    if (video) {
      video.volume = value;
      video.muted = value === 0;
      setIsMuted(value === 0);
    }
  };

  const toggleFullscreen = () => {
    const el = playerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const controlsVisible = !isPlaying || isHovering;

  // Phần trăm xem tới xa nhất — giới hạn trên của thanh tua.
  const watchedPercent = duration > 0 ? Math.min(100, (maxWatchedRef.current / duration) * 100) : 0;

  if (!videoSource) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl md:rounded-3xl border border-dashed border-slate-300 bg-slate-100 text-sm text-slate-500">
          Video đã bị khóa hoặc không khả dụng
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div
        ref={playerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setShowSpeedMenu(false);
        }}
        className="group relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl bg-black shadow-[0_12px_40px_rgba(15,23,42,0.18)]"
      >
        <video
          ref={videoRef}
          src={activeSrc ?? undefined}
          poster={posterUrl || undefined}
          title={title}
          className="h-full w-full object-contain"
          onClick={handleVideoClick}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onPause={() => setIsBuffering(false)}
          onError={handleSourceError}
          onEnded={() => {
            setIsPlaying(false);
            onVideoEnd?.();
          }}
          preload="metadata"
        />

        {/* Đang tải/buffer khi vừa bấm play hoặc tua */}
        {isBuffering && isPlaying && (
          <span aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]" />
          </span>
        )}

        {/* Hiệu ứng giữa video khi bấm (play/pause) */}
        {flash && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 m-auto flex h-24 w-24 animate-in fade-in zoom-in-75 items-center justify-center rounded-full bg-black/55 text-white shadow-[0_8px_40px_rgba(0,0,0,0.4)] ring-4 ring-white/20 backdrop-blur-md"
          >
            {flash === 'pause' ? (
              <Pause className="h-11 w-11 fill-current" />
            ) : (
              <Play className="ml-1.5 h-11 w-11 fill-current" />
            )}
          </span>
        )}

        {/* Nút play lớn giữa màn hình */}
        {!isPlaying && !flash && (
          <button
            onClick={handleVideoClick}
            aria-label="Phát video"
            className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-piemind-pink text-white shadow-[0_8px_30px_rgba(243,129,129,0.5)] transition-transform hover:scale-105 sm:h-20 sm:w-20"
          >
            <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" />
          </button>
        )}

        {/* Thanh điều khiển */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-12 transition-opacity duration-200 sm:px-4 sm:pb-4 ${
            controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {/* Timeline — kéo chuột bám đúng vị trí con trỏ (clamp trong phần đã xem);
              phím mũi tên tua ±5s khi thanh được focus */}
          <div
            ref={timelineRef}
            onPointerDown={handleTimelinePointerDown}
            onPointerMove={handleTimelinePointerMove}
            onPointerUp={handleTimelinePointerUp}
            onPointerCancel={handleTimelinePointerUp}
            onPointerLeave={() => setHoverPct(null)}
            title="Kéo để tua trong phần đã xem"
            className="group/scrub relative mb-3 flex h-4 cursor-pointer touch-none items-center"
          >
            <div className="relative h-1.5 w-full rounded-full bg-white/25">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/45"
                style={{ width: `${watchedPercent}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-piemind-pink"
                style={{ width: `${progress}%` }}
              />
              {/* Chấm theo con trỏ khi hover/drag — neo đúng phần được tua */}
              {hoverPct !== null && (
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-piemind-pink shadow"
                  style={{ left: `${Math.min(hoverPct, watchedPercent)}%` }}
                />
              )}
            </div>
            <input
              ref={sliderInputRef}
              type="range"
              min={0}
              max={Math.max(watchedPercent, 0.1)}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              onKeyDown={handleSliderKeyDown}
              aria-label="Tua trong phần đã xem"
              tabIndex={0}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Tạm dừng' : 'Phát video'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-piemind-pink text-white transition-transform hover:scale-105 sm:h-10 sm:w-10"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>
              <button
                onClick={() => skip(-10)}
                aria-label="Lùi 10 giây"
                title="Lùi 10 giây"
                className="hidden h-9 w-9 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white sm:flex"
              >
                <Rewind className="h-4 w-4" />
              </button>
              <button
                onClick={() => skip(10)}
                aria-label="Tiến 10 giây (chỉ trong phần đã xem)"
                title="Chỉ tiến trong phần đã xem"
                className="hidden h-9 w-9 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white sm:flex"
              >
                <FastForward className="h-4 w-4" />
              </button>
              <span className="ml-1 text-[11px] font-semibold tabular-nums text-white/85 sm:text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Tốc độ phát nhanh */}
              <div className="hidden items-center rounded-full bg-white/12 p-0.5 sm:flex">
                {SPEED_RATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      playbackRate === rate
                        ? 'bg-piemind-pink text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {rate.toFixed(2).replace(/0$/, '')}x
                  </button>
                ))}
              </div>

              {/* Menu tốc độ đầy đủ */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((v) => !v)}
                  aria-label="Cài đặt tốc độ phát"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tốc độ
                    </div>
                    {ALL_RATES.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50 ${
                          playbackRate === rate ? 'text-piemind-pink' : 'text-slate-600'
                        }`}
                      >
                        {rate.toFixed(2).replace(/0$/, '')}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Âm lượng */}
              <div className="group/vol hidden items-center gap-2 sm:flex">
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Âm lượng"
                  className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 accent-piemind-pink transition-all duration-200 group-hover/vol:w-20"
                />
              </div>

              <button
                onClick={toggleFullscreen}
                aria-label="Toàn màn hình"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
