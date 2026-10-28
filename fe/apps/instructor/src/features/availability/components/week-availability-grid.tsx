import { useRef, useState } from "react";
import { cn } from "@fe/lib/utils";
import { DAY_LABELS, WEEK_ORDER, timeToMinutes } from "../config/availability.config";
import { formatDate } from "../utils/date";
import { exceptionKind } from "../types/availability.types";
import type { ExceptionAvailability, RecurringAvailability } from "../types/availability.types";

const HOUR_H = 48;
const TOTAL_H = 24 * HOUR_H;
const SNAP = 15;
const MAX_MIN = 24 * 60;

interface WeekAvailabilityGridProps {
  items: RecurringAvailability[];
  /** Thứ Hai của tuần đang xem (dùng để hiển thị ngày trên header + overlay ngoại lệ) */
  weekStart?: Date;
  exceptions?: ExceptionAvailability[];
  onCreate: (slot: { day: number; start: string; end: string }) => void;
  onEdit: (item: RecurringAvailability) => void;
}

interface Draft {
  day: number;
  a: number;
  b: number;
}

function fmt(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(
    min % 60,
  ).padStart(2, "0")}`;
}

function snap(min: number): number {
  return Math.max(0, Math.min(MAX_MIN, Math.round(min / SNAP) * SNAP));
}

export function WeekAvailabilityGrid({
  items,
  weekStart,
  exceptions,
  onCreate,
  onEdit,
}: WeekAvailabilityGridProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayStr = formatDate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Ngày (YYYY-MM-DD) cho từng cột: weekStart luôn là Thứ Hai.
  const columnDates = WEEK_ORDER.map((_, idx) => {
    const d = new Date(weekStart ?? now);
    d.setDate(d.getDate() + idx);
    return formatDate(d);
  });
  const todayIdx = weekStart ? columnDates.indexOf(todayStr) : WEEK_ORDER.indexOf(now.getDay());

  const exceptionsFor = (date: string) =>
    (exceptions ?? []).filter((e) => e.specific_date === date);

  const minutesAt = (e: React.PointerEvent): number => {
    const rect = bodyRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return snap(((e.clientY - rect.top) / HOUR_H) * 60);
  };

  const startDrag = (day: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (e.pointerType !== "mouse") {
      // Touch/tap: no drag (keeps vertical scrolling usable) — create 1h at that hour.
      emit(day, e, e);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const m = minutesAt(e);
    setDraft({ day, a: m, b: m });
  };

  const moveDrag = (day: number, e: React.PointerEvent<HTMLDivElement>) => {
    const m = minutesAt(e);
    setDraft((d) => (d && d.day === day ? { ...d, b: m } : d));
  };

  const finishDrag = (day: number) => {
    if (!draft || draft.day !== day) return;
    const { a, b } = draft;
    setDraft(null);
    emit(day, a, b);
  };

  const emit = (
    day: number,
    from: number | React.PointerEvent,
    to: number | React.PointerEvent,
  ) => {
    const a = typeof from === "number" ? from : minutesAt(from);
    const b = typeof to === "number" ? to : minutesAt(to);
    let s = Math.min(a, b);
    const raw = Math.max(a, b);
    let dur = raw - s;
    if (dur < SNAP) {
      // Click / tap: 1 hour from the top of the clicked hour.
      s = Math.floor(a / 60) * 60;
      dur = 60;
    } else if (dur < 30) {
      dur = 30;
    }
    if (s + dur > MAX_MIN) s = MAX_MIN - dur;
    onCreate({ day, start: fmt(s), end: fmt(s + dur) });
  };

  const outOfRange = (item: RecurringAvailability): boolean => {
    if (item.effective_from && todayStr < item.effective_from) return true;
    if (item.effective_until && todayStr > item.effective_until) return true;
    return false;
  };

  const renderBlock = (item: RecurringAvailability) => {
    const s = timeToMinutes(item.start_time);
    const e = timeToMinutes(item.end_time);
    const height = ((e - s) / MAX_MIN) * TOTAL_H;
    const inactive = !item.is_active;
    const muted = outOfRange(item);
    return (
      <div
        key={item.id}
        title={`${fmt(s)} – ${fmt(e)}${inactive ? " • Tạm dừng" : ""}${
          muted ? " • Ngoài hiệu lực" : ""
        }`}
        onClick={(ev) => {
          ev.stopPropagation();
          onEdit(item);
        }}
        onPointerDown={(ev) => ev.stopPropagation()}
        className={cn(
          "absolute left-1 right-1 z-10 cursor-pointer overflow-hidden rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight transition-colors",
          inactive
            ? "border border-dashed border-amber-500 bg-amber-100 text-amber-800 hover:bg-amber-200"
            : "bg-[#146a5f] text-white hover:bg-[#0f5a51]",
          muted && "opacity-50",
        )}
        style={{
          top: `${(s / MAX_MIN) * TOTAL_H}px`,
          height: `${Math.max(height, 18)}px`,
        }}
      >
        {height >= 22 && (
          <span className="select-none">
            {fmt(s)} – {fmt(e)}
          </span>
        )}
      </div>
    );
  };

  const renderExceptionOverlay = (exc: ExceptionAvailability) => {
    const kind = exceptionKind(exc);

    if (kind === "off") {
      return (
        <div
          key={`exc-${exc.id}`}
          title="Nghỉ cả ngày"
          className="pointer-events-none absolute inset-x-1 top-1 bottom-1 z-10 flex items-center justify-center rounded-md border border-destructive/50 bg-destructive/15 text-[10px] font-bold text-destructive"
        >
          Nghỉ cả ngày
        </div>
      );
    }

    const s = timeToMinutes(exc.start_time!.slice(0, 5));
    const e = timeToMinutes(exc.end_time!.slice(0, 5));
    const height = ((e - s) / MAX_MIN) * TOTAL_H;
    const isExtra = kind === "extra";

    return (
      <div
        key={`exc-${exc.id}`}
        title={`${isExtra ? "Cộng thêm" : "Nghỉ"} ${exc.start_time!.slice(0, 5)} – ${exc.end_time!.slice(0, 5)}${
          exc.reason ? ` • ${exc.reason}` : ""
        }`}
        className={cn(
          "pointer-events-none absolute left-1 right-1 z-10 flex items-center overflow-hidden rounded-md border px-1.5 text-[10px] font-bold",
          isExtra
            ? "border-emerald-400 bg-emerald-500/80 text-white"
            : "border-red-400 bg-red-500/80 text-white",
        )}
        style={{
          top: `${(s / MAX_MIN) * TOTAL_H}px`,
          height: `${Math.max(height, 16)}px`,
        }}
      >
        <span className="truncate">
          {isExtra ? "Cộng thêm" : "Nghỉ"} {exc.start_time!.slice(0, 5)}–
          {exc.end_time!.slice(0, 5)}
        </span>
      </div>
    );
  };

  const draftPreview = (day: number) => {
    if (!draft || draft.day !== day) return null;
    const s = Math.min(draft.a, draft.b);
    const e = Math.max(draft.a, draft.b);
    return (
      <div
        className="pointer-events-none absolute left-1 right-1 z-20 rounded-md border border-[#146a5f] bg-[#146a5f]/30"
        style={{
          top: `${(s / MAX_MIN) * TOTAL_H}px`,
          height: `${Math.max(((e - s) / MAX_MIN) * TOTAL_H, 4)}px`,
        }}
      />
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="text-sm font-semibold">Bản đồ tuần</span>
        <span className="text-xs text-muted-foreground">
          Kéo chuột để tạo khung giờ • bấm khung để sửa
        </span>
      </div>

      <div className="max-h-[560px] overflow-auto">
        <div className="relative min-w-[720px]">
          <div className="sticky top-0 z-30 grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b bg-background">
            <div />
            {WEEK_ORDER.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "px-2 py-2 text-center text-xs font-semibold text-muted-foreground",
                  idx === todayIdx &&
                    "bg-[#146a5f]/10 text-[#146a5f] tracking-wide",
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {idx === todayIdx && (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#146a5f]" />
                  )}
                  {DAY_LABELS[day]}
                </span>
                <span className="block text-[10px] font-medium tabular-nums opacity-70">
                  {columnDates[idx].slice(8, 10)}/{columnDates[idx].slice(5, 7)}
                </span>
              </div>
            ))}
          </div>

          <div
            ref={bodyRef}
            className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]"
          >
            <div className="relative border-r" style={{ height: TOTAL_H }}>
              {Array.from({ length: 24 }, (_, h) => (
                <span
                  key={h}
                  className={cn(
                    "absolute right-2 text-[11px] leading-none text-muted-foreground",
                    h === 0 ? "top-1" : "-translate-y-1/2",
                  )}
                  style={{ top: h === 0 ? undefined : h * HOUR_H }}
                >
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>

            {WEEK_ORDER.map((day, idx) => (
              <div
                key={day}
                data-day={day}
                className={cn(
                  "relative border-r last:border-r-0",
                  idx === todayIdx && "bg-[#146a5f]/[0.04]",
                  draft?.day === day && "bg-[#146a5f]/10",
                )}
                style={{ height: TOTAL_H }}
                onPointerDown={(e) => startDrag(day, e)}
                onPointerMove={(e) => moveDrag(day, e)}
                onPointerUp={() => finishDrag(day)}
                onPointerCancel={() => setDraft(null)}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-border/50"
                    style={{ top: h * HOUR_H }}
                  />
                ))}

                {items
                  .filter((item) => item.day_of_week === day)
                  .map(renderBlock)}

                {exceptionsFor(columnDates[idx]).map(renderExceptionOverlay)}

                {draftPreview(day)}

                {idx === todayIdx && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-30"
                    style={{ top: `${(nowMin / MAX_MIN) * TOTAL_H}px` }}
                  >
                    <div className="h-px w-full bg-red-500" />
                    <div className="absolute -top-[3px] -left-[3px] h-1.5 w-1.5 rounded-full bg-red-500" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
              <span className="rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground">
                Chưa có khung giờ — kéo chuột để tạo
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
