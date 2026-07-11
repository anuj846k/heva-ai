import { eq, and } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { runs, checkpoints } from '@/db/schema';
import { emitEvent } from './events';
import { createPlan, askGeminiForStep, generateFinalOutput } from './gemini';
import { runTool } from './tools';
import type { PlanStep, RunStatus } from './types';

async function getRun(runId: string) {
  const rows = await db.select().from(runs).where(eq(runs.id, runId)).limit(1);
  return rows[0] ?? null;
}

async function updateStatus(runId: string, status: RunStatus) {
  await db.update(runs).set({ status }).where(eq(runs.id, runId));
  await emitEvent({
    type: 'run_status',
    runId,
    status,
    at: new Date().toISOString(),
  });
}

async function saveCheckpoint(
  runId: string,
  stepIndex: number,
  state: { contextSummary: string },
) {
  await db.insert(checkpoints).values({
    runId,
    stepIndex,
    state,
  });
  await db
    .update(runs)
    .set({ currentStepIndex: stepIndex + 1 })
    .where(eq(runs.id, runId));
}

async function loadCheckpoint(runId: string, stepIndex: number) {
  const rows = await db
    .select()
    .from(checkpoints)
    .where(
      and(eq(checkpoints.runId, runId), eq(checkpoints.stepIndex, stepIndex)),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function startAgent(runId: string, goal: string) {
  await updateStatus(runId, 'planning');

  try {
    const plan: PlanStep[] = await createPlan(goal);
    await db.update(runs).set({ plan }).where(eq(runs.id, runId));
    await emitEvent({
      type: 'plan_created',
      runId,
      plan,
      at: new Date().toISOString(),
    });
    await updateStatus(runId, 'running');
    await executeFrom(runId, 0, '');
  } catch (err) {
    await emitEvent({
      type: 'tool_error',
      runId,
      stepId: 'plan',
      tool: 'planner',
      error: err instanceof Error ? err.message : 'Planning failed',
      at: new Date().toISOString(),
    });
    await updateStatus(runId, 'failed');
  }
}

export async function resumeAgent(runId: string) {
  const run = await getRun(runId);
  if (!run) return;

  const startIndex =
    (run.rollbackToStepIndex as number) ?? run.currentStepIndex;
  let contextSummary = "";

  if (startIndex > 0) {
    const checkpoint = await loadCheckpoint(runId, startIndex - 1);
    if (checkpoint) {
      const state = checkpoint.state as { contextSummary: string };
      contextSummary = state.contextSummary;
    }
  }

  if (run.rollbackToStepIndex != null) {
    await db
      .update(runs)
      .set({ rollbackToStepIndex: null })
      .where(eq(runs.id, runId));
  }

  await emitEvent({
    type: "run_resumed",
    runId,
    at: new Date().toISOString(),
  });
  await updateStatus(runId, "running");
  await executeFrom(runId, startIndex, contextSummary);
}

async function executeFrom(
  runId: string,
  startIndex: number,
  initialContext: string,
) {
  const run = await getRun(runId);
  if (!run) return;

  const plan = run.plan as PlanStep[];
  let contextSummary = initialContext;

  for (let i = startIndex; i < plan.length; i++) {
    const current = await getRun(runId);
    if (!current || current.status === 'paused') return;

    const step = plan[i];

    try {
      const { reasoningText, functionCall } = await askGeminiForStep(
        step.description,
        step.toolName,
        contextSummary || 'No previous steps completed yet.',
        step.input as Record<string, unknown> | undefined,
      );

      if (reasoningText) {
        await emitEvent({
          type: 'reasoning_delta',
          runId,
          stepId: step.id,
          text: reasoningText,
          at: new Date().toISOString(),
        });
      }

      if (!functionCall || !functionCall.name || !functionCall.args) {
        continue;
      }

      await emitEvent({
        type: 'tool_started',
        runId,
        stepId: step.id,
        tool: functionCall.name,
        input: functionCall.args,
        at: new Date().toISOString(),
      });

      const result = await runTool(functionCall.name, functionCall.args);

      if (!result.ok) {
        await emitEvent({
          type: 'tool_error',
          runId,
          stepId: step.id,
          tool: functionCall.name,
          error: result.error,
          at: new Date().toISOString(),
        });
        contextSummary += `\nStep "${step.description}" FAILED: ${result.error}`;
        await updateStatus(runId, 'paused');
        return;
      }

      await emitEvent({
        type: 'tool_result',
        runId,
        stepId: step.id,
        tool: functionCall.name,
        output: result.data,
        at: new Date().toISOString(),
      });

      contextSummary += `\nStep "${step.description}" (${functionCall.name}): ${JSON.stringify(result.data).slice(0, 500)}`;

      await saveCheckpoint(runId, i, { contextSummary });

      await emitEvent({
        type: 'step_completed',
        runId,
        stepId: step.id,
        at: new Date().toISOString(),
      });
    } catch (err) {
      await emitEvent({
        type: 'tool_error',
        runId,
        stepId: step.id,
        tool: 'unknown',
        error: err instanceof Error ? err.message : 'Step failed',
        at: new Date().toISOString(),
      });
      await updateStatus(runId, 'paused');
      return;
    }
  }

  try {
    const finalOutput = await generateFinalOutput(
      (run.goal as string) || '',
      contextSummary,
    );

    await db.update(runs).set({ finalOutput }).where(eq(runs.id, runId));

    await emitEvent({
      type: 'final_output',
      runId,
      content: finalOutput,
      at: new Date().toISOString(),
    });

    await updateStatus(runId, 'completed');
  } catch (err) {
    await emitEvent({
      type: 'tool_error',
      runId,
      stepId: 'final',
      tool: 'summarizer',
      error:
        err instanceof Error ? err.message : 'Final summary generation failed',
      at: new Date().toISOString(),
    });
    await updateStatus(runId, 'failed');
  }
}
