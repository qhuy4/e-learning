import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveCourseCommand } from '../command/approve-course.command';
import { CourseRepository } from '../../infrastructure/repository/course.repository';
import { CourseStatus } from '../../domain/enum/course-status.enum';

@CommandHandler(ApproveCourseCommand)
@Injectable()
export class ApproveCourseHandler
  implements ICommandHandler<ApproveCourseCommand>
{
  constructor(
    private readonly courseRepository: CourseRepository,
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepo: Repository<InstructorProfileTypeOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async execute(command: ApproveCourseCommand): Promise<void> {
    const course = await this.courseRepository.findById(command.id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const owner = await this.userRepo.findOne({ where: { id: Number(course.instructorId) } });
    const profile = await this.profileRepo.findOne({ where: { userId: course.instructorId } });
    if (owner?.role !== UserRole.ADMIN && profile?.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new ForbiddenException('Hồ sơ giảng viên chưa được duyệt để xuất bản khóa học.');
    }

    course.status = CourseStatus.PUBLISHED;
    course.publishedAt = new Date();
    course.reviewedAt = new Date();
    course.reviewedBy = command.reviewerId;
    course.rejectReason = null;

    if (course.parentId) {
      const parent = await this.courseRepository.findById(course.parentId);
      if (parent) {
        parent.status = CourseStatus.ARCHIVED;
        await this.courseRepository.update(parent);
      }
    }

    await this.courseRepository.update(course);
  }
}
