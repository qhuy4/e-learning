import { studentOutcomeScore } from './student-outcome-score';

describe('studentOutcomeScore', () => {
  it.each([
    ['A1', 'A2', 1, 0.65],
    ['A2', 'A2', 0, 0.5],
    ['B1', 'A2', -1, 0.35],
    ['A1', 'C2', 5, 0.95],
  ])(
    'maps %s -> %s to delta %s and score %s',
    (previous, assessed, deltaBands, score) => {
      expect(studentOutcomeScore(previous, assessed)).toEqual({
        previousLevel: previous,
        assessedLevel: assessed,
        deltaBands,
        score,
      });
    },
  );

  it('rejects unknown levels', () => {
    expect(studentOutcomeScore('unknown', 'B1')).toBeNull();
  });
});
