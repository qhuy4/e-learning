import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreviewCourseQuery } from '../query/preview-course.query';
import {
  COURSE_REPOSITORY,
  ICourseRepository,
} from '../../domain/repository/course.repository';
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
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    private readonly previewTokenService: PreviewTokenService,
    @Inject(FILE_STORAGE)
    private readonly storage: FileStorage,
  ) {}

  async execute(query: PreviewCourseQuery) {
    const { token } = query;
    const payload = this.previewTokenService.verifyCoursePreviewToken(token);

    const course = await this.courseRepository.findById(payload.courseId);
    if (!course) {
      throw new NotFoundException('Course không tồn tại');
    }

    if (payload.role === UserRole.ADMIN) {
      return CourseDtoMapper.toDetailDto(course, this.storage);
    }

    if (payload.role === UserRole.INSTRUCTOR) {
      if (course.instructorId !== payload.userId) {
        throw new ForbiddenException('Bạn không có quyền preview course này');
      }
      return CourseDtoMapper.toDetailDto(course, this.storage);
    }

    throw new ForbiddenException('Bạn không có quyền preview course này');
  }
}
