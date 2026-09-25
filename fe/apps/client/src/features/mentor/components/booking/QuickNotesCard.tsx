import { Card, CardContent } from "@fe/components/ui/card";
import { Textarea } from "@fe/components/ui/textarea";
import { StepHeader } from "./StepHeader";

interface QuickNotesCardProps {
    mentorName: string;
    notes: string;
    onNotesChange: (value: string) => void;
}

export function QuickNotesCard({
    mentorName,
    notes,
    onNotesChange,
}: QuickNotesCardProps) {
    return (
        <Card className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <StepHeader
                step={4}
                title={
                    <>
                        Quick Notes for Coach {mentorName}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                            (Optional)
                        </span>
                    </>
                }
                description="Mention anything specific: upcoming interview, tricky situations, or target accent"
            />

            <CardContent className="px-0 pt-6">
                <Textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Tell your coach anything specific (e.g. 'I freeze up during sprint meetings when asked to speak spontaneously' or 'Aiming for British RP intonation')..."
                    className="min-h-24 rounded-xl border border-input bg-card p-3 text-sm focus-visible:ring-primary"
                />
            </CardContent>
        </Card>
    );
}
