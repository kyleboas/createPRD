import { NextRequest, NextResponse } from 'next/server';

import { githubRequest } from '@/lib/github/client';
import { getSession } from '@/lib/session';

type RepoResponse = {
  id: number;
  full_name: string;
  default_branch: string;
  private: boolean;
};

export async function GET(request: NextRequest) {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const owner = request.nextUrl.searchParams.get('owner');
  const repo = request.nextUrl.searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'owner and repo are required' }, { status: 400 });
  }

  const repoData = await githubRequest<RepoResponse>(`/repos/${owner}/${repo}`, session.accessToken);

  return NextResponse.json({
    id: repoData.id,
    fullName: repoData.full_name,
    defaultBranch: repoData.default_branch,
    private: repoData.private,
  });
}
