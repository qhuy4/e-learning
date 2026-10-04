const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function getVNDateTimeParts(date: Date = new Date()): {
  dateStr: string;
  timeStr: string;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    // một số ICU trả "24" cho giờ 0h khi hour12:false, chuẩn hóa lại
    timeStr: `${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}:${parts.second}`,
  };
}
export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function formatNextAvailableDisplay(
  todayStr: string,
  dateStr: string,
  timeStr: string | null,
): string | null {
  if (!timeStr) return null;
  const timeFormatted = timeStr.substring(0, 5); // "19:00:00" -> "19:00"

  const targetD = parseDateOnly(dateStr);
  const todayD = parseDateOnly(todayStr);
  const diffDays = Math.round(
    (targetD.getTime() - todayD.getTime()) / (1000 * 3600 * 24),
  );

  if (diffDays === 0) return `Today, ${timeFormatted}`;
  if (diffDays === 1) return `Tomorrow, ${timeFormatted}`;
  return `${dateStr} ${timeFormatted}`;
}