import { useLocation } from "react-router";
import { useToeicExam } from "./contexts/toeic-exam-context";
import type { ToeicSection } from "./types";

/** Derives the active exam section from the current route. */
export function useExamSection(): ToeicSection {
  const { pathname } = useLocation();
  if (pathname.includes("/speaking")) return "speaking";
  if (pathname.includes("/reading")) return "reading";
  if (pathname.includes("/writing")) return "writing";
  return "listening";
}

/** Currently focused question (writing / speaking use their task numbers instead). */
export function useCurrentQuestionId(): number | null {
  const section = useExamSection();
  const { current } = useToeicExam();
  return section === "writing" || section === "speaking" ? null : current[section];
}
