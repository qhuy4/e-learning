import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstructorCertificateCommand } from '@/modules/instructors/application/command/create-instructor-certificate.command';
import { InstructorCertificateEntity } from '@/modules/instructors/infrastructure/entity/instructor-certificate.entity';
import { CertificateStatus } from '@/modules/instructors/domain/enum/certificate-status.enum';

@CommandHandler(CreateInstructorCertificateCommand)
export class CreateInstructorCertificateHandler
  implements ICommandHandler<CreateInstructorCertificateCommand>
{
  constructor(
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
  ) {}

  async execute(command: CreateInstructorCertificateCommand) {
    const cert = this.certRepo.create({
      userId: command.userId,
      certificateName: command.certificateName,
      issuer: command.issuer,
      issuedAt: command.issuedAt,
      expiresAt: command.expiresAt,
      filePath: command.filePath,
      certificateStatus: CertificateStatus.PENDING,
    });

    const saved = await this.certRepo.save(cert);

    return {
      data: {
        id: saved.id,
        certificateName: saved.certificateName,
        issuer: saved.issuer,
        filePath: saved.filePath,
        issuedAt: saved.issuedAt,
        expiresAt: saved.expiresAt,
        certificateStatus: saved.certificateStatus,
        createdAt: saved.createdAt,
      },
    };
  }
}
