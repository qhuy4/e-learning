import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, CalendarOff, X } from "lucide-react";
import { toast } from "sonner";

import { TimePicker } from "@/components/time-picker";
import { DayOfWeekPicker } from "@/components/day-of-week-picker";
import { Toggle } from "@fe/components/ui/toggle";

import {
  useRecurringAvailability,
  useExceptionAvailability,
  useCreateRecurring,
  useUpdateRecurring,
  useDeleteRecurring,
  useCreateException,
  useUpdateException,
  useDeleteException,
} from "@/features/availability/hooks/use-availability";
import type {
  RecurringAvailability,
  ExceptionAvailability,
} from "@/features/availability/types/availability.types";
import {
  DAY_LABELS,
  DAY_NAMES,
  recurringStatusConfig,
  exceptionTypeConfig,
} from "@/features/availability/config/availability.config";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { Calendar } from "@fe/components/ui/calendar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getErrorMessage } from "@/shared/utils/error";

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function AvailabilityPage() {
  const [tab, setTab] = useState<"recurring" | "exceptions">("recurring");

  return (
    <div className="mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch giảng dạy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý lịch availability của bạn
        </p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "recurring"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("recurring")}
        >
          <Clock className="w-4 h-4 mr-2 inline" />
          Lịch cố định
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "exceptions"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("exceptions")}
        >
          <CalendarOff className="w-4 h-4 mr-2 inline" />
          Ngoại lệ
        </button>
      </div>

      {tab === "recurring" ? <RecurringTab /> : <ExceptionsTab />}
    </div>
  );
}

