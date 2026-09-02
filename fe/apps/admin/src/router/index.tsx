import { createBrowserRouter } from "react-router"

import App from "@/App"
import DashboardPage from "@/pages/dashboard/dashboard-page"
import UsersPage from "@/pages/users/users-page"
import { UserDetailPage } from "@/pages/users/user-detail-page"
import { InstructorApprovalsPage } from "@/pages/instructors/instructor-approvals-page"
import LoginPage from "@/pages/authen/login-page.tsx";
import {ProtectedRoute} from "@/router/protectedRoute.tsx";
import {PublicRoute} from "@/router/publishRoute.tsx";
import { CreateCoursePage } from "@/pages/courses/create-course-page";
import { CoursesListPage } from "@/pages/courses/courses-list-page";
import { CreateLessonPage } from "@/features/lessons/pages/create-lesson-page";

export const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <App />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                    {
                        path: "users",
                        element: <UsersPage />,
                    },
                    {
                        path: "users/:id",
                        element: <UserDetailPage />,
                    },
                    {
                        path: "courses",
                        element: <CoursesListPage />,
                    },
                     {
                        path: "courses/:courseId",
                        element: <CreateCoursePage />,
                    },
                    {
                        path: "courses/create",
                        element: <CreateCoursePage />,
                    },
                    {
                        path: "lessons/create",
                        element: <CreateLessonPage />,
                    },
                    {
                        path: "lessons/:id/edit",
                        element: <CreateLessonPage />,
                    },
                    {
                        path: "instructors/approvals",
                        element: <InstructorApprovalsPage />,
                    },
                    {
                        path: ":id",
                        element: <UserDetailPage />,
                    }
                ],
            },
        ],
    },

    {
        element: <PublicRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
        ],
    },
]);