import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

import { Button } from "@fe/components/ui/button";

import { useCreateQuiz, useUpdateQuiz, useGetQuizById, useAttachQuizToLesson } from "../hook/use-quizzes";
import { useGetCourseDetail } from "@/features/courses/hook/use-courses";
import { QuizQuestionType } from "../types/quiz.types";
import type { Quiz, QuizQuestion, QuizOption } from "../types/quiz.types";
import { getErrorMessage } from "@/shared/utils/error";

import { QuizQuestionList } from "../components/quiz-question-list";
import { QuizSettings } from "../components/quiz-settings";

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const lessonId = searchParams.get("lessonId");
  const courseId = searchParams.get("courseId");
  const isEditing = !!id;

  const { data: quizResponse, isLoading: isLoadingQuiz } = useGetQuizById(isEditing ? Number(id) : undefined);
  const { data: courseData } = useGetCourseDetail(courseId ?? undefined);

  const { mutateAsync: createQuiz, isPending: isCreating } = useCreateQuiz();
  const { mutateAsync: updateQuiz, isPending: isUpdating } = useUpdateQuiz();
  const { mutateAsync: attachToLesson, isPending: isAttaching } = useAttachQuizToLesson();

  const isSaving = isCreating || isUpdating || isAttaching;

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [passingScore, setPassingScore] = useState<number | "">(0);
  const [showAnswerAfterSubmit, setShowAnswerAfterSubmit] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (quizResponse?.data) {
      const q = quizResponse.data;
      setTitle(q.title || "");
      setDescription(q.description || "");
      setTimeLimit(q.timeLimit ?? "");
      setPassingScore(q.passingScore ?? 0);
      setShowAnswerAfterSubmit(q.showAnswerAfterSubmit ?? true);
      if (q.questions) {
        setQuestions(q.questions);
      }
    }
  }, [quizResponse]);

  const course = courseData?.data;
  let currentSection = null;
  let currentLesson = null;

  if (course?.sections && lessonId) {
    for (const section of course.sections) {
      const lesson = section.lessons?.find((l: any) => l.id === Number(lessonId));
      if (lesson) {
        currentSection = section;
        currentLesson = lesson;
        break;
      }
    }
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: QuizQuestionType.MULTIPLE_CHOICE,
        points: 1,
        position: questions.length + 1,
        options: [
          { content: "Đáp án 1", isCorrect: true, position: 1 },
          { content: "Đáp án 2", isCorrect: false, position: 2 },
        ],
      },
    ]);
  };

  const handleAddQuestions = (newQs: QuizQuestion[]) => {
    setQuestions([...questions, ...newQs]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updates };
    
    // If type changes, reset options accordingly
    if (updates.type && updates.type !== questions[index].type) {
      if (updates.type === QuizQuestionType.TRUE_FALSE) {
        newQs[index].options = [
          { content: "True", isCorrect: true, position: 1 },
          { content: "False", isCorrect: false, position: 2 },
        ];
      } else if (updates.type === QuizQuestionType.FILL_BLANK) {
        newQs[index].options = [
          { content: "", isCorrect: true, position: 1 },
        ];
      } else {
        newQs[index].options = [
          { content: "Đáp án 1", isCorrect: true, position: 1 },
          { content: "Đáp án 2", isCorrect: false, position: 2 },
        ];
      }
    }
    
    setQuestions(newQs);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateOption = (qIndex: number, oIndex: number, updates: Partial<QuizOption>) => {
    const newQs = [...questions];
    const newOptions = [...newQs[qIndex].options];
    
    if (updates.isCorrect && (newQs[qIndex].type === QuizQuestionType.MULTIPLE_CHOICE || newQs[qIndex].type === QuizQuestionType.TRUE_FALSE)) {
      newOptions.forEach(o => o.isCorrect = false);
    }
    
    newOptions[oIndex] = { ...newOptions[oIndex], ...updates };
    newQs[qIndex].options = newOptions;
    setQuestions(newQs);
  };

  const addOption = (qIndex: number) => {
    const newQs = [...questions];
    const newOptions = [...newQs[qIndex].options];
    newOptions.push({
      content: "Đáp án " + (newOptions.length + 1),
      isCorrect: false,
      position: newOptions.length + 1,
    });
    newQs[qIndex].options = newOptions;
    setQuestions(newQs);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options = newQs[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQs);
  };

  const toCourse = () => {
    if (courseId) {
      navigate(`/courses/${courseId}/content`, { state: { refresh: Date.now() } });
    } else {
      navigate(-1);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên Quiz");
      return;
    }

    if (questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 câu hỏi");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error("Câu hỏi " + (i + 1) + " không được để trống nội dung");
        return;
      }
      if (q.type !== QuizQuestionType.FILL_BLANK && !q.options.some(o => o.isCorrect)) {
        toast.error("Câu hỏi " + (i + 1) + " phải có ít nhất 1 đáp án đúng");
        return;
      }
      if (q.type === QuizQuestionType.FILL_BLANK && !q.options[0]?.content?.trim()) {
        toast.error("Câu hỏi " + (i + 1) + " dạng điền khuyết phải có đáp án");
        return;
      }
    }

    const payload: Quiz = {
      title,
      description,
      timeLimit: timeLimit === "" ? undefined : Number(timeLimit),
      passingScore: passingScore === "" ? undefined : Number(passingScore),
      showAnswerAfterSubmit,
      questions: questions.map((q, i) => ({
        ...q,
        position: i + 1,
        options: q.options.map((o, j) => ({ ...o, position: j + 1 }))
      })),
    };

    try {
      if (isEditing) {
        const tid = toast.loading("Đang cập nhật Quiz...");
        await updateQuiz({ id: Number(id), payload });
        toast.success("Đã cập nhật Quiz!", { id: tid });
        toCourse();
      } else {
        const tid = toast.loading("Đang tạo Quiz...");
        const createdQuiz = await createQuiz(payload);
        const createdQuizData = (createdQuiz as any)?.data ?? createdQuiz;
        const newQuizId = createdQuizData?.id;
        
        if (lessonId && newQuizId) {
          toast.loading("Đang gắn Quiz vào bài học...", { id: tid });
          await attachToLesson({ quizId: newQuizId, lessonId });
        }
        
        toast.success("Đã tạo Quiz thành công!", { id: tid });
        toCourse();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isEditing && isLoadingQuiz) {
    return <div className="container mx-auto py-8">Đang tải...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-md hover:bg-muted h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {isEditing ? "Chỉnh sửa Quiz" : "Tạo Quiz mới"}
            </h1>
            {course && (
              <div className="flex items-center text-sm text-muted-foreground mt-0.5 gap-2">
                <span className="truncate max-w-[200px]" title={course.title}>Khóa: {course.title}</span>
                {currentSection && (
                  <>
                    <span>/</span>
                    <span className="truncate max-w-[200px]" title={currentSection.title}>Chương: {currentSection.title}</span>
                  </>
                )}
                {currentLesson && (
                  <>
                    <span>/</span>
                    <span className="font-medium text-foreground truncate max-w-[200px]" title={currentLesson.title}>Bài học: {currentLesson.title}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>Hủy</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu Quiz"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Questions */}
        <div className="lg:col-span-2 space-y-4">
          <QuizQuestionList 
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onAddQuestions={handleAddQuestions}
            onUpdateQuestion={updateQuestion}
            onRemoveQuestion={removeQuestion}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
          />
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-4">
          <QuizSettings 
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            timeLimit={timeLimit}
            setTimeLimit={setTimeLimit}
            passingScore={passingScore}
            setPassingScore={setPassingScore}
            showAnswerAfterSubmit={showAnswerAfterSubmit}
            setShowAnswerAfterSubmit={setShowAnswerAfterSubmit}
          />
        </div>
      </div>
    </div>
  );
}
