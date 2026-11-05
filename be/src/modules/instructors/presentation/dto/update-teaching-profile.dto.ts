import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { CEFR_LEVELS } from '@/modules/student-assessment/domain/cefr';

/**
 * Instructor tự khai báo — không có field nào bắt buộc.
 * Giá trị null / '' = xóa (clear), undefined = không đổi.
 *
 * teachingLevels: các band CEFR instructor giảng dạy — chính là dữ liệu
 * filter/tie-break level trong matching. teachingMethods / teachingVideoUrl
 * vẫn còn trong DB (chưa phá hủy) nhưng chưa ghi/đọc từ API.
 */
export class UpdateTeachingProfileDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @ValidateIf((dto: { experienceYears?: number | null }) =>
    Boolean(dto.experienceYears),
  )
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears?: number | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @ValidateIf((dto: { websiteUrl?: string | null }) => Boolean(dto.websiteUrl))
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(500)
  websiteUrl?: string | null;

  /** Mảng rỗng = xóa (không khai báo level nào). */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(CEFR_LEVELS.length)
  @IsIn(CEFR_LEVELS as unknown as string[], { each: true })
  teachingLevels?: string[] | null;
}
