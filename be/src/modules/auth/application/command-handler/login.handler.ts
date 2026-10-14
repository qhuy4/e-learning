import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { LoginCommand } from '@/modules/auth/application/command/login.command';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { TokenService } from '@/common/service/token.service';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';
import { HttpStatus } from '@nestjs/common';
import { RefreshSessionRepository } from '@/modules/auth/infrastructure/repository/refresh-session.repository';
import { randomUUID } from 'crypto';
import { LoginResult } from '@/modules/auth/application/command/login.result';
import { UserStatus } from '@/modules/users/domain/enum/user.status';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshSessionRepository,
  ) {}

  /**
   * Execute login command.
   *
   * @param command Login with email and password.
   * @returns Access token after successful authentication.
   * @throws AppException When user is not found or password is invalid.
   */
  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!command.allowedRoles.includes(user.role)) {
      throw new AppException(ErrorCode.INVALID_PASSWORD, HttpStatus.FORBIDDEN);
    }
    // Migrate Password From Laravel
    let hash = user.password;
    if (hash.startsWith('$2y$')) {
      hash = hash.replace('$2y$', '$2b$');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      command.password,
      hash,
    );

    if (!isPasswordValid) {
      throw new AppException(ErrorCode.INVALID_PASSWORD, HttpStatus.FORBIDDEN);
    }
    if (user.status === UserStatus.PENDING) {
      throw new AppException(
        ErrorCode.EMAIL_VERIFICATION_REQUIRED,
        HttpStatus.FORBIDDEN,
      );
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new AppException(ErrorCode.ACCOUNT_BLOCKED, HttpStatus.FORBIDDEN, {
        reason: user.blockReason,
      });
    }
    if (user.id === null) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userProfile = await this.userProfileRepository.findByUserId(user.id);
    const accessToken = this.tokenService.generateAccessToken(user.id);

    const { token: refreshToken } = this.tokenService.generateRefreshToken(
      user.id,
    );

    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);

    const tokenFamily = randomUUID();

     const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      tokenFamily,
      expiresAt,
      revokedAt: null,
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: userProfile?.avatarUrl ?? null,
      },
    };
  }
}
