import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router";
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
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { FindMentorPage } from "../pages/mentor/FindMentorPage";
import { BookingProfileDetailPage } from "../pages/mentor/BookingProfileDetailPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { PaymentResultPage } from "../pages/payment/PaymentResultPage";
import { MyCoursesPage } from "../pages/my-courses/MyCoursesPage";
import { CartPage } from "../pages/cart/CartPage";
import { MeetingRoom } from "@/pages/meeting/meeting.tsx";
import { MyBookingsPage } from "@/pages/meeting/MyBookingsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { useAuth } from "@/features/auth/hooks/use-auth";

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
                element: (
                    <Navigate to="/payment/result?status=success" replace />
                ),
            },
            {
                path: "payment/cancel",
                element: (
                    <Navigate to="/payment/result?status=failed" replace />
                ),
            },
            {
                path: "my-courses",
                element: <MyCoursesPage />,
            },
            {
                path: "my-bookings",
                element: <MyBookingsPage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "cart",
                element: <CartPage />,
            },
            {
                path: "mentors",
                element: <FindMentorPage />,
            },
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
                path: "instructor/profile",
                element: <InstructorKycPage />,
            },
            {
                path: "instructor/kyc",
                element: <Navigate to="/instructor/profile" replace />,
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
            {
                path: "student/verify-email",
                element: <VerifyEmailPage />,
            },
        ],
    },
    {
        path: "/learning/:courseSlug/:lessonSlug?",
        element: <LearningPage />,
    },
    {
        path: "/mentors/:mentorId/book",
        element: <BookingProfileDetailPage />,
    },
    {
        path: "/meeting/:meetingId",
        element: <MeetingRoomWrapper />,
    },
]);

function MeetingRoomWrapper() {
    const { meetingId } = useParams<{ meetingId: string }>();
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/student/login" replace />;
    return <MeetingRoom meetingRoomId={Number(meetingId)} />;
}

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
