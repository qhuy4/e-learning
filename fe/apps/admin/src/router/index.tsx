import { createBrowserRouter } from "react-router"

import App from "@/App"
import DashboardPage from "@/pages/dashboard/dashboard-page"
import UsersPage from "@/pages/users/users-page"
import { UserDetailPage } from "@/pages/users/user-detail-page"
import { InstructorApprovalsPage } from "@/pages/instructors/instructor-approvals-page"

export const router = createBrowserRouter([
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
                path: "instructors/approvals",
                element: <InstructorApprovalsPage />,
            },
            {
                path: ":id",
                element: <UserDetailPage />,
            },
        ],
    },
])