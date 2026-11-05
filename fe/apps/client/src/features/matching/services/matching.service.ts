import { api } from "@/shared/lib/axios";
import type {
    LearnerProfile,
    MatchingFromAssessmentResponse,
    MatchingFromProfileResponse,
    MatchingLevelOptions,
    MatchingRequestTarget,
    MatchingResponse,
    QuizAttempt,
    QuizForm,
    QuizScorePayload,
    SelfAssessment,
    SkillOption,
    WritingAssessment,
} from "../types/matching.type";

/** Response envelope của backend: { success, data, meta }. */
interface Envelope<T> {
    success: boolean;
    data: T;
}

export const matchingService = {
    /** Catalog skill đang hoạt động để chọn mục tiêu. */
    getSkills: async (): Promise<SkillOption[]> => {
        const { data: res } =
            await api.get<Envelope<{ skills: SkillOption[] }>>(
                "/matching/skills",
            );
        return Array.isArray(res?.data?.skills) ? res.data.skills : [];
    },

    /** Gọi POST /matching/instructors — thứ tự ranking do backend trả về. */
    match: async (
        targets: MatchingRequestTarget[],
        limit = 10,
        level?: MatchingLevelOptions,
    ): Promise<MatchingResponse> => {
        const { data: res } = await api.post<Envelope<MatchingResponse>>(
            "/matching/instructors",
            {
                targets,
                limit,
                ...(level?.studentLevel
                    ? {
                          studentLevel: level.studentLevel,
                          requireLevelMatch: level.requireLevelMatch ?? false,
                      }
                    : {}),
            },
        );
        return res.data;
    },

    /** POST /student-assessment/analyze — GEC + vocab free-text, lưu assessment. */
    analyzeWriting: async (text: string): Promise<WritingAssessment> => {
        const { data: res } = await api.post<Envelope<WritingAssessment>>(
            "/student-assessment/analyze",
            { text },
        );
        return res.data;
    },

    /** GET /student-assessment/latest — null nếu chưa có assessment nào. */
    getLatestAssessment: async (): Promise<WritingAssessment | null> => {
        const { data: res } = await api.get<Envelope<WritingAssessment | null>>(
            "/student-assessment/latest",
        );
        return res?.data ?? null;
    },

    /** POST /matching/from-assessment — fit = mức đáp ứng nhu cầu từ assessment. */
    matchFromAssessment: async (payload: {
        assessmentId?: number;
        limit?: number;
        requireLevelMatch?: boolean;
    }): Promise<MatchingFromAssessmentResponse> => {
        const { data: res } = await api.post<
            Envelope<MatchingFromAssessmentResponse>
        >("/matching/from-assessment", payload);
        return res.data;
    },

    // --- Skill match 3 bước (quiz + self-assessment + profile) ---------------

    /** GET /student-assessment/quiz/form — form 30 câu cloze, không lộ đáp án. */
    getQuizForm: async (seed?: number): Promise<QuizForm> => {
        const { data: res } = await api.get<Envelope<QuizForm>>(
            "/student-assessment/quiz/form",
            seed == null ? {} : { params: { seed } },
        );
        return res.data;
    },

    /** POST /student-assessment/quiz/score — chấm + lưu (nộp thiếu vẫn hợp lệ). */
    scoreQuiz: async (payload: QuizScorePayload): Promise<QuizAttempt> => {
        const { data: res } = await api.post<Envelope<QuizAttempt>>(
            "/student-assessment/quiz/score",
            payload,
        );
        return res.data;
    },

    /** GET /student-assessment/quiz/latest — null nếu chưa làm bài nào. */
    getLatestQuiz: async (): Promise<QuizAttempt | null> => {
        const { data: res } = await api.get<Envelope<QuizAttempt | null>>(
            "/student-assessment/quiz/latest",
        );
        return res?.data ?? null;
    },

    /** POST /student-assessment/self-assessment — Bước 1 (ước lượng cá nhân). */
    saveSelfAssessment: async (band: string): Promise<SelfAssessment> => {
        const { data: res } = await api.post<Envelope<SelfAssessment>>(
            "/student-assessment/self-assessment",
            { band },
        );
        return res.data;
    },

    /** GET /student-assessment/profile — hồ sơ hợp nhất + trạng thái từng kỹ năng. */
    getLearnerProfile: async (): Promise<LearnerProfile> => {
        const { data: res } = await api.get<Envelope<LearnerProfile>>(
            "/student-assessment/profile",
        );
        return res.data;
    },

    /** POST /matching/from-profile — xếp hạng từ hồ sơ (quiz +/hoặc writing). */
    matchFromProfile: async (payload: {
        limit?: number;
        requireLevelMatch?: boolean;
    }): Promise<MatchingFromProfileResponse> => {
        const { data: res } = await api.post<
            Envelope<MatchingFromProfileResponse>
        >("/matching/from-profile", payload);
        return res.data;
    },
};
