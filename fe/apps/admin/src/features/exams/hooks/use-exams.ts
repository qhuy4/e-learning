import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examService } from "../services/exam.service";
import type {
  CreateExamDto,
  UpdateExamDto,
  CreateExamGroupMaterialDto,
  UpdateExamGroupMaterialDto,
  CreateExamQuestionDto,
  UpdateExamQuestionDto,
  ExamGroupType,
} from "../types/exam";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  deleted: () => [...examKeys.all, "deleted"] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: number) => [...examKeys.details(), id] as const,
  sections: (examId: number) => [...examKeys.detail(examId), "sections"] as const,
  questionGroups: (sectionId: number) => [...examKeys.all, "questionGroups", sectionId] as const,
  groupMaterials: (groupId: number) => [...examKeys.all, "groupMaterials", groupId] as const,
  questions: (groupId: number) => [...examKeys.all, "questions", groupId] as const,
  sectionQuestions: (sectionId: number) => [...examKeys.all, "sectionQuestions", sectionId] as const,
  options: (questionId: number) => [...examKeys.all, "options", questionId] as const,
};

export function useExams() {
  return useQuery({
    queryKey: examKeys.lists(),
    queryFn: () => examService.list(),
  });
}

/** Danh sách đề đã xóa mềm (trang "Đã xóa"). */
export function useDeletedExams() {
  return useQuery({
    queryKey: examKeys.deleted(),
    queryFn: () => examService.listDeleted(),
  });
}

/** Khôi phục đề đã xóa mềm. */
export function useRestoreExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.restore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examKeys.deleted() });
    },
  });
}

export function useExam(id: number) {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examService.getById(id),
    enabled: !!id,
  });
}

export function useExamDetail(id: number) {
  return useQuery({
    queryKey: [...examKeys.detail(id), "full"],
    queryFn: () => examService.getExamDetail(id),
    enabled: !!id,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamDto) => examService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamDto }) =>
      examService.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.id) });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examKeys.deleted() });
    },
  });
}

export function usePublishExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.publish(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(variables) });
    },
  });
}

export function useArchiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.archive(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(variables) });
    },
  });
}

export function useDuplicateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.duplicate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
}

export function useExamSections(examId: number) {
  return useQuery({
    queryKey: examKeys.sections(examId),
    queryFn: () => examService.getSections(examId),
    enabled: !!examId,
  });
}

// Group Material hooks
export function useExamGroupMaterials(groupId: number) {
  return useQuery({
    queryKey: examKeys.groupMaterials(groupId),
    queryFn: () => examService.getMaterialsByGroup(groupId),
    enabled: !!groupId,
  });
}

export function useCreateExamGroupMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data: CreateExamGroupMaterialDto }) =>
      examService.createGroupMaterial(groupId, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.groupMaterials(variables.groupId) });
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useUpdateExamGroupMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamGroupMaterialDto }) =>
      examService.updateGroupMaterial(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useDeleteExamGroupMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.removeGroupMaterial(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

// Question hooks (group-based)
export function useExamQuestions(groupId: number) {
  return useQuery({
    queryKey: examKeys.questions(groupId),
    queryFn: () => examService.getQuestionsByGroup(groupId),
    enabled: !!groupId,
  });
}

// Question hooks (section-based, direct questions)
export function useExamSectionQuestions(sectionId: number) {
  return useQuery({
    queryKey: examKeys.sectionQuestions(sectionId),
    queryFn: () => examService.getQuestionsBySection(sectionId),
    enabled: !!sectionId,
  });
}

export function useCreateExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data: CreateExamQuestionDto }) =>
      examService.createQuestion(groupId, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.questions(variables.groupId) });
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useCreateExamQuestionInSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: CreateExamQuestionDto }) =>
      examService.createQuestionInSection(sectionId, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.sectionQuestions(variables.sectionId) });
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useUpdateExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExamQuestionDto }) =>
      examService.updateQuestion(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useDeleteExamQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.removeQuestion(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useExamOptions(questionId: number) {
  return useQuery({
    queryKey: examKeys.options(questionId),
    queryFn: () => examService.getQuestionOptions(questionId),
    enabled: !!questionId,
  });
}

// Question Group hooks
export function useExamQuestionGroups(sectionId: number) {
  return useQuery({
    queryKey: examKeys.questionGroups(sectionId),
    queryFn: () => examService.getQuestionGroups(sectionId),
    enabled: !!sectionId,
  });
}

export function useCreateExamQuestionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: { groupType?: ExamGroupType; title?: string; instructions?: string; position: number } }) =>
      examService.createQuestionGroup(sectionId, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.questionGroups(variables.sectionId) });
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useUpdateExamQuestionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { groupType?: ExamGroupType; title?: string; instructions?: string; position?: number } }) =>
      examService.updateQuestionGroup(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}

export function useDeleteExamQuestionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examService.removeQuestionGroup(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
