import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginDto } from './dto/login.dto';
import { LoginCommand } from '../application/command/login.command';
import { LoginResponse } from '@/modules/auth/application/command/login.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }
}
