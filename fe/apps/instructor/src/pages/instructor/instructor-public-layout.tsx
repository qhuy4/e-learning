import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { cn } from "@fe/lib/utils";

interface InstructorPublicLayoutProps {
  children: ReactNode;
  className?: string;
}

export function InstructorPublicLayout({
  children,
  className,
}: InstructorPublicLayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <GraduationCap className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm leading-none font-bold">EduPro</span>
            <span className="mt-1 text-[11px] leading-none text-muted-foreground">
              Cổng giảng viên
            </span>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Giảng viên
          </Badge>
        </div>
      </header>
      <main
        className={cn(
          "mx-auto w-full px-4 py-8 sm:px-6 lg:px-8",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
