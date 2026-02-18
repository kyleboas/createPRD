'use client';

type ActionBarProps = {
  canGeneratePrd: boolean;
  loading: boolean;
  isApproved: boolean;
  prdDraft: string;
  error: string | null;
  onGeneratePrd: () => Promise<void>;
  onRegeneratePrd: () => Promise<void>;
  onApprovePrd: () => Promise<void>;
};

export function ActionBar(props: ActionBarProps) {
  return (
    <section className="panel">
      <h2>Action bar</h2>
      <div className="stack-sm">
        <p className="panel-muted">PRD approval is required before any GitHub write operation can run.</p>
        <div className="quick-options">
          <button
            className="button"
            disabled={props.loading || !props.canGeneratePrd}
            onClick={() => props.onGeneratePrd()}
            type="button"
          >
            Generate PRD
          </button>
          <button
            className="button button-secondary"
            disabled={props.loading || !props.prdDraft.trim()}
            onClick={() => props.onRegeneratePrd()}
            type="button"
          >
            Regenerate PRD
          </button>
          <button
            className="button"
            disabled={props.loading || !props.prdDraft.trim()}
            onClick={() => props.onApprovePrd()}
            type="button"
          >
            Approve PRD
          </button>
        </div>
        <p>
          Status: <strong>{props.isApproved ? 'Approved' : 'Pending approval'}</strong>
        </p>
        {props.error ? <p className="error-text">{props.error}</p> : null}
      </div>
    </section>
  );
}
