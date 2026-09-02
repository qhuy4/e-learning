import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/users/user.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { AuthModule } from './modules/auth/auth.module';
import { SectionsModule } from './modules/sections/sections.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { StorageModule } from './common/storage/storage.module';
import { InstructorProfileModule } from '@/modules/instructors/instructor-profile.module';
import { LocationModule } from '@/modules/locations/location.module';

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
    UserModule,
    AuthModule,
    InstructorProfileModule,
    CoursesModule,
    TeacherModule,
    SectionsModule,
    LessonsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
