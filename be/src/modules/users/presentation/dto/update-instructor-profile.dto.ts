import { IsOptional, IsString, IsEmail, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GenderApi } from '@/modules/users/presentation/mapper/enum.mapper';

class UpdateInstructorProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(GenderApi)
  gender?: GenderApi;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateInstructorProfileWithFileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @ValidateNested()
  @Type(() => UpdateInstructorProfileDto)
  profile?: UpdateInstructorProfileDto;
}

export { UpdateInstructorProfileDto };
