import { NextRequest, NextResponse } from 'next/server';

import { buildTasksMarkdown, toFeatureSlug, validateTasksMarkdown } from '@/lib/chat-flow';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    approvedPrd?: unknown;
    prompt?: unknown;
  };

  const approvedPrd = typeof body.approvedPrd === 'string' ? body.approvedPrd.trim() : '';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (!approvedPrd) {
    return NextResponse.json({ error: 'Approved PRD is required before generating tasks' }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ error: 'Feature prompt is required before generating tasks' }, { status: 400 });
  }

  const featureSlug = toFeatureSlug(prompt);
  const markdown = buildTasksMarkdown({ approvedPrd, featurePrompt: prompt });
  const validation = validateTasksMarkdown(markdown);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error ?? 'Generated tasks markdown is invalid' }, { status: 500 });
  }

  return NextResponse.json({
    markdown,
    filenames: {
      prd: `/tasks/prd-${featureSlug}.md`,
      tasks: `/tasks/tasks-${featureSlug}.md`,
    },
  });
}
