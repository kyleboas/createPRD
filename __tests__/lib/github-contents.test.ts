import { resolveTargetPath } from '@/lib/github/contents';

describe('resolveTargetPath', () => {
  it('keeps original path when no collision exists', () => {
    expect(resolveTargetPath('tasks/prd-example.md', false)).toBe('tasks/prd-example.md');
  });

  it('adds -v2 suffix when collision exists', () => {
    expect(resolveTargetPath('tasks/prd-example.md', true)).toBe('tasks/prd-example-v2.md');
    expect(resolveTargetPath('tasks/no-extension', true)).toBe('tasks/no-extension-v2');
  });
});
