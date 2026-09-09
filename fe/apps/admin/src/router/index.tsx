import App from "@/App";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import { createBrowserRouter } from "react-router";

import { InstructorApprovalsPage } from "@/pages/instructors/instructor-approvals-page";
import UsersPage from "@/pages/users/users-page";
import { UserDetailPage } from "@/pages/users/user-detail-page";
import { UserEditPage } from "@/pages/users/user-edit-page.tsx";
import { UserCreatePage } from "@/pages/users/user-create-page.tsx";
import LoginPage from "@/pages/authen/login-page.tsx";
import { ProtectedRoute } from "@/router/protectedRoute.tsx";
import { PublicRoute } from "@/router/publishRoute.tsx";

import { CreateLessonPage } from "@/features/lessons/pages/create-lesson-page";
import InstructorsPage from "@/pages/instructors/instructors-page.tsx";
import { InstructorDetailPage } from "@/pages/instructors/instructor-detail-page.tsx";
import { InstructorEditPage } from "@/pages/instructors/instructor-edit-page.tsx";
import StudentsPage from "@/pages/students/students-page.tsx";
import ReviewsPage from "@/pages/reviews/reviews-page.tsx";
import ReviewDetailPage from "@/pages/reviews/review-detail-page.tsx";
import CourseListPage from "@/pages/courses/courses-page";
import { CourseDetailPage } from "@/pages/courses/course-detail-page";
import OrdersPage from "@/pages/orders/orders-page";
import OrderDetailPage from "@/pages/orders/order-detail-page";
import EnrollmentsPage from "@/pages/enrollments/enrollments-page";
import EnrollmentDetailPage from "@/pages/enrollments/enrollment-detail-page";
import CouponsPage from "@/pages/coupons/coupons-page";
import CouponCreatePage from "@/pages/coupons/coupon-create-page";
import CouponDetailPage from "@/pages/coupons/coupon-detail-page";
import CouponEditPage from "@/pages/coupons/coupon-edit-page";

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
                        path: "students",
                        element: <StudentsPage />,
                    },
                    {
                        path: "reviews",
                        children: [
                            {
                                index: true,
                                element: <ReviewsPage />,
                            },
                            {
                                path: ":id",
                                element: <ReviewDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "courses",
                        children: [
                            {
                                index: true,
                                element: <CourseListPage />,
                            },
                            {
                                path: ":id",
                                element: <CourseDetailPage />,
                            },
                        ],
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
                        path: "instructors",
                        children: [
                            {
                                index: true,
                                element: <InstructorsPage />,
                            },
                            {
                                path: "approvals",
                                element: <InstructorApprovalsPage />,
                            },
                            {
                                path: "create",
                                element: <UserCreatePage />,
                            },
                            {
                                path: ":id",
                                element: <InstructorDetailPage />,
                            },
                            {
                                path: ":id/edit",
                                element: <InstructorEditPage />,
                            },
                        ],
                    },
                    {
                        path: "orders",
                        children: [
                            {
                                index: true,
                                element: <OrdersPage />,
                            },
                            {
                                path: ":id",
                                element: <OrderDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "enrollments",
                        children: [
                            {
                                index: true,
                                element: <EnrollmentsPage />,
                            },
                            {
                                path: ":id",
                                element: <EnrollmentDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "coupons",
                        children: [
                            {
                                index: true,
                                element: <CouponsPage/>,
                            },
                            {
                                path: "create",
                                element: <CouponCreatePage/>,
                            },
                            {
                                path: ":id",
                                element: <CouponDetailPage/>,
                            },
                            {
                                path: ":id/edit",
                                element: <CouponEditPage/>,
                            },
                        ],
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