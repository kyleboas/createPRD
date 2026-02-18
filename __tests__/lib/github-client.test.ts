import { GitHubApiError, githubRequest } from '@/lib/github/client';

describe('githubRequest error normalization', () => {
  const fetchMock = jest.fn();

  beforeAll(() => {
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('normalizes 401 authentication failures', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Bad credentials' }),
    } as Response);

    await expect(githubRequest('/user', 'token')).rejects.toEqual(
      expect.objectContaining<Partial<GitHubApiError>>({
        status: 401,
        message: 'GitHub authentication failed (401). Reconnect GitHub and try again.',
      }),
    );
  });

  it('normalizes 403 access failures and rate limits', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Resource not accessible by integration' }),
    } as Response);

    await expect(githubRequest('/repos/a/b', 'token')).rejects.toEqual(
      expect.objectContaining<Partial<GitHubApiError>>({
        status: 403,
        message: 'GitHub access denied (403). Resource not accessible by integration',
      }),
    );

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'API rate limit exceeded for user ID 1' }),
    } as Response);

    await expect(githubRequest('/repos/a/b', 'token')).rejects.toEqual(
      expect.objectContaining<Partial<GitHubApiError>>({
        status: 403,
        message: 'GitHub API rate limit reached (403). Wait a moment and retry.',
      }),
    );
  });

  it('normalizes 404 and 429 failures', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not Found' }),
    } as Response);

    await expect(githubRequest('/repos/a/missing', 'token')).rejects.toEqual(
      expect.objectContaining<Partial<GitHubApiError>>({
        status: 404,
        message: 'GitHub resource not found (404). Not Found',
      }),
    );

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ message: 'Too many requests' }),
    } as Response);

    await expect(githubRequest('/repos/a/b', 'token')).rejects.toEqual(
      expect.objectContaining<Partial<GitHubApiError>>({
        status: 429,
        message: 'GitHub API rate limit reached (429). Wait a moment and retry.',
      }),
    );
  });
});
