'use client';

import { useMemo, useState } from 'react';

import { ActionBar } from '@/components/ActionBar';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewTabs } from '@/components/PreviewTabs';
import { toFeatureSlug, type ClarifyingQuestion } from '@/lib/chat-flow';

type WorkflowStage = 'initial' | 'clarifying' | 'drafted' | 'approved';

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

export function WorkflowShell() {
  const [activeTab, setActiveTab] = useState<'prd' | 'tasks'>('prd');
  const [stage, setStage] = useState<WorkflowStage>('initial');
  const [featurePrompt, setFeaturePrompt] = useState('');
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answerString, setAnswerString] = useState('');
  const [prdDraft, setPrdDraft] = useState('');
  const [tasksDraft, setTasksDraft] = useState('');
  const [approvedPrd, setApprovedPrd] = useState<string | null>(null);
  const [editingPrd, setEditingPrd] = useState(false);
  const [editingTasks, setEditingTasks] = useState(false);
  const [review, setReview] = useState<CommitReview | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canGeneratePrd = useMemo(
    () => questions.length > 0 && answerString.trim().length > 0,
    [answerString, questions.length],
  );

  const computedFilenames = useMemo(() => {
    const slug = toFeatureSlug(featurePrompt);
    return {
      prd: `/tasks/prd-${slug}.md`,
      tasks: `/tasks/tasks-${slug}.md`,
    };
  }, [featurePrompt]);

  const askClarifyingQuestions = async () => {
    setLoading(true);
    setError(null);
    setReview(null);
    setCommitResult(null);

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
    setTasksDraft('');
    setActiveTab('prd');
    setLoading(false);
  };

  const generatePrd = async () => {
    setLoading(true);
    setError(null);
    setReview(null);
    setCommitResult(null);

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
    setTasksDraft('');
    setActiveTab('prd');
    setLoading(false);
  };

  const approvePrd = async () => {
    if (!prdDraft.trim()) {
      setError('Generate or edit a PRD before approval.');
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);
    setCommitResult(null);

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
    setEditingPrd(false);
    setLoading(false);
  };

  const regeneratePrd = async () => {
    await generatePrd();
  };

  const generateTasks = async () => {
    if (!approvedPrd) {
      setError('Approve the PRD before generating tasks.');
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);
    setCommitResult(null);

    const response = await fetch('/api/llm/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedPrd, prompt: featurePrompt }),
    });

    const payload = (await response.json()) as {
      markdown?: string;
      error?: string;
    };

    if (!response.ok || !payload.markdown) {
      setError(payload.error ?? 'Failed to generate tasks');
      setLoading(false);
      return;
    }

    setTasksDraft(payload.markdown);
    setEditingTasks(false);
    setActiveTab('tasks');
    setLoading(false);
  };

  const regenerateTasks = async () => {
    await generateTasks();
  };

  const loadReviewSummary = async () => {
    if (!approvedPrd || !tasksDraft.trim()) {
      setError('Generate tasks before reviewing commit summary.');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch('/api/github/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        featurePrompt,
        approvedPrd,
        tasksMarkdown: tasksDraft,
        dryRun: true,
      }),
    });

    const payload = (await response.json()) as { review?: CommitReview; error?: string };

    if (!response.ok || !payload.review) {
      setError(payload.error ?? 'Failed to load commit review summary');
      setLoading(false);
      return;
    }

    setReview(payload.review);
    setCommitResult(null);
    setLoading(false);
  };

  const commitToRepo = async () => {
    if (!approvedPrd || !tasksDraft.trim()) {
      setError('Generate tasks before committing to the repository.');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch('/api/github/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        featurePrompt,
        approvedPrd,
        tasksMarkdown: tasksDraft,
      }),
    });

    const payload = (await response.json()) as {
      repository?: string;
      branch?: string;
      commitSha?: string;
      files?: string[];
      error?: string;
    };

    if (!response.ok || !payload.commitSha || !payload.repository || !payload.branch || !payload.files) {
      setError(payload.error ?? 'Failed to commit PRD and tasks');
      setLoading(false);
      return;
    }

    setCommitResult({
      repository: payload.repository,
      branch: payload.branch,
      commitSha: payload.commitSha,
      files: payload.files,
    });
    setLoading(false);
  };

  return (
    <>
      <PreviewTabs
        activeTab={activeTab}
        approvedPrd={approvedPrd}
        editingPrd={editingPrd}
        editingTasks={editingTasks}
        filenames={computedFilenames}
        onPrdEditToggle={() => setEditingPrd((value) => !value)}
        onTabChange={setActiveTab}
        onTasksDraftChange={setTasksDraft}
        onTasksEditToggle={() => setEditingTasks((value) => !value)}
        onPrdDraftChange={setPrdDraft}
        prdDraft={prdDraft}
        tasksDraft={tasksDraft}
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
        commitResult={commitResult}
        error={error}
        isApproved={stage === 'approved'}
        loading={loading}
        onApprovePrd={approvePrd}
        onCommitToRepo={commitToRepo}
        onGeneratePrd={generatePrd}
        onGenerateTasks={generateTasks}
        onLoadReviewSummary={loadReviewSummary}
        onRegeneratePrd={regeneratePrd}
        onRegenerateTasks={regenerateTasks}
        prdDraft={prdDraft}
        review={review}
        tasksDraft={tasksDraft}
      />
    </>
  );
}
