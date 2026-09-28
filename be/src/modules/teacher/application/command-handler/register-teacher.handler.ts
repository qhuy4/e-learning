import { ConflictException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource, QueryFailedError } from 'typeorm';
import { RegisterTeacherCommand } from '@/modules/teacher/application/command/register-teacher.command';
import { TeacherRegistrationResult } from '@/modules/teacher/domain/entity/teacher-registration-result.model';
import { ApprovalStatus } from '@/modules/teacher/domain/enum/approval-status.enum';
import { CertificateStatus } from '@/modules/teacher/domain/enum/certificate-status.enum';
import { InstructorCertificateEntity } from '@/modules/teacher/infrastructure/entity/instructor-certificate.entity';
import { InstructorProfileEntity } from '@/modules/teacher/infrastructure/entity/instructor-profile.entity';
import { InstructorProfileRepository } from '@/modules/teacher/infrastructure/repository/instructor-profile.repository';

@CommandHandler(RegisterTeacherCommand)
export class RegisterTeacherHandler
  implements ICommandHandler<RegisterTeacherCommand, TeacherRegistrationResult>
{
  private readonly logger = new Logger(RegisterTeacherHandler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly instructorProfileRepository: InstructorProfileRepository,
  ) {}

  async execute(command: RegisterTeacherCommand): Promise<TeacherRegistrationResult> {
    const existingProfile =
      await this.instructorProfileRepository.findByUserId(command.userId);
    if (existingProfile && existingProfile.approvalStatus !== ApprovalStatus.REJECTED) {
      throw new ConflictException(
        'Bạn đã có hồ sơ đăng ký giáo viên đang chờ duyệt hoặc đã được duyệt.',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        await manager.query('SELECT pg_advisory_xact_lock($1::bigint)', [command.userId]);
        const currentProfile = await manager.findOne(InstructorProfileEntity, {
          where: { userId: command.userId },
        });
        if (currentProfile && currentProfile.approvalStatus !== ApprovalStatus.REJECTED) {
          throw new ConflictException(
            'Bạn đã có hồ sơ đăng ký giáo viên đang chờ duyệt hoặc đã được duyệt.',
          );
        }

        const profile = await manager.save(
          manager.create(InstructorProfileEntity, {
            ...(currentProfile ? { id: currentProfile.id } : {}),
            userId: command.userId,
            headline: command.headline ?? null,
            bio: command.bio ?? null,
            websiteUrl: command.websiteUrl ?? null,
            socialLinks: command.socialLinks ?? null,
            approvalStatus: ApprovalStatus.PENDING,
            approvedAt: null,
            reviewReason: null,
          }),
        );

        if (currentProfile) {
          await manager.delete(InstructorCertificateEntity, { userId: command.userId });
        }
        const certificateEntities = command.certificates.map((cert) =>
          manager.create(InstructorCertificateEntity, {
            userId: command.userId,
            certificateName: cert.certificateName,
            issuer: cert.issuer ?? null,
            filePath: cert.filePath,
            issuedAt: cert.issuedAt ?? null,
            expiresAt: cert.expiresAt ?? null,
            certificateStatus: CertificateStatus.PENDING,
          }),
        );
        const certificates = certificateEntities.length
          ? await manager.save(certificateEntities)
          : [];

        this.logger.log(
          `User #${command.userId} nộp hồ sơ giáo viên đã xác thực email -> profileId=${profile.id}`,
        );
        return new TeacherRegistrationResult(
          profile.id,
          profile.approvalStatus,
          certificates.map((certificate) => certificate.id),
          'Hồ sơ đã được nộp và đang chờ quản trị viên duyệt.',
        );
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } }).driverError
          ?.code === '23505'
      ) {
        throw new ConflictException(
          'Bạn đã có hồ sơ đăng ký giáo viên. Vui lòng tải lại trang để xem trạng thái.',
        );
      }
      throw error;
    }
  }
}
