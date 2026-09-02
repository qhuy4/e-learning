import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginDto } from '../dto/login.dto';
import { LoginCommand } from '../../application/command/login.command';
import { LoginResponse } from '@/modules/auth/application/command/login.response';
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
}
