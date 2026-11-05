import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EmailOutboxStatus } from '@/modules/instructor-applications/domain/enums/email-outbox-status.enum';
import { InstructorEmailTemplate } from '@/modules/instructor-applications/domain/enums/instructor-email-template.enum';
import { InstructorEmailPayload } from '@/modules/instructor-applications/application/templates/instructor-email.templates';
import { EmailOutboxOrmEntity } from '@/modules/instructor-applications/infrastructure/entity/email-outbox.orm.entity';

@Injectable()
export class EmailOutboxService {
  constructor(
    @InjectRepository(EmailOutboxOrmEntity)
    private readonly outboxRepository: Repository<EmailOutboxOrmEntity>,
  ) {}

  async enqueue(
    input: {
      toEmail: string;
      template: InstructorEmailTemplate;
      payload: InstructorEmailPayload;
    },
    manager?: EntityManager,
  ): Promise<EmailOutboxOrmEntity> {
    const repository = manager
      ? manager.getRepository(EmailOutboxOrmEntity)
      : this.outboxRepository;

    return repository.save(
      repository.create({
        toEmail: input.toEmail.trim().toLowerCase(),
        template: input.template,
        payload: input.payload as Record<string, unknown>,
        status: EmailOutboxStatus.PENDING,
        attempts: 0,
        nextAttemptAt: new Date(),
      }),
    );
  }
}
