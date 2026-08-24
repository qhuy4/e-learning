import { Course } from '../entity/course.entity';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface ICourseRepository {
  findPublishedById(id: number): Promise<Course | null>;

  findPublishedBySlug(slug: string): Promise<Course | null>;

  findById(id: number): Promise<Course | null>;

  findBySlug(slug: string): Promise<Course | null>;

  create(course: Course): Promise<Course>;

  update(course: Course): Promise<Course>;

  delete(id: number): Promise<void>;
}
