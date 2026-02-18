import { githubRequest } from '@/lib/github/client';

type RepoResponse = {
  id: number;
  full_name: string;
  default_branch: string;
  private: boolean;
};

export async function getRepoMetadata(params: {
  owner: string;
  repo: string;
  accessToken: string;
}) {
  const repoData = await githubRequest<RepoResponse>(
    `/repos/${params.owner}/${params.repo}`,
    params.accessToken,
  );

  return {
    id: repoData.id,
    fullName: repoData.full_name,
    defaultBranch: repoData.default_branch,
    private: repoData.private,
  };
}
