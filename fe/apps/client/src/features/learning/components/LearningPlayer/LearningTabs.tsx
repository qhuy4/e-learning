import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fe/components/ui/tabs";
import { FileText, MessageSquare, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@fe/components/ui/avatar";

export const LearningTabs = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto lg:mx-0 w-full font-sans">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-fit flex-wrap sm:flex-nowrap justify-start p-2 h-auto bg-slate-100/80 rounded-2xl mb-8">
          <TabsTrigger value="overview" className="rounded-xl py-2.5 sm:py-3 px-4 sm:px-8 text-sm sm:text-base font-semibold transition-all">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-xl py-2.5 sm:py-3 px-4 sm:px-8 text-sm sm:text-base font-semibold transition-all">
            Ghi chú
          </TabsTrigger>
          <TabsTrigger value="qa" className="rounded-xl py-2.5 sm:py-3 px-4 sm:px-8 text-sm sm:text-base font-semibold transition-all">
            Hỏi đáp
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-xl py-2.5 sm:py-3 px-4 sm:px-8 text-sm sm:text-base font-semibold transition-all">
            Tài liệu
          </TabsTrigger>
        </TabsList>
        
        {/* TAB TỔNG QUAN */}
        <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Về bài học này</h2>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Trong bài học này, chúng ta sẽ tìm hiểu sâu về tầm quan trọng của việc nghiên cứu người dùng (User Research) trước khi bắt tay vào thiết kế. Việc hiểu rõ người dùng mục tiêu sẽ giúp bạn tạo ra những sản phẩm UI/UX không chỉ đẹp mắt mà còn giải quyết đúng vấn đề của họ.
          </p>
        </TabsContent>
        
        {/* TAB GHI CHÚ */}
        <TabsContent value="notes" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input 
              type="text" 
              placeholder="Thêm ghi chú mới tại 14:20..." 
              className="flex-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 bg-white"
            />
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto shrink-0 shadow-sm">
              Lưu ghi chú
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
              <div className="bg-[#e0f7f4] text-[#00a884] font-semibold px-2.5 py-1 rounded-md text-xs h-fit shrink-0 cursor-pointer hover:bg-[#c9f0eb]">
                02:15
              </div>
              <div>
                <p className="text-sm text-slate-700">Định nghĩa lại Persona, nhớ áp dụng cho project cuối khóa.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
              <div className="bg-[#e0f7f4] text-[#00a884] font-semibold px-2.5 py-1 rounded-md text-xs h-fit shrink-0 cursor-pointer hover:bg-[#c9f0eb]">
                08:40
              </div>
              <div>
                <p className="text-sm text-slate-700">Các bước vẽ User Journey Maps cơ bản.</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* TAB HỎI ĐÁP */}
        <TabsContent value="qa" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            2 Bình luận <MessageSquare className="w-4 h-4 text-slate-400" />
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
          
          {/* Danh sách bình luận */}
          <div className="space-y-8">
            {/* Bình luận 1 */}
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 shrink-0 border border-slate-100">
                <AvatarImage src="https://i.pravatar.cc/150?u=user1" />
                <AvatarFallback>HN</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-900">Hoàng Nam</h4>
                    <span className="text-xs font-medium text-slate-400">2 ngày trước</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Cho mình hỏi đoạn 14:20, khi phỏng vấn user thì mình nên chuẩn bị bao nhiêu câu hỏi là vừa đủ để không làm họ bị mệt ạ?
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 mb-4 ml-1">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> 12
                  </button>
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Phản hồi</button>
                </div>
                
                {/* Reply */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0 border border-slate-100">
                    <AvatarImage src="https://i.pravatar.cc/150?u=bao-anh" />
                    <AvatarFallback>BA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-[#e0f7f4]/40 border border-[#b2e5df]/50 rounded-2xl rounded-tl-none p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-slate-900">Bảo Anh</h4>
                        <span className="bg-[#00a884] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Giảng viên</span>
                        <span className="text-xs font-medium text-slate-400 ml-auto">1 ngày trước</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Chào Nam, thông thường một buổi phỏng vấn sâu kéo dài 30-45 phút, bạn nên chuẩn bị khoảng 10-15 câu hỏi chính. Và nhớ chuẩn bị thêm kịch bản dự phòng nhé!
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-1">
                      <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" /> 5
                      </button>
                      <button className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Phản hồi</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* TAB TÀI LIỆU */}
        <TabsContent value="resources" className="focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer bg-white group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">User_Research_Template.pdf</h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">2.4 MB • Tài liệu tham khảo</p>
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
