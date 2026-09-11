import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetInstructorCertificatesQuery } from '@/modules/instructors/application/query/get-instructor-certificates.query';
import { GetInstructorCertificateByIdQuery } from '@/modules/instructors/application/query/get-instructor-certificate-by-id.query';
import { CreateInstructorCertificateCommand } from '@/modules/instructors/application/command/create-instructor-certificate.command';
import { DeleteInstructorCertificateCommand } from '@/modules/instructors/application/command/delete-instructor-certificate.command';

const UPLOAD_ROOT = join(process.cwd(), 'uploads', 'instructor-certificates');

@Controller('instructor/certificates')
@UseGuards(JwtAuthGuard)
export class InstructorCertificateController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.queryBus.execute(new GetInstructorCertificatesQuery(userId));
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.queryBus.execute(new GetInstructorCertificateByIdQuery(userId, id));
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = (req.user as any)?.id ?? 'unknown';
          const dir = join(UPLOAD_ROOT, String(userId));
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp) hoặc PDF'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @CurrentUser('id') userId: number,
    @Body('certificateName') certificateName: string,
    @Body('issuer') issuer?: string,
    @Body('issuedAt') issuedAt?: string,
    @Body('expiresAt') expiresAt?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!certificateName) {
      throw new Error('Tên chứng chỉ là bắt buộc');
    }

    const filePath = file
      ? `/uploads/instructor-certificates/${userId}/${file.filename}`
      : '';

    return this.commandBus.execute(
      new CreateInstructorCertificateCommand(
        userId,
        certificateName,
        issuer ?? null,
        issuedAt ?? null,
        expiresAt ?? null,
        filePath,
      ),
    );
  }

  @Delete(':id')
  delete(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commandBus.execute(
      new DeleteInstructorCertificateCommand(userId, id),
    );
  }
}
