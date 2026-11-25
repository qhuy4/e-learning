import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchingService } from "../services/matching.service";
import type {
    MatchingFromAssessmentResponse,
    MatchingFromProfileResponse,
    MatchingLevelOptions,
    MatchingRequestTarget,
    MatchFromProfilePayload,
    ListeningAttempt,
    ListeningForm,
    ListeningScorePayload,
    SpeakingAttempt,
    SpeakingPrompt,
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
            void queryClient.invalidateQueries({
                queryKey: ["learning-roadmap"],
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
            void queryClient.invalidateQueries({
                queryKey: ["learning-roadmap"],
            });
        },
    });
};

export const useListeningForm = () =>
    useQuery({
        queryKey: ["learner-listening", "form"],
        queryFn: (): Promise<ListeningForm> =>
            matchingService.getListeningForm(),
        staleTime: Infinity,
    });

export const useLatestListening = () =>
    useQuery({
        queryKey: ["learner-listening", "latest"],
        queryFn: (): Promise<ListeningAttempt | null> =>
            matchingService.getLatestListening(),
    });

export const useScoreListening = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (
            payload: ListeningScorePayload,
        ): Promise<ListeningAttempt> => matchingService.scoreListening(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["learner-listening", "latest"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learner-profile"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learning-roadmap"],
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
            void queryClient.invalidateQueries({
                queryKey: ["learner-listening", "form"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learner-speaking", "prompt"],
            });
        },
    });
};

export const useSpeakingPrompt = () =>
    useQuery({
        queryKey: ["learner-speaking", "prompt"],
        queryFn: (): Promise<SpeakingPrompt> =>
            matchingService.getSpeakingPrompt(),
        staleTime: Infinity,
    });

export const useLatestSpeaking = () =>
    useQuery({
        queryKey: ["learner-speaking", "latest"],
        queryFn: (): Promise<SpeakingAttempt | null> =>
            matchingService.getLatestSpeaking(),
        refetchInterval: (query) => {
            const attempt = query.state.data;
            if (!attempt) return false;
            const processing =
                attempt.transcriptionStatus === "PROCESSING" ||
                attempt.assessmentStatus === "PENDING" ||
                attempt.assessmentStatus === "PROCESSING";
            return processing ? 2_500 : false;
        },
    });

export const useSubmitSpeaking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: {
            promptId: string;
            durationSeconds: number;
            blob: Blob;
        }): Promise<SpeakingAttempt> =>
            matchingService.submitSpeaking(
                input.promptId,
                input.durationSeconds,
                input.blob,
            ),
        onSuccess: (attempt) => {
            queryClient.setQueryData(["learner-speaking", "latest"], attempt);
            void queryClient.invalidateQueries({
                queryKey: ["learner-speaking", "latest"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learner-profile"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learning-roadmap"],
            });
        },
    });
};

export const useRetrySpeaking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (attemptId: number): Promise<SpeakingAttempt> =>
            matchingService.retrySpeaking(attemptId),
        onSuccess: (attempt) => {
            queryClient.setQueryData(["learner-speaking", "latest"], attempt);
            void queryClient.invalidateQueries({
                queryKey: ["learner-speaking", "latest"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learner-profile"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["learning-roadmap"],
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
        mutationFn: (
            payload: MatchFromProfilePayload,
        ): Promise<MatchingFromProfileResponse> =>
            matchingService.matchFromProfile(payload),
    });
};

export const useCourseMatches = (enabled = true) =>
    useQuery({
        queryKey: ["course-matches"],
        queryFn: matchingService.matchCourses,
        enabled,
    });

export const useRoadmap = (enabled = true) =>
    useQuery({
        queryKey: ["learning-roadmap"],
        queryFn: matchingService.getRoadmap,
        enabled,
    });

export const useGenerateRoadmap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: matchingService.generateRoadmap,
        onSuccess: (roadmap) => {
            queryClient.setQueryData(["learning-roadmap"], roadmap);
        },
    });
};

export const useReassessRoadmap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: matchingService.reassessRoadmap,
        onSuccess: (roadmap) => {
            queryClient.setQueryData(["learning-roadmap"], roadmap);
        },
    });
};
