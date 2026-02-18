type CounterName = 'llmCallFailed' | 'githubWriteFailed' | 'llmRateLimited';

type CounterMap = Record<CounterName, number>;

declare global {
  // eslint-disable-next-line no-var
  var __createPrdTelemetry: CounterMap | undefined;
}

function getCounters(): CounterMap {
  if (!globalThis.__createPrdTelemetry) {
    globalThis.__createPrdTelemetry = {
      llmCallFailed: 0,
      githubWriteFailed: 0,
      llmRateLimited: 0,
    };
  }

  return globalThis.__createPrdTelemetry;
}

export function incrementCounter(counter: CounterName) {
  const counters = getCounters();
  counters[counter] += 1;
}

export function readCounters() {
  return { ...getCounters() };
}
