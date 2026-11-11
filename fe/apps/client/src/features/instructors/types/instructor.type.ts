export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AvailableTeacher {
  id: number;
  name: string;
}

export interface AvailableTeachersResponse {
  data: AvailableTeacher[];
  meta: PaginationMeta;
}

export interface InstructorProfile {
  headline: string | null;
  bio: string | null;
  avgRating: number;
  totalStudents: number;
  hourlyRate?: number;
  certificateTags?: string[];
}

/** Raw shape from GET /admin/instructors and GET /admin/instructors/:id */
export interface ApiInstructor {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  avgRating?: number;
  profile?: InstructorProfile | null;
}

export interface InstructorListItem {
  /** users.id — same value used as instructorId in bookings/availability */
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  avgRating: number;
  totalStudents: number;
  hourlyRate: number;
  certificateTags: string[];
}

export interface GetInstructorsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  tag?: string;
}

export interface GetAvailableInstructorsParams {
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export interface SlotCheckResult {
  /** "HH:MM" → true if instructor is free for a slot starting then */
  [slot: string]: boolean;
}

export interface BusyBlock {
  start: string;
  end: string;
}

export interface AvailabilityWindow {
  available: boolean;
  start: string | null;
  end: string | null;
  busy: BusyBlock[];
}
