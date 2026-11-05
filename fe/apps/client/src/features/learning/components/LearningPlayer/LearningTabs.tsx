import { Tabs, TabsList, TabsTrigger, TabsContent } from '@fe/components/ui/tabs';
import { FileText, Download } from 'lucide-react';
import type { LessonDetail } from '../../types/learning.type';
import { useLessonMaterials } from '../../hooks/use-learning';
import { LessonNotes } from '../LessonNotes';
import { LessonComments } from '../LessonComments';
import type { VideoPlayerHandle } from './VideoPlayer';
import type { RefObject } from 'react';

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
  previewToken?: string;
  /** Ref player video — panel Ghi chú dùng để tua về mốc note */
  videoRef?: RefObject<VideoPlayerHandle | null>;
}

export const LearningTabs = ({
  lesson,
  previewToken,
  videoRef,
}: LearningTabsProps) => {
  const {
    data: materials,
    isLoading: materialsLoading,
    isError: materialsError,
  } = useLessonMaterials(lesson.id, true, previewToken);

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full font-sans">
      <Tabs defaultValue="overview" className="w-full">
        {/* Tab strip kiểu chuyên nghiệp: chữ trái + gạch dưới hồng khi chọn */}
        <TabsList
          variant="line"
          className="w-full justify-start gap-5 sm:gap-8 flex-wrap p-0 group-data-horizontal/tabs:h-auto border-b border-slate-200"
        >
          {/* Bài kiểm tra không có video → ẩn tab Ghi chú */}
          {(
            [
              ['overview', 'Tổng quan'],
              ...(lesson.type === 'quiz' ? [] : [['notes', 'Ghi chú']]),
              ['qa', 'Hỏi đáp'],
              ['resources', 'Tài liệu'],
            ] as Array<[string, string]>
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-none rounded-none px-1 pt-2 pb-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 data-active:text-piemind-pink data-active:after:opacity-100 after:bg-piemind-pink group-data-horizontal/tabs:after:bottom-[-2px] group-data-horizontal/tabs:after:h-[3px]"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TAB TỔNG QUAN */}
        <TabsContent value="overview" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Về bài học này</h2>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            {lesson.content ?? 'Chưa có mô tả cho bài học này.'}
          </p>
        </TabsContent>

        {/* TAB GHI CHÚ — ghi chú cá nhân theo mốc thời gian, bấm vào để tua lại */}
        <TabsContent value="notes" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
          <LessonNotes lessonId={lesson.id} videoRef={videoRef} />
        </TabsContent>

        {/* TAB HỎI ĐÁP — bình luận nhiều cấp, giảng viên trả lời trực tiếp */}
        <TabsContent value="qa" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
          <LessonComments lessonId={lesson.id} />
        </TabsContent>

        {/* TAB TÀI LIỆU */}
        <TabsContent value="resources" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
          {materialsLoading ? (
            <p className="text-sm text-slate-500 text-center py-8">Đang tải tài liệu...</p>
          ) : materialsError ? (
            <p className="text-sm text-slate-500 text-center py-8">
              {previewToken
                ? 'Không thể tải tài liệu trong chế độ xem trước.'
                : 'Không thể tải tài liệu. Vui lòng đăng nhập và ghi danh khóa học.'}
            </p>
          ) : !materials || materials.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Chưa có tài liệu đính kèm.</p>
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
