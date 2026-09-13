import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { SendInstructorInviteDto } from '@/modules/auth/dto/send-instructor-invite.dto';
import { RegisterInstructorDto } from '@/modules/auth/dto/register-instructor.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * API 1: Giảng viên nhập email -> Gửi link có session qua mail
   */
  @Post('instructor/send-invite')
  @HttpCode(HttpStatus.OK)
  async sendInstructorInvite(@Body() dto: SendInstructorInviteDto) {
    return this.authService.sendInstructorInvite(dto);
  }

  /**
   * API 1.5: Kiểm tra tính hợp lệ của session khi FE tải trang đăng ký
   */
  @Get('instructor/verify-session')
  async verifySession(@Query('session') session: string) {
    return this.authService.verifySession(session);
  }

  /**
   * API 2: Submit form đăng ký kèm session -> Tạo user role Instructor
   */
  @Post('instructor/register')
  async registerInstructor(@Body() dto: RegisterInstructorDto) {
    return this.authService.registerInstructor(dto);
  }
}
