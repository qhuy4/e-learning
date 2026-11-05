import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash } from 'crypto';
import type { CertificateOcrData } from '@/modules/instructor-applications/domain/utils/extract-certificate-ocr';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import {
  SkillCapability,
  SkillVerification,
  VERIFICATION_WEIGHT,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';
import { buildCertificateLanguageEvidence } from '@/modules/skill-profiling/domain/utils/certificate-language-evidence';
import { SKILL_AGGREGATION_CONFIG } from '../skill-aggregation.config';
import { matchTopicSkill } from './skill-keywords';

interface DesiredEvidence {
  skillCode: string;
  sourceType: SkillSourceType;
  sourceId: string | null;
  score: number;
  confidence: number;
  observedAt: Date;
  rationale: string;
  contentHash: string;
  verification: SkillVerification;
  capability: SkillCapability;
  metadata: Record<string, unknown>;
}

export interface RefreshResult {
  created: number;
  superseded: number;
  kept: number;
}

interface CourseRow {
  id: string | number;
  title: string | null;
  published_at: Date | null;
  created_at: Date;
  categories: string | null;
}

interface ReviewRow {
  id: string | number;
  user_id: string | number;
  rating: number | string | null;
  created_at: Date;
  course_id: string | number;
}

interface LessonRow {
  id: string | number;
  title: string;
  status: number | string;
  content: string | null;
  updated_at: Date | null;
  created_at: Date;
  section_id: string | number;
  course_id: string | number;
  course_title: string;
}

interface CertificateRow {
  id: string | number;
  certificate_name: string;
  issuer: string | null;
  issued_at: Date | string | null;
  created_at: Date | string | null;
  reviewed_at: Date | string | null;
  ocr_raw_text: string | null;
  ocr_extracted_data: CertificateOcrData | null;
}

interface EnrollmentRow {
  id: string | number;
  progress: number | string | null;
  last_accessed_at: Date | null;
  enrolled_at: Date;
  course_id: string | number;
}

interface SkillIdRow {
  id: string | number;
  code: string;
}

interface ManualRow {
  skill_id: string | number;
  source_type: string;
}

interface ExistingRow {
  id: string | number;
  skill_id: string | number;
  source_type: SkillSourceType;
  source_id: string | null;
  metadata: { content_hash?: string } | null;
}

const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

const clamp3 = (n: number): number =>
  Math.min(1, Math.max(0, Math.round(n * 1000) / 1000));

const contentHash = (parts: unknown[]): string =>
  createHash('sha256').update(parts.join('|')).digest('hex');

function certificateIndependenceKey(cert: CertificateRow): string {
  const ocr = cert.ocr_extracted_data;
  const documentType = ocr?.document_type ?? 'UNKNOWN';
  const reportNumber = ocr?.test_report_form_number?.value
    ?.trim()
    .toUpperCase();
  const testDate = ocr?.test_date?.value?.trim() || 'undated';
  if (reportNumber) {
    return `certificate-credential:${documentType}:report:${reportNumber}:date:${testDate}`;
  }
  if (ocr?.document_image_hash) {
    return `certificate-credential:${documentType}:hash:${ocr.document_image_hash}`;
  }
  return `certificate:${cert.id}`;
}

@Injectable()
export class SkillExtractorService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * MVP: chỉ thu thập chứng chỉ đã duyệt và review từ học viên hợp lệ.
   * vào instructor_skill_evidences theo kiểu supersede-on-write:
   *  - chỉ đụng tới hàng có metadata.extracted = true (hàng tự khai
   *    của giảng viên không bị extractor xóa/sửa),
   *  - hash giữ nguyên -> giữ nguyên (idempotent),
   *  - nguồn biến mất khỏi DB -> supersede.
   */
  async refreshForInstructor(profileId: number): Promise<RefreshResult> {
    const userRows: Array<{ user_id: number | string }> =
      await this.dataSource.query(
        'SELECT user_id FROM instructor_profiles WHERE id = $1',
        [profileId],
      );
    if (!userRows[0]) return { created: 0, superseded: 0, kept: 0 };
    const userId = Number(userRows[0].user_id);

    const [reviews, certificates] = await Promise.all([
      this.loadReviews(userId),
      this.loadCertificates(userId),
    ]);

    const desired = this.buildDesired([], reviews, [], certificates, []);

    return this.sync(profileId, desired);
  }

  // ------------------------------------------------------------------
  // Loaders
  // ------------------------------------------------------------------

  private loadCourses(userId: number) {
    return this.dataSource.query<CourseRow[]>(
      `SELECT c.id, c.title, c.published_at, c.created_at,
              COALESCE(string_agg(cat.name, ' '), '') AS categories
       FROM courses c
       LEFT JOIN category_course cc ON cc.course_id = c.id
       LEFT JOIN categories cat ON cat.id = cc.category_id
       WHERE c.instructor_id = $1 AND c.deleted_at IS NULL
       GROUP BY c.id`,
      [userId],
    );
  }

  private loadReviews(userId: number) {
    return this.dataSource.query<ReviewRow[]>(
      `SELECT DISTINCT ON (r.user_id, r.course_id)
              r.id, r.user_id, r.rating, r.created_at, r.course_id
       FROM reviews r
       JOIN courses c ON c.id = r.course_id
       WHERE c.instructor_id = $1
         AND r.deleted_at IS NULL
         AND (r.status = 1 OR r.status IS NULL)
         AND EXISTS (
           SELECT 1 FROM enrollments e
           WHERE e.user_id = r.user_id AND e.course_id = r.course_id
             AND e.deleted_at IS NULL AND e.status IN (1, 2)
         )
       ORDER BY r.user_id, r.course_id, r.updated_at DESC, r.created_at DESC, r.id DESC`,
      [userId],
    );
  }

  private loadLessons(userId: number) {
    return this.dataSource.query<LessonRow[]>(
      `SELECT l.id, l.title, l.status, l.content, l.updated_at, l.created_at,
              l.section_id, c.id AS course_id, c.title AS course_title
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE c.instructor_id = $1 AND l.deleted_at IS NULL AND c.deleted_at IS NULL`,
      [userId],
    );
  }

  private loadCertificates(userId: number) {
    // `instructor_certificates` chỉ có OCR sau khi được copy lúc duyệt; với dữ
    // liệu cũ, fallback sang chứng chỉ gốc trong hồ sơ ứng tuyển. Ưu tiên hàng
    // đã có OCR (hàng upload lại sau có thể vẫn đang pending).
    return this.dataSource.query<CertificateRow[]>(
      `SELECT ic.id, ic.certificate_name, ic.issuer, ic.issued_at, ic.created_at,
              ic.reviewed_at,
              COALESCE(ic.ocr_raw_text, ac.ocr_raw_text) AS ocr_raw_text,
              COALESCE(ic.ocr_extracted_data, ac.ocr_extracted_data) AS ocr_extracted_data
       FROM instructor_certificates ic
       LEFT JOIN LATERAL (
         SELECT aic.ocr_raw_text, aic.ocr_extracted_data
         FROM instructor_applications ia
         JOIN instructor_application_certificates aic
           ON aic.application_id = ia.id
         WHERE ia.user_id = ic.user_id
           AND aic.certificate_name = ic.certificate_name
           AND aic.issued_at IS NOT DISTINCT FROM ic.issued_at
         ORDER BY (aic.ocr_extracted_data IS NOT NULL) DESC, aic.id DESC
         LIMIT 1
       ) ac ON TRUE
       WHERE ic.user_id = $1 AND ic.deleted_at IS NULL AND ic.certificate_status = 2
         AND (ic.expires_at IS NULL OR ic.expires_at >= CURRENT_DATE)`,
      [userId],
    );
  }

  private loadEnrollments(userId: number) {
    return this.dataSource.query<EnrollmentRow[]>(
      `SELECT e.id, e.progress, e.last_accessed_at, e.enrolled_at, e.course_id
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE c.instructor_id = $1 AND e.deleted_at IS NULL`,
      [userId],
    );
  }

  // ------------------------------------------------------------------
  // Desired set
  // ------------------------------------------------------------------

  private buildDesired(
    courses: CourseRow[],
    reviews: ReviewRow[],
    lessons: LessonRow[],
    certificates: CertificateRow[],
    enrollments: EnrollmentRow[],
  ): DesiredEvidence[] {
    const courseById = new Map<number, { text: string; title: string }>();
    for (const c of courses) {
      const id = Number(c.id);
      const text = `${c.title ?? ''} ${c.categories ?? ''}`;
      courseById.set(id, { text, title: c.title ?? '' });
    }

    const desired = new Map<string, DesiredEvidence>();
    const push = (
      skillCode: string | null,
      sourceType: SkillSourceType,
      sourceId: string | null,
      score: number,
      confidence: number,
      observedAt: Date | null | undefined,
      rationale: string,
      options?: {
        verification?: SkillVerification;
        capability?: SkillCapability;
        metadata?: Record<string, unknown>;
      },
    ) => {
      if (!skillCode || !observedAt) return;
      // Không bao giờ chấp nhận epoch/Invalid (new Date(null) → 1970-01-01):
      // decay theo tuổi sẽ ≈ 0 và làm confidence sai lệch.
      if (!Number.isFinite(observedAt.getTime()) || observedAt.getTime() <= 0)
        return;
      const score3 = clamp3(score);
      const conf3 = clamp3(confidence);
      const verification = options?.verification ?? SkillVerification.INFERRED;
      const capability = options?.capability ?? SkillCapability.TEACHING;
      const metadata = options?.metadata ?? {};
      const key = `${skillCode}|${sourceType}|${sourceId ?? 'null'}`;
      desired.set(key, {
        skillCode,
        sourceType,
        sourceId,
        score: score3,
        confidence: conf3,
        observedAt,
        rationale,
        verification,
        capability,
        metadata,
        contentHash: contentHash([
          skillCode,
          sourceType,
          sourceId ?? 'null',
          String(score3),
          String(conf3),
          observedAt.toISOString(),
          verification,
          capability,
          JSON.stringify(metadata),
        ]),
      });
    };

    // 1. STUDENT_RATING — mỗi đánh giá; không khớp chủ đề -> instructional_clarity
    for (const r of reviews) {
      const course = courseById.get(Number(r.course_id));
      const rating = Number(r.rating ?? 0);
      push(
        'instructional_clarity',
        SkillSourceType.STUDENT_RATING,
        String(r.id),
        rating / 5,
        0.9,
        r.created_at,
        `Đánh giá ${rating}/5 cho khóa "${course?.title ?? ''}"`,
        {
          metadata: {
            course_id: Number(r.course_id),
            topic_skill: matchTopicSkill(course?.text),
            independence_key: `review-student:${r.user_id}`,
          },
        },
      );
    }

    // 2. STUDENT_OUTCOME — mỗi enrollment; không khớp chủ đề -> student_engagement
    for (const e of enrollments) {
      const course = courseById.get(Number(e.course_id));
      const progress = Number(e.progress ?? 0);
      push(
        'student_engagement',
        SkillSourceType.STUDENT_OUTCOME,
        String(e.id),
        progress / 100,
        0.8,
        e.last_accessed_at ?? e.enrolled_at,
        `Học viên tiến độ ${progress}% khóa "${course?.title ?? ''}"`,
        {
          metadata: {
            course_id: Number(e.course_id),
            topic_skill: matchTopicSkill(course?.text),
            independence_key: `outcome-course:${e.course_id}`,
          },
        },
      );
    }

    // 3. LESSON_PLAN — bài học; khớp theo tên bài trước, rồi tên khóa; không khớp -> bỏ qua
    for (const l of lessons) {
      const course = courseById.get(Number(l.course_id));
      const published = Number(l.status) === 1;
      const contentLen = String(l.content ?? '').length;
      // Draft content is not eligible evidence. Published content is evidence
      // of relevant teaching activity, not proof of teaching effectiveness.
      if (!published) continue;
      const score = contentLen >= 200 ? 0.7 : 0.6;
      push(
        'instructional_clarity',
        SkillSourceType.LESSON_PLAN,
        String(l.id),
        score,
        0.75,
        l.updated_at ?? l.created_at,
        `Bài học "${l.title}" — khóa "${course?.title ?? ''}" (đã xuất bản; bằng chứng hoạt động, không tự chứng minh chất lượng)`,
        {
          metadata: {
            course_id: Number(l.course_id),
            topic_skill:
              matchTopicSkill(l.title) ?? matchTopicSkill(course?.text),
            independence_key: `lesson-course:${l.course_id}`,
          },
        },
      );
    }

    // 4. CERTIFICATE — chỉ chứng chỉ đã duyệt và có dữ liệu OCR mới sinh
    //    bằng chứng NGÔN NGỮ (trực tiếp hoặc suy luận). Chứng chỉ ngôn ngữ
    //    KHÔNG suy ra năng lực sư phạm; không có OCR -> không sinh evidence.
    for (const cert of certificates) {
      const drafts = buildCertificateLanguageEvidence({
        ocr: cert.ocr_extracted_data,
        certificateId: Number(cert.id),
        // Test data có thể sai ngày thi; dùng mốc duyệt/upload ổn định cho
        // time-decay, còn ngày thi OCR chỉ hiển thị trên UI để đối soát.
        observedAt: new Date(cert.reviewed_at ?? cert.created_at ?? 0),
      });
      for (const draft of drafts) {
        push(
          draft.skillCode,
          SkillSourceType.CERTIFICATE,
          String(cert.id),
          draft.score,
          draft.confidence,
          draft.observedAt,
          draft.rationale,
          {
            verification: draft.verification,
            capability: draft.capability,
            metadata: {
              ...draft.metadata,
              independence_key: certificateIndependenceKey(cert),
            },
          },
        );
      }
    }

    // 5. EXPERIENCE — theo skill chủ đề, suy ra từ khóa học sớm nhất; source_id NULL
    let earliestCourse: Date | null = null;
    let courseCount = 0;
    for (const c of courses) {
      const ts = new Date(c.published_at ?? c.created_at).getTime();
      if (!Number.isFinite(ts) || ts <= 0) continue;
      if (!earliestCourse || ts < earliestCourse.getTime())
        earliestCourse = new Date(ts);
      courseCount += 1;
    }
    if (earliestCourse) {
      const years = Math.max(
        0,
        Math.floor((Date.now() - earliestCourse.getTime()) / MS_PER_YEAR),
      );
      push(
        'instructional_clarity',
        SkillSourceType.EXPERIENCE,
        null,
        Math.min(years / 5, 1),
        Math.min(0.5 + 0.09 * years, 0.95),
        earliestCourse,
        `${years} năm hoạt động giảng dạy (${courseCount} khóa học)`,
        {
          metadata: { independence_key: 'platform-teaching-experience' },
        },
      );
    }

    return [...desired.values()];
  }

  // ------------------------------------------------------------------
  // Sync (transaction + advisory lock)
  // ------------------------------------------------------------------

  private async sync(
    profileId: number,
    desired: DesiredEvidence[],
  ): Promise<RefreshResult> {
    let created = 0;
    let superseded = 0;
    let kept = 0;

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`extractor:${profileId}`],
      );

      const skillRows: SkillIdRow[] = await manager.query(
        'SELECT id, code FROM instructor_skills WHERE is_active = TRUE',
      );
      const localCodeToId = new Map<string, number>(
        skillRows.map((r) => [r.code, Number(r.id)] as [string, number]),
      );

      // Hàng tự khai (không phải extractor) giữ nguyên — extractor không đụng.
      const manualRows: ManualRow[] = await manager.query(
        `SELECT skill_id, source_type
         FROM instructor_skill_evidences
         WHERE instructor_id = $1 AND status = 'ACTIVE' AND source_id IS NULL
           AND (metadata ->> 'extracted') IS DISTINCT FROM 'true'`,
        [profileId],
      );
      const manualKeys = new Set(
        manualRows.map((r) => `${r.skill_id}|${r.source_type}`),
      );

      const existingRows: ExistingRow[] = await manager.query(
        `SELECT id, skill_id, source_type, source_id, metadata
         FROM instructor_skill_evidences
         WHERE instructor_id = $1 AND status = 'ACTIVE'
           AND (metadata ->> 'extracted') = 'true'`,
        [profileId],
      );
      const existingByKey = new Map<string, ExistingRow[]>();
      for (const row of existingRows) {
        const key = `${row.skill_id}|${row.source_type}|${row.source_id ?? 'null'}`;
        const bucket = existingByKey.get(key);
        if (bucket) bucket.push(row);
        else existingByKey.set(key, [row]);
      }

      const desiredKeySet = new Set<string>();
      const toSupersede: string[] = [];

      for (const d of desired) {
        const skillId = localCodeToId.get(d.skillCode);
        if (skillId == null) continue;
        const key = `${skillId}|${d.sourceType}|${d.sourceId ?? 'null'}`;
        if (
          d.sourceId == null &&
          manualKeys.has(`${skillId}|${d.sourceType}`)
        ) {
          continue; // giảng viên đã tự khai loại này — ưu tiên hàng thủ công
        }
        desiredKeySet.add(key);

        const bucket = existingByKey.get(key) ?? [];
        const match = bucket.find(
          (r) => r.metadata?.content_hash === d.contentHash,
        );
        // Row cũ (hash khác) phải SUPERSEDED TRƯỚC khi INSERT row mới —
        // unique (…, extractor_version) WHERE ACTIVE sẽ chặn insert khi
        // row cũ còn ACTIVE.
        const stale = bucket.filter((r) => r !== match);
        if (stale.length > 0) {
          const res: { rowCount?: number } = await manager.query(
            `UPDATE instructor_skill_evidences
             SET status = 'SUPERSEDED'
             WHERE id = ANY($1::bigint[]) AND status = 'ACTIVE'`,
            [stale.map((r) => String(r.id))],
          );
          superseded += Number(res?.rowCount ?? stale.length);
        }
        if (match) {
          kept += 1;
          continue;
        }

        await manager.query(
          `INSERT INTO instructor_skill_evidences
             (instructor_id, skill_id, source_type, source_id, score, weight,
              confidence, observed_at, extractor_version, status, metadata,
              verification, capability)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', $10, $11, $12)`,
          [
            profileId,
            skillId,
            d.sourceType,
            d.sourceId,
            d.score,
            SKILL_AGGREGATION_CONFIG.baseWeights[d.sourceType] *
              VERIFICATION_WEIGHT[d.verification],
            d.confidence,
            d.observedAt,
            SKILL_AGGREGATION_CONFIG.extractorVersion,
            {
              content_hash: d.contentHash,
              rationale: d.rationale,
              extracted: true,
              extractor_version: SKILL_AGGREGATION_CONFIG.extractorVersion,
              ...d.metadata,
            },
            d.verification,
            d.capability,
          ],
        );
        created += 1;
      }

      // Nguồn đã biến mất (khóa học xóa, review ẩn...) -> supersede
      for (const [key, bucket] of existingByKey) {
        if (desiredKeySet.has(key)) continue;
        for (const r of bucket) toSupersede.push(String(r.id));
      }

      if (toSupersede.length > 0) {
        const res: { rowCount?: number } = await manager.query(
          `UPDATE instructor_skill_evidences
           SET status = 'SUPERSEDED'
           WHERE id = ANY($1::bigint[]) AND status = 'ACTIVE'`,
          [toSupersede],
        );
        superseded += Number(res?.rowCount ?? toSupersede.length);
      }
    });

    return { created, superseded, kept };
  }
}
