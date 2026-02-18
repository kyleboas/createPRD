import { GitHubApiError, githubRequest } from '@/lib/github/client';

export type FileLookupResult = {
  exists: boolean;
  sha?: string;
};

export async function getFileIfExists(params: {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  accessToken: string;
}): Promise<FileLookupResult> {
  try {
    const payload = await githubRequest<{ sha: string }>(
      `/repos/${params.owner}/${params.repo}/contents/${encodeURIComponent(params.path)}?ref=${encodeURIComponent(params.ref)}`,
      params.accessToken,
    );

    return { exists: true, sha: payload.sha };
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return { exists: false };
    }

    throw error;
  }
}

export function resolveTargetPath(basePath: string, exists: boolean): string {
  if (!exists) {
    return basePath;
  }

  const extensionIndex = basePath.lastIndexOf('.');
  const hasExtension = extensionIndex > -1;
  const filename = hasExtension ? basePath.slice(0, extensionIndex) : basePath;
  const extension = hasExtension ? basePath.slice(extensionIndex) : '';

  return `${filename}-v2${extension}`;
}
