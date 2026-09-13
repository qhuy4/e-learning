import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetInstructorCertificateByIdQuery } from '@/modules/instructors/application/query/get-instructor-certificate-by-id.query';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';

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
      throw new NotFoundException('Chứng chỉ không tồn tại');
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
