'use client';

import { useMemo, useState } from 'react';

import { ActionBar } from '@/components/ActionBar';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewTabs } from '@/components/PreviewTabs';
import type { ClarifyingQuestion } from '@/lib/chat-flow';

type WorkflowStage = 'initial' | 'clarifying' | 'drafted' | 'approved';

export function WorkflowShell() {
  const [stage, setStage] = useState<WorkflowStage>('initial');
  const [featurePrompt, setFeaturePrompt] = useState('');
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answerString, setAnswerString] = useState('');
  const [prdDraft, setPrdDraft] = useState('');
  const [approvedPrd, setApprovedPrd] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canGeneratePrd = useMemo(
    () => questions.length > 0 && answerString.trim().length > 0,
    [answerString, questions.length],
  );

  const askClarifyingQuestions = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/llm/clarify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: featurePrompt }),
    });

    const payload = (await response.json()) as { questions?: ClarifyingQuestion[]; error?: string };

    if (!response.ok || !payload.questions) {
      setError(payload.error ?? 'Failed to generate clarifying questions');
      setLoading(false);
      return;
    }

    setQuestions(payload.questions);
    setStage('clarifying');
    setAnswerString('');
    setApprovedPrd(null);
    setLoading(false);
  };

  const generatePrd = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/llm/prd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: featurePrompt, questions, answers: answerString }),
    });

    const payload = (await response.json()) as { markdown?: string; error?: string };

    if (!response.ok || !payload.markdown) {
      setError(payload.error ?? 'Failed to generate PRD');
      setLoading(false);
      return;
    }

    setPrdDraft(payload.markdown);
    setStage('drafted');
    setApprovedPrd(null);
    setLoading(false);
  };

  const approvePrd = async () => {
    if (!prdDraft.trim()) {
      setError('Generate or edit a PRD before approval.');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch('/api/session/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prdMarkdown: prdDraft }),
    });

    const payload = (await response.json()) as { approvedPrdSnapshot?: string; error?: string };

    if (!response.ok || !payload.approvedPrdSnapshot) {
      setError(payload.error ?? 'Failed to approve PRD');
      setLoading(false);
      return;
    }

    setApprovedPrd(payload.approvedPrdSnapshot);
    setStage('approved');
    setEditing(false);
    setLoading(false);
  };

  const regeneratePrd = async () => {
    await generatePrd();
  };

  return (
    <>
      <PreviewTabs
        approvedPrd={approvedPrd}
        editing={editing}
        onEditToggle={() => setEditing((value) => !value)}
        onPrdDraftChange={setPrdDraft}
        prdDraft={prdDraft}
      />
      <ChatPanel
        answerString={answerString}
        error={error}
        featurePrompt={featurePrompt}
        loading={loading}
        onAnswerStringChange={setAnswerString}
        onAskClarifyingQuestions={askClarifyingQuestions}
        onFeaturePromptChange={setFeaturePrompt}
        questions={questions}
        stage={stage}
      />
      <ActionBar
        canGeneratePrd={canGeneratePrd}
        error={error}
        isApproved={stage === 'approved'}
        loading={loading}
        onApprovePrd={approvePrd}
        onGeneratePrd={generatePrd}
        onRegeneratePrd={regeneratePrd}
        prdDraft={prdDraft}
      />
    </>
  );
}
