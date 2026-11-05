import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { randomBytes, randomUUID } from 'crypto';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';
import { OcrSpaceProvider } from '@/modules/certificates/providers/ocr-space.provider';
import { SkillAssessmentRunService } from '@/modules/skill-profiling/application/skill-assessment-run.service';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { PasswordService } from '@/common/service/password.service';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { InstructorCertificateEntity } from '@/modules/instructors/infrastructure/entity/instructor-certificate.entity';
import { CertificateStatus } from '@/modules/instructors/domain/enum/certificate-status.enum';
import { InstructorApplicationStatus } from '@/modules/instructor-applications/domain/enums/instructor-application-status.enum';
import { InstructorApplicationCertificateStatus } from '@/modules/instructor-applications/domain/enums/instructor-application-certificate-status.enum';
import { InstructorEmailTemplate } from '@/modules/instructor-applications/domain/enums/instructor-email-template.enum';
import { InstructorApplicationTokenPurpose } from '@/modules/instructor-applications/domain/enums/instructor-application-token-purpose.enum';
import { INSTRUCTOR_CERTIFICATE_TAGS } from '@/modules/instructor-applications/domain/enums/instructor-certificate-tag.enum';
import {
  deriveCertificateTags,
  sanitizeCertificateTags,
} from '@/modules/instructor-applications/domain/utils/derive-certificate-tags';
import {
  certificateDisplayNameFromOcr,
  extractCertificateOcr,
  isFutureCertificateTestDate,
} from '@/modules/instructor-applications/domain/utils/extract-certificate-ocr';
import { InstructorApplicationOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/instructor-application.orm.entity';
import { InstructorApplicationCertificateOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/instructor-application-certificate.orm.entity';
import { InstructorApplicationTokenService } from '@/modules/instructor-applications/application/services/instructor-application-token.service';
import { EmailOutboxService } from '@/modules/instructor-applications/application/services/email-outbox.service';
import { CreateInstructorApplicationDto } from '@/modules/instructor-applications/presentation/dto/create-instructor-application.dto';
import { SubmitInstructorApplicationDto } from '@/modules/instructor-applications/presentation/dto/submit-instructor-application.dto';
import { ListInstructorApplicationsDto } from '@/modules/instructor-applications/presentation/dto/list-instructor-applications.dto';
import { ActivateInstructorDto } from '@/modules/instructor-applications/presentation/dto/activate-instructor.dto';
import { ApproveInstructorApplicationDto } from '@/modules/instructor-applications/presentation/dto/approve-instructor-application.dto';
import type { ReviewedCertificateOcrDto } from '@/modules/instructor-applications/presentation/dto/review-certificate.dto';

const ALLOWED_CERTIFICATE_MIME_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const REAPPLY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function validateReviewedCertificateOcr(
  data: ReviewedCertificateOcrDto,
): void {
  const required =
    data.documentType === 'IELTS_TRF'
      ? [
          data.overall,
          data.listening,
          data.reading,
          data.writing,
          data.speaking,
        ]
      : [data.overall, data.listening, data.reading];
  if (required.some((score) => score == null)) {
    throw new AppException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, [
      data.documentType === 'IELTS_TRF'
        ? 'IELTS cần đủ Overall, Listening, Reading, Writing và Speaking.'
        : 'TOEIC cần đủ điểm tổng, Listening và Reading.',
    ]);
  }

  const scores = required as number[];
  const valid =
    data.documentType === 'IELTS_TRF'
      ? scores.every((score) => score >= 0 && score <= 9)
      : data.overall! >= 10 &&
        data.overall! <= 990 &&
        data.listening! >= 5 &&
        data.listening! <= 495 &&
        data.reading! >= 5 &&
        data.reading! <= 495;
  if (!valid) {
    throw new AppException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, [
      data.documentType === 'IELTS_TRF'
        ? 'Điểm IELTS phải nằm trong khoảng 0–9.'
        : 'Điểm TOEIC tổng phải từ 10–990; Listening/Reading từ 5–495.',
    ]);
  }
}

@Injectable()
export class InstructorApplicationsService {
  private readonly logger = new Logger(InstructorApplicationsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly instructorApplicationTokenService: InstructorApplicationTokenService,
    private readonly emailOutboxService: EmailOutboxService,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
    private readonly ocrSpaceProvider: OcrSpaceProvider,
    private readonly assessmentRuns: SkillAssessmentRunService,
    @InjectRepository(InstructorApplicationOrmEntity)
    private readonly applicationRepository: Repository<InstructorApplicationOrmEntity>,
    @InjectRepository(InstructorApplicationCertificateOrmEntity)
    private readonly certificateRepository: Repository<InstructorApplicationCertificateOrmEntity>,
  ) {}

