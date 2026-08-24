import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCourseThumbnailDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}
