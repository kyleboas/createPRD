'use client';

const SESSION_KEY = 'createprd.byok.session';
const REMEMBERED_KEY = 'createprd.byok.remembered';

export type RememberedEnvelope = {
  ciphertext: string;
  iv: string;
  salt: string;
  provider: 'codex';
  createdAt: string;
};

function encode(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, [
    'deriveKey',
  ]);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

export function saveSessionKey(value: { provider: 'codex'; apiKey: string }) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
}

export function readSessionKey(): { provider: 'codex'; apiKey: string } | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { provider?: unknown; apiKey?: unknown };

    if (parsed.provider !== 'codex' || typeof parsed.apiKey !== 'string') {
      return null;
    }

    return { provider: 'codex', apiKey: parsed.apiKey };
  } catch {
    return null;
  }
}

export async function rememberKey(params: { provider: 'codex'; apiKey: string; passphrase: string }) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(params.passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    new TextEncoder().encode(params.apiKey),
  );

  const envelope: RememberedEnvelope = {
    provider: params.provider,
    ciphertext: encode(new Uint8Array(ciphertext)),
    iv: encode(iv),
    salt: encode(salt),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(REMEMBERED_KEY, JSON.stringify(envelope));
}

export function readRememberedEnvelope() {
  const raw = localStorage.getItem(REMEMBERED_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as RememberedEnvelope;
    if (!parsed.ciphertext || !parsed.iv || !parsed.salt || parsed.provider !== 'codex') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function unlockRememberedKey(passphrase: string) {
  const envelope = readRememberedEnvelope();

  if (!envelope) {
    throw new Error('No remembered key found.');
  }

  const key = await deriveKey(passphrase, decode(envelope.salt));
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: decode(envelope.iv),
    },
    key,
    decode(envelope.ciphertext),
  );

  const apiKey = new TextDecoder().decode(plaintext);
  return { provider: envelope.provider, apiKey };
}

export function forgetRememberedKey() {
  localStorage.removeItem(REMEMBERED_KEY);
}
