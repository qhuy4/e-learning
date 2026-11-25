import { speakingPrompt } from './speaking-prompts';

describe('speakingPrompt', () => {
  it.each([
    ['pre-A1', true],
    ['A1', true],
    ['A2', true],
    ['B1', true],
    ['B2', false],
  ] as const)('marks %s guided=%s', (level, guided) => {
    const prompt = speakingPrompt(level);
    expect(prompt.guided).toBe(guided);
    if (guided) {
      expect(prompt.title).toBe('Introduce yourself');
      expect(prompt.prompt).toContain('Read these words:');
    }
  });
});
