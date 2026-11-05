import { useEffect, useState } from "react";
import { Check, GraduationCap } from "lucide-react";
import { Button } from "@fe/components/ui/button";

/** Sự kiện nội bộ để mọi instance của nút đồng bộ trạng thái "đã ghi nhận". */
const GRADE_REQUEST_EVENT = "exam:teacher-grade-requested";

function storageKeyOf(skillLabel: string): string {
  return `exam:teacher-grade-requested:${skillLabel}`;
}

function readRequested(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

interface InstructorGradeButtonProps {
  /** Kỹ năng cần giảng viên chấm (mặc định Speaking). */
  skillLabel?: string;
  size?: "sm" | "default" | "lg";
  /** Nút chiếm hết chiều rộng khối cha. */
  fullWidth?: boolean;
}

/**
 * Nút "Nhờ giảng viên chấm điểm" — Speaking (và Writing) KHÔNG chấm tự động,
 * học viên gửi bài cho giảng viên chấm tay.
 *
 * Trạng thái được ghi nhận vào sessionStorage (trong phiên) + bắn sự kiện để
 * mọi nút cùng trang đồng bộ. Nối backend (lưu yêu cầu + giảng viên nhận bài)
 * sẽ nối vào sau.
 */
export function InstructorGradeButton({
  skillLabel = "Speaking",
  size = "default",
  fullWidth = false,
}: InstructorGradeButtonProps) {
  const key = storageKeyOf(skillLabel);
  const [requested, setRequested] = useState(() => readRequested(key));

  useEffect(() => {
    const sync = () => setRequested(readRequested(key));
    window.addEventListener(GRADE_REQUEST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(GRADE_REQUEST_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  const request = () => {
    try {
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — vẫn hiện trạng thái trong phiên React */
    }
    setRequested(true);
    window.dispatchEvent(new Event(GRADE_REQUEST_EVENT));
  };

  if (requested) {
    return (
      <div
        className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}
        data-testid="teacher-grade-requested"
      >
        <span
          className={`inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700 ${
            fullWidth ? "w-full" : ""
          }`}
        >
          <Check className="size-4" />
          Đã ghi nhận yêu cầu chấm {skillLabel}
        </span>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Giảng viên sẽ chấm bài và phản hồi cho bạn.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
      <Button
        size={size}
        className={`gap-2 ${fullWidth ? "w-full" : ""}`}
        onClick={request}
        data-testid="teacher-grade-button"
      >
        <GraduationCap className="size-4" />
        Nhờ giảng viên chấm {skillLabel}
      </Button>
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        {skillLabel} không chấm tự động — bài sẽ được giảng viên chấm tay.
      </p>
    </div>
  );
}
