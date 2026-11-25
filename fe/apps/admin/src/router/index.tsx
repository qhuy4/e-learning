import App from "@/App";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import {createBrowserRouter} from "react-router";

import {InstructorApprovalsPage} from "@/pages/instructors/instructor-approvals-page";
import {InstructorApplicationDetailPage} from "@/pages/instructors/instructor-application-detail-page";
import UsersPage from "@/pages/users/users-page";
import {UserDetailPage} from "@/pages/users/user-detail-page";
import {UserEditPage} from "@/pages/users/user-edit-page.tsx";
import {UserCreatePage} from "@/pages/users/user-create-page.tsx";
import LoginPage from "@/pages/authen/login-page.tsx";
import LogoutPage from "@/pages/authen/logout-page.tsx";
import SettingsPage from "@/pages/settings/settings-page.tsx";
import {ProtectedRoute} from "@/router/protectedRoute.tsx";
import {PublishRoute} from "@/router/publishRoute.tsx";

import {CreateLessonPage} from "@/features/lessons/pages/create-lesson-page";
import InstructorsPage from "@/pages/instructors/instructors-page.tsx";
import {InstructorDetailPage} from "@/pages/instructors/instructor-detail-page.tsx";
import {InstructorEditPage} from "@/pages/instructors/instructor-edit-page.tsx";
import StudentsPage from "@/pages/students/students-page.tsx";
import {StudentDetailPage} from "@/pages/students/student-detail-page.tsx";
import {StudentCreatePage} from "@/pages/students/student-create-page.tsx";
import {StudentEditPage} from "@/pages/students/student-edit-page.tsx";
import ReviewsPage from "@/pages/reviews/reviews-page.tsx";
import ReviewDetailPage from "@/pages/reviews/review-detail-page.tsx";
import CourseListPage from "@/pages/courses/courses-page";
import {CourseDetailPage} from "@/pages/courses/course-detail-page";
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
import {InstructorCertificatesPage} from "@/pages/instructor-certificates/instructor-certificates-page";
import {InstructorCertificateDetailPage} from "@/pages/instructor-certificates/instructor-certificate-detail-page";
import {NotificationsPage} from "@/pages/notifications/notifications-page";
import {NotificationDetailPage} from "@/pages/notifications/notification-detail-page";
import PaymentsPage from "@/pages/payments/payments-page";
import PaymentDetailPage from "@/pages/payments/payment-detail-page";
import PayoutRequestsPage from "@/pages/payout-requests/payout-requests-page";
import PayoutRequestDetailPage from "@/pages/payout-requests/payout-request-detail-page";
import BookingsPage from "@/pages/bookings/bookings-page";
import BookingDetailPage from "@/pages/bookings/booking-detail-page";

import ExamTypesPage from "@/pages/exams/exam-types-page";
import ExamTypeCreatePage from "@/pages/exams/exam-type-create-page";
import ExamTypeDetailPage from "@/pages/exams/exam-type-detail-page";
import ExamTypeEditPage from "@/pages/exams/exam-type-edit-page";
import ExamFormatsPage from "@/pages/exams/exam-formats-page";
import ExamFormatCreatePage from "@/pages/exams/exam-format-create-page";
import ExamFormatDetailPage from "@/pages/exams/exam-format-detail-page";
import ExamFormatEditPage from "@/pages/exams/exam-format-edit-page";
import ExamsPage from "@/pages/exams/exams-page";
import ExamCreatePage from "@/pages/exams/exam-create-page";
import ExamDetailPage from "@/pages/exams/exam-detail-page";
import ExamEditPage from "@/pages/exams/exam-edit-page";
import ExamBuilderPage from "@/pages/exams/exam-builder-page";
import ExamPreviewPage from "@/pages/exams/exam-preview-page";
import ExamPackageImportPage from "@/pages/exams/exam-package-import-page";

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
                                  path: "applications",
                                  element: <InstructorApprovalsPage />,
                              },
                              {
                                  path: "applications/:id",
                                  element: <InstructorApplicationDetailPage />,
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
                        path: "bookings",
                        children: [
                            {
                                index: true,
                                element: <BookingsPage />,
                            },
                            {
                                path: ":id",
                                element: <BookingDetailPage />,
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
                        path: "exam-types",
                        children: [
                            {
                                index: true,
                                element: <ExamTypesPage />,
                            },
                            {
                                path: "create",
                                element: <ExamTypeCreatePage />,
                            },
                            {
                                path: ":id",
                                element: <ExamTypeDetailPage />,
                            },
                            {
                                path: ":id/edit",
                                element: <ExamTypeEditPage />,
                            },
                        ],
                    },
                    {
                        path: "exam-formats",
                        children: [
                            {
                                index: true,
                                element: <ExamFormatsPage />,
                            },
                            {
                                path: "create",
                                element: <ExamFormatCreatePage />,
                            },
                            {
                                path: ":id",
                                element: <ExamFormatDetailPage />,
                            },
                            {
                                path: ":id/edit",
                                element: <ExamFormatEditPage />,
                            },
                        ],
                    },
                    {
                        path: "exams",
                        children: [
                            {
                                index: true,
                                element: <ExamsPage />,
                            },
                            {
                                path: "create",
                                element: <ExamCreatePage />,
                            },
                            {
                                path: ":id",
                                element: <ExamDetailPage />,
                            },
                            {
                                path: ":id/edit",
                                element: <ExamEditPage />,
                            },
                            {
                                path: ":id/builder",
                                element: <ExamBuilderPage />,
                            },
                            {
                                path: ":id/preview",
                                element: <ExamPreviewPage />,
                            },
                            {
                                path: ":id/import-package",
                                element: <ExamPackageImportPage />,
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
