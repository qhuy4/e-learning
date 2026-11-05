import { chunkWriting, countTotalWords } from './writing-chunker';

describe('chunkWriting', () => {
  it('bài ngắn → 1 chunk, offset 0, wordCount đúng', () => {
    const text = 'She go to school every day. I has a apple.';
    const chunks = chunkWriting(text, 120);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].charOffset).toBe(0);
    expect(chunks[0].text).toBe(text);
    expect(chunks[0].wordCount).toBe(countTotalWords(text));
  });

  it('bài dài → nhiều chunk, mỗi chunk ≤ maxWords', () => {
    const sentence = 'This is a simple test sentence with eight words total. ';
    const text = sentence.repeat(40); // 320 words
    const chunks = chunkWriting(text, 120);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.wordCount).toBeLessThanOrEqual(120);
    expect(chunks.reduce((s, c) => s + c.wordCount, 0)).toBe(countTotalWords(text));
  });

  it('câu dài hơn maxWords bị cắt cứng theo từ', () => {
    const longSentence = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const chunks = chunkWriting(longSentence, 120);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    for (const c of chunks) expect(c.wordCount).toBeLessThanOrEqual(120);
  });

  it('charOffset map đúng: slice bài gốc tại offset = chunk.text (khi không trim)', () => {
    const text = 'First sentence here. Second sentence here. Third one here.';
    const chunks = chunkWriting(text, 4);
    for (const c of chunks) {
      const slice = text.slice(c.charOffset, c.charOffset + c.text.length);
      expect(slice).toBe(c.text);
    }
  });

  it('offset không lệch khi có whitespace/newline trước câu', () => {
    const text = 'Hello world one.\n\nSecond sentence with more words here.';
    const chunks = chunkWriting(text, 6);
    expect(chunks.length).toBe(2);
    for (const c of chunks) {
      const slice = text.slice(c.charOffset, c.charOffset + c.text.length);
      expect(slice).toBe(c.text);
    }
  });

  it('text rỗng → []', () => {
    expect(chunkWriting('')).toEqual([]);
    expect(chunkWriting('   \n  ')).toEqual([]);
  });
});

describe('countTotalWords', () => {
  it('đếm theo whitespace, bỏ token rỗng', () => {
    expect(countTotalWords('  a  b\tc\n d ')).toBe(4);
    expect(countTotalWords('')).toBe(0);
  });
});
