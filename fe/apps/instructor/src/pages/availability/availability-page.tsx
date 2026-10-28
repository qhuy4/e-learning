import { useState } from "react";
import { CalendarDays, CalendarOff, ChevronLeft, ChevronRight, Clock, ListChecks } from "lucide-react";
import { cn } from "@fe/lib/utils";
import { Button } from "@fe/components/ui/button";
import { Card, CardContent } from "@fe/components/ui/card";

import {
  useRecurringAvailability,
  useExceptionAvailability,
} from "@/features/availability/hooks/use-availability";
import {
  timeToMinutes,
} from "@/features/availability/config/availability.config";
import type { RecurringAvailability } from "@/features/availability/types/availability.types";
import { WeekAvailabilityGrid } from "@/features/availability/components/week-availability-grid";
import { WeeklyScheduleCards } from "@/features/availability/components/weekly-schedule-cards";
import { ExceptionsSection } from "@/features/availability/components/exceptions-section";
import { RecurringFormDialog } from "@/features/availability/components/recurring-form-dialog";

function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtShort(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

export default function AvailabilityPage() {
  const [view, setView] = useState<"weekly" | "calendar">("weekly");
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));

  const { data: recurring, isLoading } = useRecurringAvailability();
  const { data: exceptions } = useExceptionAvailability();

  const [dialog, setDialog] = useState<{
    open: boolean;
    editing: RecurringAvailability | null;
    initial?: { day: number; start: string; end: string };
  }>({ open: false, editing: null });

  const openCreate = (initial?: { day: number; start: string; end: string }) =>
    setDialog({ open: true, editing: null, initial });
  const openEdit = (item: RecurringAvailability) =>
    setDialog({ open: true, editing: item });
  const closeDialog = () => setDialog({ open: false, editing: null });

  // Stats
  const activeItems = recurring?.filter((item) => item.is_active) ?? [];
  const totalMinutes = activeItems.reduce(
    (sum, item) =>
      sum + Math.max(0, timeToMinutes(item.end_time) - timeToMinutes(item.start_time)),
    0,
  );
  const hours = totalMinutes / 60;
  const hoursLabel = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  const exceptionCount = exceptions?.length ?? 0;

  const isCurrentWeek =
    mondayOf(new Date()).getTime() === weekStart.getTime();
  const weekLabel = `${fmtShort(weekStart)} – ${fmtShort(
    addDays(weekStart, 6),
  )}`;

  const views: { id: "weekly" | "calendar"; label: string; icon: typeof Clock }[] = [
    { id: "weekly", label: "Lịch tuần", icon: ListChecks },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch giảng dạy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lịch cố định hằng tuần + ngoại lệ từng ngày
        </p>
      </div>

      {/* Stats + view toggle */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <div>
                <div className="text-lg font-bold leading-tight">
                  {isLoading ? "…" : `${hoursLabel} giờ`}
                </div>
                <div className="text-xs text-muted-foreground">
                  có sẵn trong tuần
                </div>
              </div>
            </div>

            <div className="h-9 w-px bg-border" />

            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <CalendarOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <div className="text-lg font-bold leading-tight">
                  {exceptionCount} ngoại lệ
                </div>
                <div className="text-xs text-muted-foreground">
                  nghỉ / cộng thêm giờ
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                  view === v.id
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <v.icon className="h-4 w-4" />
                {v.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Views */}
      {view === "weekly" ? (
        isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <WeeklyScheduleCards
            items={recurring ?? []}
            onAdd={() => openCreate()}
          />
        )
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-32 text-center text-sm font-semibold tabular-nums">
                {weekLabel}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isCurrentWeek && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setWeekStart(mondayOf(new Date()))}
                >
                  Về tuần này
                </Button>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Kéo chuột để tạo khung giờ • bấm khung để sửa
            </span>
          </div>

          <WeekAvailabilityGrid
            items={recurring ?? []}
            weekStart={weekStart}
            exceptions={exceptions ?? []}
            onCreate={(slot) => openCreate(slot)}
            onEdit={openEdit}
          />
        </div>
      )}

      {/* Exceptions — nằm ngay trong Availability */}
      <ExceptionsSection />

      {dialog.open && (
        <RecurringFormDialog
          open
          editing={dialog.editing}
          initial={dialog.initial}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}
