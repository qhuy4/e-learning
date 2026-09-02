import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginDto } from '../dto/login.dto';
import { LoginCommand } from '../../application/command/login.command';
import { LoginResponse } from '@/modules/auth/application/command/login.response';
import { ADMIN_LOGIN_ROLES } from '@/common/constants/allow-role';
import { RegisterCommand } from '@/modules/auth/application/command/register.command';
import { RegisterDto } from '@/modules/auth/presentation/dto/register.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async loginAdmin(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, ADMIN_LOGIN_ROLES),
    );
  }

  @Post('register')
  async registerAdmin(@Body() dto: RegisterDto): Promise<void> {
    return this.commandBus.execute(
      new RegisterCommand(
        dto.name,
        dto.email,
        dto.password,
        dto.confirmPassword,
      ),
    );
  }
}
