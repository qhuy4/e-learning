import { Outlet } from "react-router";
import { IeltsHeader } from "./IeltsHeader";
import { QuestionNavigator } from "./QuestionNavigator";

/**
 * Full-screen IELTS exam shell: sticky 72px header + left question navigator
 * (~260px) + main module content. Desktop-first (min 1280px).
 *
 * NOTE: `<IeltsExamProvider>` wraps these routes at the router level so that
 * instructions / test / review / result share one state tree — do not nest a
 * second provider here.
 *
 * Layout cố định toàn màn hình (giống TOEIC): header + bộ câu hỏi đứng yên,
 * chỉ cột giữa cuộn nội dung — làm từng part nhỏ không bị mất điều hướng.
 */
export function IeltsShell() {
  return (
    <div className="exam-screen flex h-screen flex-col overflow-hidden bg-muted/50">
      <IeltsHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 px-4 py-4">
        <QuestionNavigator />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
