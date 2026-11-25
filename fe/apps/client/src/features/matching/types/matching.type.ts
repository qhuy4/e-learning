/** Skill catalog để chọn mục tiêu (GET /matching/skills). */
export interface SkillOption {
    id: number;
    code: string;
    name: string;
    category: string;
}

/** Target đã resolve của backend (weight đã chuẩn hóa). */
export interface MatchingTargetInfo {
    skillId: number;
    code: string;
    name: string;
    weight: number;
}

export interface MatchedSkill {
    skillId: number;
    name: string;
    score: number;
    confidence: number;
    /** Neutral-baseline confidence adjustment used for ranking only. */
    adjustedScore: number;
    evidenceCount: number;
    /** Tỷ trọng số bằng chứng VERIFIED (0..1) — hiển thị, không phải năng lực. */
    verifiedRatio: number;
    sources: Array<{ type: string; count: number }>;
}

export interface UnknownSkill {
    skillId: number;
    name: string;
    status: "unknown";
}

export interface RankedInstructor {
    instructor: {
        id: number;
        name: string;
        headline: string | null;
        totalStudents: number;
        avgRating: number | null;
        hourlyRate: number;
        /** Chỉ có khi match truyền studentLevel. null = chưa khai báo level. */
        teachesLevel?: boolean | null;
        /** 0 exact, 1 adjacent, >1 lệch xa, null = chưa khai báo. */
        levelDistance?: number | null;
    };
    /** Weighted mean score trên skill ĐÃ có dữ liệu (backend tính, FE chỉ hiển thị). */
    fit: number;
    /** Điểm xếp hạng tổng thể; skill thiếu dữ liệu dùng baseline trung lập 50%. */
    matchScore: number;
    /** Tỷ lệ trọng số đã biết — <1 nghĩa là thiếu dữ liệu một phần. */
    coverage: number;
    /** Weighted mean confidence — độ tin cậy dữ liệu, KHÔNG phải năng lực. */
    confidenceAvg: number;
    matchedSkills: MatchedSkill[];
    unknownSkills: UnknownSkill[];
    reasons: string[];
}

export interface InsufficientInstructor {
    instructor: { id: number; name: string; headline: string | null };
    status: "insufficient_data";
    coverage: number;
}

export interface MatchingResponse {
    targets: MatchingTargetInfo[];
    ranked: RankedInstructor[];
    insufficient: InsufficientInstructor[];
    meta: {
        eligible: number;
        rankedCount: number;
        insufficientCount: number;
        levelFilter?: {
            enabled: boolean;
            studentLevel: string;
            excludedCount: number;
        };
        priceFilter?: {
            mode: "FREE" | "PAID";
            minHourlyRate?: number;
            maxHourlyRate?: number;
            excludedCount: number;
        };
    };
}

/** Payload client gửi lên (weight thiếu → backend mặc định 1). */
export interface MatchingRequestTarget {
    skillId: number;
    weight?: number;
}

/** Tham số level — không truyền studentLevel = không dùng level. */
export interface MatchingLevelOptions {
    studentLevel?: string;
    requireLevelMatch?: boolean;
}

/** Thang CEFR dùng cho select level sinh viên. */
export const CEFR_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

// --- Writing assessment (POST /student-assessment/*) ------------------------

export type GrammarReliability = "high" | "medium" | "low" | "unavailable";

/** Một chỉnh sửa GEC. Chỉ `accepted` mới tham gia tính qualityScore. */
export interface GrammarChange {
    type: string;
    original: string;
    corrected: string;
    accepted: boolean;
    char_start?: number | null;
    char_end?: number | null;
    reject_reason?: string | null;
    chunk: number;
}

export interface AssessmentFocusTarget {
    code: string;
    weight: number;
    weightPct: number;
    reason: string;
}

