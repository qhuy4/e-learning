import { createBrowserRouter } from "react-router";

import App from "@/App";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import UsersPage from "@/pages/users/users-page";
import { UserDetailPage } from "@/pages/users/user-detail-page";
import { UserEditPage } from "@/pages/users/user-edit-page.tsx";
import { UserCreatePage } from "@/pages/users/user-create-page.tsx";
import { InstructorApprovalsPage } from "@/pages/instructors/instructor-approvals-page";
import LoginPage from "@/pages/authen/login-page.tsx";
import { ProtectedRoute } from "@/router/protectedRoute.tsx";
import { PublicRoute } from "@/router/publishRoute.tsx";
import { CreateCoursePage } from "@/pages/courses/create-course-page";
import { CoursesListPage } from "@/pages/courses/courses-list-page";
import { AdminCoursesListPage } from "@/pages/admin-courses/admin-courses-list-page";
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
            children: [
              {
                index: true,
                element: <UsersPage />,
              },
              {
                path: "create",
                element: <UserCreatePage />,
              },
              {
                path: ":id",
                element: <UserDetailPage />,
              },
              {
                path: ":id/edit",
                element: <UserEditPage />,
              },
            ],
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
            path: "admin-courses",
            element: <AdminCoursesListPage />,
          },
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
