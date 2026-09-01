import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterInstructorDto {
  @IsString()
  @IsNotEmpty({ message: 'Session token không được để trống' })
  session: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  name: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
