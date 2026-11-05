export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CefrBand = (typeof CEFR_LEVELS)[number];

export function isCefrBand(value: unknown): value is CefrBand {
  return (
    typeof value === 'string' && (CEFR_LEVELS as readonly string[]).includes(value)
  );
}

/** Index trong thang CEFR (A1=0 ... C2=5); -1 nếu không hợp lệ. */
export function cefrIndex(band: string | null | undefined): number {
  return isCefrBand(band) ? CEFR_LEVELS.indexOf(band) : -1;
}

/**
 * Khoảng cách level giữa level sinh viên và danh sách level giảng viên dạy.
 * - null  = chưa khai báo (không loại, không chấm điểm)
 * - 0     = exact
 * - 1     = adjacent (±1 band)
 * - >1    = lệch xa
 */
export function levelDistance(
  declared: string[] | null | undefined,
  studentLevel: string | null | undefined,
): number | null {
  const studentIdx = cefrIndex(studentLevel);
  if (studentIdx < 0 || !Array.isArray(declared) || declared.length === 0) {
    return null;
  }
  const distances = declared
    .map(cefrIndex)
    .filter((idx) => idx >= 0)
    .map((idx) => Math.abs(idx - studentIdx));
  return distances.length > 0 ? Math.min(...distances) : null;
}

/** teaching_levels lưu dạng JSON text của Postgres — parse an toàn. */
export function parseTeachingLevels(raw: unknown): string[] | null {
  if (raw == null) return null;
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(value)) return null;
  const levels = value.filter((v): v is string => typeof v === 'string');
  return levels.length > 0 ? levels : null;
}
