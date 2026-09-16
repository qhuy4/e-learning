import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InstructorCertificateRepository } from '@/modules/teacher/infrastructure/repository/instructor-certificate.repository';
import { InstructorKycRepository } from '@/modules/teacher/infrastructure/repository/instructor-kyc.repository';
import { InstructorProfileRepository } from '@/modules/teacher/infrastructure/repository/instructor-profile.repository';
import { GetTeacherRegistrationStatusQuery } from '@/modules/teacher/application/query/get-teacher-registration-status.query';

export interface TeacherRegistrationStatusView {
  profileId: number;
  approvalStatus: number;
  kyc: {
    status: number;
    ocrVerified: boolean;
    faceVerified: boolean;
    rejectReason: string | null;
  } | null;
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
    private readonly instructorKycRepository: InstructorKycRepository,
    private readonly instructorCertificateRepository: InstructorCertificateRepository,
  ) {}

  async execute(
    query: GetTeacherRegistrationStatusQuery,
  ): Promise<TeacherRegistrationStatusView> {
    const profile = await this.instructorProfileRepository.findByUserId(
      query.userId,
    );

    if (!profile) {
      throw new AppException(ErrorCode.TEACHER_REGISTRATION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const [kyc, certificates] = await Promise.all([
      this.instructorKycRepository.findLatestByUserId(query.userId),
      this.instructorCertificateRepository.findByUserId(query.userId),
    ]);

    return {
      profileId: profile.id,
      approvalStatus: profile.approvalStatus,
      kyc: kyc
        ? {
            status: kyc.kycStatus,
            ocrVerified: kyc.ocrVerified,
            faceVerified: kyc.faceVerified,
            rejectReason: kyc.rejectReason,
          }
        : null,
      certificates: certificates.map((c) => ({
        id: c.id,
        certificateName: c.certificateName,
        status: c.certificateStatus,
      })),
    };
  }
}
