import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { matchTopicSkill } from './skill-keywords';

/**
 * Feature extractor (Skill Scoring v2) — LỚP 2 trong kiến trúc 3 lớp:
 *   Evidence (giải thích) → Features (input ML) → Score (output).
 *
 * Mỗi (instructor, skill) 1 dòng instructor_skill_features với features
 * JSONB chuẩn hoá [0..1]. Quy tắc:
 *  - SUBJECT skill: scope = course/lesson match keyword (attribution thật).
 *  - PEDAGOGY skill: scope = TOÀN bộ course/lesson của giảng viên
 *    (đúng định nghĩa 2 skill này — không cần keyword match).
 *  - Feature KHÔNG có dữ liệu → KHÔNG ghi key (R2: aggregation loại khỏi
 *    công thức rồi chuẩn hoá lại trọng số — không ghi 0 vì 0 ≠ thiếu).
 *  - sample_size = số quan sát thật được attribution (input α-ramp model).
 */

export const FEATURE_VERSION = 'fv1';

export interface FeatureRefreshResult {
  updated: number;
}

/** scope-course row từ SQL aggregate (tách reviews/enrollments — merge trong TS) */
interface CourseReviewRow {
  course_id: string | number;
  rating_avg: number | string | null;
  rating_n: number | string;
}

interface CourseEnrollmentRow {
  course_id: string | number;
  progress_avg: number | string | null;
  enrollment_n: number | string;
  students: number | string;
  active_students: number | string;
}

interface CourseQnaRow {
  course_id: string | number;
  question_n: number | string;
  answer_n: number | string;
  median_latency_s: number | string | null;
}

interface LessonStatRow {
  lesson_id: string | number;
  watch_ratio: number | string | null;
  watch_n: number | string;
}

interface LessonQuizRow {
  lesson_id: string | number;
  quiz_pass: number | string | null;
  quiz_n: number | string;
}

interface LessonDictationRow {
  lesson_id: string | number;
  dictation_accuracy: number | string | null;
  dictation_n: number | string;
}

interface RetentionRow {
  students_total: number | string;
  students_returning: number | string;
}

interface BookingRow {
  booking_n: number | string;
  booking_confirmed: number | string;
}

interface CourseRow {
  id: string | number;
  title: string | null;
  status: number | string | null;
  categories: string | null;
}

interface LessonRow {
  id: string | number;
  title: string;
  status: number | string;
  content: string | null;
  duration: number | null;
  course_id: string | number;
}

interface SkillRow {
  id: number;
  code: string;
  category: string;
}

const n = (v: number | string | null | undefined): number =>
  v == null ? 0 : Number(v);

const f = (v: number | string | null | undefined): number | null => {
  if (v == null) return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
};

/** Trung bình có trọng số — trả null khi không có quan sát nào. */
const wavg = (items: Array<{ v: number | null; w: number }>): number | null => {
  let sum = 0;
  let weight = 0;
  for (const it of items) {
    if (it.v == null || !Number.isFinite(it.v) || it.w <= 0) continue;
    sum += it.v * it.w;
    weight += it.w;
  }
  return weight > 0 ? sum / weight : null;
};

const ratio = (num: number, den: number): number | null =>
  den > 0 ? num / den : null;

/** latency (giây) → điểm nghịch đảo [0,1]; 48h = 0. */
const latencyScore = (seconds: number | null): number | null => {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  const hours = Math.max(0, seconds / 3600);
  return 1 - Math.min(1, Math.log1p(hours) / Math.log1p(48));
};

const clamp01 = (x: number): number =>
  Math.min(1, Math.max(0, Math.round(x * 1000) / 1000));

type Features = Record<string, number>;

interface OptionalTableFlags {
  has_quiz: boolean;
  has_dictation: boolean;
}

@Injectable()
export class SkillFeatureExtractorService {
  constructor(private readonly dataSource: DataSource) {}

