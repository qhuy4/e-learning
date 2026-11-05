import { ForbiddenException, HttpStatus, Inject } from '@nestjs/common';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreviewCourseQuery } from '../query/preview-course.query';
import { CourseRepository } from '@/modules/courses/infrastructure/repository/course.repository';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { CourseDtoMapper } from '../../presentation/mappers/course-dto.mapper';
import { PreviewTokenService } from '@/common/service/preview-token.service';
import {
  FILE_STORAGE,
  FileStorage,
} from '@/common/storage/domain/interface/file-storage.interface';

@QueryHandler(PreviewCourseQuery)
export class PreviewCourseQueryHandler implements IQueryHandler<PreviewCourseQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly previewTokenService: PreviewTokenService,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: PreviewCourseQuery) {
    const { token } = query;
    const payload = this.previewTokenService.verifyCoursePreviewToken(token);

    const course = await this.courseRepository.findOrmEntityForPreview(
      payload.courseId,
    );
    if (!course) {
      throw new AppException(ErrorCode.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const role: UserRole = payload.role;

    if (role === UserRole.ADMIN) {
      return CourseDtoMapper.toDetailDto(course, this.storage);
    }

    if (role === UserRole.INSTRUCTOR) {
      if (Number(course.instructorId) !== payload.userId) {
        throw new ForbiddenException('Bạn không có quyền preview course này');
      }
      return CourseDtoMapper.toDetailDto(course, this.storage);
    }

    throw new ForbiddenException('Bạn không có quyền preview course này');
  }
}
