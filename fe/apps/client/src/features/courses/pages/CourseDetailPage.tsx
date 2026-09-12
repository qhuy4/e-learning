import {
  CourseHeader,
  CourseLearningOutcomes,
  CourseDescription,
  CourseContent,
  CourseInstructor,
  CourseSidebar,
  RelatedCourses,
} from "../components/CourseDetail";

import { useParams } from "react-router-dom";
import { useCourseBySlug } from "../hooks/use-courses";
import { useEnrollmentCheck } from "../../enrollment/hooks/use-enrollment";
import { useAuth } from "../../auth/hooks/use-auth";

export const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const { data: course, isLoading, isError } = useCourseBySlug(slug ?? "");
  const courseData = (course as any)?.data ?? course;

  const { data: enrollmentCheck } = useEnrollmentCheck(
    courseData?.slug,
    isAuthenticated,
  );
  const isEnrolled = isAuthenticated && enrollmentCheck?.enrolled === true;

  if (isLoading) return <div>Loading...</div>;

  if (isError || !course) {
    return <div>Không tìm thấy khóa học</div>;
  }

  return (
    <div className="bg-white">
      <CourseHeader course={courseData} />

      <div className="container mx-auto px-4 max-w-6xl py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-10 min-w-0">
            <CourseLearningOutcomes />
            <CourseDescription course={courseData} />
            <CourseContent course={courseData} />
            <CourseInstructor instructor={courseData?.instructor} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full lg:w-[340px] shrink-0">
            <CourseSidebar course={courseData} isEnrolled={isEnrolled} />
          </div>
        </div>

        {/* Bottom Section */}
        <RelatedCourses courseSlug={courseData?.slug ?? ""} />
      </div>
    </div>
  );
};
