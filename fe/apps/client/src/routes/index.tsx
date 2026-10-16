import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router";
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
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { FindMentorPage } from "../pages/mentor/FindMentorPage";
import { BookingProfileDetailPage } from "../pages/mentor/BookingProfileDetailPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { PaymentResultPage } from "../pages/payment/PaymentResultPage";
import { MyCoursesPage } from "../pages/my-courses/MyCoursesPage";

import { ExamListPage } from "../features/exams/pages/ExamListPage";
import { ExamDetailPage } from "../features/exams/pages/ExamDetailPage";
import { ExamTakingPage } from "../features/exams/pages/ExamTakingPage";
import { ExamResultPage } from "../features/exams/pages/ExamResultPage";
import { ExamReviewPage } from "../features/exams/pages/ExamReviewPage";

import { ToeicLandingPage } from "../features/toeic/pages/ToeicLandingPage";
import { ToeicInstructionsPage } from "../features/toeic/pages/ToeicInstructionsPage";
import { ToeicListeningPage } from "../features/toeic/pages/ToeicListeningPage";
import { ToeicReadingPage } from "../features/toeic/pages/ToeicReadingPage";
import { ToeicReviewPage } from "../features/toeic/pages/ToeicReviewPage";
import { ToeicResultPage } from "../features/toeic/pages/ToeicResultPage";
import { ExamShell } from "../features/toeic/components/chrome/ExamShell";
import { WritingShell } from "../features/toeic/components/chrome/WritingShell";
import { SpeakingShell } from "../features/toeic/components/chrome/SpeakingShell";
import { ToeicExamProvider } from "../features/toeic/contexts/toeic-exam-context";

import { IeltsLandingPage } from "../features/ielts/pages/IeltsLandingPage";
import { IeltsInstructionsPage } from "../features/ielts/pages/IeltsInstructionsPage";
import { IeltsListeningPage } from "../features/ielts/pages/IeltsListeningPage";
import { IeltsReadingPage } from "../features/ielts/pages/IeltsReadingPage";
import { IeltsWritingPage } from "../features/ielts/pages/IeltsWritingPage";
import { IeltsSpeakingPage } from "../features/ielts/pages/IeltsSpeakingPage";
import { IeltsReviewPage } from "../features/ielts/pages/IeltsReviewPage";
import { IeltsResultPage } from "../features/ielts/pages/IeltsResultPage";
import { IeltsShell } from "../features/ielts/components/chrome/IeltsShell";
import { IeltsExamProvider } from "../features/ielts/contexts/ielts-exam-context";

import { MeetingRoom } from "@/pages/meeting/meeting.tsx";
import { MyBookingsPage } from "@/pages/meeting/MyBookingsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { useAuth } from "@/features/auth/hooks/use-auth";

/**
 * Redirect giữ nguyên query string (?examId=…) — mất examId là mất nguồn data.
 * API (provider rơi về mock) nên mọi <Navigate> nội bộ phải đi qua đây.
 */
function SearchPreservingNavigate({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

function MeetingRoomWrapper() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/student/login" replace />;
  }

  return <MeetingRoom meetingRoomId={Number(meetingId)} />;
}

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
        path: "my-bookings",
        element: <MyBookingsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "mentors",
        element: <FindMentorPage />,
      },
      {
        path: "mentors/:mentorId/book",
        element: <BookingProfileDetailPage />,
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
        path: "student/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "student/verify-email",
        element: <VerifyEmailPage />,
      },
      {
        path: "exams",
        element: <ExamListPage />,
      },
      {
        path: "exams/:id",
        element: <ExamDetailPage />,
      },
      {
        path: "exams/:examId/result/:attemptId",
        element: <ExamResultPage />,
      },
      {
        path: "toeic",
        element: <ToeicLandingPage />,
      },
      {
        path: "ielts",
        element: <IeltsLandingPage />,
      },
    ],
  },

  // Làm bài thi giao diện đề chung: full-screen
  {
    path: "/exams/:id/take",
    element: <ExamTakingPage />,
  },

  // Xem chi tiết bài làm (review)
  {
    path: "/exams/:examId/review/:attemptId",
    element: <ExamReviewPage />,
  },

  {
    path: "/learning/:courseSlug/:lessonSlug?",
    element: <LearningPage />,
  },

  // TOEIC module: one shared provider across instructions / run / writing / speaking / review / result.
  {
    element: (
      <ToeicExamProvider>
        <Outlet />
      </ToeicExamProvider>
    ),
    children: [
      { path: "toeic/instructions", element: <ToeicInstructionsPage /> },
      {
        path: "toeic/run",
        element: <ExamShell />,
        children: [
          {
            index: true,
            element: (
              <SearchPreservingNavigate to="/toeic/run/listening" />
            ),
          },
          { path: "listening", element: <ToeicListeningPage /> },
          { path: "reading", element: <ToeicReadingPage /> },
          { path: "writing", element: <SearchPreservingNavigate to="/toeic/writing" /> },
          { path: "review", element: <SearchPreservingNavigate to="/toeic/review" /> },
        ],
      },
      { path: "toeic/writing", element: <WritingShell /> },
      { path: "toeic/speaking", element: <SpeakingShell /> },
      { path: "toeic/review", element: <ToeicReviewPage /> },
      { path: "toeic/result", element: <ToeicResultPage /> },
    ],
  },

  // IELTS CBT module: one shared provider across instructions / test / review / result.
  {
    element: (
      <IeltsExamProvider>
        <Outlet />
      </IeltsExamProvider>
    ),
    children: [
      { path: "ielts/instructions", element: <IeltsInstructionsPage /> },
      {
        path: "ielts/test",
        element: <IeltsShell />,
        children: [
          {
            index: true,
            element: (
              <SearchPreservingNavigate to="/ielts/test/listening" />
            ),
          },
          { path: "listening", element: <IeltsListeningPage /> },
          { path: "reading", element: <IeltsReadingPage /> },
          { path: "writing", element: <IeltsWritingPage /> },
          { path: "speaking", element: <IeltsSpeakingPage /> },
        ],
      },
      { path: "ielts/review", element: <IeltsReviewPage /> },
      { path: "ielts/result", element: <IeltsResultPage /> },
    ],
  },

  {
    path: "/meeting/:meetingId",
    element: <MeetingRoomWrapper />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

