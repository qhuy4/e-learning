import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SkillMatchingService } from '@/modules/skill-profiling/application/skill-matching.service';
import { MatchInstructorsDto } from '@/modules/skill-profiling/presentation/dto/match-instructors.dto';

/**
 * Matching v1: xếp hạng instructor theo skill mục tiêu (read-only).
 * Sinh viên đã đăng nhập (JwtAuthGuard) — không chạy aggregation/model.
 */
@Controller('matching')
@UseGuards(JwtAuthGuard)
export class SkillMatchingController {
  constructor(private readonly matching: SkillMatchingService) {}

  /** Catalog skill đang hoạt động — FE chọn mục tiêu. */
  @Get('skills')
  async skills() {
    return { skills: await this.matching.getCatalog() };
  }

  @Post('instructors')
  match(@Body() dto: MatchInstructorsDto) {
    return this.matching.match(dto, {
      studentLevel: dto.studentLevel ?? null,
      requireLevelMatch: dto.requireLevelMatch ?? false,
    });
  }
}
