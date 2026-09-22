import { ChevronRight, School } from "lucide-react";
import { Link, useParams } from "react-router";
import { CourseHeader } from "@/features/courses/components/CourseDetail/CourseHeader";
import { CourseContent } from "@/features/courses/components/CourseDetail/CourseContent";
import { CourseSidebar } from "@/features/courses/components/CourseDetail/CourseSidebar";
import { CourseLearningOutcomes } from "@/features/courses/components/CourseDetail/CourseLearningOutcomes";
import { RelatedCourses } from "@/features/courses/components/CourseDetail/RelatedCourses";
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
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-48 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-48 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !courseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="bg-white rounded-xl border border-primary/30 shadow-sm p-12 text-center">
          <p className="text-slate-500 text-lg">Course not found</p>
          <Link to="/courses" className="text-piemind-pink font-bold text-sm mt-2 inline-block hover:underline">
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/courses" className="hover:text-piemind-pink transition-colors flex items-center gap-1">
          <School className="size-4" />
          <span>Courses</span>
        </Link>
        <ChevronRight className="size-4 text-slate-300" />
        <span className="text-slate-900 font-bold">{courseData.title}</span>
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

      {/* Related Courses */}
      {slug && <RelatedCourses courseSlug={slug} />}
    </div>
  );
};
