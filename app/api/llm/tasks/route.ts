import { NextRequest, NextResponse } from 'next/server';

import { buildTasksMarkdown, toFeatureSlug, validateTasksMarkdown } from '@/lib/chat-flow';
import { enforceLlmRateLimit, enforceMarkdownLimit, enforcePromptLimit, parseLlmAuthHeader } from '@/lib/llm/security';
import { incrementCounter } from '@/lib/telemetry';

export async function POST(request: NextRequest) {
  const auth = parseLlmAuthHeader(request.headers.get('authorization'));

  if (!auth.valid) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json()) as {
    approvedPrd?: unknown;
    prompt?: unknown;
  };

  const approvedPrd = typeof body.approvedPrd === 'string' ? body.approvedPrd.trim() : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (!approvedPrd) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: 'Approved PRD is required before generating tasks' }, { status: 400 });
  }

  if (!prompt) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: 'Feature prompt is required before generating tasks' }, { status: 400 });
  }

  try {
    enforcePromptLimit(prompt, 'Prompt');
    enforceMarkdownLimit(approvedPrd, 'Approved PRD');
    enforceLlmRateLimit(auth.key, 'tasks');
  } catch (error) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 429 });
  }

  const featureSlug = toFeatureSlug(prompt);
  const markdown = buildTasksMarkdown({ approvedPrd, featurePrompt: prompt });
  const validation = validateTasksMarkdown(markdown);

  if (!validation.valid) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: validation.error ?? 'Generated tasks markdown is invalid' }, { status: 500 });
  }

  try {
    enforceMarkdownLimit(markdown, 'Generated tasks');
  } catch (error) {
    incrementCounter('llmCallFailed');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Generated output too large' }, { status: 500 });
  }

  return NextResponse.json({
    markdown,
    filenames: {
      prd: `/tasks/prd-${featureSlug}.md`,
      tasks: `/tasks/tasks-${featureSlug}.md`,
    },
  });
}
