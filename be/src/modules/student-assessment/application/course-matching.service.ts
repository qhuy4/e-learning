import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LearnerProfileService } from './learner-profile.service';
import {
  cefrIndex,
  isCefrBand,
} from '@/modules/student-assessment/domain/cefr';
import { CourseStatus } from '@/modules/courses/domain/enum/course-status.enum';

interface CourseMatchRow {
  id: string | number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: string | number;
  cefr_level_start: string;
  cefr_level_end: string;
  skill_codes: string[];
  instructor_id: string | number;
  instructor_name: string;
}

export interface CourseMatchResponse {
  currentBand: string | null;
  focusSkills: string[];
  courses: Array<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    cefrLevelStart: string;
    cefrLevelEnd: string;
    skillCodes: string[];
    matchedSkills: string[];
    matchScore: number;
    instructor: { id: number; name: string };
  }>;
}

@Injectable()
export class CourseMatchingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly profiles: LearnerProfileService,
  ) {}

  async match(userId: number): Promise<CourseMatchResponse> {
    const profile = await this.profiles.getProfile(userId);
    const selfBand = profile.selfAssessment?.band;
    const currentBand = isCefrBand(profile.levelBand)
      ? profile.levelBand
      : isCefrBand(selfBand)
        ? selfBand
        : null;

    if (!currentBand) {
      return { currentBand: null, focusSkills: [], courses: [] };
    }

    const focusSkills = profile.skills
      .filter((skill) => skill.status === 'assessed')
      .map((skill) => ({
        code: skill.code,
        score:
          skill.scorePct ??
          skill.qualityScore ??
          (isCefrBand(skill.band) ? (cefrIndex(skill.band) + 1) * 15 : 100),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((skill) => skill.code);

    const rows: CourseMatchRow[] = await this.dataSource.query(
      `SELECT c.id, c.title, c.slug, c.description, c.thumbnail, c.price,
              c.cefr_level_start, c.cefr_level_end, c.skill_codes,
              c.instructor_id, u.name AS instructor_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       WHERE c.status = $1 AND c.deleted_at IS NULL
         AND c.cefr_level_start IS NOT NULL AND c.cefr_level_end IS NOT NULL
         AND jsonb_array_length(c.skill_codes) > 0`,
      [CourseStatus.PUBLISHED],
    );

    const currentIndex = cefrIndex(currentBand);
    const courses = rows
      .filter((course) => {
        const start = cefrIndex(course.cefr_level_start);
        const end = cefrIndex(course.cefr_level_end);
        return start <= currentIndex && currentIndex <= end;
      })
      .map((course) => {
        const matchedSkills = course.skill_codes.filter((code) =>
          focusSkills.includes(code),
        );
        const levelFit =
          cefrIndex(course.cefr_level_start) === currentIndex ? 1 : 0.75;
        const skillFit = focusSkills.length
          ? matchedSkills.length / focusSkills.length
          : 0;
        return {
          id: Number(course.id),
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          price: Number(course.price),
          cefrLevelStart: course.cefr_level_start,
          cefrLevelEnd: course.cefr_level_end,
          skillCodes: course.skill_codes,
          matchedSkills,
          matchScore: Math.round((levelFit * 0.6 + skillFit * 0.4) * 100),
          instructor: {
            id: Number(course.instructor_id),
            name: course.instructor_name,
          },
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore || a.price - b.price)
      .slice(0, 10);

    return { currentBand, focusSkills, courses };
  }
}
