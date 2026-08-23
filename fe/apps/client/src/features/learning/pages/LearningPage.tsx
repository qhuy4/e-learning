import {
  LearningHeader,
  VideoPlayer,
  LearningTabs,
  LearningSidebar,
} from "../components/LearningPlayer";

export const LearningPage = () => {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top Header */}
      <LearningHeader />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-64px)]">
        
        {/* Left Column (Video + Tabs) */}
        <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar">
          <VideoPlayer />
          <LearningTabs />
        </div>
        
        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 h-[50vh] lg:h-full">
          <LearningSidebar />
        </div>
        
      </div>
    </div>
  );
};
