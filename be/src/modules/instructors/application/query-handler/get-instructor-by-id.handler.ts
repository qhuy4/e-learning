import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInstructorByIdQuery } from '@/modules/instructors/application/query/get-instructor-by-id.query';
import { InstructorRepository } from '@/modules/instructors/infrastructure/repository/instructor.repository';
import { InstructorMapper } from '@/modules/instructors/infrastructure/mapper/instructor.mapper';
import { InstructorListItem } from '@/modules/instructors/presentation/dto/admin/get-instructor.response';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetInstructorByIdQuery)
export class GetInstructorByIdHandler implements IQueryHandler<
  GetInstructorByIdQuery,
  InstructorListItem
> {
  constructor(private readonly instructorRepository: InstructorRepository) {}

  async execute(query: GetInstructorByIdQuery): Promise<InstructorListItem> {
    const { id } = query.data;
    const instructor = await this.instructorRepository.findById(id);

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }

    return InstructorMapper.toResponse(instructor);
  }
}
