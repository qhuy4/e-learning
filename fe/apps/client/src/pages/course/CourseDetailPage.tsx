import { ChevronRight, School } from "lucide-react";
import { Link, useParams } from "react-router";
import { CourseHeader } from "@/features/courses/components/CourseDetail/CourseHeader";
import { CourseContent } from "@/features/courses/components/CourseDetail/CourseContent";
import { CourseSidebar } from "@/features/courses/components/CourseDetail/CourseSidebar";
import { CourseLearningOutcomes } from "@/features/courses/components/CourseDetail/CourseLearningOutcomes";
import { RelatedCourses } from "@/features/courses/components/CourseDetail/RelatedCourses";
import { CourseReviewsSection } from "@/features/reviews/components/CourseReviewsSection";
import { useCourseBySlug } from "@/features/courses/hooks/use-courses";
import { useEnrollmentCheck } from "@/features/enrollment/hooks/use-enrollment";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const { data: course, isLoading, isError } = useCourseBySlug(slug ?? "");
  const rawData = (course as any)?.data ?? course;
  const courseData = rawData?.data ?? rawData;

  const { data: enrollmentCheck } = useEnrollmentCheck(
    courseData?.slug,
    isAuthenticated,
  );
  const isEnrolled = isAuthenticated && enrollmentCheck?.enrolled === true;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-6">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-64 bg-muted rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-48 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !courseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="bg-card rounded-xl border border-primary/30 shadow-sm p-12 text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy khóa học</p>
          <Link to="/courses" className="text-piemind-pink font-bold text-sm mt-2 inline-block hover:underline">
            Khám phá khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/courses" className="hover:text-piemind-pink transition-colors flex items-center gap-1">
          <School className="size-4" />
          <span>Khóa học</span>
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <span className="text-foreground font-bold">{courseData.title}</span>
      </nav>

      {/* Course Header Hero */}
      <CourseHeader course={courseData} />

      {/* Learning Outcomes */}
      <CourseLearningOutcomes course={courseData} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Main Content */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          <CourseContent course={courseData} isEnrolled={isEnrolled} />
        </main>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4">
          <CourseSidebar course={courseData} isEnrolled={isEnrolled} />
        </div>
      </div>

      {/* Đánh giá từ học viên */}
      <CourseReviewsSection courseId={courseData.id} />

      {/* Related Courses */}
      {slug && <RelatedCourses courseSlug={slug} />}
    </div>
  );
};
