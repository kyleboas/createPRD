'use client';

import { formatAnswerString, type AnswerSelection, type ClarifyingQuestion } from '@/lib/chat-flow';

type ChatPanelProps = {
  stage: 'initial' | 'clarifying' | 'drafted' | 'approved';
  featurePrompt: string;
  questions: ClarifyingQuestion[];
  answerString: string;
  loading: boolean;
  error: string | null;
  onFeaturePromptChange: (value: string) => void;
  onAskClarifyingQuestions: () => Promise<void>;
  onAnswerStringChange: (value: string) => void;
};

export function ChatPanel(props: ChatPanelProps) {
  const setAnswer = (questionNumber: number, option: string) => {
    const chunks = props.answerString
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    const map = new Map<number, string>();

    for (const chunk of chunks) {
      const match = chunk.match(/^(\d+)([A-Za-z])$/);
      if (!match) {
        continue;
      }
      map.set(Number(match[1]), match[2].toUpperCase());
    }

    map.set(questionNumber, option);

    const selections: AnswerSelection[] = [...map.entries()].map(([question, selectedOption]) => ({
      question,
      option: selectedOption,
    }));

    props.onAnswerStringChange(formatAnswerString(selections));
  };

  return (
    <section className="panel">
      <h2>Chat</h2>
      <div className="stack-sm">
        <label htmlFor="feature-prompt">Feature request prompt</label>
        <textarea
          id="feature-prompt"
          rows={4}
          placeholder="Describe the feature you want to build..."
          value={props.featurePrompt}
          onChange={(event) => props.onFeaturePromptChange(event.target.value)}
        />
        <button
          className="button"
          disabled={props.loading || !props.featurePrompt.trim()}
          onClick={() => props.onAskClarifyingQuestions()}
          type="button"
        >
          Ask clarifying questions
        </button>

        {props.stage !== 'initial' && props.questions.length > 0 ? (
          <div className="stack-sm">
            <p className="panel-muted">Answer using strict format: 1B, 2C, 3A</p>
            {props.questions.map((question) => (
              <div className="selected-repo" key={question.number}>
                <p>
                  <strong>
                    {question.number}. {question.prompt}
                  </strong>
                </p>
                <div className="quick-options">
                  {question.options.map((option) => (
                    <button
                      className="button button-secondary"
                      key={option.label}
                      onClick={() => setAnswer(question.number, option.label)}
                      type="button"
                    >
                      {option.label}) {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <label htmlFor="answer-string">Answers</label>
            <input
              id="answer-string"
              placeholder="1B, 2C, 3A"
              value={props.answerString}
              onChange={(event) => props.onAnswerStringChange(event.target.value)}
            />
          </div>
        ) : null}

        {props.error ? <p className="error-text">{props.error}</p> : null}
      </div>
    </section>
  );
}
