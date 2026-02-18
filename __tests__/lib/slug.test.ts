import { toFeatureSlug } from '@/lib/slug';

describe('toFeatureSlug', () => {
  it('normalizes mixed case and punctuation into safe hyphenated slugs', () => {
    expect(toFeatureSlug(' Build Fancy Search / Filters!!! ')).toBe('build-fancy-search-filters');
  });

  it('trims to max length and falls back to feature for empty values', () => {
    expect(toFeatureSlug('')).toBe('feature');
    expect(toFeatureSlug('a'.repeat(90))).toHaveLength(64);
  });
});
