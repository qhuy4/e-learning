import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { HomeController } from './presentation/home.controller';
import { GetHomeStatsHandler } from './application/query-handler/get-home-stats.handler';
import { GetHomeCoursesHandler } from './application/query-handler/get-home-courses.handler';
import { CourseOrmEntity } from '@/modules/courses/infrastructure/entity/course.orm-entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { EnrollmentOrmEntity } from '@/modules/enrollments/infrastructure/entity/enrollment.orm-entity';
import { ReviewOrmEntity } from '@/modules/reviews/infrastructure/entity/review.orm-entity';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      CourseOrmEntity,
      UserOrmEntity,
      EnrollmentOrmEntity,
      ReviewOrmEntity,
    ]),
  ],
  controllers: [HomeController],
  providers: [GetHomeStatsHandler, GetHomeCoursesHandler],
})
export class HomeModule {}
