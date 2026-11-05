import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { skillProfileService } from "../services/skill-profile.service";
import type { EvidenceListParams } from "../types/skill.types";

const SKILL_KEYS = {
  profile: ["skill-profile"],
  detail: (id: number) => ["skill-detail", id],
  history: (id: number) => ["skill-history", id],
  recommendations: ["skill-recommendations"],
  evidence: (params: EvidenceListParams) => ["skill-evidence", params],
} as const;

/** Invalidate mọi query liên quan — evidence đổi → score đổi */
function useInvalidateSkillData() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: SKILL_KEYS.profile });
    qc.invalidateQueries({ queryKey: SKILL_KEYS.recommendations });
    qc.invalidateQueries({ queryKey: ["skill-detail"] });
    qc.invalidateQueries({ queryKey: ["skill-evidence"] });
  };
}

export function useSkillProfile() {
  return useQuery({
    queryKey: SKILL_KEYS.profile,
    queryFn: skillProfileService.list,
  });
}

export function useSkillDetail(skillId: number | null) {
  return useQuery({
    queryKey: SKILL_KEYS.detail(skillId ?? 0),
    queryFn: () => skillProfileService.detail(skillId as number),
    enabled: skillId != null,
  });
}

export function useSkillHistory(skillId: number | null) {
  return useQuery({
    queryKey: SKILL_KEYS.history(skillId ?? 0),
    queryFn: () => skillProfileService.history(skillId as number),
    enabled: skillId != null,
  });
}

export function useSkillRecommendations() {
  return useQuery({
    queryKey: SKILL_KEYS.recommendations,
    queryFn: skillProfileService.recommendations,
  });
}

export function useDismissSkillRecommendation() {
  const invalidate = useInvalidateSkillData();
  return useMutation({
    mutationFn: skillProfileService.dismissRecommendation,
    onSuccess: invalidate,
  });
}

export function useSkillEvidence(params: EvidenceListParams = {}) {
  return useQuery({
    queryKey: SKILL_KEYS.evidence(params),
    queryFn: () => skillProfileService.evidenceList(params),
  });
}

export function useRefreshSkillProfile() {
  const invalidate = useInvalidateSkillData();
  return useMutation({
    mutationFn: skillProfileService.refresh,
    onSuccess: invalidate,
  });
}

export function useCreateSkillEvidence() {
  const invalidate = useInvalidateSkillData();
  return useMutation({
    mutationFn: skillProfileService.createEvidence,
    onSuccess: invalidate,
  });
}

export function useDeleteSkillEvidence() {
  const invalidate = useInvalidateSkillData();
  return useMutation({
    mutationFn: skillProfileService.deleteEvidence,
    onSuccess: invalidate,
  });
}
