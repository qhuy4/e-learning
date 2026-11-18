import { ExamGroupType } from '../../domain/enums/exam-group-type.enum';
import { QuestionType } from '../../domain/enums/question-type.enum';

/** Option của câu hỏi trắc nghiệm (body create/update question). */
export interface ExamOptionBody {
  content: string;
  isCorrect?: boolean;
  position: number;
}

/** Body tạo/cập nhật group câu hỏi trong section. */
export interface ExamGroupBody {
  groupType?: ExamGroupType;
  title?: string | null;
  instructions?: string | null;
  position?: number;
}

/** Body tạo/cập nhật câu hỏi exam (admin). */
export interface ExamQuestionBody {
  type: QuestionType;
  question: string;
  explanation?: string | null;
  points?: number;
  position?: number;
  sectionId?: number;
  groupId?: number | null;
  options?: ExamOptionBody[];
}
