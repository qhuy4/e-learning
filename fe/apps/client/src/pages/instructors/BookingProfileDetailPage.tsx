import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";
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
    InstructorSummaryCard,
    QuickNotesCard,
} from "@/features/instructors/components/booking";
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

    const daysList = useMemo(() => getUpcomingDays(), []);
    const initialValidDay = daysList[0];

    const [selectedDate, setSelectedDate] = useState(initialValidDay.dateStr);
    const [selectedTime, setSelectedTime] = useState("");
    const [duration, setDuration] = useState<DurationMinutes>(DURATIONS[2]);
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

    const selectedTimeLabel = activeTime ? formatSlotLabel(activeTime) : "";
    const activeDay = daysList.find((d) => d.dateStr === selectedDate);
    const summaryDate = formatSummaryDate(activeDay, selectedDate);

    const booking = useMutation({
        mutationFn: async () => {
            const endTime = addMinutesToTime(activeTime, duration);

            const response = await api.post(`/bookings/checkout/${instructor!.id}`, {
                bookingDate: selectedDate,
                startTime: `${activeTime}:00`,
                endTime: `${endTime}:00`,
                notes:
                    [
                        notes,
                        "Múi giờ: ICT (GMT+7)",
                    ]
                        .filter(Boolean)
                        .join(" — ") || undefined,
            });
            return response.data?.data ?? response.data;
        },
        onSuccess: (checkout) => {
            sessionStorage.setItem(
                "piemind:lastBookingCheckout",
                JSON.stringify({
                    bookingId: checkout.bookingId,
                    instructorName: instructor?.name,
                    amount: checkout.amount,
                }),
            );
            window.location.assign(checkout.paymentUrl);
        },
    });

    if (!isAuthenticated) return <Navigate to="/student/login" replace />;
    if (isLoading) return <BookingLoading />;
    if (isError || !instructor) return <BookingNotFound />;

    return (
        <main className="min-h-screen w-full bg-muted/30 pb-20 pt-8 text-foreground">
            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6">
                <BookingBreadcrumbs instructorName={instructor.name} />
                <BookingHero instructorName={instructor.name} />

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        <DateSlotPicker
                            daysList={daysList}
                            activeDay={activeDay}
                            selectedDate={selectedDate}
                            onSelectDate={(date) => {
                                setSelectedDate(date);
                                setSelectedTime("");
                            }}
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

                        <QuickNotesCard
                            instructorName={instructor.name}
                            notes={notes}
                            onNotesChange={setNotes}
                        />

                        <BookingSubmitSection
                            isError={booking.isError}
                            isPending={booking.isPending}
                            disabled={!activeTime || booking.isPending || instructor.hourlyRate <= 0}
                            amount={Math.round((instructor.hourlyRate * duration) / 60)}
                            userEmail={user?.email}
                            onConfirm={() => booking.mutate()}
                        />
                    </div>

                    <aside className="sticky top-6 flex flex-col gap-4 lg:col-span-4">
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
