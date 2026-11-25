import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { SkillProfileQueryService } from '@/modules/skill-profiling/application/skill-profile-query.service';
import { SkillEvidenceService } from '@/modules/skill-profiling/application/skill-evidence.service';
import { SkillAssessmentRunService } from '@/modules/skill-profiling/application/skill-assessment-run.service';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import {
  CreateSkillEvidenceDto,
  ListSkillEvidenceDto,
} from '@/modules/skill-profiling/presentation/dto/create-skill-evidence.dto';
import { SkillVerification } from '../domain/enum/skill-verification.enum';

@Controller('instructor/skill-evidence')
@UseGuards(JwtAuthGuard)
export class InstructorSkillEvidenceController {
  constructor(
    private readonly queryService: SkillProfileQueryService,
    private readonly evidenceService: SkillEvidenceService,
    private readonly assessmentRuns: SkillAssessmentRunService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async list(
    @CurrentUser('id') userId: number,
    @Query() dto: ListSkillEvidenceDto,
  ) {
    const profileId = await this.queryService.resolveProfileId(userId);
    return this.queryService.evidenceList(profileId, {
      skillId: dto.skillId,
      sourceType: dto.sourceType,
      limit: dto.limit,
    });
  }

  /**
   * Thêm evidence thủ công (SELF_ASSESSMENT / EXPERIENCE) rồi chạy lại
   * aggregation cho instructor — score không sửa trực tiếp, chỉ thêm bằng chứng.
   */
  @Post()
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateSkillEvidenceDto,
  ) {
    const profileId = await this.queryService.resolveProfileId(userId);

    const score =
      dto.sourceType === SkillSourceType.EXPERIENCE
        ? Math.min((dto.years ?? 0) / 5, 1)
        : (dto.score ?? 0);
    const confidence = dto.confidence ?? 0.5;
    const rationale =
      dto.rationale ??
      (dto.sourceType === SkillSourceType.EXPERIENCE
        ? `${dto.years ?? 0} năm kinh nghiệm (tự khai)`
        : 'Tự đánh giá của giảng viên');

    const result = await this.evidenceService.recordEvidence({
      instructor_id: profileId,
      skill_id: dto.skillId,
      source_type: dto.sourceType,
      source_id: null,
      score,
      confidence,
      observed_at: new Date(),
      rationale,
      verification: SkillVerification.DECLARED,
    });
    const run = await this.assessmentRuns.execute(
      profileId,
      'EVIDENCE_CHANGED',
    );

    const skills = await this.queryService.list(profileId);
    return { created: result.created, runId: run.runId, skills };
  }

  /** Chỉ xóa được evidence thủ công — hàng do extractor thu sẽ tự làm mới ở refresh. */
  @Delete(':id')
  async remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const profileId = await this.queryService.resolveProfileId(userId);
    // TypeORM/Postgres trả [rows, affectedCount] cho UPDATE ... RETURNING.
    const [updatedRows]: [{ skill_id: number }[], number] =
      await this.dataSource.query(
        `UPDATE instructor_skill_evidences
       SET status = 'SUPERSEDED'
       WHERE id = $1 AND instructor_id = $2 AND status = 'ACTIVE'
         AND (metadata ->> 'extracted') IS DISTINCT FROM 'true'
         AND source_type IN ('SELF_ASSESSMENT', 'EXPERIENCE')
       RETURNING skill_id`,
        [id, profileId],
      );
    if (updatedRows.length === 0) {
      throw new AppException(
        ErrorCode.SKILL_EVIDENCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const run = await this.assessmentRuns.execute(
      profileId,
      'EVIDENCE_CHANGED',
    );
    const skills = await this.queryService.list(profileId);
    return { deleted: true, runId: run.runId, skills };
  }
}
