import { NextRequest, NextResponse } from 'next/server';

import { getSession, saveSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = (await request.json()) as { prdMarkdown?: unknown };
  const prdMarkdown = typeof body.prdMarkdown === 'string' ? body.prdMarkdown.trim() : '';

  if (!prdMarkdown) {
    return NextResponse.json({ error: 'PRD markdown is required for approval' }, { status: 400 });
  }

  session.approvedPrdSnapshot = prdMarkdown;
  session.prdApprovedAt = new Date().toISOString();
  saveSession(session);

  return NextResponse.json({
    ok: true,
    approvedPrdSnapshot: session.approvedPrdSnapshot,
    prdApprovedAt: session.prdApprovedAt,
  });
}

export async function DELETE() {
  const session = getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  session.approvedPrdSnapshot = undefined;
  session.prdApprovedAt = undefined;
  saveSession(session);

  return NextResponse.json({ ok: true });
}
