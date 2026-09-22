import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';

import { LoginDto } from '@/modules/auth/presentation/dto/login.dto';
import { LoginCommand } from '@/modules/auth/application/command/login.command';
import { LoginHttpResponse } from '@/modules/auth/application/command/login.response';
import { RefreshTokenCommand } from '@/modules/auth/application/command/refresh-token.command';
import { LogoutCommand } from '@/modules/auth/application/command/logout.command';
import { INSTRUCTOR_LOGIN_ROLES } from '@/common/constants/allow-role';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/instructor/auth',
};

@Controller('instructor/auth')
export class InstructorAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async loginInstructor(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginHttpResponse> {
    const result = await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, INSTRUCTOR_LOGIN_ROLES),
    );

    response.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const result = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );

    response.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = request.cookies?.refresh_token;

    if (refreshToken) {
      await this.commandBus.execute(new LogoutCommand(refreshToken));
    }

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/instructor/auth',
    });
  }
}
