import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginDto } from '@/modules/auth/presentation/dto/login.dto';
import { LoginCommand } from '@/modules/auth/application/command/login.command';

import { ADMIN_LOGIN_ROLES } from '@/common/constants/allow-role';
import { RegisterCommand } from '@/modules/auth/application/command/register.command';
import { RegisterDto } from '@/modules/auth/presentation/dto/register.dto';
import { Response, Request } from 'express';
import { LoginHttpResponse } from '@/modules/auth/application/command/login.response';
import { RefreshTokenCommand } from '@/modules/auth/application/command/refresh-token.command';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { AppException } from '@/common/exception/app.exception';
import { LogoutCommand } from '@/modules/auth/application/command/logout.command';
export interface RefreshTokenResponse {
  accessToken: string;
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async loginAdmin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginHttpResponse> {
    const result = await this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, ADMIN_LOGIN_ROLES),
    );
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/admin/auth',
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
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

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshTokenResponse> {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const result = await this.commandBus.execute(
      new RefreshTokenCommand(refreshToken),
    );

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/admin/auth',
    });

    return {
      accessToken: result.accessToken,
    };
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
      path: '/admin/auth',
    });
  }
}
