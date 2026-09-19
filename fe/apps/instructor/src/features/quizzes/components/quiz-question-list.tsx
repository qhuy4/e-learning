import React from "react";
import { Plus, Trash2, GripVertical, CheckCircle2, AlignLeft, Award } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent } from "@fe/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { QuizQuestionType } from "../types/quiz.types";
import type { QuizQuestion, QuizOption } from "../types/quiz.types";
import { QuizExcelImport } from "./quiz-excel-import";

interface QuizQuestionListProps {
  questions: QuizQuestion[];
  onAddQuestion: () => void;
  onAddQuestions: (newQs: QuizQuestion[]) => void;
  onUpdateQuestion: (index: number, updates: Partial<QuizQuestion>) => void;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (qIndex: number) => void;
  onUpdateOption: (qIndex: number, oIndex: number, updates: Partial<QuizOption>) => void;
  onRemoveOption: (qIndex: number, oIndex: number) => void;
}

export function QuizQuestionList({
  questions,
  onAddQuestion,
  onAddQuestions,
  onUpdateQuestion,
  onRemoveQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: QuizQuestionListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Nội dung câu hỏi ({questions.length})</h2>
        <QuizExcelImport onImportQuestions={onAddQuestions} />
      </div>

      {questions.map((q, qIndex) => (
        <Card key={qIndex} className="relative overflow-visible border-muted-foreground/20">
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 bg-background border rounded-full shadow-sm cursor-move">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardContent className="p-5 pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Câu hỏi {qIndex + 1}
                </Label>
                <Input 
                  placeholder="Nhập nội dung câu hỏi..." 
                  value={q.question}
                  onChange={(e) => onUpdateQuestion(qIndex, { question: e.target.value })}
                  className="font-medium"
                />
              </div>
              <div className="w-[180px] shrink-0 space-y-1.5">
                <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Loại câu hỏi
                </Label>
                <Select
                  value={q.type}
                  onValueChange={(val) => onUpdateQuestion(qIndex, { type: val as QuizQuestionType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={QuizQuestionType.MULTIPLE_CHOICE}>Trắc nghiệm nhiều lựa chọn</SelectItem>
                    <SelectItem value={QuizQuestionType.TRUE_FALSE}>Đúng / Sai</SelectItem>
                    <SelectItem value={QuizQuestionType.FILL_BLANK}>Điền vào chỗ trống</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-muted-foreground hover:text-destructive mt-6"
                onClick={() => onRemoveQuestion(qIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Options section */}
            <div className="pl-2 border-l-2 border-muted space-y-3 mt-4">
              {q.type === QuizQuestionType.MULTIPLE_CHOICE && (
                <>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={opt.isCorrect ? "default" : "outline"}
                        size="icon"
                        className={"h-8 w-8 shrink-0 rounded-full " + (opt.isCorrect ? "bg-green-600 hover:bg-green-700 text-white" : "")}
                        onClick={() => onUpdateOption(qIndex, oIndex, { isCorrect: true })}
                        title="Chọn làm đáp án đúng"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Input 
                        value={opt.content}
                        onChange={(e) => onUpdateOption(qIndex, oIndex, { content: e.target.value })}
                        placeholder={"Đáp án " + (oIndex + 1)}
                        className={"h-9 " + (opt.isCorrect ? "border-green-600/50 bg-green-50/10" : "")}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => onRemoveOption(qIndex, oIndex)}
                        disabled={q.options.length <= 2}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => onAddOption(qIndex)} className="mt-2 text-xs h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Thêm đáp án
                  </Button>
                </>
              )}

              {q.type === QuizQuestionType.TRUE_FALSE && (
                <div className="flex gap-4">
                  {q.options.map((opt, oIndex) => (
                    <Button
                      key={oIndex}
                      type="button"
                      variant={opt.isCorrect ? "default" : "outline"}
                      className={"w-24 " + (opt.isCorrect ? "bg-green-600 hover:bg-green-700 text-white" : "")}
                      onClick={() => onUpdateOption(qIndex, oIndex, { isCorrect: true })}
                    >
                      {opt.content}
                    </Button>
                  ))}
                </div>
              )}

              {q.type === QuizQuestionType.FILL_BLANK && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Đáp án đúng (chính xác từng chữ)</Label>
                  <Input 
                    value={q.options[0]?.content || ""}
                    onChange={(e) => onUpdateOption(qIndex, 0, { content: e.target.value })}
                    placeholder="Nhập từ cần điền..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-muted/50">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Điểm số:</Label>
                <Input 
                  type="number" 
                  min="1"
                  className="w-20 h-8" 
                  value={q.points} 
                  onChange={(e) => onUpdateQuestion(qIndex, { points: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Giải thích thêm (tùy chọn)" 
                  className="h-8 flex-1 text-sm bg-muted/30"
                  value={q.explanation || ""}
                  onChange={(e) => onUpdateQuestion(qIndex, { explanation: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center mt-4">
        <Button 
          variant="outline" 
          className="w-full h-10 border-dashed bg-muted/30 hover:bg-muted/50"
          onClick={onAddQuestion}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm câu hỏi mới
        </Button>
      </div>
    </div>
  );
}
