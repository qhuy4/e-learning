import { cn } from "@fe/lib/utils";

interface DayOfWeekPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DAYS = [
  { value: "0", short: "CN", label: "Chủ nhật" },
  { value: "1", short: "T2", label: "Thứ 2" },
  { value: "2", short: "T3", label: "Thứ 3" },
  { value: "3", short: "T4", label: "Thứ 4" },
  { value: "4", short: "T5", label: "Thứ 5" },
  { value: "5", short: "T6", label: "Thứ 6" },
  { value: "6", short: "T7", label: "Thứ 7" },
];

export function DayOfWeekPicker({ value, onChange }: DayOfWeekPickerProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS.map((day) => (
        <button
          key={day.value}
          className={cn(
            "h-10 rounded-lg text-sm font-medium transition-colors",
            value === day.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChange(day.value)}
        >
          {day.short}
        </button>
      ))}
    </div>
  );
}
