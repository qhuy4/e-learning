import { instructorApi } from "@/shared/lib/axios";
import type {
  CreateSkillEvidenceRequest,
  EvidenceListParams,
  RefreshResult,
  SkillDetail,
  SkillEvidenceList,
  SkillRecommendations,
  SkillSummary,
} from "../types/skill.types";

export const skillProfileService = {
  async list(): Promise<SkillSummary[]> {
    const res = await instructorApi.get("/skill-profile");
    return res.data.data;
  },

  async detail(skillId: number): Promise<SkillDetail> {
    const res = await instructorApi.get(`/skill-profile/${skillId}`);
    return res.data.data;
  },

  async recommendations(): Promise<SkillRecommendations> {
    const res = await instructorApi.get("/skill-profile/recommendations");
    return res.data.data;
  },

  /** Chạy lại extractor + aggregation — AI tính lại profile */
  async refresh(): Promise<RefreshResult> {
    const res = await instructorApi.post("/skill-profile/refresh");
    return res.data.data;
  },

  async evidenceList(
    params: EvidenceListParams = {},
  ): Promise<SkillEvidenceList> {
    const res = await instructorApi.get("/skill-evidence", { params });
    return res.data.data;
  },

  /** Thêm evidence thủ công (tự đánh giá / kinh nghiệm) — AI tự tính lại điểm */
  async createEvidence(
    data: CreateSkillEvidenceRequest,
  ): Promise<{ created: boolean; skills: SkillSummary[] }> {
    const res = await instructorApi.post("/skill-evidence", data);
    return res.data.data;
  },

  /** Xóa evidence thủ công — chỉ evidence do giảng viên tự thêm */
  async deleteEvidence(
    id: number,
  ): Promise<{ deleted: boolean; skills: SkillSummary[] }> {
    const res = await instructorApi.delete(`/skill-evidence/${id}`);
    return res.data.data;
  },
};
