import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PasswordService } from '@/common/service/password.service';
import { TokenService } from '@/common/service/token.service';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { RefreshSessionRepository } from '@/modules/auth/infrastructure/repository/refresh-session.repository';
import { ChangePasswordDto } from '@/modules/auth/presentation/dto/change-password.dto';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/auth',
};

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthSecurityController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly tokenService: TokenService,
  ) {}

  @Post('change-password')
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    let hash = user.password;
    if (hash.startsWith('$2y$')) {
      hash = hash.replace('$2y$', '$2b$');
    }

    const isCurrentValid = await this.passwordService.compare(
      dto.currentPassword,
      hash,
    );

    if (!isCurrentValid) {
      throw new AppException(ErrorCode.INVALID_PASSWORD, HttpStatus.FORBIDDEN);
    }

    user.update({ password: await this.passwordService.hash(dto.newPassword) });
    await this.userRepository.save(user);

    return { changed: true };
  }

  @Get('sessions')
  async listSessions(
    @CurrentUser('id') userId: number,
    @Req() request: Request,
  ) {
    const currentId = await this.currentSessionId(request);
    const sessions =
      await this.refreshSessionRepository.findActiveByUserId(userId);

    return sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: currentId !== null && session.id === currentId,
    }));
  }

  @Delete('sessions/others')
  async revokeOtherSessions(
    @CurrentUser('id') userId: number,
    @Req() request: Request,
  ) {
    const currentId = await this.currentSessionId(request);
    await this.refreshSessionRepository.revokeAllForUser(userId, currentId);

    return { revoked: true };
  }

  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser('id') userId: number,
    @Param('id') sessionId: string,
  ) {
    const session =
      await this.refreshSessionRepository.findActiveById(sessionId, userId);

    if (session) {
      await this.refreshSessionRepository.revoke(sessionId);
    }

    return { revoked: true };
  }

  @Delete('account')
  async deleteAccount(
    @CurrentUser('id') userId: number,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.refreshSessionRepository.revokeAllForUser(userId, null);
    await this.userRepository.delete(user);
    response.clearCookie('refresh_token', CLEAR_COOKIE_OPTIONS);

    return { deleted: true };
  }

  private async currentSessionId(request: Request): Promise<string | null> {
    const token = request.cookies?.refresh_token as string | undefined;

    if (!token) {
      return null;
    }

    try {
      const session = await this.refreshSessionRepository.findByTokenHash(
        this.tokenService.hashRefreshToken(token),
      );

      return session?.id ?? null;
    } catch {
      return null;
    }
  }
}
