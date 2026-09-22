import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/home/HomePage";
import { CourseCatalogPage } from "../pages/course/CourseCatalogPage";
import { CourseDetailPage } from "../pages/course/CourseDetailPage";
import { CoursePreviewPage } from "../pages/course/CoursePreviewPage";
import { LearningPage } from "../pages/learning/LearningPage";

import { TeachLandingPage } from "../pages/instructor/TeachLandingPage";
import { InstructorLoginPage } from "../pages/auth/InstructorLoginPage";
import { InstructorRegisterPage } from "../pages/auth/InstructorRegisterPage";
import { InstructorKycPage } from "../pages/instructor/InstructorKycPage";

import { StudentLoginPage } from "../pages/auth/StudentLoginPage";
import { StudentRegisterPage } from "../pages/auth/StudentRegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { FindMentorPage } from "../pages/mentor/FindMentorPage";
import { BookingProfileDetailPage } from "../pages/mentor/BookingProfileDetailPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { PaymentResultPage } from "../pages/payment/PaymentResultPage";
import { MyCoursesPage } from "../pages/my-courses/MyCoursesPage";
import { CartPage } from "../pages/cart/CartPage";

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
        path: "courses",
        element: <CourseCatalogPage />,
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
        path: "checkout/:slug",
        element: <CheckoutPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "payment/result",
        element: <PaymentResultPage />,
      },
      {
        path: "payment/success",
        element: <Navigate to="/payment/result?status=success" replace />,
      },
      {
        path: "payment/cancel",
        element: <Navigate to="/payment/result?status=failed" replace />,
      },
      {
        path: "my-courses",
        element: <MyCoursesPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "mentors",
        element: <FindMentorPage />,
      },
      { path: "mentors/:mentorId/book", element: <BookingProfileDetailPage /> },
      {
        path: "teach",
        element: <TeachLandingPage />,
      },
      {
        path: "login",
        element: <InstructorLoginPage />,
      },
      {
        path: "instructor/register",
        element: <InstructorRegisterPage />,
      },
      {
        path: "instructor/kyc",
        element: <InstructorKycPage />,
      },
      {
        path: "student/login",
        element: <StudentLoginPage />,
      },
      {
        path: "student/register",
        element: <StudentRegisterPage />,
      },
      {
        path: "student/forgot-password",
        element: <ForgotPasswordPage />,
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
