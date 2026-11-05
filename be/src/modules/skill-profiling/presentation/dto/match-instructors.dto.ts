import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CEFR_LEVELS } from '@/modules/student-assessment/domain/cefr';

export class MatchingTargetDto {
  @IsInt()
  @Min(1)
  skillId: number;

  /** Mặc định 1 khi client không truyền — service chuẩn hóa nội bộ. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

export class MatchInstructorsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MatchingTargetDto)
  targets: MatchingTargetDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  /** Band CEFR của sinh viên (A1–C2). Không truyền = không dùng level. */
  @IsOptional()
  @IsIn(CEFR_LEVELS as unknown as string[])
  studentLevel?: string;

  /**
   * Chỉ giữ giảng viên dạy EXACT level + CHƯA khai báo teaching_levels.
   * Chỉ có ý nghĩa khi truyền studentLevel.
   */
  @IsOptional()
  @IsBoolean()
  requireLevelMatch?: boolean;
}
