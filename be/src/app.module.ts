import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '@/database/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@/modules/users/user.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { TeacherModule } from '@/modules/teacher/teacher.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { DictationsModule } from './modules/dictations/dictations.module';
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
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PremiumSubscriptionsModule } from '@/modules/premium-subscriptions/premium-subscriptions.module';
import { WishlistsModule } from '@/modules/wishlists/wishlists.module';
import { AdminDashboardModule } from '@/modules/analytics/admin-dashboard.module';
import { AchievementsModule } from '@/modules/achievements/achievements.module';
import { ExamsModule } from '@/modules/exams/exams.module';
import { ExamsImportModule } from '@/modules/exams/import/exams-import.module';
import { BookingsModule } from '@/modules/bookings/bookings.module';

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
    CqrsModule.forRoot(),
    LocationModule,
    ReviewsModule,
    OrdersModule,
    EnrollmentsModule,
    CouponsModule,
    CategoriesModule,
    InstructorPayoutsModule,
    CourseQuestionsModule,
    ReviewReportsModule,
    NotificationsModule,
    PremiumSubscriptionsModule,
    WishlistsModule,
    AdminDashboardModule,
    AchievementsModule,
    BookingsModule,
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
    QuizzesModule,
    DictationsModule,
    ExamsModule,
    ExamsImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
