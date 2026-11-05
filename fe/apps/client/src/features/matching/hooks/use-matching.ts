import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingService } from "../services/matching.service";
import type {
    MatchingFromAssessmentResponse,
    MatchingFromProfileResponse,
    MatchingLevelOptions,
    MatchingRequestTarget,
    QuizAttempt,
    QuizForm,
    QuizScorePayload,
    SelfAssessment,
} from "../types/matching.type";

export const useSkillCatalog = () => {
    return useQuery({
        queryKey: ["matching-skills"],
        queryFn: matchingService.getSkills,
    });
};

export const useMatching = () => {
    return useMutation({
        mutationFn: ({
            targets,
            limit,
            level,
        }: {
            targets: MatchingRequestTarget[];
            limit?: number;
            level?: MatchingLevelOptions;
        }) => matchingService.match(targets, limit, level),
    });
};

export const useAnalyzeWriting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text: string) => matchingService.analyzeWriting(text),
        onSuccess: () => {
            // Assessment mới đã được lưu — nếu không invalidate thì query "latest"
            // vẫn trả bản cũ, và màn hình hiển thị dữ liệu lỗi thời sau khi bấm
            // "Nhập lại" (setAssessment(null) sẽ rơi về bản cũ trong cache).
            void queryClient.invalidateQueries({
                queryKey: ["student-assessment", "latest"],
            });
            // Bằng chứng writing mới → hồ sơ hợp nhất (Bước 3) cũng phải tải lại.
            void queryClient.invalidateQueries({
                queryKey: ["learner-profile"],
            });
        },
    });
};

export const useLatestAssessment = (enabled = true) => {
    return useQuery({
        queryKey: ["student-assessment", "latest"],
        queryFn: matchingService.getLatestAssessment,
        enabled,
    });
};

export const useMatchFromAssessment = () => {
    return useMutation({
        mutationFn: (payload: {
            assessmentId?: number;
            limit?: number;
            requireLevelMatch?: boolean;
        }): Promise<MatchingFromAssessmentResponse> =>
            matchingService.matchFromAssessment(payload),
    });
};

// --- Skill match 3 bước -----------------------------------------------------

/** Form quiz — staleTime/gcTime Infinity: item_id đã trả lời phải luôn khớp form. */
export const useQuizForm = (enabled = true) => {
    return useQuery({
        queryKey: ["learner-quiz", "form"],
        queryFn: (): Promise<QuizForm> => matchingService.getQuizForm(),
        enabled,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

export const useLatestQuiz = (enabled = true) => {
    return useQuery({
        queryKey: ["learner-quiz", "latest"],
        queryFn: matchingService.getLatestQuiz,
        enabled,
        staleTime: 60_000,
    });
};

export const useScoreQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: QuizScorePayload): Promise<QuizAttempt> =>
            matchingService.scoreQuiz(payload),
        onSuccess: () => {
            // Bài quiz mới = bằng chứng mới → hồ sơ (profile) phải tải lại.
            void queryClient.invalidateQueries({
                queryKey: ["learner-quiz", "latest"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learner-profile"],
            });
        },
    });
};

export const useSaveSelfAssessment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (band: string): Promise<SelfAssessment> =>
            matchingService.saveSelfAssessment(band),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["learner-profile"],
            });
        },
    });
};

export const useLearnerProfile = (enabled = true) => {
    return useQuery({
        queryKey: ["learner-profile"],
        queryFn: matchingService.getLearnerProfile,
        enabled,
    });
};

export const useMatchFromProfile = () => {
    return useMutation({
        mutationFn: (payload: {
            limit?: number;
            requireLevelMatch?: boolean;
        }): Promise<MatchingFromProfileResponse> =>
            matchingService.matchFromProfile(payload),
    });
};
