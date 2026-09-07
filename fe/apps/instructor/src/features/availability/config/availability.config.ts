import { badgeVariants } from "@fe/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export const DAY_NAMES = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

export const recurringStatusConfig: Record<
  string,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  active: {
    label: "Hoạt động",
    variant: "outline",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  inactive: {
    label: "Tạm dừng",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
};

export const exceptionTypeConfig: Record<
  string,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  unavailable: {
    label: "Nghỉ",
    variant: "destructive",
  },
  custom: {
    label: "Giờ",
    variant: "outline",
  },
};
