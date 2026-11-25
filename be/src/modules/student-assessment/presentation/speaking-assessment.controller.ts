import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SpeakingAssessmentService } from '@/modules/student-assessment/application/speaking-assessment.service';
import { SpeakingSubmitDto } from '@/modules/student-assessment/presentation/dto/speaking-submit.dto';

@Controller('student-assessment/speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingAssessmentController {
  constructor(private readonly speaking: SpeakingAssessmentService) {}

  @Get('prompt')
  prompt(@CurrentUser('id') userId: number) {
    return this.speaking.prompt(userId);
  }

  @Post('submit')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  submit(
    @CurrentUser('id') userId: number,
    @Body() dto: SpeakingSubmitDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.speaking.submit(userId, dto, file);
  }

  @Get('latest')
  latest(@CurrentUser('id') userId: number) {
    return this.speaking.latest(userId);
  }

  @Post(':attemptId/retry')
  retry(
    @CurrentUser('id') userId: number,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    return this.speaking.retry(userId, attemptId);
  }
}
