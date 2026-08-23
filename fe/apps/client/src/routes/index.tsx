import { createBrowserRouter, RouterProvider } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import { CourseDetailPage } from "../features/courses/pages/CourseDetailPage";
import { LearningPage } from "../features/learning/pages/LearningPage";

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
