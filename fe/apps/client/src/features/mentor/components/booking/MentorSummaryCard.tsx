import { Badge } from "@fe/components/ui/badge";
import { Card } from "@fe/components/ui/card";
import {
    Calendar as CalendarIcon,
    Clock,
    Quote,
    ShieldCheck,
    Star,
    Video,
} from "lucide-react";
import type { MentorListItem } from "../../types/mentor.type";

interface MentorSummaryCardProps {
    mentor: MentorListItem;
    summaryDate: string;
    selectedTimeLabel: string;
    durationMinutes: number;
}

export function MentorSummaryCard({
    mentor,
    summaryDate,
    selectedTimeLabel,
    durationMinutes,
}: MentorSummaryCardProps) {
    return (
        <Card className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
                <div className="relative size-20 shrink-0">
                    {mentor.avatarUrl ? (
                        <img
                            src={mentor.avatarUrl}
                            alt={mentor.name}
                            className="size-20 rounded-2xl object-cover border border-border"
                        />
                    ) : (
                        <div className="size-20 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                            {mentor.name[0]}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-m3-secondary flex items-center justify-center">
                        <span className="size-2 rounded-full bg-white animate-pulse" />
                    </div>
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground truncate">
                            {mentor.name}
                        </h3>
                        <ShieldCheck className="size-4 text-m3-secondary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">
                        {mentor.headline || "Cambridge Certified ESL Coach"}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <div className="flex items-center text-accent-foreground font-bold">
                            <Star className="size-3.5 fill-current text-accent-foreground" />
                            <span className="ml-1">
                                {Number(mentor.avgRating || 0).toFixed(1)}
                            </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                            {mentor.totalStudents} students
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                <Badge
                    variant="outline"
                    className="bg-muted text-foreground border-border font-semibold px-2.5 py-1 text-xs rounded-full"
                >
                    CEFR Coach
                </Badge>
                <Badge
                    variant="outline"
                    className="bg-muted text-foreground border-border font-semibold px-2.5 py-1 text-xs rounded-full"
                >
                    {mentor.totalStudents} students
                </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs leading-relaxed text-muted-foreground italic relative">
                <Quote className="size-4 text-primary/40 mb-1" />
                <p>
                    "
                    {mentor.bio ||
                        "In our 15 minutes, we won't do boring grammar drills. We'll speak naturally, identify what holds back your flow, and give you 3 instant quick-wins."}
                    "
                </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="size-4 text-primary" />
                        Date & Time
                    </span>
                    <span className="font-bold text-foreground text-right">
                        {summaryDate}
                        {selectedTimeLabel
                            ? ` • ${selectedTimeLabel}`
                            : " • Select a time"}
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-4 text-accent-foreground" />
                        Duration
                    </span>
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-m3-secondary/15 text-m3-secondary text-[11px] font-bold rounded-full">
                            {durationMinutes} min
                        </span>
                        {durationMinutes} Minutes
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-m3-secondary" />
                        Session Cost
                    </span>
                    <span className="font-extrabold text-m3-secondary text-sm">
                        FREE ($0.00)
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Video className="size-4 text-muted-foreground" />
                        Format
                    </span>
                    <span className="font-semibold text-foreground">
                        PiEMind Web Video
                    </span>
                </div>
            </div>
        </Card>
    );
}
