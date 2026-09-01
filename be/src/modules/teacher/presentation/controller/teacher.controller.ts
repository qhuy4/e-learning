import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import {
  RegisterTeacherCertificateInput,
  RegisterTeacherCommand,
} from '../../application/command/register-teacher.command';
import { GetTeacherRegistrationStatusQuery } from '../../application/query/get-teacher-registration-status.query';
import { TeacherRegistrationStatusView } from '../../application/query-handler/get-teacher-registration-status.handler';
import { TeacherRegistrationResult } from '../../domain/entity/teacher-registration-result.model';
import { RegisterTeacherDto } from '../dto/register-teacher.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'teachers');

const imageFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
    return callback(
      new BadRequestException('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)'),
      false,
    );
  }
  callback(null, true);
};

const teacherFileInterceptor = FileFieldsInterceptor(
  [
    { name: 'identity_front', maxCount: 1 },
    { name: 'identity_back', maxCount: 1 },
    { name: 'selfie_with_id', maxCount: 1 },
    { name: 'certificate_files', maxCount: 10 },
  ],
  {
    storage: diskStorage({
      destination: (req: any, file, cb) => {
        const userId = req.user?.id ?? req.body?.userId ?? 'unknown';
        const dir = join(UPLOAD_ROOT, String(userId));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        cb(null, `${file.fieldname}-${randomUUID()}${extname(file.originalname)}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB / file
  },
);

interface TeacherUploadedFiles {
  identity_front?: Express.Multer.File[];
  identity_back?: Express.Multer.File[];
  selfie_with_id?: Express.Multer.File[];
  certificate_files?: Express.Multer.File[];
}

@Controller('teachers')
export class TeacherController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Đăng ký & nộp hồ sơ eKYC làm giáo viên.
   * Content-Type: multipart/form-data
   *
   * Text fields: headline?, bio?, websiteUrl?, socialLinks? (JSON string),
   *              identityNumber, certificates? (JSON string, mảng CertificateItemDto)
   * File fields: identity_front (1), identity_back (1), selfie_with_id (1),
   *              certificate_files (0..10, khớp thứ tự với mảng `certificates`)
   */
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(teacherFileInterceptor)
  async register(
    @Body() dto: RegisterTeacherDto,
    @UploadedFiles() files: TeacherUploadedFiles,
    @CurrentUser('id') authUserId?: number,
  ): Promise<TeacherRegistrationResult> {
    const targetUserId = authUserId ?? dto.userId;

    if (!targetUserId) {
      throw new BadRequestException('Vui lòng đăng nhập để thực hiện nộp hồ sơ eKYC.');
    }

    const identityFront = files.identity_front?.[0];
    const identityBack = files.identity_back?.[0];
    const selfie = files.selfie_with_id?.[0];

    if (!identityFront || !identityBack || !selfie) {
      throw new BadRequestException(
        'Thiếu ảnh giấy tờ: cần đủ identity_front, identity_back và selfie_with_id.',
      );
    }

    const certificateInputs = dto.certificates ?? [];
    const certificateFiles = files.certificate_files ?? [];

    if (certificateInputs.length !== certificateFiles.length) {
      throw new BadRequestException(
        `Số lượng chứng chỉ khai báo (${certificateInputs.length}) không khớp với số file certificate_files đã tải lên (${certificateFiles.length}).`,
      );
    }

    const certificates: RegisterTeacherCertificateInput[] =
      certificateInputs.map((cert, index) => ({
        certificateName: cert.certificateName,
        issuer: cert.issuer,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        filePath: certificateFiles[index].path,
      }));

    const command = new RegisterTeacherCommand(
      targetUserId,
      dto.headline,
      dto.bio,
      dto.websiteUrl,
      dto.socialLinks,
      dto.identityNumber,
      identityFront.path,
      identityBack.path,
      selfie.path,
      certificates,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Lấy trạng thái hồ sơ của chính user đang đăng nhập (JWT).
   */
  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyRegistrationStatus(
    @CurrentUser('id') userId: number,
  ): Promise<TeacherRegistrationStatusView> {
    return this.queryBus.execute(
      new GetTeacherRegistrationStatusQuery(userId),
    );
  }

  /** Kiểm tra trạng thái hồ sơ đăng ký giáo viên theo userId (dành cho test/debug). */
  @Get(':userId/registration-status')
  async getRegistrationStatus(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<TeacherRegistrationStatusView> {
    return this.queryBus.execute(
      new GetTeacherRegistrationStatusQuery(userId),
    );
  }
}
