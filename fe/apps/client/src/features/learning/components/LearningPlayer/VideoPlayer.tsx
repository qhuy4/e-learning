import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  videoSource: string | null;
  posterUrl?: string | null;
  title?: string;
}

export const VideoPlayer = ({ videoSource, posterUrl, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      if (total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      const newTime = (value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const toggleFullScreen = () => {
    if (playerRef.current) {
      if (!document.fullscreenElement) {
        playerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoSource) {
    return (
      <div className="w-full bg-[#0f172a] border-b border-slate-200 flex justify-center">
        <div className="w-full max-w-5xl relative aspect-video">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 shadow-inner">
               <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <p className="text-sm font-medium">Video đã bị khóa hoặc không khả dụng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0f172a] flex justify-center shadow-xl z-20 relative">
      <div 
        ref={playerRef}
        className="w-full max-w-5xl relative aspect-video bg-black group flex flex-col overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setShowSpeedMenu(false); }}
      >
        <video
          ref={videoRef}
          src={videoSource}
          poster={posterUrl ?? undefined}
          title={title}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-none transition-opacity duration-300"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/90 rounded-full flex items-center justify-center text-white backdrop-blur-md shadow-lg shadow-emerald-500/20 transform hover:scale-110 transition-transform pointer-events-auto" onClick={togglePlay}>
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1.5 fill-white" />
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 px-4 pb-4 transition-all duration-300 ${
            isPlaying && !isHovering ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Timeline / Progress Bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white text-xs font-medium w-10 text-center">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1.5 sm:h-2 rounded-full bg-slate-600/50 group/scrub cursor-pointer flex items-center">
              <div 
                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-75 ease-linear pointer-events-none" 
                style={{ width: `${progress}%` }} 
              />
              {/* Thumb */}
              <div 
                className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow hover:scale-125 transition-transform pointer-events-none opacity-0 group-hover/scrub:opacity-100"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-white text-xs font-medium w-10 text-center">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4 sm:gap-6">
              <button onClick={togglePlay} className="hover:text-emerald-400 transition-colors focus:outline-none">
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />}
              </button>

              <div className="flex items-center gap-2 group/vol relative">
                <button onClick={toggleMute} className="hover:text-emerald-400 transition-colors focus:outline-none">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-20 sm:group-hover/vol:w-24 transition-all duration-300 ease-out flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 accent-emerald-500 bg-slate-600 rounded-full cursor-pointer appearance-none"
                    style={{
                      background: `linear-gradient(to right, #10b981 ${(isMuted ? 0 : volume) * 100}%, #475569 ${(isMuted ? 0 : volume) * 100}%)`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:text-emerald-400 transition-colors bg-white/10 px-2 py-1 rounded-md"
                >
                  <Settings className="w-4 h-4" />
                  {playbackRate}x
                </button>
                
                {/* Speed Menu */}
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-3 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl overflow-hidden min-w-32 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors flex items-center justify-between ${
                          playbackRate === rate ? 'text-emerald-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                        }`}
                      >
                        {rate === 1 ? 'Chuẩn' : `${rate}x`}
                        {playbackRate === rate && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullScreen} className="hover:text-emerald-400 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
