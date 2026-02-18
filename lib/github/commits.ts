import { githubRequest } from '@/lib/github/client';

export type CommitFile = {
  path: string;
  content: string;
};

type RefResponse = {
  object: {
    sha: string;
  };
};

type CommitResponse = {
  sha: string;
  tree: {
    sha: string;
  };
};

type TreeResponse = {
  sha: string;
};

type CreatedCommit = {
  sha: string;
};

export async function commitFilesToBranch(params: {
  owner: string;
  repo: string;
  branch: string;
  accessToken: string;
  message: string;
  files: CommitFile[];
}) {
  const ref = await githubRequest<RefResponse>(
    `/repos/${params.owner}/${params.repo}/git/ref/heads/${encodeURIComponent(params.branch)}`,
    params.accessToken,
  );

  const latestCommit = await githubRequest<CommitResponse>(
    `/repos/${params.owner}/${params.repo}/git/commits/${ref.object.sha}`,
    params.accessToken,
  );

  const tree = await githubRequest<TreeResponse>(`/repos/${params.owner}/${params.repo}/git/trees`, params.accessToken, {
    method: 'POST',
    body: {
      base_tree: latestCommit.tree.sha,
      tree: params.files.map((file) => ({
        path: file.path,
        mode: '100644',
        type: 'blob',
        content: file.content,
      })),
    },
  });

  const createdCommit = await githubRequest<CreatedCommit>(
    `/repos/${params.owner}/${params.repo}/git/commits`,
    params.accessToken,
    {
      method: 'POST',
      body: {
        message: params.message,
        tree: tree.sha,
        parents: [ref.object.sha],
      },
    },
  );

  await githubRequest(`/repos/${params.owner}/${params.repo}/git/refs/heads/${encodeURIComponent(params.branch)}`, params.accessToken, {
    method: 'PATCH',
    body: {
      sha: createdCommit.sha,
      force: false,
    },
  });

  return {
    sha: createdCommit.sha,
  };
}
