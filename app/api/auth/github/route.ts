import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { githubRequest } from '@/lib/github/client';
import {
  clearOAuthState,
  getOAuthState,
  saveOAuthState,
  saveSession,
} from '@/lib/session';

type GitHubTokenResponse = {
  access_token: string;
};

type GitHubUser = {
  id: number;
  login: string;
};

function getBaseUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return configured;
  }

  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');

  if (!code) {
    const state = randomUUID();
    saveOAuthState(state);

    const githubUrl = new URL('https://github.com/login/oauth/authorize');
    githubUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID ?? '');
    githubUrl.searchParams.set('scope', 'repo read:user');
    githubUrl.searchParams.set('state', state);

    return NextResponse.redirect(githubUrl);
  }

  const state = url.searchParams.get('state');
  const savedState = getOAuthState();

  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL('/?auth=invalid_state', getBaseUrl(request)));
  }

  clearOAuthState();

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL('/?auth=oauth_exchange_failed', getBaseUrl(request)));
  }

  const tokenPayload = (await tokenResponse.json()) as GitHubTokenResponse;

  if (!tokenPayload.access_token) {
    return NextResponse.redirect(new URL('/?auth=oauth_token_missing', getBaseUrl(request)));
  }

  const user = await githubRequest<GitHubUser>('/user', tokenPayload.access_token);

  saveSession({
    accessToken: tokenPayload.access_token,
    githubLogin: user.login,
    githubId: user.id,
  });

  return NextResponse.redirect(new URL('/?auth=success', getBaseUrl(request)));
}
