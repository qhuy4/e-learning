import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InstructorCertificateRepository } from '@/modules/teacher/infrastructure/repository/instructor-certificate.repository';
import { InstructorProfileRepository } from '@/modules/teacher/infrastructure/repository/instructor-profile.repository';
import { GetTeacherRegistrationStatusQuery } from '@/modules/teacher/application/query/get-teacher-registration-status.query';

export interface TeacherRegistrationStatusView {
  profileId: number;
  approvalStatus: number;
  reviewReason: string | null;
  certificates: {
    id: number;
    certificateName: string;
    status: number;
  }[];
}

@QueryHandler(GetTeacherRegistrationStatusQuery)
export class GetTeacherRegistrationStatusHandler
  implements IQueryHandler<GetTeacherRegistrationStatusQuery>
{
  constructor(
    private readonly instructorProfileRepository: InstructorProfileRepository,
    private readonly instructorCertificateRepository: InstructorCertificateRepository,
  ) {}

  async execute(
    query: GetTeacherRegistrationStatusQuery,
  ): Promise<TeacherRegistrationStatusView | null> {
    const profile = await this.instructorProfileRepository.findByUserId(
      query.userId,
    );

    if (!profile) {
      return null;
    }

    const certificates =
      await this.instructorCertificateRepository.findByUserId(query.userId);

    return {
      profileId: profile.id,
      approvalStatus: profile.approvalStatus,
      reviewReason: profile.reviewReason,
      certificates: certificates.map((c) => ({
        id: c.id,
        certificateName: c.certificateName,
        status: c.certificateStatus,
      })),
    };
  }
}
