import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CouponOrmEntity } from '@/modules/coupons/infrastructure/entity/coupon.orm-entity';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';

@Entity({ name: 'coupon_courses', schema: 'public' })
export class CouponCourseOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'coupon_id', type: 'bigint' })
  couponId: string;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @ManyToOne(() => CouponOrmEntity, (coupon) => coupon.couponCourses)
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponOrmEntity;

  @ManyToOne(() => CourseOrmEntity)
  @JoinColumn({ name: 'course_id' })
  course: CourseOrmEntity;
}
