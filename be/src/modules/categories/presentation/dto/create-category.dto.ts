import { IsString, IsNumber, IsOptional, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @ValidateIf((o: CreateCategoryDto) => o.parentId != null)
  @IsNumber()
  parentId?: number | null;
}
