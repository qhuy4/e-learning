import { Tabs, TabsList, TabsTrigger, TabsContent } from '@fe/components/ui/tabs';
import { FileText, MessageSquare, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@fe/components/ui/avatar';
import type { LessonDetail } from '../../types/learning.type';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLessonMaterials } from '../../hooks/use-learning';

const formatFileSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileExt = (name: string) => {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toUpperCase() : 'FILE';
};

interface LearningTabsProps {
  lesson: LessonDetail;
}

export const LearningTabs = ({ lesson }: LearningTabsProps) => {
  const { user } = useAuth();
  const {
    data: materials,
    isLoading: materialsLoading,
    isError: materialsError,
  } = useLessonMaterials(lesson.id);
  const userInitials =
    (user?.name || user?.email || 'Học viên')
      .split(/[\s@.]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'HV';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto lg:mx-0 w-full font-sans">
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab strip kiểu chuyên nghiệp: chữ trái + gạch dưới hồng khi chọn */}
        <TabsList
          variant="line"
          className="w-full justify-start gap-5 sm:gap-8 flex-wrap p-0 group-data-horizontal/tabs:h-auto border-b border-slate-200"
        >
          {(
            [
              ['overview', 'Tổng quan'],
              ['notes', 'Ghi chú'],
              ['qa', 'Hỏi đáp'],
              ['resources', 'Tài liệu'],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-none rounded-none px-1 pt-2 pb-3.5 text-sm font-bold text-slate-400 hover:text-slate-700 data-active:text-piemind-pink data-active:after:opacity-100 after:bg-piemind-pink group-data-horizontal/tabs:after:bottom-[-2px] group-data-horizontal/tabs:after:h-[3px]"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TAB TỔNG QUAN */}
        <TabsContent value="overview" className="pt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Về bài học này</h2>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            {lesson.content ?? 'Chưa có mô tả cho bài học này.'}
          </p>
        </TabsContent>

        {/* TAB GHI CHÚ */}
        <TabsContent value="notes" className="pt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        <TabsContent value="qa" className="pt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Bình luận <MessageSquare className="w-4 h-4 text-slate-400" />
          </h3>

          {/* Form bình luận */}
          <div className="flex gap-4 mb-8">
            <Avatar className="w-10 h-10 shrink-0 border border-slate-100">
              <AvatarImage src={user?.avatar ?? undefined} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                {userInitials}
              </AvatarFallback>
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
        <TabsContent value="resources" className="pt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {materialsLoading ? (
            <p className="text-sm text-slate-400 text-center py-8">Đang tải tài liệu...</p>
          ) : materialsError ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Không thể tải tài liệu. Vui lòng đăng nhập và ghi danh khóa học.
            </p>
          ) : !materials || materials.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Chưa có tài liệu đính kèm.</p>
          ) : (
            <div className="space-y-3">
              {materials.map((m) => {
                const size = formatFileSize(m.fileSize);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-4 p-4 border border-slate-200 rounded-2xl hover:border-piemind-pink/30 hover:shadow-md transition-all bg-white group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-piemind-pink/10 text-piemind-pink rounded-xl flex items-center justify-center shrink-0 group-hover:bg-piemind-pink/15 transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 truncate">
                          {m.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                          {fileExt(m.fileName)}
                          {size && ` · ${size}`}
                          {m.description ? ` · ${m.description}` : ''}
                        </p>
                      </div>
                    </div>
                    {m.downloadUrl && (
                      <a
                        href={m.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-2 text-sm font-semibold text-piemind-pink px-5 py-2.5 border-2 border-piemind-pink/20 rounded-xl hover:bg-piemind-pink hover:border-piemind-pink hover:text-white transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Tải xuống
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
