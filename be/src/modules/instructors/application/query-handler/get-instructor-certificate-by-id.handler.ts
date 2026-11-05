import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { GetInstructorCertificateByIdQuery } from '@/modules/instructors/application/query/get-instructor-certificate-by-id.query';
import { InstructorCertificateEntity } from '@/modules/instructors/infrastructure/entity/instructor-certificate.entity';

@QueryHandler(GetInstructorCertificateByIdQuery)
export class GetInstructorCertificateByIdHandler
  implements IQueryHandler<GetInstructorCertificateByIdQuery>
{
  constructor(
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
  ) {}

  async execute(query: GetInstructorCertificateByIdQuery) {
    const cert = await this.certRepo.findOne({
      where: { id: query.certificateId, userId: query.userId },
    });

    if (!cert) {
      throw new AppException(ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return {
      id: cert.id,
      certificateName: cert.certificateName,
      issuer: cert.issuer,
      filePath: cert.filePath,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      certificateStatus: cert.certificateStatus,
      rejectReason: cert.rejectReason,
      reviewedAt: cert.reviewedAt,
      createdAt: cert.createdAt,
    };
  }
}
