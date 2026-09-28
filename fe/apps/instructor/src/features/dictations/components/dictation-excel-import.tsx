import React, { useRef } from "react";
import { Upload, Download } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { DictationSentence } from "../types/dictation.types";

interface DictationExcelImportProps {
  onImport: (sentences: Omit<DictationSentence, "id" | "dictationId">[]) => void;
}

export function DictationExcelImport({ onImport }: DictationExcelImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const data = [
      ["start_time", "end_time", "text", "hint"],
      [0, 5, "Hello, how are you today?", "Xin chao, ban khoe khong?"],
      [5, 10, "I am doing well, thank you.", "Toi khoe, cam on ban."],
      [10, 16, "What is your name?", "Ten ban la gi?"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 40 },
      { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "dictation_template.xlsx");
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
          toast.error("File Excel khong co du lieu!");
          return;
        }

        const headers = (data[0] || []).map((h: any) => String(h).trim().toLowerCase());
        const startTimeIdx = headers.findIndex((h: string) => h === "start_time");
        const endTimeIdx = headers.findIndex((h: string) => h === "end_time");
        const textIdx = headers.findIndex((h: string) => h === "text");
        const hintIdx = headers.findIndex((h: string) => h === "hint");

        if (startTimeIdx === -1 || endTimeIdx === -1 || textIdx === -1) {
          toast.error("File Excel phai co it nhat 3 cot: start_time, end_time, text");
          return;
        }

        const errors: string[] = [];
        const sentences: Omit<DictationSentence, "id" | "dictationId">[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const startTime = Number(row[startTimeIdx]);
          const endTime = Number(row[endTimeIdx]);
          const text = String(row[textIdx] || "").trim();
          const hint = hintIdx !== -1 ? String(row[hintIdx] || "").trim() : "";

          if (!text) {
            errors.push(`Dong ${i + 1}: noi dung text khong duoc de trong.`);
            continue;
          }
          if (isNaN(startTime) || isNaN(endTime)) {
            errors.push(`Dong ${i + 1}: start_time va end_time phai la so.`);
            continue;
          }
          if (startTime >= endTime) {
            errors.push(`Dong ${i + 1}: start_time (${startTime}) phai nho hon end_time (${endTime}).`);
            continue;
          }

          sentences.push({
            sentence: text,
            startTime,
            endTime,
            position: sentences.length + 1,
            hint: hint || null,
          });
        }

        if (errors.length > 0) {
          const msg = errors.slice(0, 5).join("\n") + (errors.length > 5 ? `\n... va ${errors.length - 5} loi khac` : "");
          toast.error(`Co ${errors.length} loi:\n${msg}`);
          if (sentences.length === 0) return;
        }

        onImport(sentences);
        toast.success(`Da nhap thanh cong ${sentences.length} cau tu Excel.`);
      } catch (error) {
        toast.error("Loi khi doc file Excel. Vui long kiem tra lai dinh dang.");
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
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls"
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 border-dashed bg-blue-50/50 hover:bg-blue-50 text-blue-600 border-blue-200"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Excel
      </Button>
      <Button
        variant="ghost"
        onClick={handleDownloadTemplate}
        className="text-xs text-muted-foreground hover:text-foreground"
        title="Tai file mau Excel"
      >
        <Download className="h-3.5 w-3.5 mr-1" />
        File mau
      </Button>
    </div>
  );
}
