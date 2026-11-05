import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Một câu trả lời trong bài quiz — item_id lấy từ GET quiz/form. */
export class QuizResponseDto {
  @IsString()
  @MaxLength(32)
  item_id: string;

  @IsString()
  @MaxLength(200)
  answer: string;
}

export class QuizScoreDto {
  /** form_seed nhận được từ GET quiz/form (bắt buộc — chống chấm nhầm form). */
  @IsInt()
  @Min(0)
  @Max(999_999_999)
  form_seed: number;

  /** 1–100 câu (model chấp nhận tối đa 100) — nộp thiếu vẫn chấm được. */
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => QuizResponseDto)
  responses: QuizResponseDto[];

  /**
   * Tự đánh giá ở Bước 1 (tuỳ chọn): gửi kèm để lưu cùng lúc.
   * 'auto' = để hệ thống tự chọn — không khẳng định level.
   */
  @IsOptional()
  @Matches(/^(pre-A1|A1|A2|B1|B2|C1|C2|auto)$/)
  selfAssessedBand?: string;
}
