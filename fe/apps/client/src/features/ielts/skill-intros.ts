import { BookOpen, Headphones, Mic, PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IeltsModule } from "./types";

/** Quick stat shown as a small card on the skill intro. */
export interface SkillIntroStat {
  label: string;
  value: string;
}

/** One line of the official test format (section / passage / task / part). */
export interface SkillIntroFormat {
  label: string;
  detail: string;
}

/** Intro copy for a single IELTS skill (instructions page deep link `?skill=`). */
export interface SkillIntro {
  skill: IeltsModule;
  /** Badge label, e.g. "Listening". */
  shortLabel: string;
  /** Card title, e.g. "IELTS Listening". */
  title: string;
  icon: LucideIcon;
  description: string;
  duration: string;
  stats: SkillIntroStat[];
  format: SkillIntroFormat[];
  tip: string;
}

/**
 * Vietnamese intro copy per skill — used by `/ielts/instructions?skill=...`
 * so the candidate reads only the rules of the skill they are about to take.
 */
export const SKILL_INTROS: Record<IeltsModule, SkillIntro> = {
  listening: {
    skill: "listening",
    shortLabel: "Listening",
    title: "IELTS Listening",
    icon: Headphones,
    duration: "30 phút · 40 câu",
    description:
      "Bài Nghe gồm 4 section với tổng cộng 40 câu hỏi, kéo dài 30 phút. Audio được phát đúng một lần — bạn vừa nghe vừa làm bài, không thể tạm dừng hay tua lại. Mỗi section có khoảng 30 giây để đọc trước câu hỏi và 30 giây cuối để kiểm tra lại đáp án. Giao diện mô phỏng máy tính thật: cột điều hướng câu hỏi bên trái, waveform mô phỏng và thanh đếm giờ ở header.",
    stats: [
      { label: "Thời lượng", value: "30 phút" },
      { label: "Số câu", value: "40 câu" },
      { label: "Section", value: "4 section" },
      { label: "Audio", value: "Phát 1 lần" },
    ],
    format: [
      { label: "Section 1 · 10 câu", detail: "Hội thoại đời thường — điền form, tên riêng, số điện thoại, mã bưu điện." },
      { label: "Section 2 · 10 câu", detail: "Lời nói đơn độc — bản đồ, sơ đồ, sơ đồ tổ chức (map / diagram labeling)." },
      { label: "Section 3 · 10 câu", detail: "Thảo luận học thuật giữa sinh viên và giảng viên — multiple choice, matching." },
      { label: "Section 4 · 10 câu", detail: "Bài giảng học thuật một mình — điền ghi chú (note completion)." },
    ],
    tip: "Nghe keyword (tên riêng, số, địa chỉ) — đáp án gần như luôn xuất hiện ngay trước hoặc ngay sau từ khóa, và người nói thường sửa lại thông tin.",
  },
  reading: {
    skill: "reading",
    shortLabel: "Reading",
    title: "IELTS Reading",
    icon: BookOpen,
    duration: "60 phút · 40 câu",
    description:
      "Bài Đọc gồm 3 passage với tổng cộng 40 câu hỏi trong 60 phút. Vì làm trên máy tính nên KHÔNG có thời gian chuyển đáp án riêng — bạn tự quản lý thời gian giữa 3 bài. Cột bài đọc và cột câu hỏi cuộn độc lập nhau, cho phép bôi đen để tô sáng / gạch chân / đánh dấu. Mỗi passage khoảng 700–900 từ kèm 13–14 câu hỏi.",
    stats: [
      { label: "Thời lượng", value: "60 phút" },
      { label: "Số câu", value: "40 câu" },
      { label: "Passage", value: "3 passage" },
      { label: "Chuyển đáp án", value: "Không có" },
    ],
    format: [
      { label: "Passage 1 · Câu 1–13", detail: "Chủ đề quen thuộc — True/False/Not Given, matching headings, sentence completion." },
      { label: "Passage 2 · Câu 14–27", detail: "Chủ đề trung tính — matching features, multiple choice, summary completion." },
      { label: "Passage 3 · Câu 28–40", detail: "Chủ đề học thuật — Yes/No/Not Given, matching paragraph information, short answer." },
      { label: "Dạng câu hỏi", detail: "TFNG · YNNG · Matching · Multiple choice · Completion · Short answer · Diagram." },
    ],
    tip: "Đọc câu hỏi trước rồi tìm keyword trong bài — không cần đọc hết passage mới bắt đầu trả lời, và luôn để dành ít nhất 5 phút để kiểm tra đáp án.",
  },
  writing: {
    skill: "writing",
    shortLabel: "Writing",
    title: "IELTS Writing",
    icon: PenLine,
    duration: "60 phút · 2 task",
    description:
      "Bài Viết gồm 2 task trong 60 phút, viết trực tiếp trong khung soạn thảo có tự lưu, đếm từ và đếm đoạn. Task 1 mô tả dữ liệu (biểu đồ, bảng, sơ đồ quá trình) yêu cầu ít nhất 150 từ; Task 2 là bài nghị luận ít nhất 250 từ. Task 2 được chấm nặng hơn Task 1 nên hãy ưu tiên thời gian cho Task 2.",
    stats: [
      { label: "Thời lượng", value: "60 phút" },
      { label: "Task", value: "2 task" },
      { label: "Task 1", value: "150 từ · 20 phút" },
      { label: "Task 2", value: "250 từ · 40 phút" },
    ],
    format: [
      { label: "Task 1 · 20 phút", detail: "Mô tả biểu đồ / bảng / sơ đồ quá trình bằng số liệu — ít nhất 150 từ, chiếm ~1/3 điểm." },
      { label: "Task 2 · 40 phút", detail: "Nghị luận về quan điểm, vấn đề hoặc giải pháp — ít nhất 250 từ, chiếm ~2/3 điểm." },
      { label: "Tiêu chí chấm", detail: "Task Response · Coherence & Cohesion · Lexical Resource · Grammar (4 tiêu chí, mỗi tiêu chí 9.0)." },
      { label: "Trong demo", detail: "Bản ghi nháp được tự lưu; band Writing được ước tính theo độ hoàn thành và gắn nhãn 'Ước tính'." },
    ],
    tip: "Đừng để hết giờ mà chưa viết đủ số từ — mở đầu nêu rõ quan điểm, mỗi đoạn một ý kèm ví dụ, và viết conclusion cuối cùng.",
  },
  speaking: {
    skill: "speaking",
    shortLabel: "Speaking",
    title: "IELTS Speaking",
    icon: Mic,
    duration: "10–15 phút · 3 part",
    description:
      "Bài Nói gồm 3 part trong khoảng 10–15 phút, mô phỏng buổi phỏng vấn trực tiếp với giám khảo. Ghi âm THẬT bằng mic trình duyệt: waveform, bộ đếm thời gian từng part (Part 1: 5 phút, Part 2: 4 phút, Part 3: 5 phút) và nghe lại được ngay câu trả lời của bạn trong phiên làm bài.",
    stats: [
      { label: "Thời lượng", value: "10–15 phút" },
      { label: "Part", value: "3 part" },
      { label: "Chuẩn bị (Part 2)", value: "1 phút" },
      { label: "Nói (Part 2)", value: "2 phút" },
    ],
    format: [
      { label: "Part 1 · 4–5 phút", detail: "Giới thiệu + câu hỏi quen thuộc: gia đình, công việc, học tập, sở thích." },
      { label: "Part 2 · 3–4 phút", detail: "Cue card: 1 phút chuẩn bị bằng ghi chú, sau đó nói liên tục 2 phút về chủ đề." },
      { label: "Part 3 · 4–5 phút", detail: "Thảo luận sâu và mở rộng vấn đề của Part 2 — trả lời dài hơn, có lập luận." },
      { label: "Ghi âm thật", detail: "Mic trình duyệt — nghe lại được ngay và trong trang xem lại; bài chờ giáo viên chấm điểm." },
    ],
    tip: "Trả lời theo cấu trúc “quan điểm → lý do → ví dụ”, đừng chỉ trả lời có/không, và đừng ngại dừng lại một chút để lấy ý.",
  },
};

/** Validated lookup: `/ielts/instructions?skill=reading` → Reading intro. */
export function getSkillIntro(skill: string | null | undefined): SkillIntro | null {
  if (!skill) return null;
  return (Object.keys(SKILL_INTROS) as IeltsModule[]).includes(skill as IeltsModule)
    ? SKILL_INTROS[skill as IeltsModule]
    : null;
}
