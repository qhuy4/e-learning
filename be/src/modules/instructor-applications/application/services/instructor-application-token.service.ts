import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { InstructorApplicationTokenPurpose } from '@/modules/instructor-applications/domain/enums/instructor-application-token-purpose.enum';
import { InstructorApplicationTokenOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/instructor-application-token.orm.entity';

const APPLICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const ACTIVATION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class InstructorApplicationTokenService {
  constructor(
    @InjectRepository(InstructorApplicationTokenOrmEntity)
    private readonly tokenRepository: Repository<InstructorApplicationTokenOrmEntity>,
  ) {}

  getTtlMs(purpose: InstructorApplicationTokenPurpose): number {
    return purpose === InstructorApplicationTokenPurpose.ACTIVATION
      ? ACTIVATION_TOKEN_TTL_MS
      : APPLICATION_TOKEN_TTL_MS;
  }

  async issue(
    input: {
      applicationId: number;
      purpose: InstructorApplicationTokenPurpose;
      userId?: number | null;
    },
    manager?: EntityManager,
  ): Promise<{ token: string; expiresAt: Date }> {
    const repository = manager
      ? manager.getRepository(InstructorApplicationTokenOrmEntity)
      : this.tokenRepository;
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.getTtlMs(input.purpose));

    await repository.save(
      repository.create({
        applicationId: input.applicationId,
        userId: input.userId ?? null,
        purpose: input.purpose,
        tokenHash: this.hash(token),
        expiresAt,
      }),
    );

    return { token, expiresAt };
  }

  async resolve(
    token: string,
    purpose: InstructorApplicationTokenPurpose,
  ): Promise<InstructorApplicationTokenOrmEntity> {
    const entity = await this.tokenRepository.findOne({
      where: { tokenHash: this.hash(token), purpose },
    });

    if (
      !entity ||
      entity.usedAt ||
      entity.revokedAt ||
      entity.expiresAt.getTime() <= Date.now()
    ) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    return entity;
  }

  async consume(
    token: string,
    purpose: InstructorApplicationTokenPurpose,
    manager?: EntityManager,
  ): Promise<InstructorApplicationTokenOrmEntity> {
    const repository = manager
      ? manager.getRepository(InstructorApplicationTokenOrmEntity)
      : this.tokenRepository;
    const tokenHash = this.hash(token);
    const entity = await repository.findOne({
      where: { tokenHash, purpose },
    });

    if (
      !entity ||
      entity.usedAt ||
      entity.revokedAt ||
      entity.expiresAt.getTime() <= Date.now()
    ) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await repository.update(
      { id: entity.id, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    if (!result.affected) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_APPLICATION_TOKEN_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    return entity;
  }

  async revokeActive(
    applicationId: number,
    purpose?: InstructorApplicationTokenPurpose,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(InstructorApplicationTokenOrmEntity)
      : this.tokenRepository;
    const where: Record<string, unknown> = {
      applicationId,
      usedAt: IsNull(),
      revokedAt: IsNull(),
    };

    if (purpose) {
      where.purpose = purpose;
    }

    await repository.update(where, { revokedAt: new Date() });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
