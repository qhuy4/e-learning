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
import { extname, join, relative, sep } from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import {
  RegisterTeacherCertificateInput,
  RegisterTeacherCommand,
} from '@/modules/teacher/application/command/register-teacher.command';
import { GetTeacherRegistrationStatusQuery } from '@/modules/teacher/application/query/get-teacher-registration-status.query';
import { TeacherRegistrationStatusView } from '@/modules/teacher/application/query-handler/get-teacher-registration-status.handler';
import { TeacherRegistrationResult } from '@/modules/teacher/domain/entity/teacher-registration-result.model';
import { RegisterTeacherDto } from '@/modules/teacher/presentation/dto/register-teacher.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'teachers');
const UPLOADS_DIR = join(process.cwd(), 'uploads');
function toPublicUploadUrl(absolutePath: string): string {
  return `/uploads/${relative(UPLOADS_DIR, absolutePath).split(sep).join('/')}`;
}

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
    { name: 'certificate_files', maxCount: 10 },
  ],
  {
    storage: diskStorage({
      destination: (req: any, file, cb) => {
        const userId = req.user?.id;
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
  certificate_files?: Express.Multer.File[];
}

@Controller('teachers')
export class TeacherController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Nộp hồ sơ chuyên môn sau khi tài khoản đã được xác thực qua email.
   * Content-Type: multipart/form-data
   *
   * Text fields: headline?, bio?, websiteUrl?, socialLinks? (JSON string),
   *              certificates? (JSON string, mảng CertificateItemDto)
   * File fields: certificate_files (0..10, khớp thứ tự với mảng `certificates`)
   */
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @UseInterceptors(teacherFileInterceptor)
  async register(
    @Body() dto: RegisterTeacherDto,
    @UploadedFiles() files: TeacherUploadedFiles,
    @CurrentUser('id') authUserId?: number,
  ): Promise<TeacherRegistrationResult> {
    const targetUserId = authUserId;

    if (!targetUserId) {
      throw new BadRequestException('Vui lòng đăng nhập bằng tài khoản đã xác thực email.');
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
        filePath: toPublicUploadUrl(certificateFiles[index].path),
      }));

    const command = new RegisterTeacherCommand(
      targetUserId,
      dto.headline,
      dto.bio,
      dto.websiteUrl,
      dto.socialLinks,
      certificates,
    );

    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      const uploadedFiles = Object.values(files).flat();
      await Promise.allSettled(uploadedFiles.map((file) => fs.promises.unlink(file.path)));
      throw error;
    }
  }

  /**
   * Lấy trạng thái hồ sơ của chính user đang đăng nhập (JWT).
   */
  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyRegistrationStatus(
    @CurrentUser('id') userId: number,
  ): Promise<TeacherRegistrationStatusView | null> {
    return this.queryBus.execute(
      new GetTeacherRegistrationStatusQuery(userId),
    );
  }

  /** Kiểm tra trạng thái hồ sơ đăng ký giáo viên theo userId (dành cho test/debug). */
  @Get(':userId/registration-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getRegistrationStatus(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<TeacherRegistrationStatusView | null> {
    return this.queryBus.execute(
      new GetTeacherRegistrationStatusQuery(userId),
    );
  }
}
