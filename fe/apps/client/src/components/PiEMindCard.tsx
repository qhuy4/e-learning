import { forwardRef } from "react";
import { cn } from "@fe/lib/utils";

export interface PiEMindCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PiEMindCard = forwardRef<HTMLDivElement, PiEMindCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col rounded-xl bg-card text-card-foreground border border-primary/30 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
PiEMindCard.displayName = "PiEMindCard";
