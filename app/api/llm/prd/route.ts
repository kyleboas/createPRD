import { NextRequest, NextResponse } from 'next/server';

import { buildPrdMarkdown, parseAnswerString } from '@/lib/chat-flow';
import { enforceLlmRateLimit, enforceMarkdownLimit, enforcePromptLimit, parseLlmAuthHeader } from '@/lib/llm/security';
import { incrementCounter } from '@/lib/telemetry';

export async function POST(request: NextRequest) {
  const auth = parseLlmAuthHeader(request.headers.get('authorization'));

  if (!auth.valid) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json()) as {
    prompt?: unknown;
    questions?: unknown;
    answers?: unknown;
  };

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const questions = Array.isArray(body.questions) ? body.questions : [];
  const answerString = typeof body.answers === 'string' ? body.answers : '';

  if (!prompt) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (questions.length === 0) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: 'Questions are required before generating PRD' }, { status: 400 });
  }

  try {
    enforcePromptLimit(prompt, 'Prompt');
    enforcePromptLimit(answerString, 'Answer string');
    enforceLlmRateLimit(auth.key, 'prd');
  } catch (error) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 429 });
  }

  let parsedAnswers;

  try {
    parsedAnswers = parseAnswerString(answerString, questions.length);
  } catch (error) {
    incrementCounter('llmCallFailed');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid answer string' },
      { status: 400 },
    );
  }

  const markdown = buildPrdMarkdown({
    featurePrompt: prompt,
    questions: questions as Parameters<typeof buildPrdMarkdown>[0]['questions'],
    answers: parsedAnswers,
  });

  try {
    enforceMarkdownLimit(markdown, 'Generated PRD');
  } catch (error) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generated output too large' }, { status: 500 });
  }

  return NextResponse.json({ markdown, parsedAnswers });
}
