import { Badge } from "../ui/badge";

interface AppVersionProps {
  version: string;
}

export function AppVersion({ version }: AppVersionProps) {
  return (
    <div
      className="pointer-events-none fixed right-2 bottom-2 z-50 select-none"
      aria-label={`Phiên bản PiEMind ${version}`}
    >
      <Badge
        variant="outline"
        className="bg-background/80 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur"
      >
        v{version}
      </Badge>
    </div>
  );
}
