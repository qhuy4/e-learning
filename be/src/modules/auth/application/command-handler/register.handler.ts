import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserProfileRepository } from '@/modules/users/infrastructure/repository/user-profile.repository';
import { UserRepository } from '@/modules/users/infrastructure/repository/user.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { RegisterCommand } from '@/modules/auth/application/command/register.command';
import { PasswordService } from '@/common/service/password.service';
import { User } from '@/modules/users/domain/entity/user.entity';
import { UserProfile } from '@/modules/users/domain/entity/user-profile.entity';
import { HttpStatus, Logger } from '@nestjs/common';
import { TokenService } from '@/common/service/token.service';
import { MailService } from '@/modules/auth/services/mail.service';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Execute register command.
   *
   * @param command Register command containing user registration information.
   * @returns Nothing after successful registration.
   * @throws AppException When the password confirmation does not match,
   * the email already exists, or user creation fails.
   */
  async execute(command: RegisterCommand): Promise<void> {
    const { name, password, confirmPassword } = command;
    const email = command.email.trim().toLowerCase();

    if (password !== confirmPassword) {
      throw new AppException(ErrorCode.PASSWORD_MISMATCH, HttpStatus.NOT_FOUND);
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await this.passwordService.hash(password);
    const user = User.create({
      name,
      email,
      password: hashedPassword,
    });
    const createdUser = await this.userRepository.create(user);
    if (createdUser.id === null) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const profile = UserProfile.create({
      userId: createdUser.id,
    });

    await this.userProfileRepository.create(profile);

    const verificationToken = this.tokenService.generateEmailVerificationToken(
      createdUser.id,
      createdUser.email,
    );
    try {
      await this.mailService.sendEmailVerification(
        createdUser.email,
        verificationToken,
      );
    } catch (error) {
      // The account is already persisted. Keep registration successful so the
      // user can retry delivery through the resend endpoint.
      this.logger.error(
        `Failed to send verification email to ${createdUser.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
