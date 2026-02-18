import { NextResponse } from 'next/server';

import { githubRequest } from '@/lib/github/client';
import { getSession } from '@/lib/session';

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
  };
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
};

export async function GET() {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const repos = await githubRequest<GitHubRepo[]>(
    '/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member',
    session.accessToken,
  );

  return NextResponse.json({
    repositories: repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      permissions: repo.permissions ?? {},
      writeLikelyAllowed: Boolean(repo.permissions?.push || repo.permissions?.admin),
    })),
  });
}
