import { Card, CardHeader, CardTitle, CardContent } from "@fe/components/ui/card";
import { Label } from "@fe/components/ui/label";
import { Input } from "@fe/components/ui/input";
import { Textarea } from "@fe/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@fe/components/ui/select";
import { DictationLevel } from "../types/dictation.types";
import { AudioUploader } from "./audio-uploader";

export default function DictationSettings({
  title, setTitle, description, setDescription,
  audioFile, setAudioFile, audioUploading, audioProgress,
  level, setLevel, playLimit, setPlayLimit
}: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cai dat chung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Ten bai tap <span className="text-red-500">*</span></Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhap ten bai tap..." />
        </div>
        <div className="space-y-2">
          <Label>Audio <span className="text-red-500">*</span></Label>
          <AudioUploader
            value={audioFile}
            onChange={setAudioFile}
            uploading={audioUploading}
            progress={audioProgress}
          />
          <p className="text-xs text-muted-foreground">MP3, WAV, OGG, WebM, M4A - toi da 50MB.</p>
        </div>
        <div className="space-y-2">
          <Label>Muc do</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={DictationLevel.BEGINNER}>So cap (Beginner)</SelectItem>
              <SelectItem value={DictationLevel.ELEMENTARY}>Co ban (Elementary)</SelectItem>
              <SelectItem value={DictationLevel.INTERMEDIATE}>Trung cap (Intermediate)</SelectItem>
              <SelectItem value={DictationLevel.UPPER_INTERMEDIATE}>Trung cao cap (Upper Intermediate)</SelectItem>
              <SelectItem value={DictationLevel.ADVANCED}>Cao cap (Advanced)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Gioi han so lan nghe</Label>
          <Input type="number" min="1" value={playLimit} onChange={e => setPlayLimit(e.target.value)} placeholder="Vd: 3" />
          <p className="text-xs text-muted-foreground">De trong = khong gioi han so lan nghe.</p>
        </div>
        <div className="space-y-2">
          <Label>Mo ta / Huong dan</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
