import { toDateString } from "../config/slots";

export interface DayOption {
    dateStr: string;
    dayName: string;
    dayNum: string;
    monthYear: string;
    isPast?: boolean;
}

export function getUpcomingDays(): DayOption[] {
    const days: DayOption[] = [];
    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i <= 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        const dateStr = toDateString(d);

        days.push({
            dateStr,
            dayName: dayNames[d.getDay()],
            dayNum: String(d.getDate()).padStart(2, "0"),
            monthYear: d.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            }),
            isPast: false,
        });
    }
    return days;
}

export function formatSummaryDate(day: DayOption | undefined, fallback: string) {
    if (!day) return fallback;
    return `${day.dayName}, ${day.monthYear.split(" ")[0]} ${day.dayNum}`;
}
