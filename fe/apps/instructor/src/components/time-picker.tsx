import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@fe/components/ui/popover";
import { cn } from "@fe/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = ["00", "15", "30", "45"];

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(value.split(":")[0] || "08");
  const [minute, setMinute] = useState(value.split(":")[1] || "00");

  const handleHourChange = (h: string) => {
    setHour(h);
    onChange(`${h}:${minute}`);
  };

  const handleMinuteChange = (m: string) => {
    setMinute(m);
    onChange(`${hour}:${m}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-start font-normal gap-2"
          >
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{value || "Chọn giờ"}</span>
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col p-1">
            <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Giờ
            </span>
            <div className="grid grid-cols-4 gap-0.5">
              {HOURS.map((h) => (
                <button
                  key={h}
                  className={cn(
                    "w-10 h-8 text-xs rounded-md transition-colors",
                    h === hour
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleHourChange(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col p-1">
            <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Phút
            </span>
            <div className="grid grid-cols-2 gap-0.5">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  className={cn(
                    "w-10 h-8 text-xs rounded-md transition-colors",
                    m === minute
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleMinuteChange(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
