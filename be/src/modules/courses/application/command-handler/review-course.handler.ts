import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { ApprovalStatus } from '@/modules/instructors/domain/enum/instructor-profile.status';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { ReviewCourseCommand } from '@/modules/courses/application/command/review-course.command';
import { AdminCourseRepository } from '@/modules/courses/infrastructure/repository/admin-course.repository';

@CommandHandler(ReviewCourseCommand)
export class ReviewCourseHandler implements ICommandHandler<ReviewCourseCommand> {
  constructor(
    private readonly adminCourseRepository: AdminCourseRepository,
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepo: Repository<InstructorProfileTypeOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  async execute(command: ReviewCourseCommand) {
    const { id, status, rejectReason } = command.data;
    const course = await this.adminCourseRepository.findById(id);
    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (status === CourseStatus.APPROVED || status === CourseStatus.PUBLISHED) {
      const owner = await this.userRepo.findOne({ where: { id: Number(course.instructorId) } });
      const profile = await this.profileRepo.findOne({ where: { userId: Number(course.instructorId) } });
      if (owner?.role !== UserRole.ADMIN && profile?.approvalStatus !== ApprovalStatus.APPROVED) {
        throw new ForbiddenException('Hồ sơ giảng viên chưa được duyệt để xuất bản khóa học.');
      }
    }
    return this.adminCourseRepository.review(id, status, rejectReason);
  }
}
