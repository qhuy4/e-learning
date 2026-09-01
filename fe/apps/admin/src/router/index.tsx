import {createBrowserRouter} from "react-router"

import App from "@/App"
import DashboardPage from "@/pages/dashboard/dashboard-page"
import UsersPage from "@/pages/users/users-page"
import {UserDetailPage} from "@/pages/users/user-detail-page"
import LoginPage from "@/pages/authen/login-page.tsx";
import {ProtectedRoute} from "@/router/protectedRoute.tsx";
import {PublicRoute} from "@/router/publishRoute.tsx";
import {UserEditPage} from "@/pages/users/user-edit-page.tsx";
import {UserCreatePage} from "@/pages/users/user-create-page.tsx";


export const router = createBrowserRouter([
    {
        element: <ProtectedRoute/>,
        children: [
            {
                path: "/",
                element: <App/>,
                children: [
                    {
                        index: true,
                        element: <DashboardPage/>,
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
                ],
            },
        ],
    },

    {
        element: <PublicRoute/>,
        children: [
            {
                path: "/login",
                element: <LoginPage/>,
            },
        ],
    },
]);