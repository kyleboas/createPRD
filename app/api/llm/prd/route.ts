import { NextRequest, NextResponse } from 'next/server';

import { buildPrdMarkdown, parseAnswerString } from '@/lib/chat-flow';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    prompt?: unknown;
    questions?: unknown;
    answers?: unknown;
  };

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const questions = Array.isArray(body.questions) ? body.questions : [];
  const answerString = typeof body.answers === 'string' ? body.answers : '';

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: 'Questions are required before generating PRD' }, { status: 400 });
  }

  let parsedAnswers;

  try {
    parsedAnswers = parseAnswerString(answerString, questions.length);
  } catch (error) {
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

  return NextResponse.json({ markdown, parsedAnswers });
}
