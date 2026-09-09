export class InstructorListItem {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
  profile: {
    id: number;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    socialLinks: Record<string, any> | null;
    revenueSharePct: number;
    totalEarned: number;
    pendingPayout: number;
    approvalStatus: string;
    approvedAt: Date | null;
    totalStudents: number;
    avgRating: number;
  } | null;
}

export interface GetInstructorsResponse {
  data: InstructorListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
