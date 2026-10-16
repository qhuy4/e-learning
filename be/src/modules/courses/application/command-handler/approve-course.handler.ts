import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
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
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (
      ![CourseStatus.PENDING_REVIEW, CourseStatus.APPROVED].includes(
        course.status,
      )
    ) {
      throw new ConflictException(
        'Chỉ có thể xuất bản khóa học đang chờ duyệt hoặc đã duyệt.',
      );
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

    await this.courseRepository.archiveAncestorChain(course.parentId ?? null);

    await this.courseRepository.update(course);
  }
}
