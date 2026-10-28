import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TimePicker } from "@/components/time-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getErrorMessage } from "@/shared/utils/error";
import {
  useCreateRecurring,
  useDeleteRecurring,
  useUpdateRecurring,
} from "../hooks/use-availability";
import { DAY_LABELS, DAY_NAMES, WEEK_ORDER } from "../config/availability.config";
import { formatDate, parseDate } from "../utils/date";
import type { RecurringAvailability } from "../types/availability.types";
import { Button } from "@fe/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import { Label } from "@fe/components/ui/label";
import { Toggle } from "@fe/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@fe/components/ui/popover";
import { Calendar } from "@fe/components/ui/calendar";
import { cn } from "@fe/lib/utils";

interface RecurringFormDialogProps {
  open: boolean;
  editing: RecurringAvailability | null;
  initial?: { day: number; start: string; end: string };
  onClose: () => void;
}

function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface DateFieldProps {
  label: string;
  value: string;
  placeholder: string;
  minDate?: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
}

function DateField({
  label,
  value,
  placeholder,
  minDate,
  onChange,
  allowClear,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="w-full justify-start font-normal"
            >
              {parseDate(value)
                ? parseDate(value)!.toLocaleDateString()
                : placeholder}
            </Button>
          }
        />
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={parseDate(value)}
            defaultMonth={parseDate(value) ?? new Date()}
            captionLayout="dropdown"
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const floor = minDate ? parseDate(minDate) : undefined;
              const limit = floor && floor > today ? floor : today;
              return date < limit;
            }}
            onSelect={(date) => {
              if (date) {
                onChange(formatDate(date));
                setOpen(false);
              }
            }}
          />
          {allowClear && value && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Xóa (vô thời hạn)
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function RecurringFormDialog({
  open,
  editing,
  initial,
  onClose,
}: RecurringFormDialogProps) {
  const createMut = useCreateRecurring();
  const updateMut = useUpdateRecurring();
  const deleteMut = useDeleteRecurring();

  // Mounted fresh on each open (parent renders this only while open),
  // so initial state can be derived straight from props.
  const [days, setDays] = useState<number[]>(() =>
    editing ? [editing.day_of_week] : [initial?.day ?? 1],
  );
  const [start, setStart] = useState(() =>
    editing ? editing.start_time.slice(0, 5) : (initial?.start ?? "08:00"),
  );
  const [end, setEnd] = useState(() =>
    editing ? editing.end_time.slice(0, 5) : (initial?.end ?? "12:00"),
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    () => (editing ? editing.effective_from : null) ?? formatDate(new Date()),
  );
  const [effectiveUntil, setEffectiveUntil] = useState(
    () => editing?.effective_until ?? "",
  );
  const [isActive, setIsActive] = useState(() =>
    editing ? editing.is_active : true,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleDay = (day: number) => {
    if (editing) return;
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const invalidRange = toMin(end) <= toMin(start);

  const handleSubmit = async () => {
    if (days.length === 0) {
      toast.error("Chọn ít nhất một ngày.");
      return;
    }
    if (invalidRange) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    const base = {
      start_time: start,
      end_time: end,
      effective_from: effectiveFrom,
      // null (not undefined) so clearing the end date actually persists as NULL
      effective_until: effectiveUntil || null,
      is_active: isActive,
    };

    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: { ...base, day_of_week: editing.day_of_week } },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật!");
            onClose();
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
      return;
    }

    const results = await Promise.allSettled(
      days.map((day) =>
        createMut.mutateAsync({ ...base, day_of_week: day }),
      ),
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failedDays = results
      .map((r, i) => (r.status === "rejected" ? days[i] : null))
      .filter((d): d is number => d !== null);

    if (ok === days.length) {
      toast.success(
        days.length > 1 ? `Đã tạo ${ok} khung giờ!` : "Đã tạo!",
      );
      onClose();
    } else if (ok > 0) {
      toast.warning(
        `Đã tạo ${ok}/${days.length} — trùng lịch: ${failedDays
          .map((d) => DAY_NAMES[d])
          .join(", ")}`,
      );
      onClose();
    } else {
      toast.error(
        `Không tạo được — trùng lịch với khung giờ đã có (${failedDays
          .map((d) => DAY_NAMES[d])
          .join(", ")}).`,
      );
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    deleteMut.mutate(editing.id, {
      onSuccess: () => {
        toast.success("Đã xóa!");
        setConfirmDelete(false);
        onClose();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const pending =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sửa khung giờ" : "Thêm khung giờ"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày trong tuần</Label>
              <div className="grid grid-cols-7 gap-1">
                {WEEK_ORDER.map((day) => {
                  const selected = editing
                    ? day === editing.day_of_week
                    : days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!!editing}
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "h-9 rounded-lg text-sm font-medium transition-colors disabled:opacity-70",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        !editing && "cursor-pointer",
                      )}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giờ bắt đầu</Label>
                <TimePicker value={start} onChange={setStart} />
              </div>
              <div className="space-y-2">
                <Label>Giờ kết thúc</Label>
                <TimePicker value={end} onChange={setEnd} />
              </div>
            </div>

            {invalidRange && (
              <p className="text-xs font-medium text-destructive">
                Giờ kết thúc phải sau giờ bắt đầu.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="Hiệu lực từ"
                value={effectiveFrom}
                placeholder="Chọn ngày"
                onChange={setEffectiveFrom}
              />
              <DateField
                label="Hiệu lực đến"
                value={effectiveUntil}
                placeholder="Vô thời hạn"
                minDate={effectiveFrom}
                onChange={setEffectiveUntil}
                allowClear
              />
            </div>

            <div className="flex items-center gap-3">
              <Label>Hoạt động</Label>
              <Toggle
                variant="outline"
                size="sm"
                pressed={isActive}
                onPressedChange={setIsActive}
              >
                {isActive ? "Bật" : "Tắt"}
              </Toggle>
            </div>
          </div>

          <DialogFooter>
            {editing && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive sm:mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Xóa
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={pending}>
              {pending
                ? "Đang lưu..."
                : editing
                  ? "Cập nhật"
                  : days.length > 1
                    ? `Tạo ${days.length} khung giờ`
                    : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa lịch?"
        description="Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