export interface WritingAssessment {
    assessmentId: number;
    createdAt: string;
    cefr: {
        band: string | null;
        meanLevel: number | null;
        coverage: number | null;
        lowConfidence: boolean | null;
        bandSource: string;
        analyzedTokens: number | null;
        /** CEFR free-text là đánh giá tham khảo, không phải chứng nhận. */
        provisional: boolean;
    };
    grammar: {
        /** Mật độ edit trên 100 từ — KHÔNG phải điểm chất lượng. */
        errorSignalPer100w: number | null;
        /**
         * Grammar Quality Score heuristic 0–100 (= 100 − errorSignalPer100w).
         * KHÔNG phải accuracy đã hiệu chỉnh, KHÔNG suy ra từ confidence.
         * null = thiếu bằng chứng (model chưa chạy / bài rỗng) — không hiển thị điểm.
         */
        qualityScore: number | null;
        reliability: GrammarReliability | null;
        wordCount: number | null;
        acceptedChanges: number | null;
        rejectedChanges: number | null;
        status: string | null;
        confidence: number | null;
        /** Cả accepted lẫn rejected, tối đa 200 phần tử — chỉ `accepted` tính điểm. */
        changes: GrammarChange[];
    };
    focusTargets: AssessmentFocusTarget[];
    modelVersions: { grammar: string | null; vocab: string | null };
}

export interface NeedFitTarget {
    code: string;
    weight: number;
    weightPct: number;
    instructorMean: number | null;
}

export interface MatchingFromAssessmentResponse extends MatchingResponse {
    assessment: {
        id: number;
        cefrBand: string | null;
        createdAt: string;
        provisional: boolean;
    };
    needFit: {
        targets: NeedFitTarget[];
        weakestTarget: { code: string } | null;
        note: string;
    };
}

// --- Quiz từ vựng + hồ sơ học viên (skill match 5 bước) --------------------

/** Một câu cloze trong form quiz (đáp án không bao giờ được trả về). */
export interface QuizFormItem {
    itemId: string;
    question: string;
    options: string[];
}

export interface QuizForm {
    formSeed: number;
    instructions: string;
    items: QuizFormItem[];
}

/** Payload POST /student-assessment/quiz/score — DTO backend dùng snake_case. */
export interface QuizScorePayload {
    form_seed: number;
    responses: Array<{ item_id: string; answer: string }>;
}

export interface QuizPerBand {
    band: string;
    correct: number;
    total: number;
}

export interface QuizAttempt {
    attemptId: number;
    formSeed: number;
    total: number;
    rawScore: number;
    band: string | null;
    bandSource: string | null;
    provisionalBand: string | null;
    calibrated: boolean;
    ability: { theta: number; se: number | null } | null;
    perBand: QuizPerBand[];
    /** true = band chưa qua calibration Rasch (heuristic ≥80%/band). */
    provisional: boolean;
    modelVersion: string | null;
    createdAt: string;
    /** Chỉ có ở response quiz/score khi gửi kèm selfAssessedBand. */
    selfAssessment?: SelfAssessment | null;
}

export interface ListeningFormItem {
    itemId: string;
    question: string;
    options: string[];
}

export interface ListeningForm {
    version: string;
    level: string;
    selectionBasis: "self_assessment" | "quiz" | "default";
    instructions: string;
    source: {
        title: string;
        author: string;
        contentOrigin: string;
        frameworkTitle: string;
        frameworkUrl: string;
        alignmentNote: string;
        license: string;
    };
    groups: Array<{
        groupId: string;
        kind: "word" | "passage";
        title: string;
        speechText: string;
        audioUrl: string | null;
        items: ListeningFormItem[];
    }>;
}

export interface ListeningAttempt {
    attemptId: number;
    answered: number;
    total: number;
    rawScore: number;
    scorePct: number;
    complete: boolean;
    formVersion: string;
    level: string | null;
    createdAt: string;
}

export interface ListeningScorePayload {
    version: string;
    responses: Array<{ itemId: string; optionIndex: number }>;
}

export interface SpeakingPrompt {
    id: string;
    level: string;
    title: string;
    prompt: string;
    preparationSeconds: number;
    responseSeconds: number;
    guided: boolean;
    selectionBasis: "self_assessment" | "quiz" | "default";
}

