import { resolveTargetPath } from '@/lib/github/contents';
import { toFeatureSlug } from '@/lib/slug';

describe('github commit path planning', () => {
  it('uses deterministic feature slug paths', () => {
    const slug = toFeatureSlug('My Cool Feature');

    expect(`tasks/prd-${slug}.md`).toBe('tasks/prd-my-cool-feature.md');
    expect(`tasks/tasks-${slug}.md`).toBe('tasks/tasks-my-cool-feature.md');
  });

  it('versions only colliding paths', () => {
    expect(resolveTargetPath('tasks/prd-my-cool-feature.md', true)).toBe(
      'tasks/prd-my-cool-feature-v2.md',
    );
    expect(resolveTargetPath('tasks/tasks-my-cool-feature.md', false)).toBe(
      'tasks/tasks-my-cool-feature.md',
    );
  });
});
