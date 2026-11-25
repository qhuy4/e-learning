/* eslint-disable @typescript-eslint/no-require-imports */
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import {
  LISTENING_LEVELS,
  listeningForm,
  scoreListening,
} from '@/modules/student-assessment/domain/listening-assessment';
import { CloudTranscriptionService } from '@/modules/student-assessment/infrastructure/cloud-transcription.service';
import { CloudSpeakingEvaluationService } from '@/modules/student-assessment/infrastructure/cloud-speaking-evaluation.service';

const { Client } = require('pg') as { Client: new (config: object) => any };
const dotenv = require('dotenv') as {
  config(options: { path: string }): void;
};

interface ListeningRun {
  level: string;
  variant: number;
  version: string;
  groupKinds: string[];
  total: number;
  perfectScore: number;
  partialScore: number;
}

function correctOption(
  version: string,
  itemId: string,
  optionCount: number,
): number {
  for (let optionIndex = 0; optionIndex < optionCount; optionIndex += 1) {
    const score = scoreListening(version, [{ itemId, optionIndex }]);
    if (score?.rawScore === 1) return optionIndex;
  }
  throw new Error(`No correct option for ${itemId}`);
}

function waveDurationSeconds(buffer: Buffer): number {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF') return 30;
  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (chunk === 'fmt ') byteRate = buffer.readUInt32LE(offset + 16);
    if (chunk === 'data') {
      dataSize = size;
      break;
    }
    offset += 8 + size + (size % 2);
  }
  return byteRate > 0 && dataSize > 0
    ? Math.max(1, Math.round(dataSize / byteRate))
    : 30;
}

async function databaseSnapshot() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'db',
  });
  await client.connect();
  try {
    const instructors = await client.query(`
      SELECT COUNT(*)::int AS eligible,
             COUNT(*) FILTER (WHERE ip.hourly_rate = 0)::int AS free,
             COUNT(*) FILTER (WHERE ip.hourly_rate > 0)::int AS paid,
             MIN(ip.hourly_rate)::int AS min_rate,
             MAX(ip.hourly_rate)::int AS max_rate
      FROM instructor_profiles ip
      JOIN users u ON u.id = ip.user_id
      WHERE ip.approval_status = 2 AND u.role = 2 AND u.status = 1
    `);
    const courses = await client.query(`
      SELECT cefr_level_start AS level, COUNT(*)::int AS count
      FROM courses
      WHERE status = 5 AND deleted_at IS NULL
        AND jsonb_array_length(skill_codes) > 0
      GROUP BY cefr_level_start
      ORDER BY array_position(ARRAY['A1','A2','B1','B2','C1','C2'], cefr_level_start)
    `);
    return { instructors: instructors.rows[0], courses: courses.rows };
  } finally {
    await client.end();
  }
}

async function main() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  const audioDirectory = process.argv[2];
  if (!audioDirectory) {
    throw new Error('Audio directory argument is required');
  }
  const speakingLevels = (process.argv[3] ?? 'pre-A1,A1,A2,B1,B2')
    .split(',')
    .map((level) => level.trim())
    .filter(Boolean);

  const listening: ListeningRun[] = [];
  for (const level of LISTENING_LEVELS) {
    for (const variant of [0, 1]) {
      const form = listeningForm(level, variant);
      const items = form.groups.flatMap((group) => group.items);
      const answers = items.map((item) => ({
        itemId: item.itemId,
        optionIndex: correctOption(
          form.version,
          item.itemId,
          item.options.length,
        ),
      }));
      const partial = answers.map((answer, index) => ({
        ...answer,
        optionIndex:
          index < 4
            ? answer.optionIndex
            : (answer.optionIndex + 1) % (items[index]?.options.length ?? 4),
      }));
      listening.push({
        level,
        variant,
        version: form.version,
        groupKinds: form.groups.map((group) => group.kind),
        total: items.length,
        perfectScore: scoreListening(form.version, answers)?.scorePct ?? -1,
        partialScore: scoreListening(form.version, partial)?.scorePct ?? -1,
      });
    }
  }

  const config = new ConfigService(process.env);
  const transcription = new CloudTranscriptionService(config);
  const evaluation = new CloudSpeakingEvaluationService(config);
  const speaking: Array<Record<string, unknown>> = [];
  for (const level of speakingLevels) {
    const filePath = path.join(audioDirectory, `${level}.wav`);
    const audio = fs.readFileSync(filePath);
    const startedAt = Date.now();
    let stage = 'transcription';
    try {
      const transcript = await transcription.transcribe(
        audio,
        'audio/wav',
        `${level}.wav`,
      );
      const durationSeconds = waveDurationSeconds(audio);
      stage = 'evaluation';
      const result = await evaluation.evaluate(
        level,
        transcript,
        durationSeconds,
      );
      speaking.push({
        level,
        status: 'PASS',
        durationSeconds,
        latencyMs: Date.now() - startedAt,
        transcript,
        ...result,
      });
    } catch (error) {
      speaking.push({
        level,
        status: 'FAIL',
        stage,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        runAt: new Date().toISOString(),
        models: {
          transcription: transcription.model,
          evaluation: evaluation.model,
        },
        listening,
        speaking,
        database: await databaseSnapshot(),
      },
      null,
      2,
    )}\n`,
  );
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
