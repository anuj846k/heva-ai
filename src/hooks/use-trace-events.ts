'use client';

import { useEffect, useState } from 'react';
import type { TraceEvent, PlanStep } from '@/lib/types';

export interface ToolCallState {
  stepId: string;
  tool: string;
  input: unknown;
  output?: unknown;
  error?: string;
  state: 'running' | 'completed' | 'error';
  startedAt: string;
  completedAt?: string;
}

export function useTraceEvents(runId: string) {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [status, setStatus] = useState<string>('queued');
  const [finalOutput, setFinalOutput] = useState<string | null>(null);
  const [toolCalls, setToolCalls] = useState<Map<string, ToolCallState>>(
    new Map(),
  );
  const [goal, setGoal] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<
    Map<string, { text: string; isStreaming: boolean }>
  >(new Map());

  useEffect(() => {
    setEvents([]);
    setPlan([]);
    setStatus('queued');
    setFinalOutput(null);
    setToolCalls(new Map());
    setReasoning(new Map());
    setGoal(null);

    fetch(`/api/runs/${runId.trim()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.goal) setGoal(data.goal);
      })
      .catch(() => {});

    const es = new EventSource(`/api/runs/${runId.trim()}/stream`);

    const eventTypes = [
      'plan_created',
      'reasoning_delta',
      'tool_started',
      'tool_result',
      'tool_error',
      'step_completed',
      'run_status',
      'run_paused',
      'plan_edited',
      'run_resumed',
      'rollback',
      'final_output',
    ];

    const listeners: Array<[string, (e: MessageEvent) => void]> = [];

    for (const type of eventTypes) {
      const handler = (raw: MessageEvent) => {
        try {
          const evt = JSON.parse(raw.data) as TraceEvent;
          setEvents((prev) => [...prev, evt]);

          switch (evt.type) {
            case 'plan_created':
            case 'plan_edited':
              setPlan(evt.plan);
              break;
            case 'run_status':
              setStatus(evt.status);
              break;
            case 'run_paused':
              setStatus('paused');
              break;
            case 'run_resumed':
              setStatus('running');
              break;
            case 'final_output':
              setFinalOutput(evt.content);
              break;
            case 'reasoning_delta': {
              setReasoning((prev) => {
                const next = new Map(prev);
                const existing = next.get(evt.stepId);
                next.set(evt.stepId, {
                  text: existing ? existing.text + '\n\n' + evt.text : evt.text,
                  isStreaming: true,
                });
                return next;
              });
              break;
            }
            case 'tool_started': {
              setToolCalls((prev) => {
                const next = new Map(prev);
                next.set(evt.stepId, {
                  stepId: evt.stepId,
                  tool: evt.tool,
                  input: evt.input,
                  state: 'running',
                  startedAt: evt.at,
                });
                return next;
              });
              break;
            }
            case 'tool_result': {
              setToolCalls((prev) => {
                const next = new Map(prev);
                const existing = next.get(evt.stepId);
                if (existing) {
                  next.set(evt.stepId, {
                    ...existing,
                    output: evt.output,
                    state: 'completed',
                    completedAt: evt.at,
                  });
                }
                return next;
              });
              setReasoning((prev) => {
                const next = new Map(prev);
                const existing = next.get(evt.stepId);
                if (existing) {
                  next.set(evt.stepId, { ...existing, isStreaming: false });
                }
                return next;
              });
              break;
            }
            case 'tool_error': {
              setToolCalls((prev) => {
                const next = new Map(prev);
                const existing = next.get(evt.stepId);
                if (existing) {
                  next.set(evt.stepId, {
                    ...existing,
                    error: evt.error,
                    state: 'error',
                    completedAt: evt.at,
                  });
                }
                return next;
              });
              setReasoning((prev) => {
                const next = new Map(prev);
                const existing = next.get(evt.stepId);
                if (existing) {
                  next.set(evt.stepId, { ...existing, isStreaming: false });
                }
                return next;
              });
              break;
            }
            case 'step_completed': {
              setPlan((prev) =>
                prev.map((s) =>
                  s.id === evt.stepId ? { ...s, status: 'completed' } : s,
                ),
              );
              break;
            }
          }
        } catch {}
      };
      es.addEventListener(type, handler);
      listeners.push([type, handler]);
    }

    return () => {
      for (const [type, handler] of listeners) {
        es.removeEventListener(type, handler);
      }
      es.close();
    };
  }, [runId]);

  return {
    events,
    plan,
    status,
    finalOutput,
    toolCalls,
    reasoning,
    goal,
  };
}
