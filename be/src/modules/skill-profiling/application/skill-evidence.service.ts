import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, IsNull } from 'typeorm';
import { createHash } from 'crypto';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';
import { InstructorSkillEvidenceOrmEntity } from '@/modules/skill-profiling/infrastructure/entity/instructor-skill-evidence.orm-entity';
import { SkillEvidenceStatus } from '@/modules/skill-profiling/domain/enum/skill-evidence-status.enum';
import { SkillSourceType } from '@/modules/skill-profiling/domain/enum/skill-source-type.enum';
import {
  SkillCapability,
  SkillVerification,
  VERIFICATION_WEIGHT,
} from '@/modules/skill-profiling/domain/enum/skill-verification.enum';
import { SkillCatalogRepository } from '@/modules/skill-profiling/infrastructure/repository/skill-catalog.repository';
import { SkillSourceValidator } from '@/modules/skill-profiling/infrastructure/service/skill-source-validator';
import { SKILL_AGGREGATION_CONFIG } from './skill-aggregation.config';

export interface RecordEvidenceInput {
  instructor_id: number;
  skill_id: number;
  source_type: SkillSourceType;
  source_id?: string | null;
  score: number;
  confidence: number;
  observed_at?: Date;
  extractor_version?: string;
  rationale?: string;
  verification?: SkillVerification;
  capability?: SkillCapability;
}

export interface RecordEvidenceResult {
  created: boolean;
  evidence?: InstructorSkillEvidenceOrmEntity;
}

const NULL_SOURCE_TYPES: SkillSourceType[] = [
  SkillSourceType.SELF_ASSESSMENT,
  SkillSourceType.EXPERIENCE,
];

@Injectable()
export class SkillEvidenceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly skillCatalog: SkillCatalogRepository,
    private readonly sourceValidator: SkillSourceValidator,
  ) {}

  /**
   * Append-only evidence write (supersede-on-write):
   *  - validates skill + polymorphic source existence/ownership,
   *  - snapshots the configured base weight into the row,
   *  - identical re-insert (same content hash, same extractor_version) = no-op,
   *  - changed content -> old ACTIVE rows for the same source are SUPERSEDED,
   *    then a new ACTIVE row is inserted (partial unique index only guards
   *    ACTIVE rows, so history is preserved),
   *  - runs in a transaction with a per-source advisory lock; a concurrent
   *    unique violation (23505) rolls the tx back and is reported as no-op.
   */
  async recordEvidence(
    input: RecordEvidenceInput,
  ): Promise<RecordEvidenceResult> {
    const { instructor_id, skill_id, source_type, source_id } = input;

    if (!Number.isFinite(input.score) || input.score < 0 || input.score > 1) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !Number.isFinite(input.confidence) ||
      input.confidence < 0 ||
      input.confidence > 1
    ) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    const skill = await this.skillCatalog.findActiveById(skill_id);
    if (!skill) {
      throw new AppException(ErrorCode.SKILL_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isNullSource = NULL_SOURCE_TYPES.includes(source_type);
    if (isNullSource && source_id != null) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isNullSource && !source_id) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    let sourceUpdatedAt: string | null = null;
    if (!isNullSource) {
      const resolved = await this.sourceValidator.resolve(
        source_type,
        source_id as string,
        instructor_id,
      );
      sourceUpdatedAt = resolved.source_updated_at;
    }

    const config = SKILL_AGGREGATION_CONFIG;
    const extractorVersion = input.extractor_version ?? config.extractorVersion;
    const observedAt = input.observed_at ?? new Date();
    // Dữ liệu giảng viên tự nhập là DECLARED (không tính điểm); các nguồn
    // còn lại mặc định INFERRED trừ khi caller nói rõ là VERIFIED.
    const verification =
      input.verification ??
      (source_type === SkillSourceType.SELF_ASSESSMENT ||
      source_type === SkillSourceType.EXPERIENCE
        ? SkillVerification.DECLARED
        : SkillVerification.INFERRED);
    const capability = input.capability ?? SkillCapability.TEACHING;
    const contentHash = this.contentHash({
      source_type,
      source_id: source_id ?? null,
      score: input.score,
      confidence: input.confidence,
      observed_at: observedAt,
      source_updated_at: sourceUpdatedAt,
      verification,
      capability,
    });

    try {
      return await this.dataSource.transaction(async (manager) => {
        // Serialize writers for this source key (instructor, skill, type, id).
        const lockKey = `${instructor_id}:${skill_id}:${source_type}:${source_id ?? 'null'}`;
        await manager.query(
          'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
          [lockKey],
        );

        const repo = manager.getRepository(InstructorSkillEvidenceOrmEntity);
        const where: FindOptionsWhere<InstructorSkillEvidenceOrmEntity> = {
          instructor_id,
          skill_id,
          source_type,
          source_id: source_id ?? IsNull(),
          status: SkillEvidenceStatus.ACTIVE,
        };
        const active = await repo.find({ where });

        // Idempotent no-op: same extractor_version, same content.
        const sameVersion = active.find(
          (e) => e.extractor_version === extractorVersion,
        );
        if (
          sameVersion &&
          sameVersion.metadata?.content_hash === contentHash &&
          active.length === 1
        ) {
          return { created: false, evidence: sameVersion };
        }

        // Supersede every ACTIVE row for this source (status flip only,
        // the row itself is never edited).
        for (const row of active) {
          row.status = SkillEvidenceStatus.SUPERSEDED;
          await repo.save(row);
        }

        const evidence = repo.create({
          instructor_id,
          skill_id,
          source_type,
          source_id: source_id ?? null,
          score: input.score,
          weight:
            config.baseWeights[source_type] * VERIFICATION_WEIGHT[verification],
          confidence: input.confidence,
          observed_at: observedAt,
          extractor_version: extractorVersion,
          status: SkillEvidenceStatus.ACTIVE,
          verification,
          capability,
          metadata: {
            content_hash: contentHash,
            ...(input.rationale ? { rationale: input.rationale } : {}),
          },
        });
        const saved = await repo.save(evidence);
        return { created: true, evidence: saved };
      });
    } catch (err) {
      // 23505: a concurrent writer won the unique race; our tx rolled back
      // completely (old rows still ACTIVE) so the state is consistent.
      if ((err as { code?: string })?.code === '23505') {
        return { created: false };
      }
      throw err;
    }
  }

  private contentHash(parts: {
    source_type: SkillSourceType;
    source_id: string | null;
    score: number;
    confidence: number;
    observed_at: Date;
    source_updated_at: string | null;
    verification: SkillVerification;
    capability: SkillCapability;
  }): string {
    const canonical = [
      parts.source_type,
      parts.source_id ?? '',
      parts.score,
      parts.confidence,
      parts.observed_at.toISOString(),
      parts.source_updated_at ?? '',
      parts.verification,
      parts.capability,
    ].join('|');
    return createHash('sha256').update(canonical).digest('hex');
  }
}
