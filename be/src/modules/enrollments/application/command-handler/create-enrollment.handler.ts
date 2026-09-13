import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';

import { CreateEnrollmentCommand } from '@/modules/enrollments/application/command/create-enrollment.command';
import { Enrollment } from '@/modules/enrollments/domain/entity/enrollment.entity';
import { EnrollmentStatus } from '@/modules/enrollments/domain/enum/enrollment-status.enum';
import {
  ENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from '@/modules/enrollments/domain/repository/enrollment.repository';

@CommandHandler(CreateEnrollmentCommand)
export class CreateEnrollmentHandler
  implements ICommandHandler<CreateEnrollmentCommand>
{
  private readonly logger = new Logger(CreateEnrollmentHandler.name);

  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async execute(command: CreateEnrollmentCommand) {
    const { userId, courseId, pricePaid, currency } = command.data;

    const existing = await this.enrollmentRepository.existsActiveByUserAndCourse(
      userId,
      courseId,
    );

    if (existing) {
      this.logger.warn(
        `Enrollment already exists for user ${userId}, course ${courseId}`,
      );
      return null;
    }

    const enrollment = Enrollment.restore({
      id: 0,
      userId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
      progress: 0,
      pricePaid,
      currency,
      completedAt: null,
      lastAccessedAt: null,
      expiresAt: null,
      enrolledAt: new Date(),
      createdAt: new Date(),
      updatedAt: null,
    });

    const created = await this.enrollmentRepository.create(enrollment);

    this.logger.log(
      `Enrollment created: user ${userId}, course ${courseId}`,
    );

    return created;
  }
}
