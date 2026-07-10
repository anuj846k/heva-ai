import * as z from "zod";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { runEvents } from "@/db/schema";
import type { TraceEvent } from "./types";

const traceEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("plan_created"),
    runId: z.string(),
    plan: z.array(z.any()),
    at: z.string(),
  }),
  z.object({
    type: z.literal("reasoning_delta"),
    runId: z.string(),
    stepId: z.string(),
    text: z.string(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("tool_started"),
    runId: z.string(),
    stepId: z.string(),
    tool: z.string(),
    input: z.unknown(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("tool_result"),
    runId: z.string(),
    stepId: z.string(),
    tool: z.string(),
    output: z.unknown(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("tool_error"),
    runId: z.string(),
    stepId: z.string(),
    tool: z.string(),
    error: z.string(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("step_completed"),
    runId: z.string(),
    stepId: z.string(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("run_status"),
    runId: z.string(),
    status: z.enum([
      "queued",
      "planning",
      "running",
      "paused",
      "completed",
      "failed",
    ]),
    at: z.string(),
  }),
  z.object({
    type: z.literal("run_paused"),
    runId: z.string(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("plan_edited"),
    runId: z.string(),
    plan: z.array(z.any()),
    at: z.string(),
  }),
  z.object({
    type: z.literal("run_resumed"),
    runId: z.string(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("rollback"),
    runId: z.string(),
    toStepIndex: z.number(),
    at: z.string(),
  }),
  z.object({
    type: z.literal("final_output"),
    runId: z.string(),
    content: z.string(),
    at: z.string(),
  }),
]);

type Listener = (evt: TraceEvent) => void;
const subscribers = new Map<string, Set<Listener>>();

export function subscribeToRun(runId: string, listener: Listener) {
  if (!subscribers.has(runId)) subscribers.set(runId, new Set());
  subscribers.get(runId)!.add(listener);
  return () => {
    subscribers.get(runId)?.delete(listener);
  };
}

export async function emitEvent(evt: TraceEvent) {
  const validated = traceEventSchema.parse(evt);

  await db.insert(runEvents).values({
    runId: validated.runId,
    type: validated.type,
    payload: validated,
  });

  subscribers.get(validated.runId)?.forEach((fn) => fn(validated as TraceEvent));
}

export async function getPastEvents(runId: string): Promise<TraceEvent[]> {
  const rows = await db
    .select({ payload: runEvents.payload })
    .from(runEvents)
    .where(eq(runEvents.runId, runId))
    .orderBy(asc(runEvents.createdAt));

  return rows.map((r) => r.payload as unknown as TraceEvent);
}