export interface SpeakingAttempt {
    attemptId: number;
    promptId: string;
    level: string;
    durationSeconds: number;
    audioUrl: string | null;
    transcript: string | null;
    transcriptionStatus: "PROCESSING" | "COMPLETED" | "FAILED";
    transcriptionModel: string | null;
    assessmentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    grammarScore: number | null;
    vocabularyScore: number | null;
    fluencyScore: number | null;
    overallScore: number | null;
    assessmentFeedback: {
        grammar?: string;
        vocabulary?: string;
        fluency?: string;
        wordCount?: number;
        wordsPerMinute?: number;
        fillerCount?: number;
    } | null;
    assessmentModel: string | null;
    canRetry: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Bước 1 — ước lượng cá nhân, KHÔNG phải CEFR chứng nhận. */
export interface SelfAssessment {
    band: string;
    updatedAt: string;
}

export type SkillAssessmentStatus =
    "assessed" | "insufficient" | "not_assessed";

export interface LearnerSkillStatus {
    code: string;
    status: SkillAssessmentStatus;
    band: string | null;
    source: "quiz" | "writing" | "listening" | "speaking" | null;
    scorePct?: number | null;
    /** Grammar Quality Score heuristic 0–100 (null với kỹ năng khác). */
    qualityScore: number | null;
    note: string;
}

export interface LearnerProfile {
    selfAssessment: SelfAssessment | null;
    quiz: QuizAttempt | null;
    listening: ListeningAttempt | null;
    speaking: {
        attemptId: number;
        level: string;
        transcript: string | null;
        transcriptionStatus: "PROCESSING" | "COMPLETED" | "FAILED";
        assessmentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
        grammarScore: number | null;
        vocabularyScore: number | null;
        fluencyScore: number | null;
        overallScore: number | null;
        durationSeconds: number;
        createdAt: string;
    } | null;
    writing: {
        assessmentId: number;
        cefrBand: string | null;
        meanLevel: number | null;
        lowConfidence: boolean | null;
        wordCount: number | null;
        grammarReliability: string | null;
        grammarQualityScore: number | null;
        provisional: boolean;
        createdAt: string;
    } | null;
    /** Quiz band khi đủ 15 câu; writing chỉ là fallback cho hồ sơ cũ. */
    levelBand: string | null;
    levelSource: "writing" | "quiz" | null;
    skills: LearnerSkillStatus[];
}

export interface MatchingFromProfileResponse extends MatchingResponse {
    profile: {
        levelBand: string | null;
        levelSource: "writing" | "quiz" | null;
        quizBand: string | null;
        writingBand: string | null;
    };
    needFit: {
        targets: NeedFitTarget[];
        weakestTarget: { code: string } | null;
        note: string;
    };
}

export interface MatchFromProfilePayload {
    targets: MatchingRequestTarget[];
    limit?: number;
    requireLevelMatch?: boolean;
    priceMode?: "ALL" | "FREE" | "PAID";
    minHourlyRate?: number;
    maxHourlyRate?: number;
}

export interface CourseMatchesResponse {
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

export interface LearningRoadmap {
    id: number;
    currentLevel: string;
    targetLevel: string;
    status: "ACTIVE" | "SUPERSEDED" | "COMPLETED";
    revision: number;
    profileSnapshot: { focusSkills?: string[]; levelSource?: string | null };
    createdAt: string;
    canReassess: boolean;
    reassessmentState: "LOCKED_STAGE" | "NEEDS_ASSESSMENT" | "READY";
    lastReassessment: {
        previousLevel: string;
        assessedLevel: string;
        preservedStages: number;
        replacedStages: number;
        generatedStages: number;
        createdAt: string;
    } | null;
    stages: Array<{
        id: number;
        position: number;
        fromLevel: string;
        toLevel: string;
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
        startedAt: string | null;
        completedAt: string | null;
        rationale: { focusSkills?: string[]; matchedSkills?: string[] };
        course: {
            id: number;
            title: string;
            slug: string;
            price: number;
        } | null;
        instructor: { id: number; name: string } | null;
    }>;
}
