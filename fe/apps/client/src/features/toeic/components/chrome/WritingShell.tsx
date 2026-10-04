import { ExamHeader } from "./ExamHeader";
import { QuestionNavigator } from "./QuestionNavigator";
import { UtilityPanel } from "./UtilityPanel";
import { ToeicWritingPage } from "../../pages/ToeicWritingPage";

/**
 * Standalone Writing shell — the Writing test runs separately from
 * Listening & Reading (own header, timer, task navigator, no shared shell).
 * Cố định hai cột bên — chỉ cột giữa cuộn nội dung.
 */
export function WritingShell() {
  return (
    <div className="exam-screen flex h-screen flex-col overflow-hidden bg-muted/50">
      <ExamHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 px-4 py-4">
        <QuestionNavigator />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <ToeicWritingPage />
        </main>
        <UtilityPanel />
      </div>
    </div>
  );
}
