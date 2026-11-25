/**
 * Idempotent demo data for instructor matching.
 * Rebuilds only accounts in the demo.instructor.*@piemind.local namespace.
 */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const { Client } = require('pg') as { Client: any };

const SKILL_CODES = [
  'grammar',
  'vocabulary',
  'speaking',
  'listening',
  'writing',
  'pronunciation',
  'reading',
] as const;

const NAMES = [
  'Nguyễn Minh Anh',
  'Trần Thu Hà',
  'Lê Hoàng Nam',
  'Phạm Khánh Linh',
  'Võ Đức Huy',
  'Đặng Ngọc Mai',
  'Bùi Quang Minh',
  'Đỗ Thanh Trúc',
  'Hồ Gia Bảo',
  'Ngô Thảo Vy',
  'Dương Quốc Anh',
  'Lý Mỹ Duyên',
  'Vũ Tuấn Kiệt',
  'Mai Phương Thảo',
  'Tạ Anh Khoa',
  'Cao Bảo Ngọc',
  'Phan Nhật Minh',
  'Trịnh Kim Oanh',
  'Huỳnh Thành Đạt',
  'Lâm Nhã Uyên',
] as const;

const RATES = [
  0, 0, 0, 0, 100_000, 120_000, 140_000, 150_000, 180_000, 200_000, 220_000,
  250_000, 280_000, 300_000, 320_000, 350_000, 400_000, 450_000, 500_000,
  160_000,
] as const;

const LEVELS = [
  ['pre-A1', 'A1'],
  ['A1', 'A2'],
  ['A2', 'B1'],
  ['B1'],
  ['B1', 'B2'],
  ['B2'],
  ['B2', 'C1'],
  ['C1', 'C2'],
] as const;

const FOCUS = [
  ['grammar', 'writing'],
  ['vocabulary', 'reading'],
  ['speaking', 'pronunciation'],
  ['listening', 'speaking'],
  ['reading', 'writing'],
] as const;

const DEMO_COURSES = [
  {
    slug: 'demo-skill-match-a1',
    title: 'Demo A1 - Nền tảng tiếng Anh',
    level: 'A1',
    price: 0,
    skills: ['grammar', 'vocabulary', 'listening'],
  },
  {
    slug: 'demo-skill-match-a2',
    title: 'Demo A2 - Giao tiếp hằng ngày',
    level: 'A2',
    price: 120_000,
    skills: ['speaking', 'pronunciation', 'listening'],
  },
  {
    slug: 'demo-skill-match-b1',
    title: 'Demo B1 - Phản xạ và lưu loát',
    level: 'B1',
    price: 180_000,
    skills: ['speaking', 'listening', 'vocabulary'],
  },
  {
    slug: 'demo-skill-match-b2',
    title: 'Demo B2 - Tiếng Anh học thuật',
    level: 'B2',
    price: 250_000,
    skills: ['writing', 'reading', 'grammar'],
  },
] as const;

