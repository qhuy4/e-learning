import App from "@/App";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import { createBrowserRouter } from "react-router";

import { InstructorApprovalsPage } from "@/pages/instructors/instructor-approvals-page";
import UsersPage from "@/pages/users/users-page";
import { UserDetailPage } from "@/pages/users/user-detail-page";
import { UserEditPage } from "@/pages/users/user-edit-page.tsx";
import { UserCreatePage } from "@/pages/users/user-create-page.tsx";
import LoginPage from "@/pages/authen/login-page.tsx";
import LogoutPage from "@/pages/authen/logout-page.tsx";
import SettingsPage from "@/pages/settings/settings-page.tsx";
import { ProtectedRoute } from "@/router/protectedRoute.tsx";
import { PublishRoute } from "@/router/publishRoute.tsx";

import { CreateLessonPage } from "@/features/lessons/pages/create-lesson-page";
import InstructorsPage from "@/pages/instructors/instructors-page.tsx";
import { InstructorDetailPage } from "@/pages/instructors/instructor-detail-page.tsx";
import { InstructorEditPage } from "@/pages/instructors/instructor-edit-page.tsx";
import StudentsPage from "@/pages/students/students-page.tsx";
import { StudentDetailPage } from "@/pages/students/student-detail-page.tsx";
import { StudentCreatePage } from "@/pages/students/student-create-page.tsx";
import { StudentEditPage } from "@/pages/students/student-edit-page.tsx";
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

import CategoriesPage from "@/pages/categories/categories-page";
import CategoryCreatePage from "@/pages/categories/category-create-page";
import CategoryDetailPage from "@/pages/categories/category-detail-page";
import CategoryEditPage from "@/pages/categories/category-edit-page";
import EarningsPage from "@/pages/earnings/earnings-page";
import PayoutDetailPage from "@/pages/earnings/payout-detail-page";
import QuestionsPage from "@/pages/questions/questions-page";
import QuestionDetailPage from "@/pages/questions/question-detail-page";
import ReviewReportsPage from "@/pages/review-reports/review-reports-page";
import ReviewReportDetailPage from "@/pages/review-reports/report-detail-page";
import AchievementsPage from "@/pages/achievements/achievements-page";
import AchievementDetailPage from "@/pages/achievements/achievement-detail-page";
import { InstructorCertificatesPage } from "@/pages/instructor-certificates/instructor-certificates-page";
import { InstructorCertificateDetailPage } from "@/pages/instructor-certificates/instructor-certificate-detail-page";
import { NotificationsPage } from "@/pages/notifications/notifications-page";
import { NotificationDetailPage } from "@/pages/notifications/notification-detail-page";
import { PremiumSubscriptionsPage } from "@/pages/premium-subscriptions/premium-subscriptions-page";
import { PremiumSubscriptionDetailPage } from "@/pages/premium-subscriptions/premium-subscription-detail-page";
import { WishlistsPage } from "@/pages/wishlists/wishlists-page";
import { WishlistDetailPage } from "@/pages/wishlists/wishlist-detail-page";
import PaymentsPage from "@/pages/payments/payments-page";
import PaymentDetailPage from "@/pages/payments/payment-detail-page";
import PayoutRequestsPage from "@/pages/payout-requests/payout-requests-page";
import PayoutRequestDetailPage from "@/pages/payout-requests/payout-request-detail-page";

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
                        children: [
                            {
                                index: true,
                                element: <StudentsPage />,
                            },
                            {
                                path: "create",
                                element: <StudentCreatePage />,
                            },
                            {
                                path: ":id",
                                element: <StudentDetailPage />,
                            },
                            {
                                path: ":id/edit",
                                element: <StudentEditPage />,
                            },
                        ],
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
                    {
                        path: "categories",
                        children: [
                            {
                                index: true,
                                element: <CategoriesPage />,
                            },
                            {
                                path: "create",
                                element: <CategoryCreatePage />,
                            },
                            {
                                path: ":id",
                                element: <CategoryDetailPage />,
                            },
                            {
                                path: ":id/edit",
                                element: <CategoryEditPage />,
                            },
                        ],
                    },
                    {
                        path: "earnings",
                        children: [
                            {
                                index: true,
                                element: <EarningsPage />,
                            },
                            {
                                path: "payouts/:id",
                                element: <PayoutDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "payments",
                        children: [
                            {
                                index: true,
                                element: <PaymentsPage />,
                            },
                            {
                                path: ":id",
                                element: <PaymentDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "payout-requests",
                        children: [
                            {
                                index: true,
                                element: <PayoutRequestsPage />,
                            },
                            {
                                path: ":id",
                                element: <PayoutRequestDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "questions",
                        children: [
                            {
                                index: true,
                                element: <QuestionsPage />,
                            },
                            {
                                path: ":id",
                                element: <QuestionDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "review-reports",
                        children: [
                            {
                                index: true,
                                element: <ReviewReportsPage />,
                            },
                            {
                                path: ":id",
                                element: <ReviewReportDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "achievements",
                        children: [
                            {
                                index: true,
                                element: <AchievementsPage />,
                            },
                            {
                                path: ":id",
                                element: <AchievementDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "instructor-certificates",
                        children: [
                            {
                                index: true,
                                element: <InstructorCertificatesPage />,
                            },
                            {
                                path: ":id",
                                element: <InstructorCertificateDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "notifications",
                        children: [
                            {
                                index: true,
                                element: <NotificationsPage />,
                            },
                            {
                                path: ":id",
                                element: <NotificationDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "premium-subscriptions",
                        children: [
                            {
                                index: true,
                                element: <PremiumSubscriptionsPage />,
                            },
                            {
                                path: ":id",
                                element: <PremiumSubscriptionDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "wishlists",
                        children: [
                            {
                                index: true,
                                element: <WishlistsPage />,
                            },
                            {
                                path: ":id",
                                element: <WishlistDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "settings",
                        element: <SettingsPage />,
                    },
                    {
                        path: "logout",
                        element: <LogoutPage />,
                    },
                ],
            },
        ],
    },

    {
        element: <PublishRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
        ],
    },
]);