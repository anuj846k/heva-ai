"use client";

import { useCallback } from "react";

export function useRunControls(runId: string) {
  const pause = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('heva-run-status', { detail: { runId, status: 'paused' } }));
    await fetch(`/api/runs/${runId}/pause`, { method: "POST" });
  }, [runId]);

  const resume = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('heva-run-status', { detail: { runId, status: 'running' } }));
    await fetch(`/api/runs/${runId}/resume`, { method: "POST" });
  }, [runId]);

  const rollback = useCallback(
    async (toStepIndex: number) => {
      await fetch(`/api/runs/${runId}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStepIndex }),
      });
    },
    [runId],
  );

  const editPlan = useCallback(
    async (plan: unknown) => {
      await fetch(`/api/runs/${runId}/edit-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
    },
    [runId],
  );

  const abandon = useCallback(async () => {
    await fetch(`/api/runs/${runId}/abandon`, { method: "POST" });
  }, [runId]);

  return { pause, resume, rollback, editPlan, abandon };
}
