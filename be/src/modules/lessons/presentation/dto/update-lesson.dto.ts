import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  videoProvider?: string | null;

  @IsOptional()
  @IsString()
  videoSource?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number | null;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}
