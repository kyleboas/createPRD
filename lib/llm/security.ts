import { createHash } from 'crypto';

import { incrementCounter } from '@/lib/telemetry';

const MAX_PROMPT_LENGTH = 4_000;
const MAX_MARKDOWN_LENGTH = 24_000;
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX_REQUESTS = 4;

type RateLimitEntry = {
  hits: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __llmRateLimitMap: Map<string, RateLimitEntry> | undefined;
}

function getRateLimitMap() {
  if (!globalThis.__llmRateLimitMap) {
    globalThis.__llmRateLimitMap = new Map<string, RateLimitEntry>();
  }

  return globalThis.__llmRateLimitMap;
}

export function parseLlmAuthHeader(headerValue: string | null) {
  if (!headerValue) {
    return { valid: false as const, error: 'Add your BYOK key to continue.' };
  }

  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { valid: false as const, error: 'Invalid authorization header format.' };
  }

  const key = match[1].trim();

  if (key.length < 20 || key.length > 300) {
    return { valid: false as const, error: 'LLM key format looks invalid.' };
  }

  return { valid: true as const, key };
}

export function enforcePromptLimit(value: string, label: string) {
  if (value.length > MAX_PROMPT_LENGTH) {
    throw new Error(`${label} exceeds ${MAX_PROMPT_LENGTH} characters.`);
  }
}

export function enforceMarkdownLimit(value: string, label: string) {
  if (value.length > MAX_MARKDOWN_LENGTH) {
    throw new Error(`${label} exceeds ${MAX_MARKDOWN_LENGTH} characters.`);
  }
}

export function enforceLlmRateLimit(apiKey: string, routeKey: string) {
  const map = getRateLimitMap();
  const fingerprint = createHash('sha256').update(`${routeKey}:${apiKey}`).digest('hex');
  const now = Date.now();
  const entry = map.get(fingerprint);

  if (!entry || now >= entry.resetAt) {
    map.set(fingerprint, {
      hits: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (entry.hits >= RATE_LIMIT_MAX_REQUESTS) {
    incrementCounter('llmRateLimited');
    throw new Error('Too many rapid LLM requests. Please wait a few seconds and try again.');
  }

  entry.hits += 1;
}