function RecurringTab() {
  const { data: items, isLoading } = useRecurringAvailability();
  const createMut = useCreateRecurring();
  const updateMut = useUpdateRecurring();
  const deleteMut = useDeleteRecurring();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringAvailability | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    day_of_week: "1",
    start_time: "08:00",
    end_time: "12:00",
    effective_from: new Date().toISOString().split("T")[0],
    effective_until: "",
    is_active: true,
  });

  const [fromOpen, setFromOpen] = useState(false);
  const [untilOpen, setUntilOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({
      day_of_week: "1",
      start_time: "08:00",
      end_time: "12:00",
      effective_from: new Date().toISOString().split("T")[0],
      effective_until: "",
      is_active: true,
    });
    setShowForm(true);
  };

  const openEdit = (item: RecurringAvailability) => {
    setEditing(item);
    setForm({
      day_of_week: String(item.day_of_week),
      start_time: item.start_time,
      end_time: item.end_time,
      effective_from: item.effective_from,
      effective_until: item.effective_until ?? "",
      is_active: item.is_active,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = () => {
    const payload = {
      day_of_week: Number(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      effective_from: form.effective_from,
      effective_until: form.effective_until || undefined,
      is_active: form.is_active,
    };

    const onDone = () => {
      toast.success(editing ? "Đã cập nhật!" : "Đã tạo!");
      cancelForm();
    };

    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: payload },
        { onSuccess: onDone, onError: (err) => toast.error(getErrorMessage(err)) }
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: onDone,
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!showForm && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm lịch
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">
              {editing ? "Sửa lịch" : "Thêm lịch mới"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={cancelForm}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày trong tuần</Label>
              <DayOfWeekPicker
                value={form.day_of_week}
                onChange={(v) => setForm({ ...form, day_of_week: v })}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hiệu lực từ</Label>
                <Popover open={fromOpen} onOpenChange={setFromOpen}>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" className="w-full justify-start font-normal">
                        {parseDate(form.effective_from)
                          ? parseDate(form.effective_from)!.toLocaleDateString()
                          : "Chọn ngày"}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDate(form.effective_from)}
                      defaultMonth={parseDate(form.effective_from) ?? new Date()}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date) {
                          setForm({ ...form, effective_from: formatDate(date) });
                          setFromOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Hiệu lực đến</Label>
                <Popover open={untilOpen} onOpenChange={setUntilOpen}>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" className="w-full justify-start font-normal">
                        {form.effective_until
                          ? parseDate(form.effective_until)?.toLocaleDateString()
                          : "Vô thời hạn"}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDate(form.effective_until)}
                      defaultMonth={parseDate(form.effective_until) ?? parseDate(form.effective_from) ?? new Date()}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setForm({ ...form, effective_until: date ? formatDate(date) : "" });
                        setUntilOpen(false);
                      }}
                    />
                    {form.effective_until && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setForm({ ...form, effective_until: "" });
                            setUntilOpen(false);
                          }}
                        >
                          Xóa (vô thời hạn)
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="is_active">Hoạt động</Label>
              <Toggle
                id="is_active"
                variant="outline"
                size="sm"
                defaultPressed={form.is_active}
                onPressedChange={(pressed) => setForm({ ...form, is_active: pressed })}
              >
                {form.is_active ? "Bật" : "Tắt"}
              </Toggle>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={cancelForm}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!items?.length && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có lịch cố định nào
        </div>
      ) : (
        <div className="space-y-2">
          {items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="w-10 justify-center">
                  {DAY_LABELS[item.day_of_week]}
                </Badge>
                <div>
                  <div className="font-medium">
                    {DAY_NAMES[item.day_of_week]} • {item.start_time} -{" "}
                    {item.end_time}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Từ {item.effective_from}
                    {item.effective_until
                      ? ` đến ${item.effective_until}`
                      : " (vô thời hạn)"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={recurringStatusConfig[item.is_active ? "active" : "inactive"].variant}
                  className={recurringStatusConfig[item.is_active ? "active" : "inactive"].className}
                >
                  {recurringStatusConfig[item.is_active ? "active" : "inactive"].label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        title="Xóa lịch?"
        description="Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

function ExceptionsTab() {
  const { data: items, isLoading } = useExceptionAvailability();
  const createMut = useCreateException();
  const updateMut = useUpdateException();
  const deleteMut = useDeleteException();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExceptionAvailability | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    specific_date: new Date().toISOString().split("T")[0],
    is_unavailable: true,
    start_time: "08:00",
    end_time: "12:00",
    reason: "",
  });

  const [dateOpen, setDateOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({
      specific_date: new Date().toISOString().split("T")[0],
      is_unavailable: true,
      start_time: "08:00",
      end_time: "12:00",
      reason: "",
    });
    setShowForm(true);
  };

  const openEdit = (item: ExceptionAvailability) => {
    setEditing(item);
    setForm({
      specific_date: item.specific_date,
      is_unavailable: item.is_unavailable,
      start_time: item.start_time ?? "08:00",
      end_time: item.end_time ?? "12:00",
      reason: item.reason ?? "",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = () => {
    const payload: any = {
      specific_date: form.specific_date,
      is_unavailable: form.is_unavailable,
      start_time: form.is_unavailable ? null : form.start_time,
      end_time: form.is_unavailable ? null : form.end_time,
      reason: form.reason || undefined,
    };

    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật!");
            setShowForm(false);
            setEditing(null);
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        }
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success("Đã tạo!");
          setShowForm(false);
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm ngoại lệ
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {editing ? "Sửa ngoại lệ" : "Thêm ngoại lệ mới"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start font-normal">
                      {parseDate(form.specific_date)
                        ? parseDate(form.specific_date)!.toLocaleDateString()
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

            <div className="flex items-center gap-3">
              <Label htmlFor="is_unavailable">Nghỉ cả ngày</Label>
              <Toggle
                id="is_unavailable"
                variant="outline"
                size="sm"
                defaultPressed={form.is_unavailable}
                onPressedChange={(pressed) =>
                  setForm({ ...form, is_unavailable: pressed })
                }
              >
                {form.is_unavailable ? "Bật" : "Tắt"}
              </Toggle>
            </div>

            {!form.is_unavailable && (
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

            <div className="space-y-2">
              <Label>Lý do (tùy chọn)</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Nghỉ phép, sự kiện..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelForm}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!items?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có ngoại lệ nào
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant={exceptionTypeConfig[item.is_unavailable ? "unavailable" : "custom"].variant}
                  className="w-10 justify-center"
                >
                  {exceptionTypeConfig[item.is_unavailable ? "unavailable" : "custom"].label}
                </Badge>
                <div>
                  <div className="font-medium">{item.specific_date}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.is_unavailable
                      ? "Nghỉ cả ngày"
                      : `${item.start_time} - ${item.end_time}`}
                    {item.reason ? ` • ${item.reason}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
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