  async refreshForInstructor(profileId: number): Promise<FeatureRefreshResult> {
    const userRows: Array<{ user_id: number | string }> =
      await this.dataSource.query(
        'SELECT user_id FROM instructor_profiles WHERE id = $1',
        [profileId],
      );
    if (!userRows[0]) return { updated: 0 };
    const userId = Number(userRows[0].user_id);

    const [courses, lessons] = await Promise.all([
      this.loadCourses(userId),
      this.loadLessons(userId),
    ]);

    // Attribution: skill → scope (SUBJECT = match keyword, PEDAGOGY = tất cả)
    const skillRows: SkillRow[] = await this.dataSource.query(
      'SELECT id, code, category FROM instructor_skills WHERE is_active = TRUE ORDER BY display_order',
    );
    const courseIdsBySkill = new Map<string, Set<number>>();
    const lessonIdsBySkill = new Map<string, Set<number>>();
    const allCourseIds = new Set<number>();
    const allLessonIds = new Set<number>();
    for (const s of skillRows) {
      courseIdsBySkill.set(s.code, new Set());
      lessonIdsBySkill.set(s.code, new Set());
    }
    const courseText = new Map<number, string>();
    for (const c of courses) {
      const id = Number(c.id);
      allCourseIds.add(id);
      const text = `${c.title ?? ''} ${c.categories ?? ''}`;
      courseText.set(id, text);
      const skill = matchTopicSkill(text);
      if (skill) courseIdsBySkill.get(skill)?.add(id);
    }
    for (const l of lessons) {
      const id = Number(l.id);
      allLessonIds.add(id);
      const skill =
        matchTopicSkill(l.title) ??
        matchTopicSkill(courseText.get(Number(l.course_id)));
      if (skill) lessonIdsBySkill.get(skill)?.add(id);
    }
    for (const s of skillRows) {
      if (s.category !== 'PEDAGOGY') continue;
      courseIdsBySkill.set(s.code, new Set(allCourseIds));
      lessonIdsBySkill.set(s.code, new Set(allLessonIds));
    }

    // Bảng quiz/dictation là optional — module có thể chưa tạo schema
    // (synchronize: false). Thiếu bảng → feature omitted (R2), không lỗi.
    const flags = (await this.loadOptionalTableFlags())[0] ?? {
      has_quiz: false,
      has_dictation: false,
    };

    const [
      courseReviews,
      courseEnrollments,
      qnaStats,
      lessonStats,
      quizStats,
      dictationStats,
      retention,
      bookings,
    ] = await Promise.all([
      this.loadCourseReviews(userId),
      this.loadCourseEnrollments(userId),
      this.loadCourseQna(userId),
      this.loadLessonWatch(userId),
      flags.has_quiz
        ? this.loadLessonQuiz(userId)
        : Promise.resolve<LessonQuizRow[]>([]),
      flags.has_dictation
        ? this.loadLessonDictation(userId)
        : Promise.resolve<LessonDictationRow[]>([]),
      this.loadRetention(userId),
      this.loadBookings(userId),
    ]);

    // Merge reviews + enrollments theo course_id (2 query tách biệt —
    // tránh cross-join nhân đôi COUNT và GROUP BY NULL gộp nhầm)
    const statByCourse = new Map<
      number,
      Partial<CourseReviewRow & CourseEnrollmentRow>
    >();
    for (const r of courseReviews)
      statByCourse.set(Number(r.course_id), { ...r });
    for (const e of courseEnrollments) {
      const id = Number(e.course_id);
      statByCourse.set(id, { ...(statByCourse.get(id) ?? {}), ...e });
    }
    // Global features (giống nhau mọi skill — chỉ 1 lần tính)
    const globalStudents = courseEnrollments.reduce(
      (s, r) => s + n(r.students),
      0,
    );
    const globalActive = courseEnrollments.reduce(
      (s, r) => s + n(r.active_students),
      0,
    );
    const ret = retention[0];
    const globalFeatures: Features = {};
    const activeRatio = ratio(globalActive, globalStudents);
    if (activeRatio != null)
      globalFeatures.active_30d_ratio = clamp01(activeRatio);
    if (globalStudents > 0) globalFeatures.students_n = globalStudents;
    const returningRatio = ret
      ? ratio(n(ret.students_returning), n(ret.students_total))
      : null;
    if (returningRatio != null)
      globalFeatures.returning_ratio = clamp01(returningRatio);
    const bk = bookings[0];
    const bookingRate = bk
      ? ratio(n(bk.booking_confirmed), n(bk.booking_n))
      : null;
    if (bookingRate != null) globalFeatures.booking_rate = clamp01(bookingRate);
    if (bk && n(bk.booking_n) > 0) globalFeatures.booking_n = n(bk.booking_n);

    const qnaByCourse = new Map(qnaStats.map((r) => [Number(r.course_id), r]));
    const watchByLesson = new Map(
      lessonStats.map((r) => [Number(r.lesson_id), r]),
    );
    const quizByLesson = new Map(
      quizStats.map((r) => [Number(r.lesson_id), r]),
    );
    const dictByLesson = new Map(
      dictationStats.map((r) => [Number(r.lesson_id), r]),
    );

    // Upsert per (instructor, skill)
    let updated = 0;
    for (const skill of skillRows) {
      const cIds = courseIdsBySkill.get(skill.code) ?? new Set<number>();
      const lIds = lessonIdsBySkill.get(skill.code) ?? new Set<number>();
      const features: Features = { ...globalFeatures };

      // --- Courses scope: rating / completion / Q&A ---
      const courseRows: Array<Partial<CourseReviewRow & CourseEnrollmentRow>> =
        [];
      const qnaRows: CourseQnaRow[] = [];
      for (const id of cIds) {
        const r = statByCourse.get(id);
        if (r) courseRows.push(r);
        const q = qnaByCourse.get(id);
        if (q) qnaRows.push(q);
      }
      const rating = wavg(
        courseRows.map((r) => ({ v: f(r.rating_avg), w: n(r.rating_n) })),
      );
      const ratingN = courseRows.reduce((s, r) => s + n(r.rating_n), 0);
      if (rating != null && ratingN > 0) features.rating = clamp01(rating / 5);
      if (ratingN > 0) features.rating_n = ratingN;

      const completion = wavg(
        courseRows.map((r) => ({ v: f(r.progress_avg), w: n(r.enrollment_n) })),
      );
      const completionN = courseRows.reduce((s, r) => s + n(r.enrollment_n), 0);
      if (completion != null && completionN > 0)
        features.completion = clamp01(completion / 100);
      if (completionN > 0) features.completion_n = completionN;

      const questionN = qnaRows.reduce((s, r) => s + n(r.question_n), 0);
      const answerN = qnaRows.reduce((s, r) => s + n(r.answer_n), 0);
      if (questionN > 0 && answerN > 0) {
        const rate = answerN / questionN;
        features.qna_answer_rate = clamp01(rate);
        features.answered_n = answerN;
        const medians = qnaRows
          .filter((r) => r.median_latency_s != null)
          .map((r) => Number(r.median_latency_s))
          .sort((a, b) => a - b);
        const med =
          medians.length > 0 ? medians[Math.floor(medians.length / 2)] : null;
        const lat = latencyScore(med);
        if (lat != null) features.qna_latency_inv = clamp01(lat);
      }

      // --- Lessons scope: publish / content / watch / quiz / dictation ---
      const lessonRows: LessonRow[] = lessons.filter((l) =>
        lIds.has(Number(l.id)),
      );
      const lessonN = lessonRows.length;
      features.n_lessons = lessonN;
      features.n_courses = cIds.size;
      if (lessonN > 0) {
        const published = lessonRows.filter(
          (l) => Number(l.status) === 1,
        ).length;
        const deep = lessonRows.filter(
          (l) => String(l.content ?? '').length >= 200,
        ).length;
        features.publish_ratio = clamp01(published / lessonN);
        features.content_depth = clamp01(deep / lessonN);
      }

      const watchItems: LessonStatRow[] = [];
      const quizItems: LessonQuizRow[] = [];
      const dictItems: LessonDictationRow[] = [];
      for (const id of lIds) {
        const w = watchByLesson.get(id);
        if (w) watchItems.push(w);
        const q = quizByLesson.get(id);
        if (q) quizItems.push(q);
        const d = dictByLesson.get(id);
        if (d) dictItems.push(d);
      }
      const watch = wavg(
        watchItems.map((r) => ({ v: f(r.watch_ratio), w: n(r.watch_n) })),
      );
      const watchN = watchItems.reduce((s, r) => s + n(r.watch_n), 0);
      if (watch != null && watchN > 0) features.watch_ratio = clamp01(watch);
      if (watchN > 0) features.watch_n = watchN;

      const quizPass = wavg(
        quizItems.map((r) => ({ v: f(r.quiz_pass), w: n(r.quiz_n) })),
      );
      const quizN = quizItems.reduce((s, r) => s + n(r.quiz_n), 0);
      if (quizPass != null && quizN > 0) features.quiz_pass = clamp01(quizPass);
      if (quizN > 0) features.quiz_n = quizN;

      const dictAcc = wavg(
        dictItems.map((r) => ({
          v: f(r.dictation_accuracy),
          w: n(r.dictation_n),
        })),
      );
      const dictN = dictItems.reduce((s, r) => s + n(r.dictation_n), 0);
      if (dictAcc != null && dictN > 0)
        features.dictation_accuracy = clamp01(dictAcc);
      if (dictN > 0) features.dictation_n = dictN;

      // sample_size = quan sát thật attribution tới skill (α-ramp input)
      const sampleSize =
        ratingN + completionN + quizN + dictN + watchN + answerN;

      await this.upsert(profileId, Number(skill.id), features, sampleSize);
      updated += 1;
    }

    return { updated };
  }

