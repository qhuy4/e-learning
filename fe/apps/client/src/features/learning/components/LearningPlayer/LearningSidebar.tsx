import { PlayCircle, CheckCircle2, Lock, File } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fe/components/ui/accordion";

export const LearningSidebar = () => {
  const sections = [
    {
      id: "sec1",
      title: "Section 1: Introduction",
      progress: "3 / 3 | 15 min",
      lessons: [
        { title: "1. Welcome to the Course", duration: "2:30", type: "video", status: "completed" },
        { title: "2. What is UI/UX Design?", duration: "5:45", type: "video", status: "completed" },
        { title: "3. Tools You Need", duration: "Reading", type: "reading", status: "completed" },
      ],
    },
    {
      id: "sec2",
      title: "Section 2: Research & Strategy",
      progress: "1 / 5 | 45 min",
      lessons: [
        { title: "4. Understanding User Research", duration: "14:20", type: "video", status: "active" },
        { title: "5. Creating Personas", duration: "10:15", type: "video", status: "locked" },
        { title: "6. User Journey Maps", duration: "08:40", type: "video", status: "locked" },
      ],
    },
    {
      id: "sec3",
      title: "Section 3: Wireframing",
      progress: "0 / 4 | 60 min",
      lessons: [],
    },
    {
      id: "sec4",
      title: "Section 4: Visual Design",
      progress: "0 / 8 | 90 min",
      lessons: [],
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      <div className="p-4 md:p-6 border-b border-slate-200 sticky top-0 bg-white z-10 shrink-0">
        <h2 className="font-bold text-slate-900 text-lg">Course Content</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <Accordion defaultValue={["sec1", "sec2"]}>
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className={`border border-slate-200 rounded-xl px-2 sm:px-4 mb-4 overflow-hidden transition-colors ${
                section.id === "sec2" ? "bg-[#e0f7f4]/30 border-[#b2e5df]" : "bg-white"
              }`}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-slate-900 text-sm">{section.title}</span>
                  <span className="text-xs text-slate-500 font-normal mt-1">{section.progress}</span>
                </div>
              </AccordionTrigger>
              {section.lessons.length > 0 && (
                <AccordionContent className="pb-4 pt-1">
                  <div className="space-y-1">
                    {section.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${
                          lesson.status === "active" ? "bg-white shadow-sm ring-1 ring-slate-100" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {lesson.status === "completed" && <CheckCircle2 className="w-4 h-4 text-[#00a884]" />}
                          {lesson.status === "active" && <PlayCircle className="w-4 h-4 text-[#00a884] fill-[#e0f7f4]" />}
                          {lesson.status === "locked" && <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div>}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium mb-1 ${
                            lesson.status === "active" ? "text-slate-900" : 
                            lesson.status === "locked" ? "text-slate-400" : "text-slate-700"
                          }`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            {lesson.type === "video" ? (
                              <PlayCircle className="w-3 h-3" />
                            ) : (
                              <File className="w-3 h-3" />
                            )}
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                        
                        {lesson.status === "locked" && (
                          <Lock className="w-3.5 h-3.5 text-slate-300 mt-1 shrink-0" />
                        )}
                      </div>
                    ))}
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
