import { Card, CardHeader, CardTitle, CardContent } from "@fe/components/ui/card";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Textarea } from "@fe/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fe/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@fe/components/ui/tooltip";
import { Trash2, Plus, Scissors, HelpCircle } from "lucide-react";
import type { DictationSentence } from "../types/dictation.types";
import { useState } from "react";
import { toast } from "sonner";
import { DictationExcelImport } from "./dictation-excel-import";

function FieldHint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
        }
      />
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function DictationSentenceList({ sentences, onChange }: any) {
  const [transcript, setTranscript] = useState("");

  const addSentence = () => {
    onChange([...sentences, { sentence: "", startTime: 0, endTime: 0, position: sentences.length + 1 }]);
  };

  const updateSentence = (idx: number, field: string, value: any) => {
    const next = [...sentences];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const removeSentence = (idx: number) => {
    const next = sentences.filter((_: any, i: number) => i !== idx);
    onChange(next.map((s: any, i: number) => ({ ...s, position: i + 1 })));
  };

  const handleAutoSplit = () => {
    if (!transcript.trim()) return;
    const parts = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];
    const newSentences = parts.map((p, i) => ({
      sentence: p.trim(),
      startTime: 0,
      endTime: 0,
      position: sentences.length + i + 1,
      hint: null,
    })).filter(s => s.sentence);

    onChange([...sentences, ...newSentences]);
    setTranscript("");
    toast.success(`Da tach thanh ${newSentences.length} cau.`);
  };

  const handleExcelImport = (imported: Omit<DictationSentence, "id" | "dictationId">[]) => {
    const reindexed = imported.map((s, i) => ({
      ...s,
      position: sentences.length + i + 1,
    }));
    onChange([...sentences, ...reindexed]);
  };

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle>Danh sach cau (Sentences)</CardTitle>
          <Button size="sm" onClick={addSentence}>
            <Plus className="h-4 w-4 mr-2" />
            Them cau
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex-1 overflow-y-auto space-y-6">

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Them thu cong</TabsTrigger>
              <TabsTrigger value="transcript">Dan Transcript</TabsTrigger>
              <TabsTrigger value="excel">Import Excel</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="space-y-2 bg-muted/30 p-4 rounded-lg border border-dashed mt-2">
              <Label>Phan cach boi dau cham, dau hoi, dau than</Label>
              <div className="flex gap-2">
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Vd: Hello everyone. Welcome to the class! How are you today?"
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                />
                <Button className="shrink-0 h-auto" variant="secondary" onClick={handleAutoSplit}>
                  <Scissors className="h-4 w-4 mr-2" /> Tac cau
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="excel" className="bg-muted/30 p-4 rounded-lg border border-dashed mt-2 space-y-3">
              <div className="space-y-2">
                <Label className="block">Dinh dang file Excel (cot bat buoc: start_time, end_time, text)</Label>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-3 py-1.5 text-left font-medium">start_time</th>
                        <th className="border border-border px-3 py-1.5 text-left font-medium">end_time</th>
                        <th className="border border-border px-3 py-1.5 text-left font-medium">text</th>
                        <th className="border border-border px-3 py-1.5 text-left font-medium">hint</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border px-3 py-1.5 font-mono">0</td>
                        <td className="border border-border px-3 py-1.5 font-mono">5</td>
                        <td className="border border-border px-3 py-1.5">Hello, how are you today?</td>
                        <td className="border border-border px-3 py-1.5 text-muted-foreground">Xin chao, ban khoe khong?</td>
                      </tr>
                      <tr>
                        <td className="border border-border px-3 py-1.5 font-mono">5</td>
                        <td className="border border-border px-3 py-1.5 font-mono">10</td>
                        <td className="border border-border px-3 py-1.5">I am doing well, thank you.</td>
                        <td className="border border-border px-3 py-1.5 text-muted-foreground">Toi khoe, cam on ban.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cot <code className="px-1 py-0.5 rounded bg-muted font-mono">hint</code> la tuy chon. Du lieu chi duoc preview truoc, chi luu DB khi teacher Submit.
                </p>
              </div>
              <DictationExcelImport onImport={handleExcelImport} />
            </TabsContent>

            <TabsContent value="manual" className="mt-2">
              <p className="text-xs text-muted-foreground mb-2">Nhan "Them cau" de them tung cau mot cach thu cong.</p>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            {sentences.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                Chua co cau hoi nao.
              </div>
            ) : (
              sentences.map((s: DictationSentence, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm relative group">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Noi dung cau (English) <span className="text-red-500">*</span></Label>
                        <Input
                          value={s.sentence}
                          onChange={e => updateSentence(idx, "sentence", e.target.value)}
                          placeholder="Noi dung can chep chinh ta..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/4 space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          Start time (giay) <FieldHint text="Thoi diem bat dau cau noi trong audio (giay). Vd: 0, 5, 12..." />
                        </Label>
                        <Input
                          type="number" min="0" step="1"
                          value={s.startTime}
                          onChange={e => updateSentence(idx, "startTime", Number(e.target.value))}
                        />
                      </div>
                      <div className="w-1/4 space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          End time (giay) <FieldHint text="Thoi diem ket thuc cau noi. Phai lon hon start_time." />
                        </Label>
                        <Input
                          type="number" min="0" step="1"
                          value={s.endTime}
                          onChange={e => updateSentence(idx, "endTime", Number(e.target.value))}
                        />
                      </div>
                      <div className="w-1/4 space-y-1">
                        <Label className="text-xs">Vi tri</Label>
                        <Input
                          type="number" min="1" step="1"
                          value={s.position}
                          onChange={e => updateSentence(idx, "position", Number(e.target.value))}
                        />
                      </div>
                      <div className="w-1/4 space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          Goi y (tuy chon) <FieldHint text="Goi y cho hoc vien, khong bat buoc. Vd: ban dich, ghi chu..." />
                        </Label>
                        <Input
                          value={s.hint || ""}
                          onChange={e => updateSentence(idx, "hint", e.target.value)}
                          placeholder="Vd: Ban dich tieng Viet"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSentence(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground -ml-3 -mt-3 shadow-sm border">
                    {idx + 1}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
