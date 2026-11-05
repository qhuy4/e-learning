import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { DeleteInstructorCertificateCommand } from '@/modules/instructors/application/command/delete-instructor-certificate.command';
import { InstructorCertificateEntity } from '@/modules/instructors/infrastructure/entity/instructor-certificate.entity';
import { CertificateStatus } from '@/modules/instructors/domain/enum/certificate-status.enum';

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
      throw new AppException(ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (cert.certificateStatus !== CertificateStatus.PENDING) {
      throw new ForbiddenException('Chỉ có thể xóa chứng chỉ đang chờ duyệt');
    }

    await this.certRepo.remove(cert);

    return { data: { success: true } };
  }
}
