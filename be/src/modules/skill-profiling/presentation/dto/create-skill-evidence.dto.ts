import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';

/**
 * Evidence thủ công — giảng viên tự khai (không bắt buộc phải làm).
 * Chỉ chấp nhận 2 nguồn null-source; các nguồn còn lại do extractor tự thu.
 */
export class CreateSkillEvidenceDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  skillId: number;

  @IsIn([SkillSourceType.SELF_ASSESSMENT, SkillSourceType.EXPERIENCE])
  sourceType: SkillSourceType;

  /** SELF_ASSESSMENT: điểm 0..1 */
  @ValidateIf(
    (dto: { sourceType: SkillSourceType }) =>
      dto.sourceType === SkillSourceType.SELF_ASSESSMENT,
  )
  @Type(() => Number)
  @Min(0)
  @Max(1)
  score?: number;

  /** EXPERIENCE: số năm (quy đổi 0..1, 5 năm = 1.0) */
  @ValidateIf(
    (dto: { sourceType: SkillSourceType }) =>
      dto.sourceType === SkillSourceType.EXPERIENCE,
  )
  @Type(() => Number)
  @Min(0)
  @Max(60)
  years?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rationale?: string;
}

export class ListSkillEvidenceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  skillId?: number;

  @IsOptional()
  @IsIn(Object.values(SkillSourceType))
  sourceType?: SkillSourceType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
