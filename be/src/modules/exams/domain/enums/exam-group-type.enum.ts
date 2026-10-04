export const ExamGroupType = {
  AUDIO: 'AUDIO',
  PASSAGE: 'PASSAGE',
  IMAGE: 'IMAGE',
  CUSTOM: 'CUSTOM',
} as const;
export type ExamGroupType = (typeof ExamGroupType)[keyof typeof ExamGroupType];

export const EXAM_GROUP_TYPE_LABELS: Record<ExamGroupType, string> = {
  AUDIO: 'Conversation / Talk',
  PASSAGE: 'Reading Passage',
  IMAGE: 'Photograph / Diagram',
  CUSTOM: 'Custom Group',
};
