import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { MatchingTargetDto } from '@/modules/skill-profiling/presentation/dto/match-instructors.dto';

/** Matching từ hồ sơ học viên + 1–3 mục tiêu do học viên chọn. */
export class MatchFromProfileDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => MatchingTargetDto)
  targets: MatchingTargetDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;

  /** Chỉ giữ giảng viên dạy đúng level (exact) + chưa khai báo. Mặc định false. */
  @IsOptional()
  @IsBoolean()
  requireLevelMatch?: boolean;

  @IsOptional()
  @IsIn(['ALL', 'FREE', 'PAID'])
  priceMode?: 'ALL' | 'FREE' | 'PAID';

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  minHourlyRate?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxHourlyRate?: number;
}
