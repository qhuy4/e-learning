export type SkillCategory = "SUBJECT" | "PEDAGOGY";

export type SkillSourceType =
  | "SELF_ASSESSMENT"
  | "EXPERIENCE"
  | "LESSON_PLAN"
  | "CERTIFICATE"
  | "STUDENT_RATING"
  | "STUDENT_OUTCOME";

/** skill trên dashboard / AI Skill Profile (score = null khi chưa đủ dữ liệu) */
export interface SkillSummary {
  id: number;
  code: string;
  name: string;
  category: SkillCategory;
  description: string | null;
  displayOrder: number;
  score: number | null;
  confidence: number | null;
  evidenceCount: number;
  computedAt: string | null;
}

export interface SourceDisplay {
  type: SkillSourceType;
  label: string;
  title: string | null;
  subtitle: string | null;
  value: string | null;
}

export interface SkillEvidenceItem {
  id: number;
  sourceType: SkillSourceType;
  sourceLabel: string;
  score: number;
  confidence: number;
  weight: number;
  observedAt: string;
  rationale: string | null;
  extracted: boolean;
  source: SourceDisplay | null;
}

export interface SkillEvidenceItemWithSkill extends SkillEvidenceItem {
  skillId: number;
  skillCode: string | null;
  skillName: string | null;
}

export interface SkillEvidenceList {
  items: SkillEvidenceItemWithSkill[];
  counts: Partial<Record<SkillSourceType, number>>;
}

export interface SkillDetail {
  skill: {
    id: number;
    code: string;
    name: string;
    category: SkillCategory;
    description: string | null;
  };
  score: number | null;
  confidence: number | null;
  evidenceCount: number;
  computedAt: string | null;
  reasons: string[];
  evidence: SkillEvidenceItem[];
}

export interface RecommendedSkill {
  skill: {
    id: number;
    code: string;
    name: string;
    category: SkillCategory;
  };
  score: number | null;
  confidence: number | null;
  evidenceCount: number;
}

export interface LimitedSkill extends RecommendedSkill {
  reason: string;
  actions: { type: SkillSourceType | string; label: string }[];
}

export interface SkillRecommendations {
  strengths: RecommendedSkill[];
  limited: LimitedSkill[];
}

export interface CreateSkillEvidenceRequest {
  skillId: number;
  sourceType: "SELF_ASSESSMENT" | "EXPERIENCE";
  score?: number;
  years?: number;
  confidence?: number;
  rationale?: string;
}

export interface RefreshResult {
  extracted: { created: number; superseded: number; kept: number };
  skills: SkillSummary[];
}

export interface EvidenceListParams {
  skillId?: number;
  sourceType?: SkillSourceType;
  limit?: number;
}
