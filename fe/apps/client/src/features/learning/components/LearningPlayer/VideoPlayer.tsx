import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Rewind, FastForward } from 'lucide-react';

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

export const VideoPlayer = ({
  videoSource,
  posterUrl,
  title,
  initialPosition = 0,
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

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [videoSource]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0) return;

    const seekIfNeeded = () => {
      if (videoRef.current && videoRef.current === video) {
        videoRef.current.currentTime = initialPosition;
        setProgress(duration > 0 ? (initialPosition / duration) * 100 : 0);
        setCurrentTime(initialPosition);
      }
    };

    if (video.readyState >= 1) seekIfNeeded();
    else video.addEventListener('loadedmetadata', seekIfNeeded, { once: true });

    return () => video.removeEventListener('loadedmetadata', seekIfNeeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSource]);

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
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const skip = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || Infinity);
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
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
    const value = Number(e.target.value);
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

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
          src={videoSource}
          poster={posterUrl || undefined}
          title={title}
          className="h-full w-full object-contain"
          onClick={handleVideoClick}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => {
            setIsPlaying(false);
            onVideoEnd?.();
          }}
          preload="metadata"
        />

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
          {/* Timeline */}
          <div className="group/scrub relative mb-3 flex h-4 items-center">
            <div className="relative h-1.5 w-full rounded-full bg-white/25">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-piemind-pink"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-piemind-pink opacity-0 shadow transition-opacity group-hover/scrub:opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              aria-label="Tua video"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
                className="hidden h-9 w-9 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white sm:flex"
              >
                <Rewind className="h-4 w-4" />
              </button>
              <button
                onClick={() => skip(10)}
                aria-label="Tiến 10 giây"
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