function readEnv(): Record<string, string> {
  const envPath = path.resolve(__dirname, '../../.env');
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) out[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

const clamp = (value: number) => Math.min(0.98, Math.max(0.5, value));

async function main() {
  const env = readEnv();
  const client = new Client({
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE || 'db',
  });
  await client.connect();

  const password = env.DEMO_INSTRUCTOR_PASSWORD || 'Demo@123';
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    await client.query('BEGIN');
    const demoInstructorIds: number[] = [];

    const skillsResult = await client.query(
      `SELECT id, code FROM instructor_skills
       WHERE is_active = TRUE AND code = ANY($1::varchar[])`,
      [SKILL_CODES],
    );
    const skillIds = new Map<string, number>(
      skillsResult.rows.map((row: { id: string; code: string }) => [
        row.code,
        Number(row.id),
      ]),
    );
    const missing = SKILL_CODES.filter((code) => !skillIds.has(code));
    if (missing.length > 0)
      throw new Error(`Missing skills: ${missing.join(', ')}`);

    for (let index = 0; index < NAMES.length; index += 1) {
      const number = String(index + 1).padStart(2, '0');
      const email = `demo.instructor.${number}@piemind.local`;
      const focus: readonly string[] = FOCUS[index % FOCUS.length];
      const teachingLevels = LEVELS[index % LEVELS.length];
      const userResult = await client.query(
        `INSERT INTO users (name, email, password, status, role, created_at, updated_at)
         VALUES ($1, $2, $3, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name, password = EXCLUDED.password, status = 1,
           role = 2, deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [NAMES[index], email, passwordHash],
      );
      const userId = Number(userResult.rows[0].id);
      demoInstructorIds.push(userId);

      const profileResult = await client.query(
        `INSERT INTO instructor_profiles (
           user_id, headline, bio, experience_years, teaching_levels,
           teaching_methods, approval_status, approved_at, total_students,
           avg_rating, hourly_rate, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5::json,$6::json,2,CURRENT_TIMESTAMP,$7,$8,$9,
                   CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET
           headline = EXCLUDED.headline, bio = EXCLUDED.bio,
           experience_years = EXCLUDED.experience_years,
           teaching_levels = EXCLUDED.teaching_levels,
           teaching_methods = EXCLUDED.teaching_methods,
           approval_status = 2, approved_at = CURRENT_TIMESTAMP,
           total_students = EXCLUDED.total_students,
           avg_rating = EXCLUDED.avg_rating, hourly_rate = EXCLUDED.hourly_rate,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [
          userId,
          `Giảng viên ${focus.join(' & ')}`,
          'Hồ sơ demo dùng để kiểm thử Skill Match của PiEMind.',
          2 + (index % 9),
          JSON.stringify(teachingLevels),
          JSON.stringify(['Thực hành theo mục tiêu', 'Phản hồi trực tiếp']),
          12 + index * 7,
          4 + (index % 10) / 10,
          RATES[index],
        ],
      );
      const profileId = Number(profileResult.rows[0].id);

      await client.query(
        'DELETE FROM instructor_skill_evidences WHERE instructor_id = $1',
        [profileId],
      );
      await client.query(
        'DELETE FROM instructor_skill_profiles WHERE instructor_id = $1',
        [profileId],
      );
      await client.query(
        'DELETE FROM instructor_availability_recurring WHERE instructor_id = $1',
        [userId],
      );

      for (
        let skillIndex = 0;
        skillIndex < SKILL_CODES.length;
        skillIndex += 1
      ) {
        const code = SKILL_CODES[skillIndex];
        const score = clamp(
          0.62 +
            ((index * 3 + skillIndex * 5) % 18) / 100 +
            (focus.includes(code) ? 0.16 : 0),
        );
        const confidence = 0.55 + ((index + skillIndex) % 4) * 0.07;
        const skillId = skillIds.get(code) as number;

        await client.query(
          `INSERT INTO instructor_skill_evidences (
             instructor_id, skill_id, source_type, source_id, score, weight,
             confidence, observed_at, extractor_version, status, verification,
             capability, metadata
           ) VALUES ($1,$2,'EXPERIENCE',$3,$4,0.5000,$5,CURRENT_TIMESTAMP,
                     'demo-seed-v1','ACTIVE','INFERRED','TEACHING',$6::jsonb)`,
          [
            profileId,
            skillId,
            `demo:${number}:${code}`,
            score,
            confidence,
            JSON.stringify({
              demo: true,
              independence_key: `demo:${number}:${code}`,
            }),
          ],
        );
        await client.query(
          `INSERT INTO instructor_skill_profiles (
             instructor_id, skill_id, score, confidence, assessment_status,
             evidence_count, independent_evidence_count, verified_ratio,
             model_version, model_kind, score_model, computed_at
           ) VALUES ($1,$2,$3,$4,'ASSESSED',1,1,0,'demo-seed-v1','heuristic',$3,
                     CURRENT_TIMESTAMP)`,
          [profileId, skillId, score, confidence],
        );
      }

      for (let slot = 0; slot < 3; slot += 1) {
        const day = (index + slot * 2) % 7;
        const startHour = 8 + ((index + slot) % 4) * 3;
        await client.query(
          `INSERT INTO instructor_availability_recurring (
             instructor_id, day_of_week, start_time, end_time, effective_from,
             is_active, created_at, updated_at
           ) VALUES ($1,$2,$3,$4,CURRENT_DATE,TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
          [
            userId,
            day,
            `${String(startHour).padStart(2, '0')}:00`,
            `${String(startHour + 2).padStart(2, '0')}:00`,
          ],
        );
      }
    }

    for (let index = 0; index < DEMO_COURSES.length; index += 1) {
      const course = DEMO_COURSES[index];
      const instructorId = demoInstructorIds[index];
      const courseResult = await client.query(
        `INSERT INTO courses (
           instructor_id, title, slug, description, level, price, status,
           published_at, cefr_level_start, cefr_level_end, skill_codes,
           created_at, updated_at, deleted_at
         ) VALUES ($1,$2,$3,$4,$5,$6,5,CURRENT_TIMESTAMP,$7,$7,$8::jsonb,
                   CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL)
         ON CONFLICT (slug) DO UPDATE SET
           instructor_id = EXCLUDED.instructor_id,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           level = EXCLUDED.level,
           price = EXCLUDED.price,
           status = 5,
           published_at = CURRENT_TIMESTAMP,
           cefr_level_start = EXCLUDED.cefr_level_start,
           cefr_level_end = EXCLUDED.cefr_level_end,
           skill_codes = EXCLUDED.skill_codes,
           deleted_at = NULL,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [
          instructorId,
          course.title,
          course.slug,
          'Khóa học demo dùng để kiểm thử matching và learning roadmap.',
          index < 2 ? 1 : 2,
          course.price,
          course.level,
          JSON.stringify(course.skills),
        ],
      );
      const courseId = Number(courseResult.rows[0].id);

      await client.query('DELETE FROM sections WHERE course_id = $1', [
        courseId,
      ]);
      const sectionResult = await client.query(
        `INSERT INTO sections (
           course_id, title, slug, description, position, is_active,
           created_at, updated_at
         ) VALUES ($1,'Nội dung chính','noi-dung-chinh',
                   'Nội dung mẫu cho kiểm thử end-to-end.',1,TRUE,
                   CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
         RETURNING id`,
        [courseId],
      );
      const sectionId = Number(sectionResult.rows[0].id);

      for (let lesson = 1; lesson <= 3; lesson += 1) {
        await client.query(
          `INSERT INTO lessons (
             section_id, title, slug, type, content, duration, position,
             published_at, status, is_preview, created_at, updated_at
           ) VALUES ($1,$2,$3,'text',$4,600,$5,CURRENT_TIMESTAMP,1,$6,
                     CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
          [
            sectionId,
            `Bài ${lesson}: ${course.level} thực hành`,
            `bai-${lesson}`,
            `Nội dung demo ${course.level}, bài ${lesson}.`,
            lesson,
            lesson === 1,
          ],
        );
      }
    }

    await client.query('COMMIT');

    const summary = await client.query(
      `SELECT COUNT(DISTINCT u.id)::int AS instructors,
              COUNT(DISTINCT u.id) FILTER (WHERE ip.hourly_rate = 0)::int AS free,
              COUNT(DISTINCT u.id) FILTER (WHERE ip.hourly_rate > 0)::int AS paid,
              COUNT(DISTINCT isp.id)::int AS skill_profiles,
              COUNT(DISTINCT ia.id)::int AS availability_slots,
              (SELECT COUNT(*) FROM courses
               WHERE slug LIKE 'demo-skill-match-%' AND deleted_at IS NULL)::int
                AS demo_courses
       FROM users u
       JOIN instructor_profiles ip ON ip.user_id = u.id
       LEFT JOIN instructor_skill_profiles isp ON isp.instructor_id = ip.id
       LEFT JOIN instructor_availability_recurring ia
         ON ia.instructor_id = u.id AND ia.deleted_at IS NULL
       WHERE u.email LIKE 'demo.instructor.%@piemind.local'`,
    );
    console.log(JSON.stringify(summary.rows[0], null, 2));
    console.log(`Demo login: demo.instructor.01@piemind.local / ${password}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
