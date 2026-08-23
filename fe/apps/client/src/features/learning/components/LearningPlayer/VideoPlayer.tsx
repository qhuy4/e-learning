

export const VideoPlayer = () => {
  return (
    <div className="w-full bg-black relative shadow-sm border-b border-slate-200">
      {/* 16:9 Aspect Ratio Wrapper */}
      <div className="relative w-full pb-[56.25%]">
        <video 
          className="absolute inset-0 w-full h-full"
          controls
          poster="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1200&auto=format&fit=crop"
        >
          <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      </div>
    </div>
  );
};