  // ------------------------------------------------------------------
  // Loaders
  // ------------------------------------------------------------------

  private loadCourses(userId: number) {
    return this.dataSource.query<CourseRow[]>(
      `SELECT c.id, c.title, c.status,
              COALESCE(string_agg(cat.name, ' '), '') AS categories
       FROM courses c
       LEFT JOIN category_course cc ON cc.course_id = c.id
       LEFT JOIN categories cat ON cat.id = cc.category_id
       WHERE c.instructor_id = $1 AND c.deleted_at IS NULL
       GROUP BY c.id`,
      [userId],
    );
  }

  private loadLessons(userId: number) {
    return this.dataSource.query<LessonRow[]>(
      `SELECT l.id, l.title, l.status, l.content, l.duration, s.course_id
       FROM lessons l
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE c.instructor_id = $1 AND l.deleted_at IS NULL AND c.deleted_at IS NULL`,
      [userId],
    );
  }

  private loadOptionalTableFlags(): Promise<OptionalTableFlags[]> {
    return this.dataSource.query<OptionalTableFlags[]>(
      `SELECT to_regclass('public.lesson_quizzes') IS NOT NULL
              AND to_regclass('public.quiz_attempts') IS NOT NULL AS has_quiz,
              to_regclass('public.lesson_dictations') IS NOT NULL
              AND to_regclass('public.dictation_attempts') IS NOT NULL AS has_dictation`,
    );
  }

