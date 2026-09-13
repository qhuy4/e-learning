export const LEVEL_LABELS: Record<number, string> = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Nâng cao",
};

export const COURSE_STATUS_CONFIG: Record<
  number,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  1: { label: "Bản nháp", variant: "secondary", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  2: { label: "Chờ duyệt", variant: "outline", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  3: { label: "Đã duyệt", variant: "default", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  4: { label: "Bị từ chối", variant: "destructive", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  5: { label: "Đã xuất bản", variant: "default", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  6: { label: "Lưu trữ", variant: "secondary", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};
