import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { cn } from "@fe/lib/utils";

export default function DictationGuide() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-dashed">
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <Info className="h-4 w-4 shrink-0" />
          Huong dan tao Dictation
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 pb-4 space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Cac buoc thuc hien:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                <span className="font-medium text-foreground">Upload audio</span>{" "}
                - Tai file am thanh (MP3, WAV, OGG, WebM, M4A) toi da 50MB.
              </li>
              <li>
                <span className="font-medium text-foreground">Nhap noi dung tung cau</span>{" "}
                - Dung o &quot;Noi dung cau (English)&quot; de nhap van ban hoc vien can chep.
              </li>
              <li>
                <span className="font-medium text-foreground">Nhap thoi gian</span>{" "}
                - Dat <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">start_time</code> va{" "}
                <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">end_time</code> (tinh bang giay) tuong ung voi audio.
              </li>
              <li>
                <span className="font-medium text-foreground">Nhap nhanh</span>{" "}
                - Su dung{" "}
                <span className="font-medium">&quot;Dan Transcript&quot;</span> de tach tu dong tu van ban dai, hoac{" "}
                <span className="font-medium">&quot;Import Excel&quot;</span> de nhap nhieu cau roi.
              </li>
              <li>
                <span className="font-medium text-foreground">Kiem tra &amp; Submit</span>{" "}
                - Xem lai noi dung, vi tri, thoi gian roi nhan &quot;Luu Dictation&quot;.
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-foreground">Giai thich cac truong:</p>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <code className="shrink-0 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">start_time</code>
                <span>- Thoi diem bat dau cau noi trong audio (don vi: giay). Vd: 0, 5, 12...</span>
              </li>
              <li className="flex gap-2">
                <code className="shrink-0 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">end_time</code>
                <span>- Thoi diem ket thuc cau noi trong audio. Phai lon hon start_time.</span>
              </li>
              <li className="flex gap-2">
                <code className="shrink-0 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">hint</code>
                <span>- Goi y cho hoc vien (khong bat buoc). Vd: ban dich, ghi chu...</span>
              </li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
