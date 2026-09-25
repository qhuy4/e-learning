import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';

import { LoginDto } from '@/modules/auth/presentation/dto/login.dto';
import { RegisterDto } from '@/modules/auth/presentation/dto/register.dto';
import { LoginCommand } from '@/modules/auth/application/command/login.command';
import { LoginHttpResponse } from '@/modules/auth/application/command/login.response';
import { LoginResult } from '@/modules/auth/application/command/login.result';
import { RegisterCommand } from '@/modules/auth/application/command/register.command';
import { RefreshTokenCommand } from '@/modules/auth/application/command/refresh-token.command';
import { RefreshTokenResult } from '@/modules/auth/application/command/refresh-token.result';
import { LogoutCommand } from '@/modules/auth/application/command/logout.command';
import { USER_LOGIN_ROLES } from '@/common/constants/allow-role';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/auth',
};

@Controller('auth')
export class UserAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginHttpResponse> {
    const result: LoginResult = await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, USER_LOGIN_ROLES),
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
  ): Promise<{ accessToken: string }> {
    const refreshToken = request.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const result: RefreshTokenResult = await this.commandBus.execute(
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
    const refreshToken = request.cookies?.refresh_token as string | undefined;

    if (refreshToken) {
      await this.commandBus.execute(new LogoutCommand(refreshToken));
    }

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
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
