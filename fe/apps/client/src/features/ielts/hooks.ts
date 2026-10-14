import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { skillsInSections } from "../exams/utils";
import { useIeltsExam } from "./contexts/ielts-exam-context";
import type { IeltsModule } from "./types";

export type IeltsRoute =
  | IeltsModule
  | "review"
  | "result"
  | "instructions"
  | null;

/** Derives the active IELTS route (module / review / result) from the pathname. */
export function useIeltsRoute(): IeltsRoute {
  const { pathname } = useLocation();
  if (pathname.includes("/review")) return "review";
  if (pathname.includes("/result")) return "result";
  if (pathname.includes("/instructions")) return "instructions";
  if (pathname.includes("/listening")) return "listening";
  if (pathname.includes("/reading")) return "reading";
  if (pathname.includes("/writing")) return "writing";
  if (pathname.includes("/speaking")) return "speaking";
  return null;
}

/**
 * Đề API 1 kỹ năng (vd Reading-only) mở nhầm trang module không có trong đề
 * (URL gõ tay / link cũ) → chuyển ngay sang kỹ năng đầu tiên của chính đề đó,
 * giữ nguyên examId. Không chạy ở mock mode.
 */
export function useIeltsSkillGuard(module: IeltsModule): void {
  const navigate = useNavigate();
  const location = useLocation();
  const { isApiMode, apiExam } = useIeltsExam();

  useEffect(() => {
    if (!isApiMode || !apiExam) return;
    const skills = skillsInSections(apiExam.sections);
    if (skills.length === 0) return;
    if (skills.some((skill) => skill.toLowerCase() === module)) return;
    // Giữ nguyên tham số hiện tại (?review=1, ?section=…) — nếu bỏ thì người
    // dùng bị đá khỏi trang xem lại khi mở nhầm kỹ năng không có trong đề.
    const params = new URLSearchParams(location.search);
    params.set("examId", String(apiExam.id));
    navigate(`/ielts/test/${skills[0].toLowerCase()}?${params.toString()}`, { replace: true });
  }, [isApiMode, apiExam, module, navigate, location.search]);
}

/**
 * Đề hiện tại CÓ kỹ năng `skill` không? Mock (chưa nối API) → luôn true.
 * Dùng ẩn nút chuyển skill cuối phần ("Sang Reading"…) khi đề API chỉ có 1
 * kỹ năng — tránh bounce qua guard làm MẤT scope luyện (và chỉ còn "Kiểm tra & nộp").
 */
export function useExamHasSkill(skill: IeltsModule): boolean {
  const { isApiMode, apiExam } = useIeltsExam();
  return useMemo(() => {
    if (!isApiMode || !apiExam) return true;
    return skillsInSections(apiExam.sections).some((s) => s.toLowerCase() === skill);
  }, [isApiMode, apiExam, skill]);
}
