import {
  isListeningForm,
  isListeningItem,
  listeningForm,
  scoreListening,
} from './listening-assessment';

describe('adaptive listening form', () => {
  it.each(['pre-A1', 'A1', 'A2', 'B1', 'B2'] as const)(
    'builds and scores word + passage groups for %s',
    (level) => {
      const form = listeningForm(level, 0);
      const items = form.groups.flatMap((group) => group.items);

      expect(form.groups.map((group) => group.kind)).toEqual([
        'word',
        'word',
        'passage',
      ]);
      expect(items).toHaveLength(7);
      expect(isListeningForm(form.version)).toBe(true);
      expect(
        items.every((item) => isListeningItem(form.version, item.itemId)),
      ).toBe(true);

      const score = scoreListening(
        form.version,
        items.map((item) => ({ itemId: item.itemId, optionIndex: 0 })),
      );
      expect(score).toMatchObject({ answered: 7, total: 7 });
    },
  );

  it('keeps legacy passage-only versions valid', () => {
    const version = 'listening-level-v2:a1-bus';
    expect(isListeningForm(version)).toBe(true);
    expect(scoreListening(version, [])?.total).toBe(5);
  });
});
