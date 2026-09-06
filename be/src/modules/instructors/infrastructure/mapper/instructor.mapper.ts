import { Instructor } from '@/modules/instructors/domain/entity/instructor.entity';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { InstructorListItem } from '@/modules/instructors/presentation/dto/admin/get-instructor.response';
import {
  mapUserRole,
  mapUserStatus,
} from '@/modules/users/presentation/mapper/enum.mapper';
import { mapApprovalStatus } from '@/modules/instructors/presentation/mapper/approval.mapper';

export class InstructorMapper {
  static toDomain(entity: InstructorProfileTypeOrmEntity): Instructor {
    const user = entity.user;

    return Instructor.restore({
      id: entity.id!,
      userId: user.id,

      // User
      name: user.name,
      email: user.email,
      password: user.password,
      status: user.status,
      role: user.role,
      blockReason: user.block_reason,
      blockedAt: user.blocked_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,

      // Instructor
      headline: entity.headline,
      bio: entity.bio,
      websiteUrl: entity.websiteUrl,
      socialLinks: entity.socialLinks,
      revenueSharePct: entity.revenueSharePct,
      totalEarned: entity.totalEarned,
      pendingPayout: entity.pendingPayout,
      approvalStatus: entity.approvalStatus,
      approvedAt: entity.approvedAt,
      totalStudents: entity.totalStudents,
      avgRating: entity.avgRating,
    });
  }

  static toResponse(instructor: Instructor): InstructorListItem {
    return {
      id: instructor.userId,
      name: instructor.name,
      email: instructor.email,
      status: mapUserStatus(instructor.status),
      role: mapUserRole(instructor.role),

      profile: {
        id: instructor.id,
        headline: instructor.headline,
        bio: instructor.bio,
        websiteUrl: instructor.websiteUrl,
        socialLinks: instructor.socialLinks,
        revenueSharePct: instructor.revenueSharePct,
        totalEarned: instructor.totalEarned,
        pendingPayout: instructor.pendingPayout,
        approvalStatus: mapApprovalStatus(instructor.approvalStatus),
        approvedAt: instructor.approvedAt,
        totalStudents: instructor.totalStudents,
        avgRating: instructor.avgRating,
      },
    };
  }
}
