import { BookMarked } from "lucide-react";

interface VocabularyCardProps {
  /** Entries shaped like "word (pos): meaning". */
  words: string[];
  title?: string;
  /** Hide entirely when there is nothing to show. */
  className?: string;
}

/** Vocabulary harvested from a question ("từ vựng cần nhớ"). */
export function VocabularyCard({ words, title = "Từ vựng cần nhớ", className = "" }: VocabularyCardProps) {
  if (words.length === 0) return null;

  return (
    <div className={`rounded-xl border border-border bg-muted/30 p-4 ${className}`}>
      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
        <BookMarked className="size-3.5 text-primary" />
        {title}
      </p>
      <ul className="mt-2.5 space-y-2">
        {words.map((entry) => {
          const [head, ...rest] = entry.split(":");
          const meaning = rest.join(":").trim();
          return (
            <li key={entry} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">{head.trim()}</strong>
                {meaning && <span className="text-muted-foreground"> — {meaning}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
