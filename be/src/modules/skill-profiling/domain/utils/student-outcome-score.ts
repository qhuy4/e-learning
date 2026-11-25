const CEFR_ORDER = ['pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export interface StudentOutcomeScore {
  previousLevel: string;
  assessedLevel: string;
  deltaBands: number;
  score: number;
}

/**
 * Convert a verified pre/post CEFR change into a bounded teaching-outcome
 * signal. A flat result is neutral (0.5); one band gained is 0.65. One
 * learner can never create a perfect score by themselves.
 */
export function studentOutcomeScore(
  previousLevel: string,
  assessedLevel: string,
): StudentOutcomeScore | null {
  const previousIndex = CEFR_ORDER.indexOf(
    previousLevel as (typeof CEFR_ORDER)[number],
  );
  const assessedIndex = CEFR_ORDER.indexOf(
    assessedLevel as (typeof CEFR_ORDER)[number],
  );
  if (previousIndex < 0 || assessedIndex < 0) return null;

  const deltaBands = assessedIndex - previousIndex;
  const score = Math.min(0.95, Math.max(0.05, 0.5 + deltaBands * 0.15));
  return { previousLevel, assessedLevel, deltaBands, score };
}
