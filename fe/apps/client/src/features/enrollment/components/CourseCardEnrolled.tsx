import { Link } from "react-router";
import { Play, Clock, BookOpen, Bookmark, CheckCircle2, User } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import type { Enrollment } from "../services/enrollment.service";

interface CourseCardEnrolledProps {
  enrollment: Enrollment;
}

export const CourseCardEnrolled = ({ enrollment }: CourseCardEnrolledProps) => {
  const isCompleted = enrollment.progress >= 100;

  return (
    <div className="group relative bg-white border border-slate-100/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail Section */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {enrollment.courseThumbnail ? (
          <img
            src={enrollment.courseThumbnail}
            alt={enrollment.courseTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-teal-400">
            <BookOpen className="w-10 h-10" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
          {isCompleted ? "Đã hoàn thành" : "Khóa học"}
        </div>

        <button
          type="button"
          aria-label="Bookmark course"
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 hover:text-rose-500 rounded-full p-2 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors mb-2">
            {enrollment.courseTitle}
          </h3>

          {/* Instructor Name */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 font-semibold truncate">
              {enrollment.instructorName || "Giảng viên e-Learning"}
            </span>
          </div>

          {/* Progress section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Tiến độ học tập</span>
              <span className="text-emerald-600 font-bold">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, enrollment.progress))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Meta & Action */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {enrollment.enrolledAt
                  ? new Date(enrollment.enrolledAt).toLocaleDateString("vi-VN")
                  : "Mới đăng ký"}
              </span>
            </div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Hoàn thành
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                <Play className="w-3 h-3 fill-current" /> Đang học
              </span>
            )}
          </div>

          <Link to={`/courses/${enrollment.courseSlug}`} className="block w-full">
            <Button className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-2xl text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group-hover:bg-emerald-600">
              <Play className="w-4 h-4 fill-current" />
              {isCompleted ? "Xem lại khóa học" : "Tiếp tục học"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
