import { NextRequest, NextResponse } from 'next/server';

import { getRepoMetadata } from '@/lib/github/repos';
import { getSession } from '@/lib/session';

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

  const repoData = await getRepoMetadata({ owner, repo, accessToken: session.accessToken });

  return NextResponse.json(repoData);
}
