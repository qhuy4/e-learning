export interface RecurringAvailability {
  id: number;
  instructor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExceptionAvailability {
  id: number;
  instructor_id: number;
  specific_date: string;
  is_unavailable: boolean;
  /** true = cộng thêm giờ (extra availability), false = chặn giờ */
  is_extra?: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  effective_from: string;
  effective_until?: string | null;
  is_active?: boolean;
}

export interface UpdateRecurringRequest {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  effective_from?: string;
  effective_until?: string | null;
  is_active?: boolean;
}

export interface CreateExceptionRequest {
  specific_date: string;
  is_unavailable: boolean;
  is_extra?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string;
}

export interface UpdateExceptionRequest {
  specific_date?: string;
  is_unavailable?: boolean;
  is_extra?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}

/** kind của exception suy ra từ is_extra / is_unavailable */
export type ExceptionKind = "off" | "range" | "extra";

export function exceptionKind(item: {
  is_unavailable: boolean;
  is_extra?: boolean;
  start_time?: string | null;
  end_time?: string | null;
}): ExceptionKind {
  if (item.is_extra) return "extra";
  if (item.is_unavailable) return "off";
  return "range";
}
