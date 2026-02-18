'use client';

type PreviewTabsProps = {
  prdDraft: string;
  approvedPrd: string | null;
  editing: boolean;
  onEditToggle: () => void;
  onPrdDraftChange: (value: string) => void;
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
  return (
    <section className="panel">
      <h2>Preview tabs</h2>
      <div className="row-between">
        <p className="panel-muted">PRD preview</p>
        <button className="button button-secondary" onClick={props.onEditToggle} type="button">
          {props.editing ? 'Stop editing' : 'Edit PRD'}
        </button>
      </div>
      {!props.prdDraft ? <p className="panel-muted">No PRD draft yet. Generate one from chat answers.</p> : null}

      {props.editing ? (
        <textarea
          aria-label="PRD markdown editor"
          rows={16}
          value={props.prdDraft}
          onChange={(event) => props.onPrdDraftChange(event.target.value)}
        />
      ) : null}

      {!props.editing && props.prdDraft ? <MarkdownPreview markdown={props.prdDraft} /> : null}

      {props.approvedPrd ? <p className="success-text">PRD approved. GitHub write endpoints are now unlocked.</p> : null}
    </section>
  );
}
