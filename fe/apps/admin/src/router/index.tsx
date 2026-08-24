import { createBrowserRouter } from "react-router"

import App from "@/App"
import DashboardPage from "@/pages/dashboard/dashboard-page"
import  UsersPage  from "@/pages/users/users-page"
import { UserDetailPage } from "@/pages/users/user-detail-page"
import LoginPage from "@/pages/authen/login-page.tsx";
import {ProtectedRoute} from "@/router/protectedRoute.tsx";
import {PublicRoute} from "@/router/publishRoute.tsx";


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