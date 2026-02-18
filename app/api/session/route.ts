import { NextRequest, NextResponse } from 'next/server';

import { getSession, saveSession } from '@/lib/session';

export async function GET() {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    githubLogin: session.githubLogin,
    githubId: session.githubId,
    selectedRepo: session.selectedRepo ?? null,
  });
}

export async function PATCH(request: NextRequest) {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = (await request.json()) as { selectedRepo?: unknown };

  if (!body.selectedRepo) {
    session.selectedRepo = undefined;
    saveSession(session);
    return NextResponse.json({ ok: true, selectedRepo: null });
  }

  const selectedRepo = body.selectedRepo as {
    id?: number;
    fullName?: string;
    owner?: string;
    name?: string;
    permissions?: Record<string, boolean>;
  };

  if (
    typeof selectedRepo.id !== 'number' ||
    typeof selectedRepo.fullName !== 'string' ||
    typeof selectedRepo.owner !== 'string' ||
    typeof selectedRepo.name !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid selectedRepo payload' }, { status: 400 });
  }

  session.selectedRepo = {
    id: selectedRepo.id,
    fullName: selectedRepo.fullName,
    owner: selectedRepo.owner,
    name: selectedRepo.name,
    permissions: selectedRepo.permissions,
  };

  saveSession(session);

  return NextResponse.json({ ok: true, selectedRepo: session.selectedRepo });
}
