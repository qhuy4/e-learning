import { PlayCircle, CheckCircle2, Lock, File } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@fe/components/ui/accordion';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { LearningSection } from '../../types/learning.type';

interface LearningSidebarProps {
  sections: LearningSection[];
  courseSlug: string;
}

export const LearningSidebar = ({ sections, courseSlug }: LearningSidebarProps) => {
  const { lessonSlug } = useParams<{ lessonSlug: string }>();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('previewToken');

  // Determine which sections to open by default based on active lesson
  const activeSectionId = sections.find((s) =>
    s.lessons.some((l) => l.slug === lessonSlug)
  )?.id;

  const defaultValues = activeSectionId ? [String(activeSectionId)] : sections.length > 0 ? [String(sections[0].id)] : [];

  const formatDuration = (duration: number | null) => {
    if (!duration) return '00:00';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      <div className="p-4 md:p-6 border-b border-slate-200 sticky top-0 bg-white z-10 shrink-0">
        <h2 className="font-bold text-slate-900 text-lg">Nội dung khóa học</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <Accordion type="multiple" defaultValue={defaultValues}>
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={String(section.id)}
              className={`border border-slate-200 rounded-xl px-2 sm:px-4 mb-4 overflow-hidden transition-colors ${
                section.id === activeSectionId ? 'bg-[#e0f7f4]/30 border-[#b2e5df]' : 'bg-white'
              }`}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col items-start text-left w-full">
                  <span className="font-semibold text-slate-900 text-sm mb-1">{section.title}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-normal w-full">
                    <span>{0}/{section.lessons.length} bài</span>
                    <span>•</span>
                    <span>{formatDuration(section.lessons.reduce((acc, l) => acc + (l.duration || 0), 0))}</span>
                  </div>
                </div>
              </AccordionTrigger>
              {section.lessons.length > 0 && (
                <AccordionContent className="pb-4 pt-1">
                  <div className="space-y-1">
                    {section.lessons.map((lesson) => {
                      const isActive = lesson.slug === lessonSlug;
                      // In a real app, this would come from user progress
                      const isCompleted = false; 
                      // If it's a paid course and not enrolled, might be locked if not preview
                      const isLocked = !lesson.isPreview && !previewToken;

                      return (
                        <div key={lesson.id}>
                        {isLocked ? (
                          <div className="flex items-start gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                            <div className="mt-1 shrink-0">
                               <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium mb-1 text-slate-500">{lesson.title}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <PlayCircle className="w-3 h-3" />
                                <span>{formatDuration(lesson.duration)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/learning/${courseSlug}/${lesson.slug}${previewToken ? `?previewToken=${previewToken}` : ''}`}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="mt-1 shrink-0">
                              {isActive ? (
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className={`text-sm mb-1 ${isActive ? 'font-semibold' : ''}`}>
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs opacity-70">
                                <span>{formatDuration(lesson.duration)}</span>
                              </div>
                            </div>
                          </Link>
                        )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
