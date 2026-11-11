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
                step={2}
                title={
                    <>
                        Ghi chú cho giảng viên {instructorName}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            (Tùy chọn)
                        </span>
                    </>
                }
                description="Gửi trước bối cảnh hoặc mục tiêu để buổi học hiệu quả hơn."
            />

            <CardContent className="px-0 pt-6">
                <Textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Ví dụ: Mình muốn luyện giao tiếp cho buổi phỏng vấn tuần tới..."
                    className="min-h-24 rounded-xl border border-input bg-card p-3 text-sm focus-visible:ring-primary"
                />
            </CardContent>
        </Card>
    );
}
