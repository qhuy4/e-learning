import { Link } from "react-router";
import { Play, Clock, BookOpen } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { Enrollment } from "../services/enrollment.service";

interface CourseCardEnrolledProps {
  enrollment: Enrollment;
}

export const CourseCardEnrolled = ({ enrollment }: CourseCardEnrolledProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-slate-100">
        {enrollment.courseThumbnail ? (
          <img
            src={enrollment.courseThumbnail}
            alt={enrollment.courseTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
          {enrollment.progress}% hoàn thành
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">
          {enrollment.courseTitle}
        </h3>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${enrollment.progress}%` }}
          />
        </div>

        <Link to={`/courses/${enrollment.courseSlug}`}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-5">
            <Play className="w-4 h-4 mr-2 fill-current" />
            Tiếp tục học
          </Button>
        </Link>
      </div>
    </div>
  );
};
