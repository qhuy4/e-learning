import { Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@fe/components/ui/avatar";
import type { CourseDetail } from "../../types/course.type";

interface CourseInstructorProps {
  instructor?: CourseDetail["instructor"];
}

export const CourseInstructor = ({ instructor }: CourseInstructorProps) => {
  if (!instructor) return null;

  const name = instructor.name || "Giảng viên";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin giảng viên</h2>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm">
          <AvatarImage src={`https://i.pravatar.cc/150?u=${(instructor as any).userId ?? instructor.id}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{name}</h3>
          {instructor.headline && (
            <div className="text-rose-500 font-medium text-sm mb-3">{instructor.headline}</div>
          )}
          
          {instructor.bio && (
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{instructor.bio}</p>
          )}
          
          {instructor.websiteUrl && (
            <div className="flex gap-3">
              <a
                href={instructor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
