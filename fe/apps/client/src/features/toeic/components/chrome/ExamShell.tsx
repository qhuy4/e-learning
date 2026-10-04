import { Outlet } from "react-router";
import { ExamHeader } from "./ExamHeader";
import { QuestionNavigator } from "./QuestionNavigator";
import { UtilityPanel } from "./UtilityPanel";

/**
 * Listening & Reading shell: fixed header (72px) + left navigator (~260px)
 * + main content + right utility panel. Desktop-first (min 1280px).
 * The provider wraps all TOEIC routes at the router level.
 *
 * Layout cố định toàn màn hình: chỉ cột giữa cuộn nội dung, hai cột bên
 * (bộ câu hỏi & ghi chú) đứng yên trong suốt bài thi.
 */
export function ExamShell() {
  return (
    <div className="exam-screen flex h-screen flex-col overflow-hidden bg-muted/50">
      <ExamHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 px-4 py-4">
        <QuestionNavigator />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <UtilityPanel />
      </div>
    </div>
  );
}
