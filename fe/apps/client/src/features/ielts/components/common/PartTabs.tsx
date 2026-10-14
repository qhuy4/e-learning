export interface PartTabOption {
  value: string;
  label: string;
}

interface PartTabsProps {
  options: PartTabOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Segmented control used for switching skills / tasks / parts. */
export function PartTabs({ options, value, onChange }: PartTabsProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-border bg-muted/60 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
