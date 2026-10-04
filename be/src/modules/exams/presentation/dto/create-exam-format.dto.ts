import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Kỹ năng của phần thi — dùng thay cho so khớp tên khi gen/đổ dữ liệu. */
export const SECTION_TYPES = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export class CreateExamFormatSectionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsNumber()
  position: number;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  questionCount?: number;

  /** LISTENING / READING / WRITING / SPEAKING — null/ bỏ trống = chưa gán. */
  @IsOptional()
  @IsIn(SECTION_TYPES)
  sectionType?: SectionType | null;
}

export class CreateExamFormatDto {
  @IsNumber()
  examTypeId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExamFormatSectionDto)
  sections?: CreateExamFormatSectionDto[];
}
