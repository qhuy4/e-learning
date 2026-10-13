import { Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@fe/components/ui/avatar";
import type { CourseDetail } from "@/features/courses/types/course.type";

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
    <div className="bg-white border border-primary/30 rounded-xl p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Giảng viên</h2>

      <div className="flex flex-col md:flex-row gap-5 items-start">
        <Avatar className="w-20 h-20 border-2 border-primary/20 shrink-0">
          <AvatarImage src={instructor.avatar ?? undefined} />
          <AvatarFallback className="bg-piemind-green/30 text-m3-secondary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900">{name}</h3>
          {instructor.headline && (
            <div className="text-piemind-pink font-medium text-sm mt-0.5">
              {instructor.headline}
            </div>
          )}

          {instructor.bio && (
            <p className="text-slate-600 text-sm leading-relaxed mt-3">
              {instructor.bio}
            </p>
          )}

          {instructor.websiteUrl && (
            <div className="mt-3">
              <a
                href={instructor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-piemind-pink hover:underline"
              >
                <Globe className="size-3.5" />
                Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
