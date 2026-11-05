import { Badge } from "@fe/components/ui/badge";
import { cn } from "@fe/lib/utils";
import {
  LEVEL_BADGE,
  confidenceLabel,
  confidenceLevel,
} from "../config/skill.config";

interface ConfidenceBadgeProps {
  value: number | null;
  className?: string;
}

/** Hiển thị mức dữ liệu hỗ trợ, không dùng màu lỗi hoặc thuật ngữ kỹ thuật. */
export function ConfidenceBadge({ value, className }: ConfidenceBadgeProps) {
  if (value == null) {
    return (
      <Badge
        variant="outline"
        className={cn("text-muted-foreground", className)}
      >
        Chưa đủ dữ liệu
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn(LEVEL_BADGE[confidenceLevel(value)], className)}
    >
      Mức hỗ trợ: {confidenceLabel(value)}
    </Badge>
  );
}
