import React from "react";
import { Settings, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Label } from "@fe/components/ui/label";
import { Input } from "@fe/components/ui/input";
import { Checkbox } from "@fe/components/ui/checkbox";

interface QuizSettingsProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  timeLimit: number | "";
  setTimeLimit: (val: number | "") => void;
  passingScore: number | "";
  setPassingScore: (val: number | "") => void;
  showAnswerAfterSubmit: boolean;
  setShowAnswerAfterSubmit: (val: boolean) => void;
}

export function QuizSettings({
  title,
  setTitle,
  description,
  setDescription,
  timeLimit,
  setTimeLimit,
  passingScore,
  setPassingScore,
  showAnswerAfterSubmit,
  setShowAnswerAfterSubmit,
}: QuizSettingsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Cài đặt Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tên Quiz</Label>
          <Input 
            placeholder="Vd: Bài kiểm tra chương 1" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Mô tả (tùy chọn)</Label>
          <textarea 
            placeholder="Nhập mô tả ngắn cho bài kiểm tra..." 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Thời gian
            </Label>
            <div className="relative">
              <Input 
                type="number" 
                placeholder="Vd: 30" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : "")}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">phút</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-muted-foreground" />
              Điểm đạt
            </Label>
            <Input 
              type="number" 
              placeholder="Vd: 50"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value ? Number(e.target.value) : "")} 
            />
          </div>
        </div>
        
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex flex-col gap-1 cursor-pointer">
              <span>Hiện đáp án sau khi nộp</span>
              <span className="text-xs font-normal text-muted-foreground">
                Cho phép học viên xem đáp án đúng
              </span>
            </Label>
            <Checkbox 
              checked={showAnswerAfterSubmit} 
              onCheckedChange={(checked) => setShowAnswerAfterSubmit(!!checked)} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
