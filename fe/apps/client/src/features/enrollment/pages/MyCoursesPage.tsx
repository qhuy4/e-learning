import { Loader2, BookOpen } from "lucide-react";
import { useMyEnrollments } from "../hooks/use-enrollment";
import { CourseCardEnrolled } from "../components/CourseCardEnrolled";
import { useAuth } from "../../auth/hooks/use-auth";
import { Link } from "react-router";

export const MyCoursesPage = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useMyEnrollments({ page: 1, limit: 20 });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Vui lòng đăng nhập để xem khóa học.</p>
        <Link
          to="/login?redirect=/my-courses"
          className="text-rose-500 font-semibold hover:underline"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  const enrollments = data?.data ?? [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Khóa học của tôi
        </h1>

        {enrollments.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              Bạn chưa có khóa học nào.
            </p>
            <Link
              to="/"
              className="text-rose-500 font-semibold hover:underline"
            >
              Khám phá khóa học ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCardEnrolled
                key={enrollment.id}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