  async invite(dto: CreateInstructorApplicationDto): Promise<{
    message: string;
    expiresAt: Date;
  }> {
    const email = dto.email.trim().toLowerCase();

    return this.dataSource.transaction(async (manager) => {
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const userRepository = manager.getRepository(UserOrmEntity);
      const user = await userRepository
        .createQueryBuilder('u')
        .where('LOWER(u.email) = :email', { email })
        .getOne();

      if (user?.role === UserRole.ADMIN) {
        throw new AppException(
          ErrorCode.INVALID_PERMISSION,
          HttpStatus.FORBIDDEN,
        );
      }

      let application = await applicationRepository
        .createQueryBuilder('a')
        .where('LOWER(a.email) = :email', { email })
        .getOne();

      if (
        application?.status === InstructorApplicationStatus.PENDING_REVIEW ||
        application?.status === InstructorApplicationStatus.APPROVED
      ) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      if (application?.status === InstructorApplicationStatus.REJECTED) {
        const rejectedAt = application.reviewedAt ?? application.updatedAt;
        const retryAt = new Date(rejectedAt.getTime() + REAPPLY_COOLDOWN_MS);

        if (retryAt.getTime() > Date.now()) {
          throw new AppException(
            ErrorCode.INSTRUCTOR_APPLICATION_REAPPLY_TOO_SOON,
            HttpStatus.TOO_MANY_REQUESTS,
            { retryAt: retryAt.toISOString() },
          );
        }
      }

      if (application) {
        application.status = InstructorApplicationStatus.PENDING_SUBMISSION;
        application.fullName =
          application.fullName ?? dto.fullName ?? user?.name ?? null;
        application.userId = application.userId ?? user?.id ?? null;
        application.reviewReason = null;
        application.reviewedBy = null;
        application.reviewedAt = null;
        application.version += 1;
        application = await applicationRepository.save(application);
      } else {
        application = await applicationRepository.save(
          applicationRepository.create({
            email,
            fullName: dto.fullName ?? user?.name ?? null,
            userId: user?.id ?? null,
            status: InstructorApplicationStatus.PENDING_SUBMISSION,
            version: 1,
          }),
        );
      }

      await this.instructorApplicationTokenService.revokeActive(
        application.id,
        InstructorApplicationTokenPurpose.APPLICATION,
        manager,
      );
      const issued = await this.instructorApplicationTokenService.issue(
        {
          applicationId: application.id,
          purpose: InstructorApplicationTokenPurpose.APPLICATION,
          userId: application.userId,
        },
        manager,
      );
      const applicationUrl = this.buildInstructorUrl(
        `/apply?token=${encodeURIComponent(issued.token)}`,
      );

      await this.emailOutboxService.enqueue(
        {
          toEmail: email,
          template: InstructorEmailTemplate.APPLICATION_LINK,
          payload: {
            name: application.fullName ?? undefined,
            applicationUrl,
            expiresIn: '24 giờ',
          },
        },
        manager,
      );

      return {
        message:
          'Nếu email hợp lệ, chúng tôi đã gửi liên kết hoàn tất đơn đăng ký giảng viên.',
        expiresAt: issued.expiresAt,
      };
    });
  }

  async getByToken(token: string) {
    const tokenEntity = await this.instructorApplicationTokenService.resolve(
      token,
      InstructorApplicationTokenPurpose.APPLICATION,
    );
    const application = await this.applicationRepository.findOne({
      where: { id: tokenEntity.applicationId },
    });

    if (!application) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const certificates = await this.certificateRepository.find({
      where: { applicationId: application.id },
      order: { id: 'ASC' },
    });

    return {
      application: this.toApplicationView(application),
      certificates: certificates.map((certificate) =>
        this.toCertificateView(certificate),
      ),
      certificateTags: INSTRUCTOR_CERTIFICATE_TAGS,
    };
  }

