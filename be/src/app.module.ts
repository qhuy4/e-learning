import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '@/database/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '@/modules/users/user.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { TeacherModule } from '@/modules/teacher/teacher.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SectionsModule } from '@/modules/sections/sections.module';
import { LessonsModule } from '@/modules/lessons/lessons.module';
import { StorageModule } from '@/common/storage/storage.module';
import { InstructorModule } from '@/modules/instructors/instructor.module';
import { LocationModule } from '@/modules/locations/location.module';
import { LessonProgressModule } from './modules/lesson-progress/lesson-progress.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { EnrollmentsModule } from '@/modules/enrollments/enrollments.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { HomeModule } from '@/modules/home/home.module';
import { CouponsModule } from '@/modules/coupons/coupons.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { InstructorPayoutsModule } from '@/modules/instructor-payouts/instructor-payouts.module';
import { CourseQuestionsModule } from '@/modules/course-questions/course-questions.module';
import { ReviewReportsModule } from '@/modules/review-reports/review-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        return databaseConfig(config);
      },
    }),
    LocationModule,
    ReviewsModule,
    OrdersModule,
    EnrollmentsModule,
    CouponsModule,
    CategoriesModule,
    InstructorPayoutsModule,
    CourseQuestionsModule,
    ReviewReportsModule,
    UserModule,
    AuthModule,
    InstructorModule,
    CoursesModule,
    TeacherModule,
    SectionsModule,
    LessonsModule,
    StorageModule,
    LessonProgressModule,
    PaymentsModule,
    HomeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
