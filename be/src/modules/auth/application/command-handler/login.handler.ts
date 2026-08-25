import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';

import { LoginCommand } from '../command/login.command';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { TokenService } from '@/modules/auth/service/token.service';
import { LoginResponse } from '@/modules/auth/application/command/login.response';
import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Execute login command.
   *
   * @param command Login with email and password.
   * @returns Access token after successful authentication.
   * @throws AppException When user is not found or password is invalid.
   */
  async execute(command: LoginCommand): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new AppException(
        ErrorCode.USER_NOT_FOUND,
        'Invalid email or password',
        401,
      );
    }
    if (!command.allowedRoles.includes(user.role)) {
      throw new AppException(
        ErrorCode.INVALID_PASSWORD,
        'Invalid Permission',
        403,
      );
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
      throw new AppException(
        ErrorCode.INVALID_PASSWORD,
        'Invalid email or password',
        401,
      );
    }
    if (user.id === null) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Missing UserId',
        401,
      );
    }

    const userProfile = await this.userProfileRepository.findByUserId(user.id);
    const accessToken = this.tokenService.generateAccessToken(user.id);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: userProfile?.avatarUrl ?? null,
      },
    };
  }
}
