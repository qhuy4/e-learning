import {
  InstructorProfileTypeOrmEntity
} from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { FindInstructorsOptions } from '@/modules/instructors/infrastructure/repository/instructor-profile.repository';

export interface IInstructorProfileRepository {
  findAll(option: FindInstructorsOptions): Promise<{
    instructors: InstructorProfileTypeOrmEntity[];
    total: number;
  }>;
}
