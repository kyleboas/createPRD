import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'createprd_session';
const OAUTH_STATE_COOKIE = 'createprd_oauth_state';
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export type SelectedRepo = {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
};

export type SessionData = {
  accessToken: string;
  githubLogin: string;
  githubId: number;
  selectedRepo?: SelectedRepo;
  approvedPrdSnapshot?: string;
  prdApprovedAt?: string;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? 'local-dev-session-secret-change-me';
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function encode(data: SessionData) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string): SessionData | null {
  const [payload, signature] = raw.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length != expectedBuffer.length) {
    return null;
  }

  const valid = timingSafeEqual(providedBuffer, expectedBuffer);

  if (!valid) {
    return null;
  }

  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decoded) as SessionData;
  } catch {
    return null;
  }
}

export function getSession() {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  return decode(raw);
}

export function saveSession(session: SessionData) {
  cookies().set(SESSION_COOKIE, encode(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK_SECONDS,
  });
}

export function clearSession() {
  cookies().set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

export function saveOAuthState(state: string) {
  cookies().set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
}

export function getOAuthState() {
  return cookies().get(OAUTH_STATE_COOKIE)?.value;
}

export function clearOAuthState() {
  cookies().set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}
