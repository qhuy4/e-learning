import {useState} from "react";
import {Pencil, Plus, Trash2} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@fe/lib/utils";
import {Button} from "@fe/components/ui/button";
import {TimePicker} from "@/components/time-picker";
import {getErrorMessage} from "@/shared/utils/error";
import {useCreateRecurring, useDeleteRecurring, useUpdateRecurring,} from "../hooks/use-availability";
import {DAY_NAMES, timeToMinutes, WEEK_ORDER,} from "../config/availability.config";
import {formatDate} from "../utils/date";
import type {RecurringAvailability} from "../types/availability.types";

interface EditRow {
  key: string;
  id: number | null;
  start: string;
  end: string;
}

interface WeeklyScheduleCardsProps {
  items: RecurringAvailability[];
  /** Mở dialog tạo khung giờ (chọn nhiều ngày / ngày hiệu lực) */
  onAdd: () => void;
}

let rowSeq = 0;

function dmy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** "Có hiệu lực từ 10/11/2026 · Không có ngày kết thúc" — tính chung cho cả tuần */
function effectiveSubtitle(items: RecurringAvailability[]): string {
  if (items.length === 0) return "Chưa có khung giờ nào trong tuần";
  const froms = items
    .map((i) => i.effective_from)
    .filter((s): s is string => Boolean(s))
    .sort();
  const untils = items
    .map((i) => i.effective_until)
    .filter((s): s is string => Boolean(s))
    .sort();
  const until = items.some((i) => !i.effective_until)
    ? "Không có ngày kết thúc"
    : `đến ${dmy(untils[untils.length - 1])}`;
  return `Có hiệu lực từ ${dmy(froms[0])} · ${until}`;
}

function isOutOfRange(item: RecurringAvailability, todayStr: string): boolean {
  if (item.effective_from && todayStr < item.effective_from) return true;
  if (item.effective_until && todayStr > item.effective_until) return true;
  return false;
}

