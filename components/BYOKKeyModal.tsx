'use client';

import { useMemo, useState } from 'react';

type BYOKKeyModalProps = {
  open: boolean;
  loading: boolean;
  activeProvider: 'codex';
  hasRememberedKey: boolean;
  status: string;
  onClose: () => void;
  onValidateAndSave: (params: {
    provider: 'codex';
    apiKey: string;
    rememberKey: boolean;
    passphrase: string;
  }) => Promise<void>;
  onForgetRememberedKey: () => void;
  onUnlockRememberedKey: (passphrase: string) => Promise<void>;
};

export function BYOKKeyModal(props: BYOKKeyModalProps) {
  const [provider, setProvider] = useState<'codex'>('codex');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [unlockPassphrase, setUnlockPassphrase] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!apiKey.trim()) {
      return false;
    }

    if (!rememberKey) {
      return true;
    }

    return passphrase.trim().length >= 8;
  }, [apiKey, passphrase, rememberKey]);

  if (!props.open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="byok-modal-title">
        <div className="row-between">
          <h2 id="byok-modal-title">LLM BYOK settings</h2>
          <button className="button button-secondary" type="button" onClick={props.onClose}>
            Close
          </button>
        </div>

        <div className="stack-sm">
          <label htmlFor="provider-select">Provider</label>
          <select
            id="provider-select"
            value={provider}
            onChange={(event) => setProvider(event.target.value as 'codex')}
          >
            <option value="codex">codex</option>
          </select>

          <label htmlFor="api-key-input">API key</label>
          <input
            id="api-key-input"
            type="password"
            placeholder="Paste your provider API key"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />

          <label className="inline-row" htmlFor="remember-key-toggle">
            <input
              id="remember-key-toggle"
              type="checkbox"
              checked={rememberKey}
              onChange={(event) => setRememberKey(event.target.checked)}
            />
            Remember my key on this device
          </label>

          {rememberKey ? (
            <>
              <label htmlFor="passphrase-input">Passphrase (min 8 chars)</label>
              <input
                id="passphrase-input"
                type="password"
                placeholder="Passphrase used to encrypt local key"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
              />
              <p className="warning-text">Stored locally — not protected against XSS.</p>
            </>
          ) : null}

          <div className="quick-options">
            <button
              type="button"
              className="button"
              disabled={props.loading || !canSubmit}
              onClick={async () => {
                setLocalError(null);

                if (rememberKey && passphrase.trim().length < 8) {
                  setLocalError('Passphrase must be at least 8 characters to remember your key.');
                  return;
                }

                await props.onValidateAndSave({
                  provider,
                  apiKey,
                  rememberKey,
                  passphrase,
                });
                setApiKey('');
                setPassphrase('');
              }}
            >
              Validate key
            </button>
            <button type="button" className="button button-secondary" onClick={props.onForgetRememberedKey}>
              Forget my key
            </button>
          </div>

          {props.hasRememberedKey ? (
            <div className="selected-repo">
              <p>
                A remembered key is available for provider <strong>{props.activeProvider}</strong>.
              </p>
              <div className="quick-options">
                <input
                  type="password"
                  placeholder="Passphrase to unlock remembered key"
                  value={unlockPassphrase}
                  onChange={(event) => setUnlockPassphrase(event.target.value)}
                />
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={async () => {
                    setLocalError(null);
                    await props.onUnlockRememberedKey(unlockPassphrase);
                    setUnlockPassphrase('');
                  }}
                  disabled={props.loading || !unlockPassphrase.trim()}
                >
                  Unlock remembered key
                </button>
              </div>
            </div>
          ) : null}

          {localError ? <p className="error-text">{localError}</p> : null}
          {props.status ? <p className="panel-muted">{props.status}</p> : null}
        </div>
      </div>
    </div>
  );
}
