import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'category_course', schema: 'public' })
export class CategoryCourseOrmEntity {
  @PrimaryColumn({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @PrimaryColumn({ name: 'category_id', type: 'bigint' })
  categoryId: string;
}
