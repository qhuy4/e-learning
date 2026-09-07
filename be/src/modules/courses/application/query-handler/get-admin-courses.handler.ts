import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminCoursesQuery } from '@/modules/courses/application/query/get-admin-courses.query';
import { AdminCourseRepository } from '@/modules/courses/infrastructure/repository/admin-course.repository';

@QueryHandler(GetAdminCoursesQuery)
export class GetAdminCoursesHandler implements IQueryHandler<GetAdminCoursesQuery> {
  constructor(private readonly adminCourseRepository: AdminCourseRepository) {}

  async execute(query: GetAdminCoursesQuery) {
    const { page, limit, keyword, status, instructorId, sortBy, sortOrder } = query.data;
    return this.adminCourseRepository.findAll({
      page,
      limit,
      keyword,
      status,
      instructorId,
      sortBy,
      sortOrder,
    });
  }
}
