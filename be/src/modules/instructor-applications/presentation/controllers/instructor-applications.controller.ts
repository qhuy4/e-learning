import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { InstructorApplicationsService } from '@/modules/instructor-applications/application/services/instructor-applications.service';
import { CreateInstructorApplicationDto } from '@/modules/instructor-applications/presentation/dto/create-instructor-application.dto';
import { SubmitInstructorApplicationDto } from '@/modules/instructor-applications/presentation/dto/submit-instructor-application.dto';
import { ActivateInstructorDto } from '@/modules/instructor-applications/presentation/dto/activate-instructor.dto';

@Controller('instructor-applications')
export class InstructorApplicationsController {
  constructor(
    private readonly instructorApplicationsService: InstructorApplicationsService,
  ) {}

  @Post('invite')
  invite(@Body() dto: CreateInstructorApplicationDto) {
    return this.instructorApplicationsService.invite(dto);
  }

  @Get('apply')
  getApplication(@Query('token') token?: string) {
    if (!token) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.instructorApplicationsService.getByToken(token);
  }

  @Put('apply')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (
          ![
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(file.mimetype)
        ) {
          return callback(
            new BadRequestException('Chỉ chấp nhận PDF, JPG, PNG hoặc WEBP.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  submitApplication(
    @Body() dto: SubmitInstructorApplicationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Không chặn ở đây: đã có chứng chỉ từ trước thì cho phép nộp lại
    // mà không cần chọn file mới. Service tự validate.
    return this.instructorApplicationsService.submitByToken(dto, files);
  }

  @Delete('certificates/:certificateId')
  deleteCertificate(
    @Param('certificateId', ParseIntPipe) certificateId: number,
    @Query('token') token?: string,
  ) {
    if (!token) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.instructorApplicationsService.deleteCertificateByToken(
      token,
      certificateId,
    );
  }

  @Post('certificates/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (
          ![
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(file.mimetype)
        ) {
          return callback(
            new BadRequestException('Chỉ chấp nhận PDF, JPG, PNG hoặc WEBP.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadCertificate(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('token') token?: string,
  ) {
    return this.instructorApplicationsService.uploadCertificate(
      token ?? '',
      file,
    );
  }

  @Get('activate')
  getActivation(@Query('token') token?: string) {
    if (!token) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.instructorApplicationsService.getActivationByToken(token);
  }

  @Post('activate')
  activate(@Body() dto: ActivateInstructorDto) {
    return this.instructorApplicationsService.activate(dto);
  }
}
