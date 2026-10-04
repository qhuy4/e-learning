import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Video,
} from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import {
    getBookingStatusBadge,
    isBookingEnded,
    type Booking,
} from "@/features/bookings/types/booking";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_START = 7;
const HOUR_END = 22;

const STATUS_ACCENT: Record<number, string> = {
    0: "border-l-red-500",
    1: "border-l-amber-500",
    2: "border-l-emerald-500",
};

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function dateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function hourOf(time: string): number {
    return Number(time.slice(0, 2));
}

function atTime(booking: Booking, time: string): Date {
    return new Date(`${booking.bookingDate.slice(0, 10)}T${time}`);
}

type BookingPhase = "past" | "live" | "upcoming";

function phaseOf(booking: Booking, now: Date): BookingPhase {
    const start = atTime(booking, booking.startTime);
    const end = atTime(booking, booking.endTime);
    if (now < start) return "upcoming";
    if (now >= end) return "past";
    return "live";
}

function canJoinBooking(booking: Booking): boolean {
    return (
        booking.status === 2 &&
        booking.meetingRoomId != null &&
        !isBookingEnded(booking)
    );
}

export default function SchedulePage() {
    const navigate = useNavigate();
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

    const { data, isLoading } = useBookings({ page: 1, limit: 100 });

    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart],
    );

    const bookings = useMemo(() => data?.data ?? [], [data]);

    const weekBookings = useMemo(() => {
        const keys = new Set(weekDays.map(dateKey));
        return bookings.filter(
            (b) => b.status !== 0 && keys.has(b.bookingDate.slice(0, 10)),
        );
    }, [bookings, weekDays]);

    const dayHasBooking = useMemo(
        () =>
            weekDays.map((day) =>
                weekBookings.some(
                    (b) => b.bookingDate.slice(0, 10) === dateKey(day),
                ),
            ),
        [weekBookings, weekDays],
    );

    const gridTemplateColumns = useMemo(() => {
        const cols = dayHasBooking.map((has) =>
            has ? "minmax(120px,1fr)" : "minmax(56px,0.4fr)",
        );
        return `64px ${cols.join(" ")}`;
    }, [dayHasBooking]);

    const busyHours = useMemo(() => {
        const set = new Set<number>();
        weekBookings.forEach((b) => set.add(hourOf(b.startTime)));
        return set;
    }, [weekBookings]);

    const hours = useMemo(() => {
        const set = new Set<number>();
        for (let h = HOUR_START; h <= HOUR_END; h += 1) set.add(h);
        weekBookings.forEach((b) => {
            const h = hourOf(b.startTime);
            if (h >= HOUR_START && h <= HOUR_END) set.add(h);
        });
        return [...set].sort((a, b) => a - b);
    }, [weekBookings]);

    const now = new Date();
    const todayKey = dateKey(now);
    const todayBookings = bookings
        .filter(
            (b) =>
                b.bookingDate.slice(0, 10) === todayKey && b.status !== 0,
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const liveToday = todayBookings.find((b) => phaseOf(b, now) === "live");
    const nextToday = todayBookings.find((b) => phaseOf(b, now) === "upcoming");

    const monthLabel = useMemo(() => {
        const mid = addDays(weekStart, 3);
        return mid.toLocaleDateString("en-US", { month: "short" });
    }, [weekStart]);

    const byDayHour = useMemo(() => {
        const map = new Map<string, Booking[]>();
        weekBookings.forEach((b) => {
            const key = `${b.bookingDate.slice(0, 10)}|${hourOf(b.startTime)}`;
            const list = map.get(key);
            if (list) list.push(b);
            else map.set(key, [b]);
        });
        map.forEach((list) =>
            list.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        );
        return map;
    }, [weekBookings]);

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    let todaySummary: string;
    if (liveToday) {
        todaySummary = `đang diễn ra · ${liveToday.startTime.slice(0, 5)}–${liveToday.endTime.slice(0, 5)} với ${liveToday.studentName}`;
    } else if (nextToday) {
        todaySummary = `tiếp theo ${nextToday.startTime.slice(0, 5)} với ${nextToday.studentName}`;
    } else if (todayBookings.length > 0) {
        todaySummary = `đã hoàn thành ${todayBookings.length} buổi`;
    } else {
        todaySummary = "không có buổi học nào";
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lịch tuần</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tổng quan bạn dạy gì trong tuần
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWeekStart(startOfWeek(new Date()))}
                    >
                        Today
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setWeekStart(addDays(weekStart, -7))}
                            title="Tuần trước"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="min-w-20 text-center text-sm font-semibold">
                            {monthLabel}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setWeekStart(addDays(weekStart, 7))}
                            title="Tuần sau"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Hôm nay</span>
                    <span className="text-muted-foreground">
                        —{" "}
                        {todayBookings.length > 0
                            ? `${todayBookings.length} buổi · ${todaySummary}`
                            : todaySummary}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card">
                <div
                    className="grid min-w-[560px]"
                    style={{ gridTemplateColumns }}
                >
                    <div className="border-b bg-muted/40 p-2" />
                    {weekDays.map((day, index) => {
                        const isToday = dateKey(day) === todayKey;
                        const hasBooking = dayHasBooking[index];
                        return (
                            <div
                                key={dateKey(day)}
                                className={`border-b border-l p-2 text-center ${
                                    isToday
                                        ? "bg-primary/10"
                                        : hasBooking
                                          ? "bg-muted/40"
                                          : "bg-muted/20"
                                }`}
                            >
                                <p
                                    className={`text-xs font-semibold uppercase ${
                                        isToday
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {DAY_LABELS[index]}
                                </p>
                                <p
                                    className={`font-bold ${
                                        hasBooking
                                            ? "text-lg"
                                            : "text-sm text-muted-foreground"
                                    } ${isToday ? "text-primary" : ""}`}
                                >
                                    {day.getDate()}
                                </p>
                                {!hasBooking && (
                                    <p className="text-[10px] font-medium uppercase text-muted-foreground/70">
                                        Nghỉ
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    {hours.map((hour) => (
                        <HourRow
                            key={hour}
                            hour={hour}
                            weekDays={weekDays}
                            todayKey={todayKey}
                            isBusy={busyHours.has(hour)}
                            dayHasBooking={dayHasBooking}
                            now={now}
                            getBookings={(day) =>
                                byDayHour.get(
                                    `${dateKey(day)}|${hour}`,
                                ) ?? []
                            }
                            onOpenDetail={(id) => navigate(`/bookings/${id}`)}
                            onJoin={(roomId) =>
                                navigate(`/meeting/${roomId}`)
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function HourRow({
    hour,
    weekDays,
    todayKey,
    isBusy,
    dayHasBooking,
    now,
    getBookings,
    onOpenDetail,
    onJoin,
}: {
    hour: number;
    weekDays: Date[];
    todayKey: string;
    isBusy: boolean;
    dayHasBooking: boolean[];
    now: Date;
    getBookings: (day: Date) => Booking[];
    onOpenDetail: (id: number) => void;
    onJoin: (roomId: number) => void;
}) {
    return (
        <>
            <div
                className={`border-t px-2 text-right align-top font-medium text-muted-foreground ${
                    isBusy ? "py-3 text-xs" : "py-1 text-[10px]"
                }`}
            >
                {String(hour).padStart(2, "0")}:00
            </div>
            {weekDays.map((day, index) => {
                const isToday = dateKey(day) === todayKey;
                const list = getBookings(day);
                const dayOff = !dayHasBooking[index];
                return (
                    <div
                        key={`${dateKey(day)}-${hour}`}
                        className={`border-l border-t ${
                            isBusy ? "min-h-20 p-1.5" : "min-h-7"
                        } ${isToday ? "bg-primary/5" : ""} ${
                            dayOff ? "bg-muted/10" : ""
                        }`}
                    >
                        {isBusy && (
                            <div className="space-y-1.5">
                                {list.map((booking) => {
                                    const badge =
                                        getBookingStatusBadge(booking);
                                    const joinable = canJoinBooking(booking);
                                    const cancelled = booking.status === 0;
                                    const phase = phaseOf(booking, now);
                                    const live = phase === "live";
                                    const past = phase === "past";
                                    const next =
                                        !live &&
                                        !past &&
                                        dateKey(day) === todayKey;
                                    return (
                                        <div
                                            key={booking.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() =>
                                                onOpenDetail(booking.id)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    onOpenDetail(booking.id);
                                            }}
                                            className={`cursor-pointer space-y-1 rounded-lg border border-l-4 p-2 shadow-sm transition hover:shadow-md ${
                                                live
                                                    ? "border-l-[#F38181] border-l-[#F38181] bg-[#F38181]/10 ring-2 ring-[#F38181]/60"
                                                    : `border-border bg-card ${STATUS_ACCENT[booking.status] ?? "border-l-primary"}`
                                            } ${next ? "ring-2 ring-primary/50" : ""} ${
                                                cancelled || past
                                                    ? "opacity-55"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-xs font-bold leading-tight">
                                                    {booking.startTime.slice(
                                                        0,
                                                        5,
                                                    )}
                                                    –
                                                    {booking.endTime.slice(
                                                        0,
                                                        5,
                                                    )}
                                                </p>
                                                {live && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#F38181]">
                                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F38181]" />
                                                        Live
                                                    </span>
                                                )}
                                            </div>
                                            <p className="truncate text-xs font-medium">
                                                {booking.studentName}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={`${badge.className} border-0 px-1.5 py-0 text-[10px]`}
                                            >
                                                {badge.label}
                                            </Badge>
                                            {joinable && (
                                                <Button
                                                    size="sm"
                                                    className="h-6 w-full rounded-full bg-[#F38181] px-2 text-[11px] font-bold text-white hover:bg-[#9e3f42]"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onJoin(
                                                            booking.meetingRoomId!,
                                                        );
                                                    }}
                                                >
                                                    <Video className="mr-1 h-3 w-3" />
                                                    Vào lớp
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}
