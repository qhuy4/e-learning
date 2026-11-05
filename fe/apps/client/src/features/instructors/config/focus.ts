export interface FocusOption {
  id: string;
  title: string;
  description: string;
}

export const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: "hesitation",
    title: "Khơi phục độ ngập ngừng khi nói & thói quen dùng từ đệm",
    description:
      'Kỹ thuật giảm "ừm", khoảng lặng và rèn cách diễn đạt ý nghĩ trôi chảy',
  },
  {
    id: "idioms",
    title: "Cụm từ tự nhiên & cách chuyển tiếp mượt (trình độ B2)",
    description:
      "Nghe tự nhiên như người bản ngữ thay vì kiểu sách giáo khoa trong hội thoại hằng ngày",
  },
  {
    id: "pronunciation",
    title: "Hoàn thiện phát âm & ngữ điệu",
    description:
      "Liên âm giữa từ, nhịp nhấn câu và độ rõ của các nguyên âm mềm",
  },
  {
    id: "ielts",
    title: "Chiến lược thi nói IELTS / Cambridge",
    description:
      "Đúng tiêu chí chấm, cách quản lý thời gian Part 2 & 3 và nâng tầm từ vựng",
  },
  {
    id: "general",
    title: "Khác / Đánh giá chẩn đoán tổng quát",
    description:
      "Hội thoại mở để so sánh độ trôi chảy thực chiến với chỉ số PiEMind",
  },
];
