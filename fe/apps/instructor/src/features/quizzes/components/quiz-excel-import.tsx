import React, { useRef } from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { QuizQuestionType } from "../types/quiz.types";
import type { QuizQuestion, QuizOption } from "../types/quiz.types";

interface QuizExcelImportProps {
  onImportQuestions: (questions: QuizQuestion[]) => void;
}

export function QuizExcelImport({ onImportQuestions }: QuizExcelImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const data = [
      ["Loại câu hỏi", "Nội dung câu hỏi", "Điểm", "Giải thích", "Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4", "Vị trí đáp án đúng"],
      ["MULTIPLE_CHOICE", "Thủ đô của Việt Nam là gì?", "1", "Hà Nội là thủ đô của VN", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", "1"],
      ["TRUE_FALSE", "Trái đất hình tròn?", "1", "", "True", "False", "", "", "1"],
      ["FILL_BLANK", "Nước ta có ... dân tộc anh em", "1", "", "54", "", "", "", "1"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const wscols = [
      { wch: 20 }, { wch: 40 }, { wch: 10 }, { wch: 30 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "quiz_template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 2) {
          toast.error("File Excel không có dữ liệu!");
          return;
        }

        const newQuestions: QuizQuestion[] = [];
        
        // Skip header row
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;

          const typeStr = String(row[0]).trim().toUpperCase();
          const questionContent = String(row[1] || "").trim();
          const points = Number(row[2]) || 1;
          const explanation = row[3] ? String(row[3]).trim() : undefined;
          
          if (!questionContent) continue;

          let type = QuizQuestionType.MULTIPLE_CHOICE;
          if (typeStr === "TRUE_FALSE") type = QuizQuestionType.TRUE_FALSE;
          else if (typeStr === "FILL_BLANK") type = QuizQuestionType.FILL_BLANK;

          const options: QuizOption[] = [];
          const correctPos = Number(row[8]) || 1;

          if (type === QuizQuestionType.MULTIPLE_CHOICE) {
            for (let j = 0; j < 4; j++) {
              const optContent = String(row[4 + j] || "").trim();
              if (optContent) {
                options.push({
                  content: optContent,
                  isCorrect: (j + 1) === correctPos,
                  position: j + 1
                });
              }
            }
            if (options.length === 0) {
               options.push({ content: "Đáp án 1", isCorrect: true, position: 1 });
            }
          } else if (type === QuizQuestionType.TRUE_FALSE) {
            options.push(
              { content: String(row[4] || "True"), isCorrect: correctPos === 1, position: 1 },
              { content: String(row[5] || "False"), isCorrect: correctPos === 2, position: 2 }
            );
          } else if (type === QuizQuestionType.FILL_BLANK) {
            options.push({
              content: String(row[4] || ""),
              isCorrect: true,
              position: 1
            });
          }

          newQuestions.push({
            question: questionContent,
            type,
            points,
            explanation,
            position: 0, // Will be reassigned later
            options
          });
        }

        onImportQuestions(newQuestions);
        toast.success(`Đã nhập thành công ${newQuestions.length} câu hỏi`);
      } catch (error) {
        toast.error("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.");
        console.error(error);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 sm:flex-none border-dashed bg-blue-50/50 hover:bg-blue-50 text-blue-600 border-blue-200"
      >
        <Upload className="h-4 w-4 mr-2" />
        Nhập Excel
      </Button>
      <Button 
        variant="ghost" 
        onClick={handleDownloadTemplate}
        className="text-xs text-muted-foreground hover:text-foreground"
        title="Tải file mẫu Excel"
      >
        <Download className="h-3.5 w-3.5 mr-1" />
        Tải file mẫu
      </Button>
    </div>
  );
}
