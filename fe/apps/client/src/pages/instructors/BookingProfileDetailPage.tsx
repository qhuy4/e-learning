import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/lib/axios";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
    BookingBreadcrumbs,
    BookingHero,
    BookingLoading,
    BookingNotFound,
    BookingSubmitSection,
    DateSlotPicker,
    DiagnosticShareCard,
    FocusSelectionCard,
    InstructorSummaryCard,
    QuickNotesCard,
} from "@/features/instructors/components/booking";
import { FOCUS_OPTIONS } from "@/features/instructors/config/focus";
import {
    formatSummaryDate,
    getUpcomingDays,
} from "@/features/instructors/utils/days";
import {
    useAvailabilityWindow,
    useDayWindows,
    useInstructorDetail,
} from "@/features/instructors/hooks/use-instructors";
import {
    addMinutesToTime,
    type DurationMinutes,
    DURATIONS,
    formatSlotLabel,
    generateStartTimes,
} from "@/features/instructors/config/slots";

export const BookingProfileDetailPage = () => {
    const { instructorId } = useParams<{ instructorId: string }>();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const daysList = useMemo(() => getUpcomingDays(), []);
    const initialValidDay = daysList[0];

    const [selectedDate, setSelectedDate] = useState(initialValidDay.dateStr);
    const [selectedTime, setSelectedTime] = useState("");
    const [duration, setDuration] = useState<DurationMinutes>(DURATIONS[2]);
    const [timezone, setTimezone] = useState("CET (GMT+1)");
    const [selectedFocus, setSelectedFocus] = useState<string[]>([
        FOCUS_OPTIONS[0].id,
    ]);
    const [shareReport, setShareReport] = useState(true);
    const [notes, setNotes] = useState("");
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 30_000);
        return () => window.clearInterval(id);
    }, []);

    const id = Number(instructorId);

    const { data: instructor, isLoading, isError } = useInstructorDetail(id);

    const dayDates = useMemo(() => daysList.map((d) => d.dateStr), [daysList]);
    const { data: dayWindows, isLoading: daysLoading } = useDayWindows(
        dayDates,
        instructor?.id,
    );

    const { data: availability, isLoading: slotsLoading } =
        useAvailabilityWindow(selectedDate, instructor?.id);

    const startTimes = useMemo(
        () =>
            generateStartTimes({
                windowStart: availability?.start ?? null,
                windowEnd: availability?.end ?? null,
                durationMinutes: duration,
                busy: availability?.busy ?? [],
                dateStr: selectedDate,
                now,
            }),
        [availability, duration, selectedDate, now],
    );

    const activeTime = useMemo(() => {
        if (selectedTime && startTimes.includes(selectedTime)) {
            return selectedTime;
        }
        return startTimes[0] ?? "";
    }, [selectedTime, startTimes]);

    const focusTitles = useMemo(
        () =>
            selectedFocus
                .map((fid) => FOCUS_OPTIONS.find((o) => o.id === fid)?.title)
                .filter(Boolean) as string[],
        [selectedFocus],
    );

    const selectedTimeLabel = activeTime ? formatSlotLabel(activeTime) : "";
    const activeDay = daysList.find((d) => d.dateStr === selectedDate);
    const summaryDate = formatSummaryDate(activeDay, selectedDate);

    const booking = useMutation({
        mutationFn: () => {
            const endTime = addMinutesToTime(activeTime, duration);

            return api.post("/admin/bookings", {
                studentId: user!.id,
                instructorId: instructor!.id,
                bookingDate: selectedDate,
                startTime: `${activeTime}:00`,
                endTime: `${endTime}:00`,
                notes:
                    [
                        focusTitles.join(", "),
                        notes,
                        shareReport ? "Đã chia sẻ báo cáo chẩn đoán" : "",
                        `Múi giờ: ${timezone}`,
                    ]
                        .filter(Boolean)
                        .join(" — ") || undefined,
            });
        },
        onSuccess: () => navigate("/instructors"),
    });

    if (!isAuthenticated) return <Navigate to="/student/login" replace />;
    if (isLoading) return <BookingLoading />;
    if (isError || !instructor) return <BookingNotFound />;

    return (
        <main className="w-full bg-background text-foreground min-h-screen pb-20 pt-8">
            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6">
                <BookingBreadcrumbs instructorName={instructor.name} />
                <BookingHero instructorName={instructor.name} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <DateSlotPicker
                            daysList={daysList}
                            activeDay={activeDay}
                            selectedDate={selectedDate}
                            onSelectDate={(date) => {
                                setSelectedDate(date);
                                setSelectedTime("");
                            }}
                            timezone={timezone}
                            onToggleTimezone={() =>
                                setTimezone(
                                    timezone === "CET (GMT+1)"
                                        ? "ICT (GMT+7)"
                                        : "CET (GMT+1)",
                                )
                            }
                            slotsLoading={slotsLoading}
                            window={availability}
                            dayWindows={dayWindows}
                            daysLoading={daysLoading}
                            duration={duration}
                            onDurationChange={(d) => {
                                setDuration(d);
                                setSelectedTime("");
                            }}
                            startTimes={startTimes}
                            activeTime={activeTime}
                            onSelectTime={setSelectedTime}
                        />

                        <FocusSelectionCard
                            instructorName={instructor.name}
                            selectedFocus={selectedFocus}
                            onFocusChange={setSelectedFocus}
                        />

                        <DiagnosticShareCard
                            instructorName={instructor.name}
                            studentName={user?.name || ""}
                            shareReport={shareReport}
                            onShareReportChange={setShareReport}
                        />

                        <QuickNotesCard
                            instructorName={instructor.name}
                            notes={notes}
                            onNotesChange={setNotes}
                        />

                        <BookingSubmitSection
                            isError={booking.isError}
                            isPending={booking.isPending}
                            disabled={!activeTime || booking.isPending}
                            userEmail={user?.email}
                            onConfirm={() => booking.mutate()}
                        />
                    </div>

                    <aside className="lg:col-span-4 flex flex-col gap-4 sticky top-6">
                        <InstructorSummaryCard
                            instructor={instructor}
                            summaryDate={summaryDate}
                            selectedTimeLabel={selectedTimeLabel}
                            durationMinutes={duration}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
};
