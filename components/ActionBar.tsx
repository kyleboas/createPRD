'use client';

type CommitReview = {
  repository: string;
  branch: string;
  files: {
    prd: string;
    tasks: string;
  };
  collisionDetected: boolean;
  versioningApplied: boolean;
};

type CommitResult = {
  repository: string;
  branch: string;
  commitSha: string;
  files: string[];
};

type ActionBarProps = {
  canGeneratePrd: boolean;
  loading: boolean;
  isApproved: boolean;
  prdDraft: string;
  tasksDraft: string;
  error: string | null;
  review: CommitReview | null;
  commitResult: CommitResult | null;
  onGeneratePrd: () => Promise<void>;
  onRegeneratePrd: () => Promise<void>;
  onApprovePrd: () => Promise<void>;
  onGenerateTasks: () => Promise<void>;
  onRegenerateTasks: () => Promise<void>;
  onLoadReviewSummary: () => Promise<void>;
  onCommitToRepo: () => Promise<void>;
};

export function ActionBar(props: ActionBarProps) {
  const canReview = props.isApproved && props.tasksDraft.trim().length > 0;

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
          <button
            className="button"
            disabled={props.loading || !props.isApproved}
            onClick={() => props.onGenerateTasks()}
            type="button"
          >
            Generate Tasks
          </button>
          <button
            className="button button-secondary"
            disabled={props.loading || !props.tasksDraft.trim()}
            onClick={() => props.onRegenerateTasks()}
            type="button"
          >
            Regenerate Tasks
          </button>
          <button
            className="button"
            disabled={props.loading || !canReview}
            onClick={() => props.onLoadReviewSummary()}
            type="button"
          >
            Review Summary
          </button>
          <button
            className="button"
            disabled={props.loading || !props.review}
            onClick={() => props.onCommitToRepo()}
            type="button"
          >
            Commit to Repo
          </button>
        </div>
        <p>
          Status: <strong>{props.isApproved ? 'Approved' : 'Pending approval'}</strong>
        </p>

        {props.review ? (
          <div className="selected-repo">
            <h3>Final review summary</h3>
            <p>
              Repository: <strong>{props.review.repository}</strong>
            </p>
            <p>
              Default branch: <strong>{props.review.branch}</strong>
            </p>
            <p>PRD file: {props.review.files.prd}</p>
            <p>Tasks file: {props.review.files.tasks}</p>
            <p>
              Collision handling:{' '}
              {props.review.versioningApplied
                ? 'Filename collision detected, versioned paths will be used.'
                : 'No filename collisions detected.'}
            </p>
          </div>
        ) : null}

        {props.commitResult ? (
          <div className="selected-repo">
            <h3>Commit successful</h3>
            <p>
              Repository: <strong>{props.commitResult.repository}</strong>
            </p>
            <p>
              Branch: <strong>{props.commitResult.branch}</strong>
            </p>
            <p>
              Commit SHA: <strong>{props.commitResult.commitSha}</strong>
            </p>
            <p>Files written:</p>
            <ul>
              {props.commitResult.files.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {props.error ? <p className="error-text">{props.error}</p> : null}
      </div>
    </section>
  );
}
