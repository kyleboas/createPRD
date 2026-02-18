import { NextRequest, NextResponse } from 'next/server';

import { isSupportedProvider, validateByokKey } from '@/lib/llm/provider';
import { parseLlmAuthHeader } from '@/lib/llm/security';
import { incrementCounter } from '@/lib/telemetry';

export async function POST(request: NextRequest) {
  const auth = parseLlmAuthHeader(request.headers.get('authorization'));

  if (!auth.valid) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json()) as { provider?: unknown };
  const provider = body.provider;

  if (!isSupportedProvider(provider)) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: 'Select a supported LLM provider.' }, { status: 400 });
  }

  const validation = await validateByokKey({ provider, apiKey: auth.key });

  if (!validation.valid) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: validation.error ?? 'Invalid API key' }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}
