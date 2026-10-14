import { ExamHeader } from "./ExamHeader";
import { QuestionNavigator } from "./QuestionNavigator";
import { UtilityPanel } from "./UtilityPanel";
import { ToeicSpeakingPage } from "../../pages/ToeicSpeakingPage";

/**
 * Standalone Speaking shell — 11 tasks with a simulated recorder,
 * separate from the Listening & Reading and Writing flows.
 * Cố định hai cột bên — chỉ cột giữa cuộn nội dung.
 */
export function SpeakingShell() {
  return (
    <div className="exam-screen flex h-screen flex-col overflow-hidden bg-muted/50">
      <ExamHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 px-4 py-4">
        <QuestionNavigator />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <ToeicSpeakingPage />
        </main>
        <UtilityPanel />
      </div>
    </div>
  );
}
