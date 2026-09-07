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
  effective_until?: string;
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
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface UpdateExceptionRequest {
  specific_date?: string;
  is_unavailable?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}
