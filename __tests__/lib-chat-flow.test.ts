import { parseAnswerString } from '@/lib/chat-flow';

describe('parseAnswerString', () => {
  it('parses comma-delimited answers in 1B format', () => {
    expect(parseAnswerString('1B, 2c,3A', 3)).toEqual([
      { question: 1, option: 'B' },
      { question: 2, option: 'C' },
      { question: 3, option: 'A' },
    ]);
  });

  it('throws on invalid format', () => {
    expect(() => parseAnswerString('1-B,2-C', 2)).toThrow('Invalid answer format');
  });
});
