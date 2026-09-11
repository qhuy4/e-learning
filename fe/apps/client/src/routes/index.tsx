import { createBrowserRouter, RouterProvider } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../features/home/pages/HomePage";
import { CourseDetailPage } from "../features/courses/pages/CourseDetailPage";
import { CoursePreviewPage } from "../features/courses/pages/CoursePreviewPage";
import { LearningPage } from "../features/learning/pages/LearningPage";

import { TeachLandingPage } from "../features/instructor/pages/TeachLandingPage";
import { LoginPage } from "../features/instructor/pages/LoginPage";
import { InstructorRegisterPage } from "../features/instructor/pages/InstructorRegisterPage";
import { InstructorKycPage } from "../features/instructor/pages/InstructorKycPage";

import { StudentLoginPage } from "../features/auth/pages/StudentLoginPage";
import { CheckoutPage } from "../features/checkout/pages/CheckoutPage";
import { PaymentResultPage } from "../features/payment/pages/PaymentResultPage";
import { MyCoursesPage } from "../features/enrollment/pages/MyCoursesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "courses/:slug",
        element: <CourseDetailPage />,
      },
      {
        path: "courses/preview/:token",
        element: <CoursePreviewPage />,
      },
      {
        path: "student/login",
        element: <StudentLoginPage />,
      },
      {
        path: "checkout/:slug",
        element: <CheckoutPage />,
      },
      {
        path: "payment/result",
        element: <PaymentResultPage />,
      },
      {
        path: "my-courses",
        element: <MyCoursesPage />,
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
    path: "/learning/:courseSlug/:lessonSlug?",
    element: <LearningPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
