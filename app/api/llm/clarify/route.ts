import { NextRequest, NextResponse } from 'next/server';

import { generateClarifyingQuestions } from '@/lib/chat-flow';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { prompt?: unknown };
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
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