  private loadCourseReviews(userId: number) {
    return this.dataSource.query<CourseReviewRow[]>(
      `SELECT r.course_id,
              AVG(r.rating) AS rating_avg,
              COUNT(r.id) AS rating_n
       FROM reviews r
       JOIN courses c ON c.id = r.course_id
       WHERE c.instructor_id = $1
         AND r.deleted_at IS NULL
         AND (r.status = 1 OR r.status IS NULL)
       GROUP BY r.course_id`,
      [userId],
    );
  }

  private loadCourseEnrollments(userId: number) {
    return this.dataSource.query<CourseEnrollmentRow[]>(
      `SELECT e.course_id,
              AVG(e.progress) AS progress_avg,
              COUNT(e.id) AS enrollment_n,
              COUNT(DISTINCT e.user_id) AS students,
              COUNT(DISTINCT e.user_id) FILTER (
                WHERE e.last_accessed_at >= NOW() - INTERVAL '30 days'
              ) AS active_students
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE c.instructor_id = $1 AND e.deleted_at IS NULL
       GROUP BY e.course_id`,
      [userId],
    );
  }

  private loadCourseQna(userId: number) {
    return this.dataSource.query<CourseQnaRow[]>(
      `SELECT q.course_id,
              COUNT(q.id) AS question_n,
              COUNT(first_a.created_at) AS answer_n,
              PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY EXTRACT(EPOCH FROM (first_a.created_at - q.created_at))
              ) AS median_latency_s
       FROM course_questions q
       LEFT JOIN LATERAL (
         SELECT MIN(a.created_at) AS created_at
         FROM course_question_answers a
         WHERE a.question_id = q.id AND a.status = 1
       ) first_a ON TRUE
       JOIN courses c ON c.id = q.course_id
       WHERE c.instructor_id = $1
       GROUP BY q.course_id`,
      [userId],
    );
  }

