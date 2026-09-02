import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import {
  ApprovalStatusResponse,
  GetInstructorListResponse,
} from '@/modules/instructors/presentation/dto/admin/get-instructor-profile.response';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';

export class InstructorProfileMapperResponseMapper {
  private static readonly statusName: Record<
    ApprovalStatus,
    ApprovalStatusResponse
  > = {
    [ApprovalStatus.PENDING]: 'PENDING',
    [ApprovalStatus.APPROVED]: 'APPROVED',
    [ApprovalStatus.SUSPENDED]: 'SUSPENDED',
  };

  static toResponse(
    instructor: InstructorProfileTypeOrmEntity,
  ): GetInstructorListResponse['data'][number] {
    return {
      id: instructor.id,
      userId: instructor.userId,

      name: instructor.user.name,
      email: instructor.user.email,
      avatarUrl: instructor.user.profile?.avatarUrl ?? null,

      headline: instructor.headline ?? null,
      approvalStatus: this.statusName[instructor.approvalStatus],

      totalStudents: instructor.totalStudents,
      avgRating: instructor.avgRating,

      revenueSharePct: instructor.revenueSharePct,

      createdAt: instructor.createdAt,
    };
  }
}
