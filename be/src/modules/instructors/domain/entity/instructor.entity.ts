import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';

export class Instructor {
  private constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly status: UserStatus,
    public readonly role: UserRole,
    public readonly blockReason: string | null,
    public readonly blockedAt: Date | null,
    public readonly headline: string | null,
    public readonly bio: string | null,
    public readonly websiteUrl: string | null,
    public readonly socialLinks: Record<string, any> | null,
    public readonly revenueSharePct: number,
    public readonly totalEarned: number,
    public readonly pendingPayout: number,
    public readonly approvalStatus: ApprovalStatus,
    public readonly approvedAt: Date | null,
    public readonly totalStudents: number,
    public readonly avgRating: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static restore(params: {
    id: number;
    userId: number;

    name: string;
    email: string;
    password: string;

    status: UserStatus;
    role: UserRole;

    blockReason: string | null;
    blockedAt: Date | null;

    headline: string | null;
    bio: string | null;
    websiteUrl: string | null;
    socialLinks: Record<string, any> | null;

    revenueSharePct: number;
    totalEarned: number;
    pendingPayout: number;

    approvalStatus: ApprovalStatus;
    approvedAt: Date | null;

    totalStudents: number;
    avgRating: number;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Instructor {
    return new Instructor(
      params.id,
      params.userId,

      params.name,
      params.email,
      params.password,

      params.status,
      params.role,

      params.blockReason,
      params.blockedAt,

      params.headline,
      params.bio,
      params.websiteUrl,
      params.socialLinks,

      params.revenueSharePct,
      params.totalEarned,
      params.pendingPayout,

      params.approvalStatus,
      params.approvedAt,

      params.totalStudents,
      params.avgRating,

      params.createdAt,
      params.updatedAt,
      params.deletedAt,
    );
  }
}
