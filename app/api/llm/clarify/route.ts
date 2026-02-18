import { NextRequest, NextResponse } from 'next/server';

import { generateClarifyingQuestions } from '@/lib/chat-flow';
import { enforceLlmRateLimit, enforcePromptLimit, parseLlmAuthHeader } from '@/lib/llm/security';
import { incrementCounter } from '@/lib/telemetry';

export async function POST(request: NextRequest) {
  const auth = parseLlmAuthHeader(request.headers.get('authorization'));

  if (!auth.valid) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json()) as { prompt?: unknown };
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (!prompt) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    enforcePromptLimit(prompt, 'Prompt');
    enforceLlmRateLimit(auth.key, 'clarify');
  } catch (error) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 429 });
  }

  const questions = generateClarifyingQuestions(prompt);

  return NextResponse.json({
    questions,
    answerFormat: '1B, 2C, 3A',
    strictFormat: {
      numbering: `1..${questions.length}`,
      options: 'A..D',
    },
  });
}
