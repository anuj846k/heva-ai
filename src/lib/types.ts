export type StepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface PlanStep {
  id: string;
  description: string;
  toolName: string;
  input: Record<string, unknown>;
  status: StepStatus;
}

export type RunStatus =
  | 'queued'
  | 'planning'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed';

export type TraceEvent =
  | { type: 'plan_created'; runId: string; plan: PlanStep[]; at: string }
  | {
      type: 'reasoning_delta';
      runId: string;
      stepId: string;
      text: string;
      at: string;
    }
  | {
      type: 'tool_started';
      runId: string;
      stepId: string;
      tool: string;
      input: unknown;
      at: string;
    }
  | {
      type: 'tool_result';
      runId: string;
      stepId: string;
      tool: string;
      output: unknown;
      at: string;
    }
  | {
      type: 'tool_error';
      runId: string;
      stepId: string;
      tool: string;
      error: string;
      at: string;
    }
  | { type: 'step_completed'; runId: string; stepId: string; at: string }
  | { type: 'run_status'; runId: string; status: RunStatus; at: string }
  | { type: 'run_paused'; runId: string; at: string }
  | { type: 'plan_edited'; runId: string; plan: PlanStep[]; at: string }
  | { type: 'run_resumed'; runId: string; at: string }
  | { type: 'rollback'; runId: string; toStepIndex: number; at: string }
  | { type: 'final_output'; runId: string; content: string; at: string };
