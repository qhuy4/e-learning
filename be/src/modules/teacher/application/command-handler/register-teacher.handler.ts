import { ConflictException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { promises as fs } from 'fs';
import { DataSource } from 'typeorm';
import { ApprovalStatus } from '../../domain/enum/approval-status.enum';
import { CertificateStatus } from '../../domain/enum/certificate-status.enum';
import { KycStatus } from '../../domain/enum/kyc-status.enum';
import { TeacherRegistrationResult } from '../../domain/entity/teacher-registration-result.model';
import { InstructorCertificateEntity } from '../../infrastructure/entity/instructor-certificate.entity';
import { InstructorKycEntity } from '../../infrastructure/entity/instructor-kyc.entity';
import { InstructorProfileEntity } from '../../infrastructure/entity/instructor-profile.entity';
import { FptEkycService } from '../../infrastructure/integration/fpt-ekyc/fpt-ekyc.service';
import { InstructorProfileRepository } from '../../infrastructure/repository/instructor-profile.repository';
import { RegisterTeacherCommand } from '../command/register-teacher.command';
import { join, relative, sep } from 'path';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

/** Chuyển đường dẫn tuyệt đối trên ổ đĩa (do Multer sinh ra khi upload) thành
 *  URL công khai, khớp với static file server đã mount ở '/uploads' trong
 *  main.ts. Chỉ dùng khi LƯU vào DB — không dùng cho fs.readFile ở trên,
 *  vì đọc file từ đĩa vẫn cần đường dẫn tuyệt đối. */
function toPublicUploadUrl(absolutePath: string): string {
  const relativePath = relative(UPLOADS_DIR, absolutePath).split(sep).join('/');
  return `/uploads/${relativePath}`;
}

@CommandHandler(RegisterTeacherCommand)
export class RegisterTeacherHandler
  implements ICommandHandler<RegisterTeacherCommand, TeacherRegistrationResult>
{
  private readonly logger = new Logger(RegisterTeacherHandler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly instructorProfileRepository: InstructorProfileRepository,
    private readonly fptEkycService: FptEkycService,
  ) {}

  async execute(
    command: RegisterTeacherCommand,
  ): Promise<TeacherRegistrationResult> {
    // 1. Chặn đăng ký trùng: nếu user đã có hồ sơ đang chờ duyệt hoặc đã
    // được duyệt thì không cho đăng ký lại.
    const existingProfile =
      await this.instructorProfileRepository.findByUserId(command.userId);

    if (
      existingProfile &&
      existingProfile.approvalStatus !== ApprovalStatus.REJECTED
    ) {
      throw new ConflictException(
        'Bạn đã có hồ sơ đăng ký giáo viên đang chờ duyệt hoặc đã được duyệt.',
      );
    }

    // 2. Đọc ảnh giấy tờ + selfie từ đĩa để gửi cho FPT eKYC.
    const [identityFrontBuffer, identityBackBuffer, selfieBuffer] =
      await Promise.all([
        fs.readFile(command.identityFrontPath),
        fs.readFile(command.identityBackPath),
        fs.readFile(command.selfiePath),
      ]);

    // 3. Gọi bên thứ 3 FPT.AI eKYC để xác thực định danh (OCR + face match).
    const ekycResult = await this.fptEkycService.verifyIdentity({
      identityFront: identityFrontBuffer,
      identityBack: identityBackBuffer,
      selfie: selfieBuffer,
      clientUuid: `teacher-register-${command.userId}`,
    });

    const { kycStatus, rejectReason } = this.resolveKycStatus(
      ekycResult,
      command.identityNumber,
    );

    // 4. Ghi dữ liệu vào DB trong 1 transaction: instructor_profiles +
    // instructor_kyc + instructor_certificates phải cùng thành công hoặc
    // cùng rollback.
    return this.dataSource.transaction(async (manager) => {
      const profile = await manager.save(
        manager.create(InstructorProfileEntity, {
          userId: command.userId,
          headline: command.headline ?? null,
          bio: command.bio ?? null,
          websiteUrl: command.websiteUrl ?? null,
          socialLinks: command.socialLinks ?? null,
          approvalStatus: ApprovalStatus.PENDING,
        }),
      );

      const kyc = await manager.save(
        manager.create(InstructorKycEntity, {
          userId: command.userId,
          kycStatus,
          identityNumber: command.identityNumber,

          // identityFront: command.identityFrontPath,
          // identityBack: command.identityBackPath,
          // selfieWithId: command.selfiePath,
          identityFront: toPublicUploadUrl(command.identityFrontPath),
          identityBack: toPublicUploadUrl(command.identityBackPath),
          selfieWithId: toPublicUploadUrl(command.selfiePath),

          ocrVerified: ekycResult.ocrVerified,
          faceVerified: ekycResult.faceVerified,
          ocrData: ekycResult.ocrData,
          faceData: ekycResult.faceData,
          rejectReason,
        }),
      );

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
        `User #${command.userId} đăng ký làm giáo viên -> kycStatus=${KycStatus[kycStatus]}, profileId=${profile.id}`,
      );

      return new TeacherRegistrationResult(
        profile.id,
        kyc.id,
        kycStatus,
        profile.approvalStatus,
        certificates.map((c) => c.id),
        rejectReason ?? 'Xác thực định danh thành công.',
      );
    });
  }

  /**
   * Quyết định kycStatus dựa trên kết quả trả về từ FPT eKYC.
   * Lưu ý: dù eKYC có PASS hay không, hồ sơ giáo viên (`instructor_profiles`)
   * vẫn luôn ở trạng thái PENDING chờ admin duyệt cuối cùng — eKYC chỉ là
   * một tín hiệu hỗ trợ ra quyết định, không tự động approve giáo viên.
   */
  private resolveKycStatus(
    ekycResult: Awaited<ReturnType<FptEkycService['verifyIdentity']>>,
    submittedIdentityNumber: string,
  ): { kycStatus: KycStatus; rejectReason: string | null } {
    // Bên thứ 3 lỗi kết nối / lỗi hệ thống -> không tự reject người dùng,
    // đẩy sang cho admin xem xét thủ công.
    if (!ekycResult.success) {
      return {
        kycStatus: KycStatus.MANUAL_REVIEW,
        rejectReason: ekycResult.errorMessage,
      };
    }

    // OCR thành công nhưng số CCCD/CMND OCR đọc được lệch với số người dùng
    // nhập tay -> nghi vấn, cần admin đối chiếu thủ công thay vì auto reject.
    const ocrIdNumber = ekycResult.ocrData?.['ID'];
    if (ocrIdNumber && ocrIdNumber !== submittedIdentityNumber) {
      return {
        kycStatus: KycStatus.MANUAL_REVIEW,
        rejectReason: `Số giấy tờ OCR đọc được (${ocrIdNumber}) không khớp với số đã nhập (${submittedIdentityNumber}).`,
      };
    }

    if (ekycResult.ocrVerified && ekycResult.faceVerified) {
      return { kycStatus: KycStatus.VERIFIED, rejectReason: null };
    }

    return {
      kycStatus: KycStatus.REJECTED,
      rejectReason:
        ekycResult.errorMessage ??
        'Xác thực khuôn mặt hoặc giấy tờ không thành công.',
    };
  }
}
