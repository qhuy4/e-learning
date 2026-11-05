import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { StudentAssessmentService } from '@/modules/student-assessment/application/student-assessment.service';
import { AnalyzeWritingDto } from '@/modules/student-assessment/presentation/dto/analyze-writing.dto';

@Controller('student-assessment')
@UseGuards(JwtAuthGuard)
export class StudentAssessmentController {
  constructor(private readonly assessments: StudentAssessmentService) {}

  /** Phân tích bài viết → CEFR (tham khảo) + focus targets, lưu lại kết quả. */
  @Post('analyze')
  analyze(@CurrentUser('id') userId: number, @Body() dto: AnalyzeWritingDto) {
    return this.assessments.analyze(userId, dto.text);
  }

  /** Assessment gần nhất của user (null nếu chưa có). */
  @Get('latest')
  latest(@CurrentUser('id') userId: number) {
    return this.assessments.latest(userId);
  }
}
