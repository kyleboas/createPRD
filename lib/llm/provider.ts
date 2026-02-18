export type SupportedLlmProvider = 'codex';

export function isSupportedProvider(value: unknown): value is SupportedLlmProvider {
  return value === 'codex';
}

export async function validateByokKey(params: { provider: SupportedLlmProvider; apiKey: string }) {
  if (params.provider !== 'codex') {
    return { valid: false, error: 'Unsupported provider selected.' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models?limit=1', {
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { valid: false, error: 'The API key was rejected (401).' };
      }

      return {
        valid: false,
        error: `Provider validation failed with status ${response.status}.`,
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Unable to reach the provider. Check network connectivity and try again.' };
  }
}
