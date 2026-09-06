import { Tabs, TabsList, TabsTrigger, TabsContent } from '@fe/components/ui/tabs';
import { FileText, MessageSquare, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@fe/components/ui/avatar';
import type { LessonDetail } from '../../types/learning.type';

interface LearningTabsProps {
  lesson: LessonDetail;
}

export const LearningTabs = ({ lesson }: LearningTabsProps) => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto lg:mx-0 w-full font-sans">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-fit flex-wrap sm:flex-nowrap justify-start p-1.5 h-auto bg-slate-100 rounded-lg mb-6 gap-1">
          <TabsTrigger value="overview" className="rounded-sm py-3 px-6 sm:px-8 text-base font-semibold transition-all hover:bg-slate-200/50 data-[state=active]:shadow-sm">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-sm py-3 px-6 sm:px-8 text-base font-semibold transition-all hover:bg-slate-200/50 data-[state=active]:shadow-sm">
            Ghi chú
          </TabsTrigger>
          <TabsTrigger value="qa" className="rounded-sm py-3 px-6 sm:px-8 text-base font-semibold transition-all hover:bg-slate-200/50 data-[state=active]:shadow-sm">
            Hỏi đáp
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-sm py-3 px-6 sm:px-8 text-base font-semibold transition-all hover:bg-slate-200/50 data-[state=active]:shadow-sm">
            Tài liệu
          </TabsTrigger>
        </TabsList>

        {/* TAB TỔNG QUAN */}
        <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Về bài học này</h2>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            {lesson.content ?? 'Chưa có mô tả cho bài học này.'}
          </p>
        </TabsContent>

        {/* TAB GHI CHÚ */}
        <TabsContent value="notes" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input
              type="text"
              placeholder={`Thêm ghi chú mới tại ${lesson.duration ? Math.floor(lesson.duration / 60) + ':' + String(lesson.duration % 60).padStart(2, '0') : '00:00'}...`}
              className="flex-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 bg-white"
            />
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto shrink-0 shadow-sm">
              Lưu ghi chú
            </button>
          </div>

          <p className="text-sm text-slate-400 text-center py-8">Chưa có ghi chú nào.</p>
        </TabsContent>

        {/* TAB HỎI ĐÁP */}
        <TabsContent value="qa" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Bình luận <MessageSquare className="w-4 h-4 text-slate-400" />
          </h3>

          {/* Form bình luận */}
          <div className="flex gap-4 mb-8">
            <Avatar className="w-10 h-10 shrink-0 border border-slate-100">
              <AvatarImage src="https://i.pravatar.cc/150?u=my_user" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col items-end gap-3">
              <textarea
                placeholder="Bạn có thắc mắc gì về bài học này?"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 min-h-[90px] resize-y bg-slate-50/50 focus:bg-white transition-colors"
              />
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
                Gửi câu hỏi
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-sm text-slate-400 text-center py-8">Chưa có câu hỏi nào.</p>
          </div>
        </TabsContent>

        {/* TAB TÀI LIỆU */}
        <TabsContent value="resources" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm text-slate-400 text-center py-8">Chưa có tài liệu đính kèm.</p>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer bg-white group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {lesson.title}_Resources.pdf
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Tài liệu tham khảo</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-emerald-600 hover:text-white px-5 py-2.5 border-2 border-emerald-100 hover:border-emerald-500 rounded-xl bg-emerald-50/50 hover:bg-emerald-500 transition-colors shadow-sm">
              Tải xuống
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
