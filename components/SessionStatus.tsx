'use client';

import { useEffect, useState } from 'react';

type SessionResponse = {
  authenticated: boolean;
  githubLogin?: string;
  selectedRepo?: {
    fullName: string;
  } | null;
};

export function SessionStatus() {
  const [session, setSession] = useState<SessionResponse | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch('/api/session', { cache: 'no-store' });
      const payload = (await response.json()) as SessionResponse;
      setSession(payload);
    };

    loadSession().catch(() => setSession({ authenticated: false }));

    window.addEventListener('session-updated', loadSession);
    return () => window.removeEventListener('session-updated', loadSession);
  }, []);

  if (!session) {
    return <p>Session: loading…</p>;
  }

  if (!session.authenticated) {
    return <p>Selected repo: none (not signed in)</p>;
  }

  return (
    <p>
      Signed in as <strong>{session.githubLogin}</strong> · Selected repo:{' '}
      {session.selectedRepo?.fullName ?? 'none'}
    </p>
  );
}
