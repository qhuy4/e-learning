import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCourseThumbnailUploadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType: string;
}
