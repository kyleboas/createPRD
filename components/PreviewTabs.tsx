'use client';

type PreviewTabsProps = {
  activeTab: 'prd' | 'tasks';
  onTabChange: (tab: 'prd' | 'tasks') => void;
  prdDraft: string;
  approvedPrd: string | null;
  tasksDraft: string;
  editingPrd: boolean;
  editingTasks: boolean;
  onPrdEditToggle: () => void;
  onTasksEditToggle: () => void;
  onPrdDraftChange: (value: string) => void;
  onTasksDraftChange: (value: string) => void;
  filenames: {
    prd: string;
    tasks: string;
  };
};

function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');

  return (
    <div className="markdown-preview">
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return <h3 key={index}>{line.slice(2)}</h3>;
        }

        if (line.startsWith('## ')) {
          return <h4 key={index}>{line.slice(3)}</h4>;
        }

        if (line.startsWith('- ')) {
          return <p key={index}>• {line.slice(2)}</p>;
        }

        if (!line.trim()) {
          return <br key={index} />;
        }

        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

export function PreviewTabs(props: PreviewTabsProps) {
  const showingPrd = props.activeTab === 'prd';

  return (
    <section className="panel">
      <h2>Preview tabs</h2>
      <div className="quick-options">
        <button
          className={`button ${showingPrd ? '' : 'button-secondary'}`}
          onClick={() => props.onTabChange('prd')}
          type="button"
        >
          PRD
        </button>
        <button
          className={`button ${!showingPrd ? '' : 'button-secondary'}`}
          onClick={() => props.onTabChange('tasks')}
          type="button"
        >
          Tasks
        </button>
      </div>
      <div className="row-between">
        <p className="panel-muted">{showingPrd ? 'PRD preview' : 'Tasks preview'}</p>
        <button
          className="button button-secondary"
          onClick={showingPrd ? props.onPrdEditToggle : props.onTasksEditToggle}
          type="button"
        >
          {showingPrd
            ? props.editingPrd
              ? 'Stop editing'
              : 'Edit PRD'
            : props.editingTasks
              ? 'Stop editing'
              : 'Edit Tasks'}
        </button>
      </div>
      <div className="stack-sm">
        <p className="panel-muted">Target PRD filename: {props.filenames.prd}</p>
        <p className="panel-muted">Target tasks filename: {props.filenames.tasks}</p>
      </div>
      {showingPrd && !props.prdDraft ? (
        <p className="panel-muted">No PRD draft yet. Generate one from chat answers.</p>
      ) : null}
      {!showingPrd && !props.tasksDraft ? (
        <p className="panel-muted">No tasks draft yet. Approve PRD, then generate tasks.</p>
      ) : null}

      {showingPrd && props.editingPrd ? (
        <textarea
          aria-label="PRD markdown editor"
          rows={16}
          value={props.prdDraft}
          onChange={(event) => props.onPrdDraftChange(event.target.value)}
        />
      ) : null}
      {!showingPrd && props.editingTasks ? (
        <textarea
          aria-label="Tasks markdown editor"
          rows={16}
          value={props.tasksDraft}
          onChange={(event) => props.onTasksDraftChange(event.target.value)}
        />
      ) : null}

      {showingPrd && !props.editingPrd && props.prdDraft ? <MarkdownPreview markdown={props.prdDraft} /> : null}
      {!showingPrd && !props.editingTasks && props.tasksDraft ? <MarkdownPreview markdown={props.tasksDraft} /> : null}

      {props.approvedPrd ? <p className="success-text">PRD approved. GitHub write endpoints are now unlocked.</p> : null}
    </section>
  );
}
