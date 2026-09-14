import { createBrowserRouter } from "react-router"
import App from "@/App"
import { ProtectedRoute } from "@/router/protectedRoute.tsx"
import { PublicRoute } from "@/router/publishRoute.tsx"
import DashboardPage from "@/pages/dashboard/dashboard-page"
import CoursesListPage from "@/pages/courses/courses-list-page"
import CreateCoursePage from "@/pages/courses/create-course-page"
import CourseDetailLayout from "@/pages/courses/course-detail-layout"
import CourseOverviewTab from "@/pages/courses/course-overview-tab"
import CourseContentTab from "@/pages/courses/course-content-tab"
import CourseStudentsTab from "@/pages/courses/course-students-tab"
import StudentsPage from "@/pages/students/students-page"
import RevenuePage from "@/pages/revenue/revenue-page"
import ProfilePage from "@/pages/profile/profile-page"
import AvailabilityPage from "@/pages/availability/availability-page"
import CertificatesPage from "@/pages/certificates/certificates-page"
import CertificateDetailPage from "@/pages/certificates/certificate-detail-page"
import CertificateCreatePage from "@/pages/certificates/certificate-create-page"
import CourseAnalyticsPage from "@/pages/analytics/course-analytics-page"
import CourseRevenuePage from "@/pages/analytics/course-revenue-page"
import CourseReviewsPage from "@/pages/analytics/course-reviews-page"
import LoginPage from "@/pages/authen/login-page"
import { CreateLessonPage } from "@/features/lessons/pages/create-lesson-page"

export const router = createBrowserRouter([
    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: "/",
                element: <App />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "courses", element: <CoursesListPage /> },
                    { path: "courses/create", element: <CreateCoursePage /> },
                    { path: "courses/:courseId/edit", element: <CreateCoursePage /> },
                    {
                        path: "courses/:courseId",
                        element: <CourseDetailLayout />,
                        children: [
                            { index: true, element: <CourseOverviewTab /> },
                            { path: "content", element: <CourseContentTab /> },
                            { path: "students", element: <CourseStudentsTab /> },
                            { path: "analytics", element: <CourseAnalyticsPage /> },
                            { path: "analytics/revenue", element: <CourseRevenuePage /> },
                            { path: "reviews", element: <CourseReviewsPage /> },
                        ],
                    },
                    { path: "students", element: <StudentsPage /> },
                    { path: "revenue", element: <RevenuePage /> },
                    { path: "availability", element: <AvailabilityPage /> },
                    { path: "certificates", element: <CertificatesPage /> },
                    { path: "certificates/create", element: <CertificateCreatePage /> },
                    { path: "certificates/:id", element: <CertificateDetailPage /> },
                    { path: "profile", element: <ProfilePage /> },
                    { path: "lessons/create", element: <CreateLessonPage /> },
                    { path: "lessons/:id/edit", element: <CreateLessonPage /> },
                ],
            },
        ],
    },
    {
        element: <PublicRoute />,
        children: [
            { path: "/login", element: <LoginPage /> },
        ],
    },
]);
