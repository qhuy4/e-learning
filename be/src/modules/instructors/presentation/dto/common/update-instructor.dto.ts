import { IsString, IsOptional, IsIn, IsEmail, IsObject } from 'class-validator';

export class UpdateInstructorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsIn(['ACTIVE', 'BLOCKED', 'PENDING', 'INACTIVE'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;
}
