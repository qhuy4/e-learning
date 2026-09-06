import { Instructor } from '@/modules/instructors/domain/entity/instructor.entity';
import { FindInstructorsOptions } from '@/modules/instructors/domain/type/find-instructors-options';

export interface IInstructorsRepository {
  findAll(options: FindInstructorsOptions): Promise<{
    instructors: Instructor[];
    total: number;
  }>;
  findById(id: number): Promise<Instructor | null>;
}