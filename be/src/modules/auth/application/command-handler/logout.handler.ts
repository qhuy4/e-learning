import { LogoutCommand } from '@/modules/auth/application/command/logout.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenService } from '@/common/service/token.service';
import { RefreshSessionRepository } from '@/modules/auth/infrastructure/repository/refresh-session.repository';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    let payload;

    try {
      payload = this.tokenService.verifyRefreshToken(command.refreshToken);
    } catch {
      return;
    }

    if (payload.type !== 'refresh') {
      return;
    }

    const tokenHash = this.tokenService.hashRefreshToken(command.refreshToken);

    const session =
      await this.refreshSessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      return;
    }

    await this.refreshSessionRepository.revoke(session.id);
  }
}
