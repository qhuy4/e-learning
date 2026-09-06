import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePreviewTokenCommand } from '../command/create-preview-token.command';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { PreviewTokenService } from '@/common/service/preview-token.service';

@CommandHandler(CreatePreviewTokenCommand)
export class CreatePreviewTokenHandler
  implements ICommandHandler<CreatePreviewTokenCommand>
{
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly previewTokenService: PreviewTokenService,
  ) {}

  async execute(command: CreatePreviewTokenCommand): Promise<{ token: string }> {
    const { user, courseId } = command;
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course không tồn tại');
    }

    if (user.role === UserRole.ADMIN) {
      const token = this.previewTokenService.generateCoursePreviewToken(
        courseId,
        user.id,
        user.role,
      );
      return { token };
    }

    if (user.role === UserRole.INSTRUCTOR) {
      if (course.instructorId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền preview course này');
      }
      const token = this.previewTokenService.generateCoursePreviewToken(
        courseId,
        user.id,
        user.role,
      );
      return { token };
    }

    throw new ForbiddenException('Bạn không có quyền tạo preview token');
  }
}
