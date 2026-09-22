import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';

import { RefreshTokenCommand } from '@/modules/auth/application/command/refresh-token.command';
import { RefreshTokenResult } from '@/modules/auth/application/command/refresh-token.result';
import { RefreshSessionRepository } from '@/modules/auth/infrastructure/repository/refresh-session.repository';
import { TokenService } from '@/common/service/token.service';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    let payload;

    try {
      payload = this.tokenService.verifyRefreshToken(command.refreshToken);
    } catch {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (payload.type !== 'refresh') {
      throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const tokenHash = this.tokenService.hashRefreshToken(command.refreshToken);

    const { token: newRefreshToken } = this.tokenService.generateRefreshToken(
      payload.sub,
    );

    const newTokenHash = this.tokenService.hashRefreshToken(newRefreshToken);

     const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    try {


      const session = await this.refreshSessionRepository.rotate(
        tokenHash,
        payload.sub,
        newTokenHash,
        newExpiresAt,
      );

      const accessToken = this.tokenService.generateAccessToken(session.userId);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.log('VERIFY REFRESH ERROR:', error);

      if (
        error instanceof Error &&
        (error.message === 'REFRESH_TOKEN_REUSE' ||
          error.message === 'REFRESH_SESSION_NOT_FOUND' ||
          error.message === 'REFRESH_SESSION_EXPIRED' ||
          error.message === 'REFRESH_SESSION_USER_MISMATCH')
      ) {
        throw new AppException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }

      throw error;
    }
  }
}
