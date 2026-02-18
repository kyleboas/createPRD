export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function normalizeGitHubErrorMessage(status: number, message?: string): string {
  const fallback = message?.trim() || 'GitHub request failed';

  if (status === 401) {
    return 'GitHub authentication failed (401). Reconnect GitHub and try again.';
  }

  if (status === 403) {
    if (/rate limit/i.test(fallback)) {
      return 'GitHub API rate limit reached (403). Wait a moment and retry.';
    }

    return `GitHub access denied (403). ${fallback}`;
  }

  if (status === 404) {
    return `GitHub resource not found (404). ${fallback}`;
  }

  if (status === 429) {
    return 'GitHub API rate limit reached (429). Wait a moment and retry.';
  }

  return fallback;
}

type GitHubRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function githubRequest<T>(
  path: string,
  accessToken: string,
  options?: GitHubRequestOptions,
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'create-prd-web',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new GitHubApiError(normalizeGitHubErrorMessage(response.status, payload?.message), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
