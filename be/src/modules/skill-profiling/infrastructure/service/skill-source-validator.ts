import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';

export interface ResolvedSource {
  /** Source row timestamp used in the content hash (changes when source edits). */
  source_updated_at: string;
}

const NULL_SOURCE_TYPES: SkillSourceType[] = [
  SkillSourceType.SELF_ASSESSMENT,
  SkillSourceType.EXPERIENCE,
];

/**
 * Validates at the application layer that a polymorphic evidence source exists
 * and belongs to the claimed instructor, using raw SQL join chains so this
 * module does not import entities from reviews/lessons/courses/certificates.
 *
 * Chains (all end at instructor_profiles.id):
 *   STUDENT_RATING   reviews          -> courses.instructor_id        -> profile
 *   LESSON_PLAN      lessons          -> sections -> courses          -> profile
 *   CERTIFICATE      instructor_certificates.user_id                  -> profile
 *   STUDENT_OUTCOME  enrollments      -> courses.instructor_id        -> profile
 *   SELF_ASSESSMENT / EXPERIENCE  must have source_id = NULL (nothing to look up)
 */
@Injectable()
export class SkillSourceValidator {
  constructor(private readonly dataSource: DataSource) {}

  async resolve(
    sourceType: SkillSourceType,
    sourceId: string,
    instructorId: number,
  ): Promise<ResolvedSource> {
    if (NULL_SOURCE_TYPES.includes(sourceType)) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!/^\d{1,19}$/.test(sourceId)) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 1. Does the source row exist at all? (404 if not)
    const existsSql = this.existsQuery(sourceType);
    const exists: unknown[] = await this.dataSource.query(existsSql, [
      sourceId,
    ]);
    if (exists.length === 0) {
      throw new AppException(
        ErrorCode.SKILL_EVIDENCE_SOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    // 2. Does it belong to this instructor? (403 if owned by someone else)
    const ownedSql = this.ownedQuery(sourceType);
    const owned: Array<{ source_updated_at: unknown }> =
      await this.dataSource.query(ownedSql, [sourceId, instructorId]);
    if (owned.length === 0) {
      throw new AppException(
        ErrorCode.INVALID_PERMISSION,
        HttpStatus.FORBIDDEN,
      );
    }

    const eligible: unknown[] = await this.dataSource.query(
      this.eligibleQuery(sourceType),
      [sourceId],
    );
    if (eligible.length === 0) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    return { source_updated_at: String(owned[0].source_updated_at) };
  }

  private existsQuery(sourceType: SkillSourceType): string {
    switch (sourceType) {
      case SkillSourceType.STUDENT_RATING:
        return 'SELECT 1 FROM reviews WHERE id = $1::bigint';
      case SkillSourceType.LESSON_PLAN:
        return 'SELECT 1 FROM lessons WHERE id = $1::bigint';
      case SkillSourceType.CERTIFICATE:
        return 'SELECT 1 FROM instructor_certificates WHERE id = $1::bigint';
      case SkillSourceType.STUDENT_OUTCOME:
        return 'SELECT 1 FROM enrollments WHERE id = $1::bigint';
      default:
        throw new AppException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private ownedQuery(sourceType: SkillSourceType): string {
    switch (sourceType) {
      case SkillSourceType.STUDENT_RATING:
        return `
          SELECT COALESCE(r.updated_at, r.created_at) AS source_updated_at
          FROM reviews r
          JOIN courses c ON c.id = r.course_id
          JOIN instructor_profiles ip ON ip.user_id = c.instructor_id
          WHERE r.id = $1::bigint AND ip.id = $2 AND r.deleted_at IS NULL`;
      case SkillSourceType.LESSON_PLAN:
        return `
          SELECT COALESCE(l.updated_at, l.created_at) AS source_updated_at
          FROM lessons l
          JOIN sections s ON s.id = l.section_id
          JOIN courses c ON c.id = s.course_id
          JOIN instructor_profiles ip ON ip.user_id = c.instructor_id
          WHERE l.id = $1::bigint AND ip.id = $2 AND l.deleted_at IS NULL`;
      case SkillSourceType.CERTIFICATE:
        return `
          SELECT COALESCE(ic.updated_at, ic.created_at) AS source_updated_at
          FROM instructor_certificates ic
          JOIN instructor_profiles ip ON ip.user_id = ic.user_id
          WHERE ic.id = $1::bigint AND ip.id = $2 AND ic.deleted_at IS NULL`;
      case SkillSourceType.STUDENT_OUTCOME:
        return `
          SELECT COALESCE(e.updated_at, e.created_at) AS source_updated_at
          FROM enrollments e
          JOIN courses c ON c.id = e.course_id
          JOIN instructor_profiles ip ON ip.user_id = c.instructor_id
          WHERE e.id = $1::bigint AND ip.id = $2 AND e.deleted_at IS NULL`;
      default:
        throw new AppException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private eligibleQuery(sourceType: SkillSourceType): string {
    switch (sourceType) {
      case SkillSourceType.STUDENT_RATING:
        return `SELECT 1 FROM reviews
                WHERE id = $1::bigint AND deleted_at IS NULL
                  AND (status = 1 OR status IS NULL)`;
      case SkillSourceType.LESSON_PLAN:
        return `SELECT 1 FROM lessons
                WHERE id = $1::bigint AND deleted_at IS NULL AND status = 1`;
      case SkillSourceType.CERTIFICATE:
        return `SELECT 1 FROM instructor_certificates
                WHERE id = $1::bigint AND deleted_at IS NULL
                  AND certificate_status = 2`;
      case SkillSourceType.STUDENT_OUTCOME:
        return `SELECT 1 FROM enrollments
                WHERE id = $1::bigint AND deleted_at IS NULL
                  AND progress = 100 AND completed_at IS NOT NULL`;
      default:
        throw new AppException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
