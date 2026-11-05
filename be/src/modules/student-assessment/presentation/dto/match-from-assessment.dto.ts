import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class MatchFromAssessmentDto {
  /** Mặc định: assessment mới nhất của user. */
  @IsOptional()
  @IsInt()
  @Min(1)
  assessmentId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;

  /** Chỉ giữ giảng viên dạy đúng level (exact) + chưa khai báo. Mặc định true. */
  @IsOptional()
  @IsBoolean()
  requireLevelMatch?: boolean;
}
