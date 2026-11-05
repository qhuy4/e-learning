import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

/** Matching từ hồ sơ học viên (quiz +/hoặc writing) — không cần assessmentId. */
export class MatchFromProfileDto {
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
