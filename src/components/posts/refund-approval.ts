/**
 * The refund rule from "The agentic software gold rush", as an agent wrote
 * it. The Post prints the same function and the same tests, and the
 * playground beside it runs these, so the passing run and the failing example
 * a reader triggers are real results rather than messages written to look
 * like them.
 *
 * The requirement says refunds of $500 or more need approval. The function is
 * wrong on purpose, and so are the agent's tests, in the same way.
 */
export function needsApproval(amount: number): boolean {
  return amount > 500;
}

/** One example: an amount and what `needsApproval` should say about it. */
export interface Example {
  amount: number;
  expected: boolean;
}

export interface ExampleResult extends Example {
  actual: boolean;
  passed: boolean;
}

/** The tests the agent wrote alongside the function. */
export const agentExamples: Example[] = [
  { amount: 499, expected: false },
  { amount: 501, expected: true },
  { amount: 500, expected: false },
];

/** The example the product owner gave when the rule was agreed. */
export const requirementExamples: Example[] = [{ amount: 500, expected: true }];

export function runExamples(examples: Example[]): ExampleResult[] {
  return examples.map((example) => {
    const actual = needsApproval(example.amount);
    return { ...example, actual, passed: actual === example.expected };
  });
}
