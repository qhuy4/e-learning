import { useState } from "react";
import { CalendarOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@fe/lib/utils";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { Calendar } from "@fe/components/ui/calendar";
import { TimePicker } from "@/components/time-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getErrorMessage } from "@/shared/utils/error";
import {
  useCreateException,
  useDeleteException,
  useExceptionAvailability,
  useUpdateException,
} from "../hooks/use-availability";
import {
  exceptionKindConfig,
} from "../config/availability.config";
import {
  exceptionKind,
  type CreateExceptionRequest,
  type ExceptionAvailability,
  type ExceptionKind,
} from "../types/availability.types";
import { formatDate, parseDate } from "../utils/date";

interface ExceptionFormState {
  specific_date: string;
  kind: ExceptionKind;
  start_time: string;
  end_time: string;
  reason: string;
}

function emptyForm(): ExceptionFormState {
  return {
    specific_date: formatDate(new Date()),
    kind: "off",
    start_time: "08:00",
    end_time: "12:00",
    reason: "",
  };
}

function formFrom(item: ExceptionAvailability): ExceptionFormState {
  return {
    specific_date: item.specific_date,
    kind: exceptionKind(item),
    start_time: item.start_time?.slice(0, 5) ?? "08:00",
    end_time: item.end_time?.slice(0, 5) ?? "12:00",
    reason: item.reason ?? "",
  };
}

function toPayload(form: ExceptionFormState): CreateExceptionRequest {
  const base = {
    specific_date: form.specific_date,
    reason: form.reason.trim() || undefined,
  };
  if (form.kind === "off") {
    return { ...base, is_unavailable: true, is_extra: false, start_time: null, end_time: null };
  }
  return {
    ...base,
    is_unavailable: false,
    is_extra: form.kind === "extra",
    start_time: form.start_time,
    end_time: form.end_time,
  };
}

const KINDS: ExceptionKind[] = ["off", "range", "extra"];

export function ExceptionsSection() {
  const { data: items, isLoading } = useExceptionAvailability();
  const createMut = useCreateException();
  const updateMut = useUpdateException();
  const deleteMut = useDeleteException();

  const [editing, setEditing] = useState<ExceptionAvailability | null>(null);
  const [form, setForm] = useState<ExceptionFormState | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const pending = createMut.isPending || updateMut.isPending;
  const invalidRange =
    form && form.kind !== "off" && form.end_time <= form.start_time;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const openEdit = (item: ExceptionAvailability) => {
    setEditing(item);
    setForm(formFrom(item));
  };

  const cancel = () => {
    setEditing(null);
    setForm(null);
  };

  const submit = () => {
    if (!form) return;
    if (invalidRange) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }
    const payload = toPayload(form);

    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật ngoại lệ!");
            cancel();
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success("Đã thêm ngoại lệ!");
          cancel();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      });
    }
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteMut.mutate(deletingId, {
      onSuccess: () => {
        toast.success("Đã xóa!");
        setDeletingId(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarOff className="h-4 w-4" />
            Ngoại lệ
            {items && items.length > 0 && (
              <Badge variant="secondary" className="text-[11px]">
                {items.length}
              </Badge>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            Ghi đè lịch cố định — nghỉ hoặc cộng thêm giờ cho một ngày cụ thể
          </p>
        </div>
        {!form && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm ngoại lệ
          </Button>
        )}
      </div>

      {form && (
        <Card className="m-4 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {editing ? "Sửa ngoại lệ" : "Thêm ngoại lệ"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Loại ngoại lệ</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, kind: k })}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors cursor-pointer",
                      form.kind === k
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {exceptionKindConfig[k].label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.kind === "off"
                  ? "Không nhận lịch cả ngày."
                  : form.kind === "range"
                    ? "Chặn một khung giờ trong ngày."
                    : "Cộng thêm giờ ngoài lịch cố định."}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ngày</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start font-normal">
                      {parseDate(form.specific_date)
                        ? parseDate(form.specific_date)!.toLocaleDateString("vi-VN")
                        : "Chọn ngày"}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(form.specific_date)}
                    defaultMonth={parseDate(form.specific_date) ?? new Date()}
                    captionLayout="dropdown"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    onSelect={(date) => {
                      if (date) {
                        setForm({ ...form, specific_date: formatDate(date) });
                        setDateOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {form.kind !== "off" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giờ bắt đầu</Label>
                  <TimePicker
                    value={form.start_time}
                    onChange={(v) => setForm({ ...form, start_time: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giờ kết thúc</Label>
                  <TimePicker
                    value={form.end_time}
                    onChange={(v) => setForm({ ...form, end_time: v })}
                  />
                </div>
              </div>
            )}

            {invalidRange && (
              <p className="text-xs font-medium text-destructive">
                Giờ kết thúc phải sau giờ bắt đầu.
              </p>
            )}

            <div className="space-y-2">
              <Label>Lý do (tùy chọn)</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Nghỉ phép, sự kiện riêng..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancel}>
                Hủy
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2 p-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !items?.length ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          Chưa có ngoại lệ nào
        </div>
      ) : (
        <div>
          {items.map((item) => {
            const kind = exceptionKind(item);
            const cfg = exceptionKindConfig[kind];
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0"
              >
                <span className="w-24 shrink-0 text-sm font-semibold tabular-nums">
                  {parseDate(item.specific_date)?.toLocaleDateString("vi-VN") ??
                    item.specific_date}
                </span>
                <Badge variant="outline" className={cn("shrink-0", cfg.className)}>
                  {cfg.label}
                </Badge>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {kind === "off"
                    ? "Cả ngày"
                    : `${item.start_time?.slice(0, 5)} – ${item.end_time?.slice(0, 5)}`}
                </span>
                {item.reason && (
                  <span className="text-xs text-muted-foreground">
                    • {item.reason}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        title="Xóa ngoại lệ?"
        description="Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
