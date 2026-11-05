import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetInstructorCertificatesQuery } from '@/modules/instructors/application/query/get-instructor-certificates.query';
import { InstructorCertificateEntity } from '@/modules/instructors/infrastructure/entity/instructor-certificate.entity';

@QueryHandler(GetInstructorCertificatesQuery)
export class GetInstructorCertificatesHandler
  implements IQueryHandler<GetInstructorCertificatesQuery>
{
  constructor(
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
  ) {}

  async execute(query: GetInstructorCertificatesQuery) {
    const certs = await this.certRepo.find({
      where: { userId: query.userId },
      order: { createdAt: 'DESC' },
    });

    return certs.map((c) => ({
      id: c.id,
      certificateName: c.certificateName,
      issuer: c.issuer,
      filePath: c.filePath,
      issuedAt: c.issuedAt,
      expiresAt: c.expiresAt,
      certificateStatus: c.certificateStatus,
      rejectReason: c.rejectReason,
      createdAt: c.createdAt,
    }));
  }
}
