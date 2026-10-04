import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
    AlarmClock,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Globe,
    Timer,
} from "lucide-react";
import {
    DURATION_OPTIONS,
    type DurationMinutes,
    formatSlotLabel,
    formatTimeLabel,
} from "../../config/slots";
import type { AvailabilityWindow } from "../../types/mentor.type";
import type { DayOption } from "../../utils/days";
import { StepHeader } from "./StepHeader";

interface DateSlotPickerProps {
    daysList: DayOption[];
    activeDay?: DayOption;
    selectedDate: string;
    onSelectDate: (dateStr: string) => void;
    timezone: string;
    onToggleTimezone: () => void;
    slotsLoading: boolean;
    window?: AvailabilityWindow;
    dayWindows?: Record<string, AvailabilityWindow>;
    daysLoading?: boolean;
    duration: DurationMinutes;
    onDurationChange: (d: DurationMinutes) => void;
    startTimes: string[];
    activeTime: string;
    onSelectTime: (slot: string) => void;
}
function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "";

    const totalMinutes = h * 60 + m + minutesToAdd;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}
export function DateSlotPicker({
    daysList,
    activeDay,
    selectedDate,
    onSelectDate,
    timezone,
    onToggleTimezone,
    slotsLoading,
    window: win,
    dayWindows,
    daysLoading,
    duration,
    onDurationChange,
    startTimes,
    activeTime,
    onSelectTime,
}: DateSlotPickerProps) {
    const hasWindow = Boolean(win?.available && win.start && win.end);

    return (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <StepHeader
                step={1}
                title="Select Date & Timezone"
                description="Pick duration and a start time inside the teacher's window"
                action={
                    <button
                        type="button"
                        onClick={onToggleTimezone}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border cursor-pointer transition-colors"
                    >
                        <Globe className="size-3.5 text-primary" />
                        <span>{timezone}</span>
                        <span className="text-[10px] text-muted-foreground">
                            (click to toggle)
                        </span>
                    </button>
                }
            />

            <div className="px-0 pt-6 space-y-6">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm sm:text-base">
                                {activeDay?.monthYear || "Upcoming Days"}
                            </span>
                            <Badge
                                variant="outline"
                                className="bg-card text-muted-foreground text-[11px] font-medium border-border"
                            >
                                {slotsLoading
                                    ? "Checking availability..."
                                    : hasWindow
                                      ? `${startTimes.length} start times`
                                      : "Unavailable"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Button
                                size="icon-xs"
                                variant="ghost"
                                className="rounded-full cursor-pointer"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                size="icon-xs"
                                variant="ghost"
                                className="rounded-full cursor-pointer"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
                        {daysList.map((day) => {
                            const isSelected = selectedDate === day.dateStr;
                            const dayWin = dayWindows?.[day.dateStr];
                            const dayOpen =
                                dayWin != null &&
                                dayWin.available &&
                                Boolean(dayWin.start) &&
                                Boolean(dayWin.end);
                            const isOff =
                                !day.isPast &&
                                !daysLoading &&
                                dayWin != null &&
                                !dayOpen;

                            return (
                                <button
                                    key={day.dateStr}
                                    type="button"
                                    disabled={day.isPast || isOff}
                                    onClick={() => onSelectDate(day.dateStr)}
                                    className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                                        day.isPast || isOff
                                            ? "opacity-30 cursor-not-allowed bg-m3-primary"
                                            : isSelected
                                              ? "bg-m3-primary-container text-white font-bold cursor-pointer  ring-offset-background"
                                              : "bg-card border hover:bg-muted text-primary border-m3-primary-container   cursor-pointer"
                                    }`}
                                >
                                    <span
                                        className={`text-sm font-bold ${
                                            isSelected || isOff
                                                ? "text-white font-bold"
                                                : "text-m3-primary-container font-bold "
                                        }`}
                                    >
                                        {day.dayName}
                                    </span>
                                    <span
                                        className={`text-base font-bold mt-0.5 ${
                                            isSelected || isOff
                                                ? "text-white font-bold"
                                                : "text-m3-primary-container font-bold "
                                        }`}
                                    >
                                        {day.dayNum}
                                    </span>
                                    <span
                                        className={`text-[10px] mt-1 font-medium text-white ${
                                            isSelected
                                                ? ""
                                                : day.isPast || !dayOpen
                                                  ? "text-white"
                                                  : "text-primary font-bold flex items-center justify-center"
                                        }`}
                                    >
                                        {day.isPast ? (
                                            "Past"
                                        ) : daysLoading || dayWin == null ? (
                                            <span className="text-muted-foreground">
                                                ···
                                            </span>
                                        ) : !dayOpen ? (
                                            "Off"
                                        ) : isSelected ? (
                                            ""
                                        ) : (
                                            <span className="relative flex size-3 items-center justify-center">
                                                <span className="absolute size-4 rounded-full bg-m3-secondary/30" />
                                                <span className="size-1.5 rounded-full bg-m3-secondary animate-pulse [animation-duration:2s]" />
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {slotsLoading && (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-10 w-64 rounded-full" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                )}

                {!slotsLoading && !hasWindow && (
                    <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
                        <p className="text-sm font-semibold text-foreground">
                            Teacher not available on this date
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Try another day from the calendar above.
                        </p>
                    </div>
                )}

                {!slotsLoading && hasWindow && win?.start && win?.end && (
                    <div className="space-y-5 ">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-m3-secondary/20 border border-secondary rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-m3-secondary" />
                                <span className="font-bold text-foreground">
                                    Coach Daily Window:
                                </span>
                                <span className="font-bold text-sm text-m3-secondary px-2 py-0.5 bg-card rounded-full border border-secondary/20">
                                    {formatTimeLabel(win.start)} –{" "}
                                    {formatTimeLabel(win.end)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                <span className="size-2 rounded-full bg-m3-secondary animate-pulse" />
                                <span className="text-black font-semibold">
                                    Active schedule · {startTimes.length} open
                                    starts
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-10 border p-2 rounded-xl ">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                    <Timer className="size-5 text-primary" />
                                    Session Duration
                                </span>
                                <span className="text-[14px] text-muted-foreground">
                                    Select meeting length
                                </span>
                            </div>
                            <div
                                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                                role="group"
                                aria-label="Duration"
                            >
                                {DURATION_OPTIONS.map((opt) => {
                                    const selected = duration === opt.minutes;
                                    return (
                                        <button
                                            key={opt.minutes}
                                            type="button"
                                            onClick={() =>
                                                onDurationChange(
                                                    opt.minutes as DurationMinutes,
                                                )
                                            }
                                            className={`py-2 px-3 rounded-full border text-sm text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                                                selected
                                                    ? "border-primary bg-primary text-primary-foreground font-bold shadow-sm"
                                                    : "border-border bg-card hover:bg-muted text-foreground"
                                            }`}
                                        >
                                            <span className="font-bold">
                                                {selected && (
                                                    <Check className="size-3 inline mr-1" />
                                                )}
                                                {opt.minutes} min
                                            </span>
                                            <span
                                                className={`text-[12px] font-semibold ${
                                                    selected
                                                        ? "text-primary-foreground/90"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {opt.hint}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
                                    <AlarmClock className="size-4 text-primary" />
                                    Select Start Time{" "}
                                    <span className="text-muted-foreground font-normal">
                                        ({duration}-min window)
                                    </span>
                                </span>
                                <span className="text-[14px] text-primary font-semibold">
                                    {activeDay?.dayName}, {activeDay?.monthYear}{" "}
                                    Slots
                                </span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
                                {startTimes.map((slot) => {
                                    const isSelected = activeTime === slot;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => onSelectTime(slot)}
                                            className={`py-2 px-4 rounded-full border text-center transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-primary flex flex-col items-center justify-center relative"
                                                    : "bg-card border-border hover:border-primary hover:bg-muted font-bold"
                                            }`}
                                        >
                                            {isSelected ? (
                                                <>
                                                    <span className="text-sm flex items-center gap-1">
                                                        <Check className="size-4" />
                                                        {formatSlotLabel(slot)}
                                                    </span>
                                                </>
                                            ) : (
                                                slot
                                            )}
                                        </button>
                                    );
                                })}
                                {startTimes.length === 0 && (
                                    <p className="col-span-full text-sm text-muted-foreground py-3 text-center">
                                        No free starts for this duration.
                                    </p>
                                )}
                            </div>

                            {activeTime && (
                                <div className="font-display-lg text-[16px] font-extrabold text-on-surface flex items-center gap-1.5 mt-2">
                                    <span>{formatSlotLabel(activeTime)}</span>
                                    <span className="text-outline font-normal">
                                        ─────────
                                    </span>
                                    <span>
                                        {formatSlotLabel(
                                            addMinutesToTime(
                                                activeTime,
                                                duration,
                                            ),
                                        )}
                                    </span>
                                    <span className="text-xs font-bold text-[#F38181] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                        ({duration} mins)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
