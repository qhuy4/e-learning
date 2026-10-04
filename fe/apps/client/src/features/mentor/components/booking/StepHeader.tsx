import type { ReactNode } from "react";

interface StepHeaderProps {
    step: number;
    title: ReactNode;
    description: ReactNode;
    action?: ReactNode;
}

export function StepHeader({
    step,
    title,
    description,
    action,
}: StepHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm">
                    {step}
                </span>
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        {title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {action}
        </div>
    );
}
