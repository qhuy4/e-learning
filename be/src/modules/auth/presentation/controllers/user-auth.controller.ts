import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginDto } from '@/modules/auth/presentation/dto/login.dto';
import { RegisterDto } from '@/modules/auth/presentation/dto/register.dto';
import { LoginCommand } from '@/modules/auth/application/command/login.command';
import { LoginResponse } from '@/modules/auth/application/command/login.response';
import { RegisterCommand } from '@/modules/auth/application/command/register.command';
import { USER_LOGIN_ROLES } from '@/common/constants/allow-role';

@Controller('auth')
export class UserAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, USER_LOGIN_ROLES),
    );
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    return this.commandBus.execute(
      new RegisterCommand(dto.name, dto.email, dto.password, dto.confirmPassword),
    );
  }
}
