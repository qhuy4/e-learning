import { Card, CardContent } from "@fe/components/ui/card";
import { Textarea } from "@fe/components/ui/textarea";
import { StepHeader } from "./StepHeader";

interface QuickNotesCardProps {
    instructorName: string;
    notes: string;
    onNotesChange: (value: string) => void;
}

export function QuickNotesCard({
    instructorName,
    notes,
    onNotesChange,
}: QuickNotesCardProps) {
    return (
        <Card className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <StepHeader
                step={4}
                title={
                    <>
                        Ghi chú nhanh cho giảng viên {instructorName}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            (Tùy chọn)
                        </span>
                    </>
                }
                description="Nêu rõ điều bạn quan tâm: buổi phỏng vấn sắp tới, tình huống khó, hoặc giọng bạn muốn hướng tới"
            />

            <CardContent className="px-0 pt-6">
                <Textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Chia sẻ với giảng viên điều bạn đang gặp (VD: 'Mình bị đơ khi được yêu cầu nói tự nhiên trong cuộc họp gấp' hoặc 'Đang tập giọng Anh chuẩn Anh Quốc')..."
                    className="min-h-24 rounded-xl border border-input bg-card p-3 text-sm focus-visible:ring-primary"
                />
            </CardContent>
        </Card>
    );
}
