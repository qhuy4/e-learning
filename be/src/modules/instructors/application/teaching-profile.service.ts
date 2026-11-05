import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InstructorProfileTypeOrmEntity } from '@/modules/instructors/infrastructure/entity/instructor-profile.orm.entity';
import { UpdateTeachingProfileDto } from '@/modules/instructors/presentation/dto/update-teaching-profile.dto';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

interface TeachingProfileStats {
  courseCount: number;
  publishedCourseCount: number;
  lessonCount: number;
  certificateCount: number;
  subjects: string[];
}

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
}

const COMPLETION_LABELS: Array<{ key: string; label: string }> = [
  { key: 'headline', label: 'Tiêu đề giảng dạy' },
  { key: 'bio', label: 'Giới thiệu bản thân' },
  { key: 'experienceYears', label: 'Số năm kinh nghiệm' },
  { key: 'teachingLevels', label: 'Các level giảng dạy' },
  { key: 'websiteUrl', label: 'Website / portfolio' },
  { key: 'course', label: 'ít nhất 1 khóa học' },
  { key: 'certificate', label: 'ít nhất 1 chứng chỉ' },
];

@Injectable()
export class TeachingProfileService {
  constructor(
    @InjectRepository(InstructorProfileTypeOrmEntity)
    private readonly profileRepo: Repository<InstructorProfileTypeOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async get(userId: number) {
    const profile = await this.findProfile(userId);

    const stats = await this.loadStats(userId);

    const completionItems: CompletionItem[] = COMPLETION_LABELS.map((item) => ({
      key: item.key,
      label: item.label,
      done: this.isDone(item.key, profile, stats),
    }));
    const doneCount = completionItems.filter((i) => i.done).length;
    const percent = Math.round((doneCount / completionItems.length) * 100);

    return {
      headline: profile.headline,
      bio: profile.bio,
      websiteUrl: profile.websiteUrl,
      experienceYears: profile.experienceYears,
      teachingLevels: profile.teachingLevels,
      stats: {
        courseCount: stats.courseCount,
        publishedCourseCount: stats.publishedCourseCount,
        lessonCount: stats.lessonCount,
        certificateCount: stats.certificateCount,
        studentCount: profile.totalStudents,
        avgRating: Number(profile.avgRating ?? 0),
      },
      subjects: stats.subjects,
      completion: { percent, items: completionItems },
    };
  }

  async update(userId: number, dto: UpdateTeachingProfileDto) {
    const profile = await this.findProfile(userId);

    const patch: Partial<InstructorProfileTypeOrmEntity> = {};
    if ('experienceYears' in dto)
      patch.experienceYears = dto.experienceYears ?? null;
    if ('websiteUrl' in dto) patch.websiteUrl = dto.websiteUrl ?? null;
    if ('teachingLevels' in dto)
      patch.teachingLevels =
        dto.teachingLevels && dto.teachingLevels.length > 0
          ? [...new Set(dto.teachingLevels)]
          : null;

    if (Object.keys(patch).length > 0) {
      await this.profileRepo.update(profile.id, patch);
    }

    return this.get(userId);
  }

  private async findProfile(
    userId: number,
  ): Promise<InstructorProfileTypeOrmEntity> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new AppException(
        ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return profile;
  }

  private async loadStats(userId: number): Promise<TeachingProfileStats> {
    const [stats]: Array<{
      course_count: number;
      published_course_count: number;
      lesson_count: number;
      certificate_count: number;
    }> = await this.dataSource.query(
      `SELECT
         (SELECT count(*) FROM courses c
            WHERE c.instructor_id = $1 AND c.deleted_at IS NULL)::int AS course_count,
         (SELECT count(*) FROM courses c
            WHERE c.instructor_id = $1 AND c.deleted_at IS NULL AND c.status = 5)::int AS published_course_count,
         (SELECT count(*) FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN courses c ON c.id = s.course_id
            WHERE c.instructor_id = $1 AND l.deleted_at IS NULL AND c.deleted_at IS NULL)::int AS lesson_count,
         (SELECT count(*) FROM instructor_certificates ic
            WHERE ic.user_id = $1 AND ic.deleted_at IS NULL)::int AS certificate_count`,
      [userId],
    );

    const subjectRows: Array<{ name: string }> = await this.dataSource.query(
      `SELECT DISTINCT cat.name
       FROM courses c
       JOIN category_course cc ON cc.course_id = c.id
       JOIN categories cat ON cat.id = cc.category_id
       WHERE c.instructor_id = $1 AND c.deleted_at IS NULL
       ORDER BY cat.name`,
      [userId],
    );

    return {
      courseCount: Number(stats?.course_count ?? 0),
      publishedCourseCount: Number(stats?.published_course_count ?? 0),
      lessonCount: Number(stats?.lesson_count ?? 0),
      certificateCount: Number(stats?.certificate_count ?? 0),
      subjects: subjectRows.map((r) => r.name),
    };
  }

  private isDone(
    key: string,
    profile: InstructorProfileTypeOrmEntity,
    stats: TeachingProfileStats,
  ): boolean {
    switch (key) {
      case 'headline':
        return Boolean(profile.headline);
      case 'bio':
        return Boolean(profile.bio);
      case 'experienceYears':
        return profile.experienceYears != null;
      case 'teachingLevels':
        return (profile.teachingLevels?.length ?? 0) > 0;
      case 'websiteUrl':
        return Boolean(profile.websiteUrl);
      case 'course':
        return stats.courseCount > 0;
      case 'certificate':
        return stats.certificateCount > 0;
      default:
        return false;
    }
  }
}
