/** Read-only snapshot metrics for the Skill Match experiment. */
/* eslint-disable @typescript-eslint/no-require-imports */
import * as fs from 'fs';
import * as path from 'path';

const { Client } = require('pg') as {
  Client: new (config: Record<string, unknown>) => {
    connect(): Promise<void>;
    end(): Promise<void>;
    query(sql: string): Promise<{ rows: Array<Record<string, string>> }>;
  };
};

function readEnv(): Record<string, string> {
  const text = fs.readFileSync(path.resolve(__dirname, '../../.env'), 'utf8');
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/))
      .filter((match): match is RegExpMatchArray => match != null)
      .map((match) => [
        match[1],
        match[2].trim().replace(/^(['"])(.*)\1$/, '$2'),
      ]),
  );
}

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
  try {
    const result = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS users,
        (SELECT COUNT(*) FROM instructor_profiles)::int AS instructors,
        (SELECT COUNT(*) FROM instructor_profiles WHERE approval_status = 2)::int AS approved_instructors,
        (SELECT COUNT(*) FROM instructor_skill_evidences WHERE status = 'ACTIVE')::int AS active_evidence,
        (SELECT COUNT(*) FROM instructor_skill_profiles)::int AS instructor_skill_profiles,
        (SELECT COUNT(*) FROM student_quiz_attempts)::int AS quiz_attempts,
        (SELECT COUNT(*) FROM student_assessments)::int AS writing_attempts,
        (SELECT COUNT(*) FROM users u WHERE NOT EXISTS (
          SELECT 1 FROM student_assessments a WHERE a.user_id = u.id
        ))::int AS users_without_writing_assessment,
        (SELECT COUNT(*) FROM student_listening_attempts)::int AS listening_attempts,
        (SELECT COUNT(*) FROM student_speaking_attempts)::int AS speaking_attempts,
        (SELECT COUNT(*) FROM courses WHERE status = 5 AND deleted_at IS NULL)::int AS published_courses,
        (SELECT COUNT(*) FROM courses WHERE status = 5 AND deleted_at IS NULL
          AND cefr_level_start IS NOT NULL AND cefr_level_end IS NOT NULL
          AND jsonb_array_length(skill_codes) > 0)::int AS matchable_courses,
        (SELECT COUNT(*) FROM learning_roadmaps)::int AS roadmaps,
        (SELECT COUNT(*) FROM roadmap_reassessments)::int AS reassessments,
        (SELECT COUNT(*) FROM instructor_skill_profiles
          WHERE (score IS NOT NULL AND (score < 0 OR score > 1))
             OR (confidence IS NOT NULL AND (confidence < 0 OR confidence > 1)))::int AS profile_range_violations,
        (SELECT COUNT(*) FROM instructor_skill_evidences
          WHERE source_type = 'CERTIFICATE' AND status = 'ACTIVE'
            AND capability <> 'LANGUAGE')::int AS active_certificate_capability_violations,
        (SELECT COUNT(*) FROM instructor_skill_evidences
          WHERE source_type = 'CERTIFICATE' AND status <> 'ACTIVE'
            AND capability <> 'LANGUAGE')::int AS historical_certificate_capability_violations,
        (SELECT COUNT(*) FROM (
          SELECT instructor_id, skill_id, source_type, source_id
          FROM instructor_skill_evidences
          WHERE status = 'ACTIVE' AND source_id IS NOT NULL
          GROUP BY instructor_id, skill_id, source_type, source_id
          HAVING COUNT(*) > 1
        ) duplicate)::int AS duplicate_active_evidence_keys,
        (SELECT COUNT(*) FROM (
          SELECT user_id FROM learning_roadmaps
          WHERE status = 'ACTIVE' GROUP BY user_id HAVING COUNT(*) > 1
        ) duplicate)::int AS duplicate_active_roadmap_users,
        (SELECT COUNT(*) FROM learning_roadmap_stages
          WHERE array_position(ARRAY['A1','A2','B1','B2','C1','C2'], from_level)
             >= array_position(ARRAY['A1','A2','B1','B2','C1','C2'], to_level))::int AS invalid_roadmap_transitions
    `);
    const certificateBreakdown = await client.query(`
      SELECT e.status, COALESCE(e.capability, 'NULL') AS capability,
             s.category, COUNT(*)::int AS count
      FROM instructor_skill_evidences e
      JOIN instructor_skills s ON s.id = e.skill_id
      WHERE e.source_type = 'CERTIFICATE'
      GROUP BY e.status, e.capability, s.category
      ORDER BY e.status, e.capability, s.category
    `);
    process.stdout.write(
      `${JSON.stringify(
        {
          ...result.rows[0],
          certificate_capability_breakdown: certificateBreakdown.rows,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
