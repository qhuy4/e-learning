import { createBrowserRouter } from "react-router"
import App from "@/App"
import { ProtectedRoute } from "@/router/protectedRoute.tsx"
import { PublicRoute } from "@/router/publishRoute.tsx"
import DashboardPage from "@/pages/dashboard/dashboard-page"
import CoursesListPage from "@/pages/courses/courses-list-page"
import CreateCoursePage from "@/pages/courses/create-course-page"
import StudentsPage from "@/pages/students/students-page"
import RevenuePage from "@/pages/revenue/revenue-page"
import ProfilePage from "@/pages/profile/profile-page"
import AvailabilityPage from "@/pages/availability/availability-page"
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
                    { path: "courses/:courseId", element: <CreateCoursePage /> },
                    { path: "students", element: <StudentsPage /> },
                    { path: "revenue", element: <RevenuePage /> },
                    { path: "availability", element: <AvailabilityPage /> },
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
