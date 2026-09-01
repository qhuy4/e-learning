import { createBrowserRouter, RouterProvider } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { CourseDetailPage } from "../features/courses/pages/CourseDetailPage";
import { LearningPage } from "../features/learning/pages/LearningPage";

import { TeachLandingPage } from "../features/instructor/pages/TeachLandingPage";
import { LoginPage } from "../features/instructor/pages/LoginPage";
import { InstructorRegisterPage } from "../features/instructor/pages/InstructorRegisterPage";
import { InstructorKycPage } from "../features/instructor/pages/InstructorKycPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "courses/:slug",
                element: <CourseDetailPage />,
            },
            {
                path: "teach",
                element: <TeachLandingPage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "instructor/register",
                element: <InstructorRegisterPage />,
            },
            {
                path: "instructor/kyc",
                element: <InstructorKycPage />,
            },
        ],
    },
    {
        path: "/learning/:id",
        element: <LearningPage />,
    }
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
