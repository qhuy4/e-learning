import { Card, CardContent } from "@fe/components/ui/card";
import { Checkbox } from "@fe/components/ui/checkbox";
import { FOCUS_OPTIONS } from "../../config/focus";
import { StepHeader } from "./StepHeader";

interface FocusSelectionCardProps {
    mentorName: string;
    selectedFocus: string[];
    onFocusChange: (focus: string[]) => void;
}

export function FocusSelectionCard({
    mentorName,
    selectedFocus,
    onFocusChange,
}: FocusSelectionCardProps) {
    const handleToggle = (focusId: string) => {
        const newSelection = selectedFocus.includes(focusId)
            ? selectedFocus.filter((f) => f !== focusId)
            : [...selectedFocus, focusId];
        onFocusChange(newSelection);
    };

    return (
        <Card className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <StepHeader
                step={2}
                title="What would you like to focus on?"
                description={`Select one or more topics for ${mentorName} to tailor your session`}
            />

            <CardContent className="px-0 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FOCUS_OPTIONS.map((option, index) => (
                        <label
                            key={option.id}
                            className={`focus-option flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                                selectedFocus.includes(option.id)
                                    ? "bg-secondary/10 border border-secondary/30 shadow-sm"
                                    : "bg-muted/30 border border-border hover:bg-muted/50"
                            }`}
                            style={{
                                gridColumn:
                                    index === FOCUS_OPTIONS.length - 1
                                        ? "span 2"
                                        : undefined,
                            }}
                        >
                            <Checkbox
                                checked={selectedFocus.includes(option.id)}
                                onCheckedChange={() => handleToggle(option.id)}
                                className="mt-1 size-4 cursor-pointer text-secondary border-border focus:ring-secondary"
                            />
                            <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                    {option.title}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">
                                    {option.description}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
