import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteInstructorCertificateCommand } from '@/modules/instructors/application/command/delete-instructor-certificate.command';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { CertificateStatus } from '@/modules/teacher/domain/enum/certificate-status.enum';

@CommandHandler(DeleteInstructorCertificateCommand)
export class DeleteInstructorCertificateHandler
  implements ICommandHandler<DeleteInstructorCertificateCommand>
{
  constructor(
    @InjectRepository(InstructorCertificateEntity)
    private readonly certRepo: Repository<InstructorCertificateEntity>,
  ) {}

  async execute(command: DeleteInstructorCertificateCommand) {
    const cert = await this.certRepo.findOne({
      where: { id: command.certificateId, userId: command.userId },
    });

    if (!cert) {
      throw new NotFoundException('Chứng chỉ không tồn tại');
    }

    if (cert.certificateStatus !== CertificateStatus.PENDING) {
      throw new ForbiddenException('Chỉ có thể xóa chứng chỉ đang chờ duyệt');
    }

    await this.certRepo.remove(cert);

    return { data: { success: true } };
  }
}
