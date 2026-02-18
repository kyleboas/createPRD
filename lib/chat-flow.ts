export type ClarifyingOption = {
  label: string;
  text: string;
};

export type ClarifyingQuestion = {
  number: number;
  prompt: string;
  options: ClarifyingOption[];
};

export type AnswerSelection = {
  question: number;
  option: string;
};

const DEFAULT_QUESTION_BANK = [
  {
    prompt: 'Who is the primary user for this feature?',
    options: ['Internal team members', 'Existing customers', 'New prospects', 'System administrators'],
  },
  {
    prompt: 'What is the most important user outcome?',
    options: ['Faster completion time', 'Higher data quality', 'Better visibility/reporting', 'Fewer manual steps'],
  },
  {
    prompt: 'How urgent is the delivery timeline?',
    options: ['Critical this sprint', 'Needed this month', 'Planned for next quarter', 'Exploratory only'],
  },
  {
    prompt: 'What level of rollout control is needed?',
    options: ['All users immediately', 'Gradual staged rollout', 'Beta program only', 'Internal pilot first'],
  },
  {
    prompt: 'What is the preferred success metric?',
    options: ['Adoption rate', 'Task completion rate', 'Error reduction', 'Time saved'],
  },
] as const;

export function generateClarifyingQuestions(prompt: string): ClarifyingQuestion[] {
  const normalizedPrompt = prompt.trim();
  const count = normalizedPrompt.length > 160 ? 5 : 4;

  return DEFAULT_QUESTION_BANK.slice(0, count).map((entry, index) => ({
    number: index + 1,
    prompt: entry.prompt,
    options: entry.options.map((optionText, optionIndex) => ({
      label: String.fromCharCode(65 + optionIndex),
      text: optionText,
    })),
  }));
}

export function parseAnswerString(input: string, questionCount: number): AnswerSelection[] {
  const cleaned = input.trim();

  if (!cleaned) {
    throw new Error('Answer string is required. Example: 1B, 2C, 3A');
  }

  const chunks = cleaned
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const pattern = /^(\d+)([A-Za-z])$/;
  const selections: AnswerSelection[] = [];

  for (const chunk of chunks) {
    const match = chunk.match(pattern);
    if (!match) {
      throw new Error('Invalid answer format. Use values like 1B, 2C, 3A');
    }

    const question = Number(match[1]);
    const option = match[2].toUpperCase();

    if (question < 1 || question > questionCount) {
      throw new Error(`Question ${question} is out of range. Allowed questions are 1..${questionCount}`);
    }

    selections.push({ question, option });
  }

  const uniqueByQuestion = new Map<number, string>();
  for (const selection of selections) {
    uniqueByQuestion.set(selection.question, selection.option);
  }

  return [...uniqueByQuestion.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([question, option]) => ({ question, option }));
}

export function formatAnswerString(selections: AnswerSelection[]): string {
  return selections
    .slice()
    .sort((a, b) => a.question - b.question)
    .map((selection) => `${selection.question}${selection.option}`)
    .join(', ');
}

export function buildPrdMarkdown(params: {
  featurePrompt: string;
  questions: ClarifyingQuestion[];
  answers: AnswerSelection[];
}): string {
  const answerByQuestion = new Map<number, string>(
    params.answers.map((answer) => [answer.question, answer.option]),
  );

  const summaryBullets = params.questions.map((question) => {
    const selected = answerByQuestion.get(question.number);
    const selectedOption = question.options.find((option) => option.label === selected);

    if (!selectedOption) {
      return `- Q${question.number}: _No answer provided_`;
    }

    return `- Q${question.number}: ${question.prompt} → ${selectedOption.label}) ${selectedOption.text}`;
  });

  return `# Product Requirements Document\n\n## 1. Feature Overview\n${params.featurePrompt}\n\n## 2. Clarifying Decisions\n${summaryBullets.join('\n')}\n\n## 3. Goals\n- Deliver a clear v1 scope for implementation.\n- Reduce ambiguity before task generation.\n\n## 4. Functional Requirements\n- The system must support the approved user flow and constraints captured above.\n- The system must provide observability and actionable error states for the feature.\n\n## 5. Non-Goals\n- Any behavior not explicitly listed in this PRD draft is out of scope for v1.\n\n## 6. Success Metrics\n- PRD is approved with no unresolved clarifying questions.\n- Engineering can generate actionable implementation tasks from this document.\n`;
}

export function toFeatureSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 64)
    .replace(/^-+|-+$/g, '');

  return slug || 'feature';
}

export function buildTasksMarkdown(params: { featurePrompt: string; approvedPrd: string }): string {
  const slug = toFeatureSlug(params.featurePrompt);

  return `## Relevant Files

- \`tasks/prd-${slug}.md\` - Approved product requirements document for this feature.
- \`tasks/tasks-${slug}.md\` - Full implementation checklist generated from the PRD.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Pull the latest default branch and create \`feature/${slug}\`
  - [ ] 0.2 Push the branch upstream so implementation commits are isolated

- [ ] 1.0 Review the approved PRD and align implementation scope
  - [ ] 1.1 Re-read requirements, non-goals, and success metrics
  - [ ] 1.2 Capture unanswered risks and assumptions before coding

- [ ] 2.0 Implement core feature behavior from approved scope
  - [ ] 2.1 Build the primary user flow from the PRD requirements
  - [ ] 2.2 Add validation and guardrails for expected edge cases
  - [ ] 2.3 Ensure the implementation maintains backward compatibility where needed

- [ ] 3.0 Add quality checks and regression coverage
  - [ ] 3.1 Add or update automated tests for main and edge-case behavior
  - [ ] 3.2 Run linting, tests, and local verification checks

- [ ] 4.0 Prepare release readiness and documentation
  - [ ] 4.1 Update relevant docs/changelog for the shipped behavior
  - [ ] 4.2 Confirm rollout and monitoring plan is clear for stakeholders

## PRD Snapshot Context

${params.approvedPrd}
`;
}

export function validateTasksMarkdown(markdown: string): { valid: boolean; error?: string } {
  const lines = markdown.split('\n');
  const taskLines = lines.filter((line) => line.trim().startsWith('- [ ]'));

  if (taskLines.length === 0) {
    return { valid: false, error: 'Tasks markdown must include checkbox task lines using - [ ]' };
  }

  const numberedLines = taskLines.filter((line) => /\d+\.\d+/.test(line));
  const hasParentTask = numberedLines.some((line) => /\b\d+\.0\b/.test(line));
  const hasSubTask = numberedLines.some((line) => /\b\d+\.[1-9]\d*\b/.test(line));

  if (!hasParentTask || !hasSubTask) {
    return {
      valid: false,
      error: 'Tasks markdown must include parent tasks (X.0) and subtasks (X.1, X.2...) with checkboxes',
    };
  }

  return { valid: true };
}