  private loadLessonWatch(userId: number) {
    return this.dataSource.query<LessonStatRow[]>(
      `SELECT lp.lesson_id,
              AVG(LEAST(lp.watch_seconds::numeric / NULLIF(l.duration, 0), 1)) AS watch_ratio,
              COUNT(lp.id) AS watch_n
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE c.instructor_id = $1
       GROUP BY lp.lesson_id`,
      [userId],
    );
  }

  private loadLessonQuiz(userId: number) {
    return this.dataSource.query<LessonQuizRow[]>(
      `SELECT lq.lesson_id,
              AVG(qa.score) / 100 AS quiz_pass,
              COUNT(qa.id) AS quiz_n
       FROM lesson_quizzes lq
       JOIN quiz_attempts qa ON qa.quiz_id = lq.quiz_id
         AND qa.status = 'SUBMITTED'
       JOIN lessons l ON l.id = lq.lesson_id
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE c.instructor_id = $1
       GROUP BY lq.lesson_id`,
      [userId],
    );
  }

  private loadLessonDictation(userId: number) {
    return this.dataSource.query<LessonDictationRow[]>(
      `SELECT ld.lesson_id,
              AVG(da.accuracy) / 100 AS dictation_accuracy,
              COUNT(da.id) AS dictation_n
       FROM lesson_dictations ld
       JOIN dictation_attempts da ON da.dictation_id = ld.dictation_id
       JOIN lessons l ON l.id = ld.lesson_id
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE c.instructor_id = $1
       GROUP BY ld.lesson_id`,
      [userId],
    );
  }

  private loadRetention(userId: number) {
    return this.dataSource.query<RetentionRow[]>(
      `SELECT COUNT(*) AS students_total,
              COUNT(*) FILTER (WHERE cnt >= 2) AS students_returning
       FROM (
         SELECT e.user_id, COUNT(*) AS cnt
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE c.instructor_id = $1 AND e.deleted_at IS NULL
         GROUP BY e.user_id
       ) t`,
      [userId],
    );
  }

  private loadBookings(userId: number) {
    return this.dataSource.query<BookingRow[]>(
      `SELECT COUNT(*) AS booking_n,
              COUNT(*) FILTER (WHERE status = 2) AS booking_confirmed
       FROM bookings WHERE instructor_id = $1`,
      [userId],
    );
  }

  private async upsert(
    profileId: number,
    skillId: number,
    features: Features,
    sampleSize: number,
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO instructor_skill_features
         (instructor_id, skill_id, features, sample_size, feature_version, computed_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, NOW())
       ON CONFLICT (instructor_id, skill_id) DO UPDATE SET
         features = EXCLUDED.features,
         sample_size = EXCLUDED.sample_size,
         feature_version = EXCLUDED.feature_version,
         computed_at = NOW(),
         updated_at = NOW()`,
      [
        profileId,
        skillId,
        JSON.stringify(features),
        sampleSize,
        FEATURE_VERSION,
      ],
    );
  }
}
