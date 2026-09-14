import { IsString, IsNumber, IsOptional, ValidateIf } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @ValidateIf((o) => o.parentId != null)
  @IsNumber()
  parentId?: number | null;
}
