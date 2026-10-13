export const DURATION_OPTIONS = [
    { minutes: 15, label: "Trải nghiệm miễn phí", hint: "Trải nghiệm miễn phí" },
    { minutes: 30, label: "Luyện tập", hint: "Luyện tập" },
    { minutes: 60, label: "Tiêu chuẩn", hint: "Tiêu chuẩn" },
    { minutes: 90, label: "Chuyên sâu", hint: "Chuyên sâu" },
] as const;

export const DURATIONS = [15, 30, 60, 90] as const;
export type DurationMinutes = (typeof DURATIONS)[number];

/** Step between candidate start times (matches the design: 08:00, 08:30, …). */
export const START_STEP_MINUTES = 30;

export function formatSlotLabel(value: string): string {
    const [hStr, mStr] = value.split(":");
    const h = Number(hStr);
    const m = Number(mStr);

    // Safe fallback for invalid input
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        return value;
    }

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTimeLabel(value: string): string {
    return formatSlotLabel(value.slice(0, 5));
}

export function addMinutesToTime(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return `${hh}:${mm}`;
}

export function toDateString(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

/** True when start is already past on the selected date (today only). */
export function isSlotPast(
    dateStr: string,
    slot: string,
    now: Date = new Date(),
): boolean {
    if (dateStr !== toDateString(now)) return false;
    const [sh, sm] = slot.split(":").map(Number);
    return sh * 60 + sm <= now.getHours() * 60 + now.getMinutes();
}

function toMin(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function overlaps(
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number,
): boolean {
    return aStart < bEnd && aEnd > bStart;
}

/**
 * Candidate starts inside [windowStart, windowEnd], every 30 min,
 * where start+duration still fits. Busy (bookings/exceptions) filtered out.
 */
export function generateStartTimes(opts: {
    windowStart: string | null;
    windowEnd: string | null;
    durationMinutes: number;
    busy?: { start: string; end: string }[];
    dateStr: string;
    now?: Date;
}): string[] {
    const {
        windowStart,
        windowEnd,
        durationMinutes,
        busy = [],
        dateStr,
    } = opts;
    const now = opts.now ?? new Date();
    if (!windowStart || !windowEnd) return [];

    const start = toMin(windowStart);
    const end = toMin(windowEnd);
    const out: string[] = [];

    for (let t = start; t + durationMinutes <= end; t += START_STEP_MINUTES) {
        const hh = String(Math.floor(t / 60)).padStart(2, "0");
        const mm = String(t % 60).padStart(2, "0");
        const slot = `${hh}:${mm}`;
        if (isSlotPast(dateStr, slot, now)) continue;

        const slotEnd = t + durationMinutes;
        const hitBusy = busy.some((b) =>
            overlaps(t, slotEnd, toMin(b.start), toMin(b.end)),
        );
        if (hitBusy) continue;

        out.push(slot);
    }

    return out;
}