  async uploadCertificate(
    token: string,
    file: Express.Multer.File | undefined,
  ) {
    if (!token) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!file) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const extension = ALLOWED_CERTIFICATE_MIME_TYPES[file.mimetype];
    if (!extension) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
        HttpStatus.BAD_REQUEST,
        ['Chỉ chấp nhận PDF, JPG, PNG hoặc WEBP.'],
      );
    }

    const tokenEntity = await this.instructorApplicationTokenService.resolve(
      token,
      InstructorApplicationTokenPurpose.APPLICATION,
    );
    const application = await this.applicationRepository.findOne({
      where: { id: tokenEntity.applicationId },
    });

    if (
      !application ||
      ![
        InstructorApplicationStatus.PENDING_SUBMISSION,
        InstructorApplicationStatus.PENDING_INFORMATION,
      ].includes(application.status)
    ) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
        HttpStatus.CONFLICT,
      );
    }

    const fileKey = `instructor-certificates/${application.id}/${randomUUID()}${extension}`;
    await this.fileStorage.upload({
      key: fileKey,
      body: file.buffer,
      contentType: file.mimetype,
      contentLength: file.size,
    });

    return {
      fileKey,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }

  async getAdminCertificateDownloadUrl(certificateId: number) {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
    });

    if (!certificate) {
      throw new AppException(
        ErrorCode.CERTIFICATE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (certificate.fileKey) {
      const expiresIn = 300;
      const url = await this.fileStorage.createDownloadUrl({
        key: certificate.fileKey,
        expiresIn,
      });

      return { url, expiresIn };
    }

    if (certificate.legacyFilePath) {
      const appUrl = this.configService.get<string>(
        'APP_URL',
        'http://localhost:3001',
      );

      return {
        url: certificate.legacyFilePath.startsWith('http')
          ? certificate.legacyFilePath
          : `${appUrl.replace(/\/$/, '')}${certificate.legacyFilePath.startsWith('/') ? '' : '/'}${certificate.legacyFilePath}`,
        expiresIn: 0,
      };
    }

    throw new AppException(
      ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
      HttpStatus.NOT_FOUND,
    );
  }

  async submitByToken(
    dto: SubmitInstructorApplicationDto,
    files: Express.Multer.File[],
  ) {
    // 1. Validate input trước khi upload/OCR.
    if (!dto.token) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate toàn bộ MIME trước khi upload bất kỳ file nào.
    const extensions = (files ?? []).map((file) => {
      const extension = ALLOWED_CERTIFICATE_MIME_TYPES[file.mimetype];

      if (!extension) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
          HttpStatus.BAD_REQUEST,
          ['Chỉ chấp nhận PDF, JPG, PNG hoặc WEBP.'],
        );
      }

      if (!file.buffer?.length) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
          HttpStatus.BAD_REQUEST,
        );
      }

      return extension;
    });

    // 2. Resolve token để biết applicationId.
    // Chưa consume token ở bước này.
    const resolvedToken = await this.instructorApplicationTokenService.resolve(
      dto.token,
      InstructorApplicationTokenPurpose.APPLICATION,
    );

    const applicationId = resolvedToken.applicationId;

    // 3. Upload file gốc lên storage.
    // Chưa mở transaction trong lúc upload/OCR.
    const uploadedFiles: Array<{
      fileKey: string;
      file: Express.Multer.File;
    }> = [];

    for (let i = 0; i < (files?.length ?? 0); i++) {
      const file = files[i];

      const fileKey = `instructor-certificates/${applicationId}/${randomUUID()}${extensions[i]}`;

      await this.fileStorage.upload({
        key: fileKey,
        body: file.buffer,
        contentType: file.mimetype,
        contentLength: file.size,
      });

      uploadedFiles.push({ fileKey, file });
    }

    // 4. Chạy OCR chỉ khi submit.
    // OCR thất bại không ngăn admin review file gốc.
    // OCR.space có thể trả 5xx khi nhiều file dùng chung API key chạy đồng
    // thời. MVP xử lý tuần tự để mỗi certificate có một request độc lập.
    const ocrResults: Array<{
      status: 'completed' | 'failed';
      rawText: string | null;
    }> = [];
    for (const { file } of uploadedFiles) {
      try {
        const result = await this.ocrSpaceProvider.parse(file);
        ocrResults.push({ status: 'completed', rawText: result.rawText });
      } catch {
        ocrResults.push({ status: 'failed', rawText: null });
      }
    }

    // 5. Transaction: consume token, validate application,
    // lưu application/certificates và enqueue email.
    return this.dataSource.transaction(async (manager) => {
      const tokenEntity = await this.instructorApplicationTokenService.consume(
        dto.token,
        InstructorApplicationTokenPurpose.APPLICATION,
        manager,
      );

      // Token phải vẫn trỏ đến đúng application đã dùng để tạo fileKey.
      if (tokenEntity.applicationId !== applicationId) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
          HttpStatus.BAD_REQUEST,
        );
      }

      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );

      const certificateRepository = manager.getRepository(
        InstructorApplicationCertificateOrmEntity,
      );

      const application = await applicationRepository.findOne({
        where: { id: tokenEntity.applicationId },
      });

      if (!application) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        ![
          InstructorApplicationStatus.PENDING_SUBMISSION,
          InstructorApplicationStatus.PENDING_INFORMATION,
        ].includes(application.status)
      ) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
          HttpStatus.CONFLICT,
        );
      }

      application.fullName = dto.fullName.trim();
      application.headline = dto.headline?.trim() || null;
      application.bio = dto.bio?.trim() || null;
      application.websiteUrl = dto.websiteUrl?.trim() || null;
      application.socialLinks = dto.socialLinks ?? null;
      application.status = InstructorApplicationStatus.PENDING_REVIEW;
      application.submittedAt = new Date();
      application.reviewReason = null;
      application.reviewedBy = null;
      application.reviewedAt = null;
      application.version += 1;

      await applicationRepository.save(application);

      // Giữ lại chứng chỉ đã có, chỉ bổ sung file mới.
      // Hành vi cũ delete toàn bộ khiến file cũ mất khi học viên nộp lại.
      const existingCertificates = await certificateRepository.find({
        where: { applicationId: application.id },
        select: { id: true, ocrExtractedData: true },
      });

      if (existingCertificates.length === 0 && !uploadedFiles.length) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingImageHashes = new Set(
        existingCertificates
          .map(
            (certificate) =>
              (
                certificate.ocrExtractedData as {
                  document_image_hash?: string;
                } | null
              )?.document_image_hash,
          )
          .filter((hash): hash is string => Boolean(hash)),
      );

      const certificates = uploadedFiles
        .map(({ fileKey, file }, index) => {
          const ocrResult = ocrResults[index];
          const ocrData = extractCertificateOcr(ocrResult.rawText, file.buffer);
          const certificateName = certificateDisplayNameFromOcr(
            ocrData,
            file.originalname,
          );
          const issuer = ocrData.issuing_organization?.value ?? null;

          return {
            duplicate:
              ocrData.document_image_hash != null &&
              existingImageHashes.has(ocrData.document_image_hash),
            entity: certificateRepository.create({
              applicationId: application.id,
              certificateName,
              issuer,
              issuedAt: ocrData.test_date?.value ?? null,
              expiresAt: null,

              fileKey,
              legacyFilePath: null,
              fileName: file.originalname,
              mimeType: file.mimetype,
              fileSize: file.size,

              status: InstructorApplicationCertificateStatus.PENDING,
              tags: deriveCertificateTags(
                certificateName,
                issuer,
                ocrResult.rawText,
              ),

              ocrStatus: ocrResult.status,
              ocrRawText: ocrResult.rawText,
              ocrExtractedData:
                ocrResult.status === 'completed' ? ocrData : null,
            }),
          };
        })
        .filter(({ duplicate }) => !duplicate)
        .map(({ entity }) => entity);

      await certificateRepository.save(certificates);

      await this.emailOutboxService.enqueue(
        {
          toEmail: application.email,
          template: InstructorEmailTemplate.APPLICATION_RECEIVED,
          payload: {
            name: application.fullName ?? undefined,
          },
        },
        manager,
      );

      return {
        id: application.id,
        status: application.status,
        message: 'Đã gửi đơn đăng ký giảng viên để duyệt.',
        certificates: certificates.map((certificate) => ({
          id: certificate.id,
          fileName: certificate.fileName,
          ocrStatus: certificate.ocrStatus,
        })),
      };
    });
  }

  async listForAdmin(query: ListInstructorApplicationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.applicationRepository
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .addOrderBy('a.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(a.email) LIKE :search OR LOWER(a.full_name) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    const [applications, total] = await qb.getManyAndCount();
    const data = await Promise.all(
      applications.map(async (application) => ({
        ...this.toApplicationView(application),
        certificateCount: await this.certificateRepository.count({
          where: { applicationId: application.id },
        }),
      })),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getForAdmin(id: number) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const certificates = await this.certificateRepository.find({
      where: { applicationId: application.id },
      order: { id: 'ASC' },
    });

    return {
      ...this.toApplicationView(application),
      certificates: certificates.map((certificate) =>
        this.toCertificateView(certificate),
      ),
      certificateTags: INSTRUCTOR_CERTIFICATE_TAGS,
    };
  }

  /**
   * Admin chốt từng chứng chỉ: APPROVED (khóa lại, học viên không được xóa)
   * hoặc REJECTED (học viên mở link apply để xóa và nộp lại).
   *
   * REJECTED đồng thời chuyển hồ sơ sang PENDING_INFORMATION và cấp lại token,
   * vì token đã bị consume ở lần submit trước nên học viên không còn link hợp lệ.
   */
  async reviewCertificate(
    applicationId: number,
    certificateId: number,
    status: 'APPROVED' | 'REJECTED',
    adminUserId: number,
    reason?: string,
    reviewedOcr?: ReviewedCertificateOcrDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const certificateRepository = manager.getRepository(
        InstructorApplicationCertificateOrmEntity,
      );

      const application = await applicationRepository.findOne({
        where: { id: applicationId },
      });

      if (!application) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        [
          InstructorApplicationStatus.APPROVED,
          InstructorApplicationStatus.REJECTED,
        ].includes(application.status)
      ) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
          HttpStatus.CONFLICT,
        );
      }

      const certificate = await certificateRepository.findOne({
        where: { id: certificateId, applicationId: application.id },
      });

      if (!certificate) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const reviewedAt = new Date();
      if (status === 'APPROVED') {
        if (!reviewedOcr) {
          throw new AppException(
            ErrorCode.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
            ['Vui lòng xác nhận loại chứng chỉ và điểm trước khi duyệt.'],
          );
        }
        validateReviewedCertificateOcr(reviewedOcr);
        const previous = certificate.ocrExtractedData;
        const field = <T>(value: T | undefined) =>
          value == null || value === '' ? null : { value, confidence: null };
        certificate.ocrExtractedData = {
          document_type: reviewedOcr.documentType,
          candidate_name: field(reviewedOcr.candidateName?.trim()),
          test_report_form_number: field(reviewedOcr.credentialNumber?.trim()),
          test_date: field(reviewedOcr.testDate),
          date_of_birth: previous?.date_of_birth ?? null,
          test_type:
            reviewedOcr.documentType === 'IELTS_TRF'
              ? (previous?.test_type ?? null)
              : null,
          issuing_organization: field(reviewedOcr.issuer?.trim()),
          scores: {
            overall: reviewedOcr.overall ?? null,
            listening: reviewedOcr.listening ?? null,
            reading: reviewedOcr.reading ?? null,
            writing: reviewedOcr.writing ?? null,
            speaking: reviewedOcr.speaking ?? null,
          },
          cefr_level: previous?.cefr_level ?? null,
          verification_status: 'UNVERIFIED',
          extraction_warnings: previous?.extraction_warnings ?? [],
          document_image_hash: previous?.document_image_hash ?? null,
        };
        certificate.ocrStatus = 'completed';
        certificate.issuer = reviewedOcr.issuer?.trim() || certificate.issuer;
      }
      certificate.status =
        status === 'APPROVED'
          ? InstructorApplicationCertificateStatus.APPROVED
          : InstructorApplicationCertificateStatus.REJECTED;
      certificate.reviewedBy = adminUserId;
      certificate.reviewedAt = reviewedAt;
      certificate.rejectReason =
        status === 'REJECTED' ? reason?.trim() || null : null;
      await certificateRepository.save(certificate);

      if (status === 'REJECTED') {
        const rejectReason =
          reason?.trim() || 'Chứng chỉ không hợp lệ hoặc không đúng yêu cầu.';

        application.status = InstructorApplicationStatus.PENDING_INFORMATION;
        application.reviewReason = rejectReason;
        application.reviewedBy = adminUserId;
        application.reviewedAt = reviewedAt;
        application.version += 1;
        await applicationRepository.save(application);

        // Token cũ đã bị consume khi submit — cấp link mới để học viên sửa.
        await this.instructorApplicationTokenService.revokeActive(
          application.id,
          InstructorApplicationTokenPurpose.APPLICATION,
          manager,
        );
        const issued = await this.instructorApplicationTokenService.issue(
          {
            applicationId: application.id,
            purpose: InstructorApplicationTokenPurpose.APPLICATION,
            userId: application.userId,
          },
          manager,
        );

        await this.emailOutboxService.enqueue(
          {
            toEmail: application.email,
            template: InstructorEmailTemplate.APPLICATION_NEEDS_INFORMATION,
            payload: {
              name: application.fullName ?? undefined,
              reason: rejectReason,
              applicationUrl: this.buildInstructorUrl(
                `/apply?token=${encodeURIComponent(issued.token)}`,
              ),
              expiresIn: '24 giờ',
            },
          },
          manager,
        );
      }

      const refreshed = await certificateRepository.findOne({
        where: { id: certificate.id },
      });

      return {
        certificate: this.toCertificateView(refreshed ?? certificate),
        application: this.toApplicationView(application),
        message:
          status === 'APPROVED'
            ? 'Đã duyệt chứng chỉ.'
            : 'Đã từ chối chứng chỉ.',
      };
    });
  }

  /**
   * Học viên xóa chứng chỉ bị từ chối rồi nộp lại.
   * Chứng chỉ đã APPROVED (đã chốt) không được xóa.
   */
  async deleteCertificateByToken(token: string, certificateId: number) {
    const resolvedToken = await this.instructorApplicationTokenService.resolve(
      token,
      InstructorApplicationTokenPurpose.APPLICATION,
    );

    return this.dataSource.transaction(async (manager) => {
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const certificateRepository = manager.getRepository(
        InstructorApplicationCertificateOrmEntity,
      );

      const application = await applicationRepository.findOne({
        where: { id: resolvedToken.applicationId },
      });

      if (!application) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        ![
          InstructorApplicationStatus.PENDING_SUBMISSION,
          InstructorApplicationStatus.PENDING_INFORMATION,
        ].includes(application.status)
      ) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
          HttpStatus.CONFLICT,
        );
      }

      const certificate = await certificateRepository.findOne({
        where: { id: certificateId, applicationId: application.id },
      });

      if (!certificate) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        certificate.status !== InstructorApplicationCertificateStatus.REJECTED
      ) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_REVIEW_FAILED,
          HttpStatus.CONFLICT,
          ['Chỉ xóa được chứng chỉ bị từ chối.'],
        );
      }

      if (certificate.fileKey) {
        await this.fileStorage
          .delete(certificate.fileKey)
          .catch(() => undefined);
      }

      await certificateRepository.remove(certificate);

      return {
        id: certificateId,
        message: 'Đã xóa chứng chỉ bị từ chối.',
      };
    });
  }

  async requestInformation(id: number, reason: string, adminUserId: number) {
    return this.dataSource.transaction(async (manager) => {
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const application = await applicationRepository.findOne({
        where: { id },
      });

      if (!application) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (application.status === InstructorApplicationStatus.APPROVED) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
          HttpStatus.CONFLICT,
        );
      }

      application.status = InstructorApplicationStatus.PENDING_INFORMATION;
      application.reviewReason = reason.trim();
      application.reviewedBy = adminUserId;
      application.reviewedAt = new Date();
      application.version += 1;
      await applicationRepository.save(application);

      await this.instructorApplicationTokenService.revokeActive(
        application.id,
        InstructorApplicationTokenPurpose.APPLICATION,
        manager,
      );
      const issued = await this.instructorApplicationTokenService.issue(
        {
          applicationId: application.id,
          purpose: InstructorApplicationTokenPurpose.APPLICATION,
          userId: application.userId,
        },
        manager,
      );
      const applicationUrl = this.buildInstructorUrl(
        `/apply?token=${encodeURIComponent(issued.token)}`,
      );

      await this.emailOutboxService.enqueue(
        {
          toEmail: application.email,
          template: InstructorEmailTemplate.APPLICATION_NEEDS_INFORMATION,
          payload: {
            name: application.fullName ?? undefined,
            reason: reason.trim(),
            applicationUrl,
            expiresIn: '24 giờ',
          },
        },
        manager,
      );

      return {
        id: application.id,
        status: application.status,
        message: 'Đã gửi yêu cầu bổ sung thông tin.',
      };
    });
  }

  async reject(id: number, reason: string, adminUserId: number) {
    return this.dataSource.transaction(async (manager) => {
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const application = await applicationRepository.findOne({
        where: { id },
      });

      if (!application) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (application.status === InstructorApplicationStatus.APPROVED) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
          HttpStatus.CONFLICT,
        );
      }

      application.status = InstructorApplicationStatus.REJECTED;
      application.reviewReason = reason.trim();
      application.reviewedBy = adminUserId;
      application.reviewedAt = new Date();
      application.version += 1;
      await applicationRepository.save(application);
      await this.instructorApplicationTokenService.revokeActive(
        application.id,
        undefined,
        manager,
      );

      await this.emailOutboxService.enqueue(
        {
          toEmail: application.email,
          template: InstructorEmailTemplate.APPLICATION_REJECTED,
          payload: {
            name: application.fullName ?? undefined,
            reason: reason.trim(),
          },
        },
        manager,
      );

      return {
        id: application.id,
        status: application.status,
        message: 'Đã từ chối đơn đăng ký giảng viên.',
      };
    });
  }

  async approve(
    id: number,
    adminUserId: number,
    dto: ApproveInstructorApplicationDto,
  ) {
    const result = await this.dataSource.transaction(async (manager) => {
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const certificateRepository = manager.getRepository(
        InstructorApplicationCertificateOrmEntity,
      );
      const userRepository = manager.getRepository(UserOrmEntity);
      const application = await applicationRepository.findOne({
        where: { id },
      });

      if (!application) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (application.status !== InstructorApplicationStatus.PENDING_REVIEW) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_NOT_EDITABLE,
          HttpStatus.CONFLICT,
        );
      }

      const certificates = await certificateRepository.find({
        where: { applicationId: application.id },
        order: { id: 'ASC' },
      });

      if (certificates.length === 0) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }

      const reviewedAt = new Date();
      let approvedCount = 0;
      for (const certificate of certificates) {
        // Admin đã chốt FROM CHỐI từng chứng chỉ — không được lật lại khi
        // duyệt hồ sơ, và chứng chỉ đó không được đưa vào hồ sơ giảng viên.
        if (
          certificate.status === InstructorApplicationCertificateStatus.REJECTED
        ) {
          continue;
        }

        if (
          certificate.status !== InstructorApplicationCertificateStatus.APPROVED
        ) {
          throw new AppException(
            ErrorCode.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
            [
              'Vui lòng kiểm tra và duyệt từng chứng chỉ trước khi duyệt hồ sơ.',
            ],
          );
        }

        if (!certificate.fileKey && !certificate.legacyFilePath) {
          throw new AppException(
            ErrorCode.INSTRUCTOR_CERTIFICATE_FILE_INVALID,
            HttpStatus.BAD_REQUEST,
          );
        }

        const requestedTags = dto.certificateTags?.[String(certificate.id)];
        certificate.tags = requestedTags
          ? sanitizeCertificateTags(requestedTags)
          : (certificate.tags ?? []);
        if (certificate.tags.length === 0) {
          certificate.tags = deriveCertificateTags(
            certificate.certificateName,
            certificate.issuer,
            certificate.ocrRawText,
          );
        }
        certificate.reviewedBy = adminUserId;
        certificate.reviewedAt = reviewedAt;
        certificate.rejectReason = null;
        approvedCount += 1;
      }

      if (approvedCount === 0) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_CERTIFICATE_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }

      await certificateRepository.save(certificates);

      let user = await userRepository
        .createQueryBuilder('u')
        .where('LOWER(u.email) = :email', { email: application.email })
        .getOne();

      application.reviewedBy = adminUserId;
      application.reviewedAt = reviewedAt;
      application.reviewReason = null;
      application.status = InstructorApplicationStatus.APPROVED;

      if (user?.role === UserRole.ADMIN) {
        throw new AppException(
          ErrorCode.INVALID_PERMISSION,
          HttpStatus.FORBIDDEN,
        );
      }
      if (user?.status === UserStatus.BLOCKED) {
        throw new AppException(ErrorCode.ACCOUNT_BLOCKED, HttpStatus.CONFLICT);
      }

      if (
        user &&
        user.role === UserRole.INSTRUCTOR &&
        user.status === UserStatus.ACTIVE
      ) {
        application.userId = user.id;
        application.activatedAt = reviewedAt;
        application.requiresPassword = false;
        await applicationRepository.save(application);

        await this.upsertApprovedProfile(manager, application, user.id);
        await this.replaceApprovedCertificates(manager, user.id, certificates);

        await this.emailOutboxService.enqueue(
          {
            toEmail: application.email,
            template: InstructorEmailTemplate.APPLICATION_APPROVED,
            payload: { name: application.fullName ?? user.name },
          },
          manager,
        );

        return {
          id: application.id,
          status: application.status,
          requiresActivation: false,
          message: 'Đã duyệt hồ sơ giảng viên.',
          _refreshUserId: user.id,
        };
      }

      let requiresPassword = false;

      if (!user) {
        const randomPassword = await this.passwordService.hash(
          randomBytes(32).toString('hex'),
        );
        user = await userRepository.save(
          userRepository.create({
            name: application.fullName ?? application.email,
            email: application.email,
            password: randomPassword,
            role: UserRole.STUDENT,
            status: UserStatus.PENDING,
          }),
        );
        requiresPassword = true;
      }

      application.userId = user.id;
      application.activatedAt = null;
      application.requiresPassword = requiresPassword;
      await applicationRepository.save(application);

      await this.instructorApplicationTokenService.revokeActive(
        application.id,
        InstructorApplicationTokenPurpose.ACTIVATION,
        manager,
      );
      const issued = await this.instructorApplicationTokenService.issue(
        {
          applicationId: application.id,
          purpose: InstructorApplicationTokenPurpose.ACTIVATION,
          userId: user.id,
        },
        manager,
      );
      const activationUrl = this.buildInstructorUrl(
        `/activate?token=${encodeURIComponent(issued.token)}`,
      );

      await this.emailOutboxService.enqueue(
        {
          toEmail: application.email,
          template: InstructorEmailTemplate.ACTIVATION_LINK,
          payload: {
            name: application.fullName ?? user.name,
            activationUrl,
            expiresIn: '7 ngày',
          },
        },
        manager,
      );

      return {
        id: application.id,
        status: application.status,
        requiresActivation: true,
        message: 'Đã duyệt hồ sơ giảng viên và gửi liên kết kích hoạt.',
      };
    });

    const { _refreshUserId, ...clean } = result as {
      _refreshUserId?: number;
      id: number;
      status: InstructorApplicationStatus;
      requiresActivation: boolean;
      message: string;
    };
    if (_refreshUserId) {
      await this.triggerSkillRefresh(_refreshUserId);
    }
    return clean;
  }

  async getActivationByToken(token: string) {
    const tokenEntity = await this.instructorApplicationTokenService.resolve(
      token,
      InstructorApplicationTokenPurpose.ACTIVATION,
    );
    const application = await this.applicationRepository.findOne({
      where: { id: tokenEntity.applicationId },
    });

    if (
      !application ||
      application.status !== InstructorApplicationStatus.APPROVED ||
      application.activatedAt
    ) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = application.userId
      ? await this.dataSource.manager.findOne(UserOrmEntity, {
          where: { id: application.userId },
        })
      : null;

    return {
      email: application.email,
      fullName: application.fullName ?? user?.name ?? null,
      requiresPassword: application.requiresPassword,
      expiresAt: tokenEntity.expiresAt,
    };
  }

  async activate(dto: ActivateInstructorDto) {
    const result = await this.dataSource.transaction(async (manager) => {
      const tokenEntity = await this.instructorApplicationTokenService.consume(
        dto.token,
        InstructorApplicationTokenPurpose.ACTIVATION,
        manager,
      );
      const applicationRepository = manager.getRepository(
        InstructorApplicationOrmEntity,
      );
      const userRepository = manager.getRepository(UserOrmEntity);
      const certificateRepository = manager.getRepository(
        InstructorApplicationCertificateOrmEntity,
      );
      const application = await applicationRepository.findOne({
        where: { id: tokenEntity.applicationId },
      });

      if (
        !application ||
        application.status !== InstructorApplicationStatus.APPROVED ||
        application.activatedAt ||
        !application.userId
      ) {
        throw new AppException(
          ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await userRepository.findOne({
        where: { id: application.userId },
      });

      if (!user) {
        throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      if (user.status === UserStatus.BLOCKED) {
        throw new AppException(ErrorCode.ACCOUNT_BLOCKED, HttpStatus.CONFLICT);
      }

      if (application.requiresPassword) {
        if (!dto.password) {
          throw new AppException(
            ErrorCode.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
            ['Vui lòng đặt mật khẩu để kích hoạt tài khoản.'],
          );
        }
        user.password = await this.passwordService.hash(dto.password);
      }

      user.role = UserRole.INSTRUCTOR;
      user.status = UserStatus.ACTIVE;
      await userRepository.save(user);

      const certificates = await certificateRepository.find({
        where: { applicationId: application.id },
        order: { id: 'ASC' },
      });
      await this.upsertApprovedProfile(manager, application, user.id);
      await this.replaceApprovedCertificates(manager, user.id, certificates);

      application.activatedAt = new Date();
      application.requiresPassword = false;
      await applicationRepository.save(application);
      await this.instructorApplicationTokenService.revokeActive(
        application.id,
        InstructorApplicationTokenPurpose.ACTIVATION,
        manager,
      );

      return {
        email: user.email,
        name: user.name,
        role: user.role,
        message:
          'Kích hoạt tài khoản giảng viên thành công. Vui lòng đăng nhập để tiếp tục.',
      };
    });

    if (result.email) {
      const user = await this.dataSource.manager.findOne(UserOrmEntity, {
        where: { email: result.email },
      });
      if (user) {
        await this.triggerSkillRefresh(user.id);
      }
    }
    return result;
  }

  private async triggerSkillRefresh(userId: number): Promise<void> {
    await this.assessmentRuns.onEvidenceChangedForUser(userId);
  }

  private async upsertApprovedProfile(
    manager: EntityManager,
    application: InstructorApplicationOrmEntity,
    userId: number,
  ): Promise<void> {
    const profileRepository = manager.getRepository(
      InstructorProfileTypeOrmEntity,
    );
    let profile = await profileRepository.findOne({ where: { userId } });

    if (!profile) {
      profile = profileRepository.create({ userId });
    }

    profile.headline = application.headline;
    profile.bio = application.bio;
    profile.websiteUrl = application.websiteUrl;
    profile.socialLinks = application.socialLinks;
    profile.approvalStatus = ApprovalStatus.APPROVED;
    profile.approvedAt = new Date();
    profile.reviewReason = null;
    await profileRepository.save(profile);
  }

  private async replaceApprovedCertificates(
    manager: EntityManager,
    userId: number,
    certificates: InstructorApplicationCertificateOrmEntity[],
  ): Promise<void> {
    const certificateRepository = manager.getRepository(
      InstructorCertificateEntity,
    );
    await certificateRepository.delete({ userId });

    // Chỉ chứng chỉ đã chốt APPROVED mới được đưa vào hồ sơ giảng viên.
    const approved = certificates.filter(
      (certificate) =>
        certificate.status === InstructorApplicationCertificateStatus.APPROVED,
    );

    if (approved.length === 0) {
      return;
    }

    await certificateRepository.save(
      approved.map((certificate) =>
        certificateRepository.create({
          userId,
          certificateName: certificate.certificateName,
          issuer: certificate.issuer,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
          filePath: certificate.legacyFilePath ?? '',
          fileKey: certificate.fileKey,
          fileName: certificate.fileName,
          mimeType: certificate.mimeType,
          fileSize: certificate.fileSize,
          tags: certificate.tags,
          certificateStatus: CertificateStatus.APPROVED,
          ocrStatus: certificate.ocrStatus,
          ocrRawText: certificate.ocrRawText,
          ocrExtractedData: certificate.ocrExtractedData,
        }),
      ),
    );
  }

  private buildInstructorUrl(path: string): string {
    const baseUrl = this.configService.get<string>(
      'FRONTEND_INSTRUCTOR_URL',
      'http://localhost:5175',
    );

    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }

  private toApplicationView(application: InstructorApplicationOrmEntity) {
    return {
      id: application.id,
      email: application.email,
      fullName: application.fullName,
      headline: application.headline,
      bio: application.bio,
      websiteUrl: application.websiteUrl,
      socialLinks: application.socialLinks,
      status: application.status,
      reviewReason: application.reviewReason,
      userId: application.userId,
      submittedAt: application.submittedAt,
      activatedAt: application.activatedAt,
      requiresPassword: application.requiresPassword,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  private toCertificateView(
    certificate: InstructorApplicationCertificateOrmEntity,
  ) {
    const ocrExtractedData = certificate.ocrExtractedData;
    const testDate = ocrExtractedData?.test_date?.value;
    const warnings = ocrExtractedData?.extraction_warnings ?? [];
    const displayOcr =
      ocrExtractedData &&
      testDate &&
      isFutureCertificateTestDate(testDate) &&
      !warnings.includes('INVALID_DATE')
        ? {
            ...ocrExtractedData,
            extraction_warnings: [...warnings, 'INVALID_DATE'],
          }
        : ocrExtractedData;

    return {
      id: certificate.id,
      certificateName: certificate.certificateName,
      issuer: certificate.issuer,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      fileKey: certificate.fileKey,
      fileName: certificate.fileName,
      mimeType: certificate.mimeType,
      fileSize: certificate.fileSize,
      status: certificate.status,
      tags: certificate.tags ?? [],
      rejectReason: certificate.rejectReason,
      ocrStatus: certificate.ocrStatus,
      ocrRawText: certificate.ocrRawText,
      ocrExtractedData: displayOcr,
    };
  }
}
