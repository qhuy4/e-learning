import type {UserStatus, UserRole} from "@/features/users/constants/users.constants.ts";

export type ApprovalStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface InstructorProfile {
    id: number;
    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    socialLinks: Record<string, any> | null;
    revenueSharePct: number | string;
    totalEarned: number | string;
    pendingPayout: number | string;
    approvalStatus: ApprovalStatus;
    approvedAt: string | null;
    totalStudents: number | string;
    avgRating: number | string;
}

export interface Instructor {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
    role: UserRole;
    profile: InstructorProfile | null;
    createdAt: string;
    updatedAt: string;
}
