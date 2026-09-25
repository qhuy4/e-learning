import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import { RefreshSession } from '@/modules/auth/infrastructure/refresh-session.entity';


@Injectable()
export class RefreshSessionRepository {
  constructor(
    @InjectRepository(RefreshSession)
    private readonly repository: Repository<RefreshSession>,
  ) {}

  async create(data: Partial<RefreshSession>): Promise<RefreshSession> {
    const session = this.repository.create(data);

    return this.repository.save(session);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    return this.repository.findOne({
      where: {
        tokenHash,
      },
    });
  }

  async revoke(id: string): Promise<void> {
    await this.repository.update(
      { id },
      {
        revokedAt: new Date(),
      },
    );
  }

  async revokeFamily(tokenFamily: string): Promise<void> {
    await this.repository.update(
      {
        tokenFamily,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async findActiveByUserId(userId: number): Promise<RefreshSession[]> {
    return this.repository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveById(
    id: string,
    userId: number,
  ): Promise<RefreshSession | null> {
    return this.repository.findOne({
      where: {
        id,
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async revokeAllForUser(
    userId: number,
    exceptId: string | null,
  ): Promise<void> {
    const criteria = exceptId
      ? { userId, revokedAt: IsNull(), id: Not(exceptId) }
      : { userId, revokedAt: IsNull() };

    await this.repository.update(criteria, { revokedAt: new Date() });
  }

  async rotate(
    tokenHash: string,
    userId: number,
    newTokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshSession> {
    return this.repository.manager.transaction(async (manager) => {
      const session = await manager.findOne(RefreshSession, {
        where: {
          tokenHash,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!session) {
        throw new Error('REFRESH_SESSION_NOT_FOUND');
      }

      if (Number(session.userId) !== Number(userId)) {
        throw new Error('REFRESH_SESSION_USER_MISMATCH');
      }

      if (session.revokedAt !== null) {
        await manager.update(
          RefreshSession,
          {
            tokenFamily: session.tokenFamily,
            revokedAt: IsNull(),
          },
          {
            revokedAt: new Date(),
          },
        );

        throw new Error('REFRESH_TOKEN_REUSE');
      }

      if (session.expiresAt <= new Date()) {
        throw new Error('REFRESH_SESSION_EXPIRED');
      }

      await manager.update(
        RefreshSession,
        {
          id: session.id,
        },
        {
          revokedAt: new Date(),
        },
      );

      const newSession = manager.create(RefreshSession, {
        userId: session.userId,
        tokenHash: newTokenHash,
        tokenFamily: session.tokenFamily,
        expiresAt,
        revokedAt: null,
      });

      return manager.save(RefreshSession, newSession);
    });
  }
}
