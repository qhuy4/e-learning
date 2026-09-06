import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginDto } from '../dto/login.dto';
import { LoginCommand } from '../../application/command/login.command';
import { LoginResponse } from '@/modules/auth/application/command/login.response';
import { INSTRUCTOR_LOGIN_ROLES } from '@/common/constants/allow-role';

@Controller('instructor/auth')
export class InstructorAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async loginInstructor(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, INSTRUCTOR_LOGIN_ROLES),
    );
  }
}
