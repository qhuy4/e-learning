import { ChevronRight, Eye, ExternalLink, School } from "lucide-react";
import { Link, useParams } from "react-router";
import { CourseHeader } from "@/features/courses/components/CourseDetail/CourseHeader";
import { CourseContent } from "@/features/courses/components/CourseDetail/CourseContent";
import { CourseLearningOutcomes } from "@/features/courses/components/CourseDetail/CourseLearningOutcomes";
import { CourseSidebar } from "@/features/courses/components/CourseDetail/CourseSidebar";
import { usePreviewCourse } from "@/features/courses/hooks/use-courses";

const INSTRUCTOR_URL =
  import.meta.env.VITE_INSTRUCTOR_URL ?? "http://localhost:5175";

export const CoursePreviewPage = () => {
  const { token } = useParams<{ token: string }>();

  const { data: course, isLoading, isError } = usePreviewCourse(token ?? "");

  const courseData = course;

  if (isLoading) return <div>Đang tải...</div>;

  if (isError || !courseData) {
    return <div>Không tìm thấy khóa học hoặc không có quyền xem thử</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-m3-on-surface-variant font-label-lg">
        <Link to="/courses" className="hover:text-m3-primary transition-colors flex items-center gap-1">
          <School className="size-4" />
          <span>Khóa học</span>
        </Link>
        <ChevronRight className="size-4 text-m3-outline-variant" />
        <span className="text-m3-on-surface font-bold">Xem thử</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
          <Eye className="size-4" />
          Bạn đang xem trước khóa học
        </div>
        <a
          href={`${INSTRUCTOR_URL}/courses/${courseData.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
        >
          Quay lại chỉnh sửa
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Course Header Hero */}
      <CourseHeader course={courseData} />

      <CourseLearningOutcomes course={courseData} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Main Content */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          <CourseContent
            course={courseData}
            previewMode
            previewToken={token}
          />
        </main>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4">
          <CourseSidebar course={courseData} previewMode />
        </div>
      </div>
    </div>
  );
};
