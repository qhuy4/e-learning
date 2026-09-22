import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Loader2,
    MessageSquare,
    Video,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";

import { api } from "@fe/lib/axios";
import { useAuth } from "@/features/auth/hooks/use-auth";

type Mentor = {
    userId: number;
    name: string;
    avatarUrl: string | null;
    headline: string | null;
    bio?: string;
    rating?: number;
    reviewCount?: number;
};

const topics = [
    { id: "speaking", label: "Speaking confidence", icon: MessageSquare },
    {
        id: "pronunciation",
        label: "Pronunciation & accent",
        icon: MessageSquare,
    },
    { id: "workplace", label: "Workplace English", icon: MessageSquare },
    { id: "exam", label: "Exam preparation", icon: MessageSquare },
];

export const BookingProfileDetailPage = () => {
    const { mentorId } = useParams<{ mentorId: string }>();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [focus, setFocus] = useState<string[]>([]);
    const [shareReport, setShareReport] = useState(true);
    const id = Number(mentorId);

    const {
        data: mentor,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["mentor", id],
        queryFn: async () =>
            (await api.get(`/admin/instructors/${id}`)).data.data as Mentor,
        enabled: id > 0,
    });

    const booking = useMutation({
        mutationFn: () =>
            api.post("/admin/bookings", {
                studentId: user!.id,
                instructorId: mentor!.userId,
                bookingDate: date,
                startTime: time,
                endTime: `${String(Number(time.slice(0, 2)) + 1).padStart(2, "0")}:00`,
                notes:
                    [
                        focus.join(", "),
                        notes,
                        shareReport ? "Diagnostic report shared" : "",
                    ]
                        .filter(Boolean)
                        .join(" — ") || undefined,
            }),
        onSuccess: () => navigate("/mentors"),
    });

    if (!isAuthenticated) return <Navigate to="/student/login" replace />;

    if (isLoading)
        return (
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-96 rounded-2xl bg-muted animate-pulse" />
            </main>
        );

    if (isError || !mentor)
        return (
            <main className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-extrabold">Mentor not found</h1>
                <Link to="/mentors" className="mt-4 inline-block text-primary">
                    Back to mentors
                </Link>
            </main>
        );
    const toggle = (topic: string) =>
        setFocus((current) =>
            current.includes(topic)
                ? current.filter((item) => item !== topic)
                : [...current, topic],
        );
    return (
        <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
            <div className="flex justify-between gap-4 text-sm text-muted-foreground">
                <span>
                    <Link to="/mentors" className="hover:text-primary">
                        Mentors
                    </Link>{" "}
                    / {mentor.name} / Book session
                </span>
                <Link
                    to="/mentors"
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 font-medium text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to mentor profile
                </Link>
            </div>
            <header className="mt-7">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-secondary">
                        100% free · no card required
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1">
                        <Clock className="mr-1 inline size-4" />
                        15 minutes
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1">
                        <Video className="mr-1 inline size-4" />
                        Live 1-on-1 video
                    </span>
                </div>
                <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
                    Book a free discovery session
                </h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                    Meet 1-on-1 with {mentor.name} to discuss your learning
                    goals and create your next speaking plan.
                </p>
            </header>
            <div className="mt-8 grid gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-xl font-bold">
                            1. Select date and time
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Choose a slot that works for you.
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-medium">
                                Date
                                <Input
                                    className="mt-2"
                                    type="date"
                                    min={new Date().toISOString().slice(0, 10)}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-medium">
                                Start time
                                <Input
                                    className="mt-2"
                                    type="time"
                                    step="3600"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </label>
                        </div>
                    </section>
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-xl font-bold">
                            2. What would you like to focus on?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Select topics for {mentor.name} to tailor your
                            session.
                        </p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {topics.map((topic) => (
                                <label
                                    key={topic.id}
                                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                                        focus.includes(topic.id)
                                            ? "border-primary bg-primary-container"
                                            : "border-border"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={focus.includes(topic.id)}
                                        onChange={() => toggle(topic.id)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm font-semibold">
                                        {topic.id}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>
                    <section className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="text-xl font-bold">
                            3. Prepare your session
                        </h2>
                        <label className="mt-5 flex cursor-pointer gap-3 rounded-xl bg-secondary-container p-4 text-sm font-semibold">
                            <input
                                type="checkbox"
                                checked={shareReport}
                                onChange={(e) =>
                                    setShareReport(e.target.checked)
                                }
                                className="accent-secondary"
                            />
                            Share my AI diagnostic report with {mentor.name}
                        </label>
                        <label className="mt-4 block text-sm font-medium">
                            Quick notes (optional)
                            <textarea
                                className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tell your mentor what you would like help with..."
                            />
                        </label>
                    </section>
                </div>
                <aside className="lg:col-span-4">
                    <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                        <div className="flex gap-4">
                            {mentor.avatarUrl ? (
                                <img
                                    src={mentor.avatarUrl}
                                    alt={mentor.name}
                                    className="size-20 rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="flex size-20 items-center justify-center rounded-2xl bg-primary-container text-2xl font-bold text-primary">
                                    {mentor.name[0]}
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Your mentor
                                </p>
                                <h2 className="text-lg font-bold">
                                    {mentor.name}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {mentor.headline ||
                                        "PiEMind language mentor"}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3 rounded-xl bg-muted p-4 text-sm">
                            <b>Session details</b>
                            <p>
                                <Calendar className="mr-2 inline size-4 text-primary" />
                                {date || "Choose a date"}
                            </p>
                            <p>
                                <Clock className="mr-2 inline size-4 text-primary" />
                                {time || "Choose a time"} · 15 minutes
                            </p>
                            <p>
                                <Video className="mr-2 inline size-4 text-primary" />
                                PiEMind video room
                            </p>
                        </div>
                        {booking.isError && (
                            <p className="mt-4 text-sm text-destructive">
                                We couldn't book that time. Try another slot.
                            </p>
                        )}
                        <Button
                            disabled={!date || !time || booking.isPending}
                            onClick={() => booking.mutate()}
                            className="mt-6 w-full cursor-pointer bg-primary hover:bg-primary/90 disabled:cursor-not-allowed"
                        >
                            {booking.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Check className="size-4" />
                            )}
                            {booking.isPending
                                ? "Booking..."
                                : "Confirm free session"}
                        </Button>
                    </div>
                </aside>
            </div>
        </main>
    );
};
