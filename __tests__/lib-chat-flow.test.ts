import {
  buildTasksMarkdown,
  generateClarifyingQuestions,
  parseAnswerString,
  toFeatureSlug,
  validateTasksMarkdown,
} from '@/lib/chat-flow';

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

describe('clarifying question format validators', () => {
  it('generates numbered questions with A..D options', () => {
    const questions = generateClarifyingQuestions('Build Fancy Search');

    expect(questions.length).toBeGreaterThanOrEqual(4);
    questions.forEach((question, index) => {
      expect(question.number).toBe(index + 1);
      expect(question.options.length).toBeGreaterThanOrEqual(4);
      expect(question.options[0]?.label).toBe('A');
      expect(question.options[1]?.label).toBe('B');
      expect(question.options[2]?.label).toBe('C');
      expect(question.options[3]?.label).toBe('D');
    });
  });
});

describe('tasks markdown generation and validation', () => {
  it('creates safe feature slugs', () => {
    expect(toFeatureSlug(' Build Fancy Search / Filters!!! ')).toBe('build-fancy-search-filters');
  });

  it('generates valid tasks markdown with checkbox numbering rules and target filenames', () => {
    const markdown = buildTasksMarkdown({
      featurePrompt: 'Build Fancy Search',
      approvedPrd: '# Product Requirements Document\n\n## 1. Feature Overview\nSearch improvements',
    });

    expect(markdown).toContain('tasks/prd-build-fancy-search.md');
    expect(markdown).toContain('tasks/tasks-build-fancy-search.md');
    expect(markdown).toContain('- [ ] 0.0 Create feature branch');
    expect(markdown).toContain('- [ ] 1.0');
    expect(markdown).toContain('- [ ] 1.1');
    expect(validateTasksMarkdown(markdown)).toEqual({ valid: true });
  });

  it('rejects markdown without checkbox task lines', () => {
    expect(validateTasksMarkdown('## Tasks\n\n1.0 Do thing')).toEqual({
      valid: false,
      error: 'Tasks markdown must include checkbox task lines using - [ ]',
    });
  });
});