export function WeeklyScheduleCards({ items, onAdd }: WeeklyScheduleCardsProps) {
  const createMut = useCreateRecurring();
  const updateMut = useUpdateRecurring();
  const deleteMut = useDeleteRecurring();
  const pending =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [rows, setRows] = useState<EditRow[]>([]);

  const todayStr = formatDate(new Date());
  const todayDay = new Date().getDay();

  const sortedFor = (day: number) =>
    items
      .filter((i) => i.day_of_week === day)
      .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  const startEdit = (day: number, withNewRow = false) => {
    const next: EditRow[] = sortedFor(day).map((i) => ({
      key: `i${i.id}`,
      id: i.id,
      start: i.start_time.slice(0, 5),
      end: i.end_time.slice(0, 5),
    }));
    if (withNewRow) {
      next.push({ key: `r${++rowSeq}`, id: null, start: "08:00", end: "12:00" });
    }
    setRows(next);
    setEditingDay(day);
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setRows([]);
  };

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { key: `r${++rowSeq}`, id: null, start: "08:00", end: "12:00" },
    ]);

  const removeRow = (key: string) =>
    setRows((prev) => prev.filter((r) => r.key !== key));

  const changeRow = (key: string, field: "start" | "end", value: string) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );

  const save = async () => {
    if (editingDay === null) return;

    for (const row of rows) {
      if (timeToMinutes(row.end) <= timeToMinutes(row.start)) {
        toast.error("Giờ kết thúc phải sau giờ bắt đầu.");
        return;
      }
    }
    const ordered = [...rows].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
    for (let i = 1; i < ordered.length; i++) {
      if (timeToMinutes(ordered[i - 1].end) > timeToMinutes(ordered[i].start)) {
        toast.error("Các khung giờ trong ngày bị chồng lấn.");
        return;
      }
    }

    const day = editingDay;
    const originals = sortedFor(day);
    const keepIds = new Set(
      rows.map((r) => r.id).filter((id): id is number => id !== null),
    );
    const failures: unknown[] = [];

    // 1) Xóa trước để giải phóng chỗ (tránh conflict overlap với update/create)
    const toDelete = originals.filter((o) => !keepIds.has(o.id));
    if (toDelete.length > 0) {
      const res = await Promise.allSettled(
        toDelete.map((o) => deleteMut.mutateAsync(o.id)),
      );
      failures.push(
        ...res.filter((r) => r.status === "rejected").map((r) => r.reason),
      );
    }

    // 2) Update lần lượt — tránh tranh chấp khi hai khung giờ hoán đổi cho nhau
    for (const row of rows) {
      if (row.id === null) continue;
      const orig = originals.find((o) => o.id === row.id);
      if (!orig) continue;
      if (
        row.start === orig.start_time.slice(0, 5) &&
        row.end === orig.end_time.slice(0, 5)
      ) {
        continue;
      }
      try {
        await updateMut.mutateAsync({
          id: row.id,
          data: { start_time: row.start, end_time: row.end },
        });
      } catch (err) {
        failures.push(err);
      }
    }

    // 3) Tạo mới sau cùng (kế thừa ngày hiệu lực của các khung giờ trong ngày)
    const toCreate = rows.filter((r) => r.id === null);
    if (toCreate.length > 0) {
      const inherit = originals[0];
      const res = await Promise.allSettled(
        toCreate.map((r) =>
          createMut.mutateAsync({
            day_of_week: day,
            start_time: r.start,
            end_time: r.end,
            effective_from: inherit?.effective_from ?? formatDate(new Date()),
            effective_until: inherit?.effective_until ?? null,
            is_active: true,
          }),
        ),
      );
      failures.push(
        ...res.filter((r) => r.status === "rejected").map((r) => r.reason),
      );
    }

    if (failures.length > 0) {
      toast.error(getErrorMessage(failures[0]));
    } else {
      toast.success("Đã lưu lịch tuần!");
    }
    cancelEdit();
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Lịch cố định hằng tuần</h2>
          <p className="text-xs text-muted-foreground">
            {effectiveSubtitle(items)}
          </p>
        </div>
        {editingDay === null && (
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm lịch
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {WEEK_ORDER.map((day) => {
          const dayItems = sortedFor(day);
          const isEditing = editingDay === day;
          const isToday = todayDay === day;

          return (
            <div
              key={day}
              className={cn(
                "flex flex-col overflow-hidden rounded-lg border bg-muted/30",
                isToday && "border-primary/40 bg-m3-secondary/40",
                isEditing && "border-primary bg-background",
              )}
            >
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase",
                    isToday && "text-primary",
                  )}
                >
                  {DAY_NAMES[day]}
                </span>
                {editingDay === null && (
                  <button
                    type="button"
                    onClick={() => startEdit(day)}
                    title="Sửa lịch ngày này"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex flex-1 flex-col gap-2.5 p-2.5">
                  {rows.map((row) => (
                    <div key={row.key} className="flex items-center gap-1.5">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div title="Giờ bắt đầu">
                          <TimePicker
                            value={row.start}
                            onChange={(v) => changeRow(row.key, "start", v)}
                          />
                        </div>
                        <div title="Giờ kết thúc">
                          <TimePicker
                            value={row.end}
                            onChange={(v) => changeRow(row.key, "end", v)}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        title="Xóa khung giờ"
                        className="shrink-0 self-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRow}
                    className="flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm khoảng thời gian
                  </button>

                  <div className="mt-auto flex justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void save()}
                      disabled={pending}
                    >
                      {pending ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-2 p-2.5">
                  {dayItems.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => startEdit(day, true)}
                      className="flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm khung giờ
                    </button>
                  ) : (
                    dayItems.map((item) => {
                      const inactive = !item.is_active;
                      const out = isOutOfRange(item, todayStr);
                      const s = item.start_time.slice(0, 5);
                      const e = item.end_time.slice(0, 5);

                      return (
                        <div
                          key={item.id}
                          title={`${s} – ${e}${inactive ? " • Tạm dừng" : ""}${
                            out ? " • Ngoài hiệu lực" : ""
                          }`}
                          className={cn(
                            "flex flex-wrap items-center gap-x-2 text-xs",
                            out && "opacity-60",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              inactive ? "bg-amber-500" : "bg-emerald-500",
                            )}
                          />
                          <span className="tabular-nums">
                            {s} – {e}
                          </span>
                          {inactive && (
                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              Tạm dừng
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
