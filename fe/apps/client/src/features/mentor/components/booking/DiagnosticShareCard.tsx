import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent } from "@fe/components/ui/card";
import { Checkbox } from "@fe/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { StepHeader } from "./StepHeader";

interface DiagnosticShareCardProps {
    mentorName: string;
    studentName: string;
    shareReport: boolean;
    onShareReportChange: (value: boolean) => void;
}

export function DiagnosticShareCard({
    mentorName,
    studentName,
    shareReport,
    onShareReportChange,
}: DiagnosticShareCardProps) {
    return (
        <Card className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <StepHeader
                step={3}
                title="Share Your AI Diagnostic Baseline"
                description={`Allows Coach ${mentorName} to review your speaking telemetry before the session`}
            />

            <CardContent className="px-0 pt-6">
                <div className="rounded-xl border border-piemind-mint bg-piemind-mint/15 p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="size-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-foreground block">
                                    Share my AI Diagnostic Report with Coach{" "}
                                    {mentorName}
                                </span>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Recommended for a personalized, data-backed
                                    15-minute diagnostic
                                </p>
                            </div>
                        </div>
                        <Checkbox
                            checked={shareReport}
                            onCheckedChange={(val) =>
                                onShareReportChange(Boolean(val))
                            }
                            className="mt-1 cursor-pointer"
                        />
                    </div>

                    {shareReport && (
                        <div className="mt-2 p-3 rounded-lg border border-border bg-card flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/20 text-primary font-bold px-2 py-0.5 text-xs rounded-full"
                                >
                                    {studentName || "Student"}
                                </Badge>
                                <span className="font-semibold text-foreground">
                                    CEFR B1 Intermediate
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-secondary" />
                                    Fluency:{" "}
                                    <strong className="text-foreground">
                                        69/100
                                    </strong>
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-accent-foreground" />
                                    Speaking:{" "}
                                    <strong className="text-foreground">
                                        54%
                                    </strong>
                                </span>
                                <span className="inline-flex items-center gap-1 text-primary font-semibold">
                                    Hesitation Alert: +1.8s delay on transitions
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
