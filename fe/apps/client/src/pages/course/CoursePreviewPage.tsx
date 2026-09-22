import { ChevronRight, School } from "lucide-react";
import { Link, useParams } from "react-router";
import { CourseHeader } from "@/features/courses/components/CourseDetail/CourseHeader";
import { CourseContent } from "@/features/courses/components/CourseDetail/CourseContent";
import { CourseSidebar } from "@/features/courses/components/CourseDetail/CourseSidebar";
import { usePreviewCourse } from "@/features/courses/hooks/use-courses";

export const CoursePreviewPage = () => {
  const { token } = useParams<{ token: string }>();

  const { data: course, isLoading, isError } = usePreviewCourse(token ?? "");

  const courseData = (course as any)?.data ?? course;

  if (isLoading) return <div>Loading...</div>;

  if (isError || !course) {
    return <div>Không tìm thấy khóa học hoặc không có quyền xem thử</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-m3-on-surface-variant font-label-lg">
        <Link to="/courses" className="hover:text-m3-primary transition-colors flex items-center gap-1">
          <School className="size-4" />
          <span>Courses</span>
        </Link>
        <ChevronRight className="size-4 text-m3-outline-variant" />
        <span className="text-m3-on-surface font-bold">Preview</span>
      </nav>

      {/* Course Header Hero */}
      <CourseHeader course={courseData} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Main Content */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          <CourseContent course={courseData} />
        </main>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4">
          <CourseSidebar course={courseData} />
        </div>
      </div>
    </div>
  );
};
