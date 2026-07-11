"use client";

import { use, useState, useEffect } from "react";
import { useTraceEvents } from "@/hooks/use-trace-events";
import { useRunControls } from "@/hooks/use-run-controls";
import { ControlBar } from "@/components/control-bar";
import { PlanPanel } from "@/components/plan-panel";
import { TraceEventCard } from "@/components/trace-event-card";
import { ArtifactPanel, type ArtifactDoc } from "@/components/artifact-panel";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PauseIcon, PlayIcon, CheckIcon, Loader2Icon, XIcon, ChevronRightIcon, ListTodoIcon, HelpCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


export default function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { events, plan, status, finalOutput, toolCalls, reasoning, goal } =
    useTraceEvents(id);
  const { pause, resume, rollback, editPlan, abandon } = useRunControls(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<ArtifactDoc | null>(null);

  const completedCount = plan.filter((s) => s.status === "completed").length;
  const isLastStep = plan.length > 0 && completedCount >= plan.length - 1;

  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  const handleEditPlan = () => {
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsDialogOpen(false);
  };
  const handleSavePlan = async (newPlan: typeof plan) => {
    await editPlan(newPlan);
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  const handlePause = async () => {
    setIsPausing(true);
    try {
      await pause();
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    setIsResuming(true);
    try {
      await resume();
    } finally {
      setIsResuming(false);
    }
  };

  const handleAbandon = async () => {
    setIsAbandoning(true);
    try {
      await abandon();
    } finally {
      setIsAbandoning(false);
    }
  };

  useEffect(() => {
    for (const [, tc] of toolCalls) {
      if (tc.tool === "create_document" && tc.state === "completed" && tc.output) {
        const out = tc.output as ArtifactDoc;
        setActiveDoc(out);
      }
    }
  }, [toolCalls]);


  return (
    <div className="flex flex-row h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <div className="border-b shrink-0 bg-background">
          <div className="flex items-center justify-between gap-2 p-3 min-w-0 flex-wrap">
            {plan.length > 0 && (
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded font-medium truncate">
                  {status === "completed" && "Task Completed"}
                  {status === "paused" && `Paused at step ${completedCount + 1}`}
                  {status === "running" && `Working on step ${completedCount + 1} of ${plan.length}`}
                  {status !== "completed" && status !== "paused" && status !== "running" && "Preparing task..."}
                </span>
                
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setIsEditing(false);
                }}>
                  <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 text-xs px-2 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" onClick={() => setIsEditing(false)}>
                    <ListTodoIcon className="mr-1 size-3.5" /> View Plan
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? "Edit Execution Plan" : "Execution Plan"}</DialogTitle>
                    </DialogHeader>
                    
                    {isEditing ? (
                      <div className="my-2">
                        <PlanPanel
                          plan={plan}
                          isEditing={true}
                          onSavePlan={handleSavePlan}
                          onCancelEdit={handleCancelEdit}
                          currentStepIndex={0}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 my-2 max-h-[60vh] overflow-y-auto pr-1">
                        {plan.map((step, i) => {
                          const isCompleted = step.status === "completed";
                          const isFailed = step.status === "failed";
                          const isActive = i === completedCount;
                          return (
                            <div
                              key={step.id}
                              className={`flex items-start gap-3 rounded-lg border p-3 text-xs transition-all ${
                                isCompleted
                                  ? "bg-muted/40 text-muted-foreground border-border"
                                  : isFailed
                                    ? "bg-destructive/10 text-destructive border-destructive/20 font-medium"
                                    : isActive
                                      ? "bg-primary/5 text-foreground border-primary/30 ring-1 ring-primary/10 font-medium"
                                      : "text-muted-foreground border-border"
                              }`}
                            >
                              <span className="shrink-0 mt-0.5">
                                {isCompleted && <CheckIcon className="size-4 text-green-500 font-bold" />}
                                {isFailed && <XIcon className="size-4 text-destructive" />}
                                {isActive && step.status !== "completed" && (
                                  <Loader2Icon className="size-4 animate-spin text-primary" />
                                )}
                                {!isCompleted && !isFailed && !isActive && (
                                  <div className="size-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[9px] font-mono">
                                    {i + 1}
                                  </div>
                                )}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 leading-none mb-1">
                                  {step.toolName}
                                </span>
                                <span className="leading-normal break-words text-foreground">
                                  {step.description}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {status === "running" && !isLastStep && (
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handlePause} disabled={isPausing}>
                  {isPausing ? (
                    <Loader2Icon className="mr-1 size-3.5 animate-spin" />
                  ) : (
                    <PauseIcon className="mr-1 size-3.5" />
                  )}
                  Pause
                </Button>
              )}
              {status === "paused" && (
                <>
                  <Button size="sm" className="h-8 text-xs" onClick={handleResume} disabled={isResuming}>
                    {isResuming ? (
                      <Loader2Icon className="mr-1 size-3.5 animate-spin" />
                    ) : (
                      <PlayIcon className="mr-1 size-3.5" />
                    )}
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={handleEditPlan}
                    disabled={isResuming || isAbandoning}
                  >
                    Edit Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 text-xs"
                    onClick={handleAbandon}
                    disabled={isAbandoning}
                  >
                    {isAbandoning ? (
                      <Loader2Icon className="mr-1 size-3.5 animate-spin" />
                    ) : null}
                    Abandon
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

          {status === "paused" && (
            <ControlBar
              status={status}
              onRollback={rollback}
              onEditPlan={handleEditPlan}
              completedStepCount={completedCount}
              isEditing={isEditing}
            />
          )}

        {(status === "queued" || status === "planning") && plan.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="animate-pulse text-lg">
                {status === "queued" ? "Starting agent..." : "Planning..."}
              </div>
            </div>
          </div>
        ) : (
          <Conversation>
            <ConversationContent>
              {events
                .filter(
                  (e) =>
                    ![
                      "run_status",
                      "plan_created",
                      "tool_result",
                      "step_completed",
                    ].includes(e.type),
                )
                .map((evt, i) => {
                  const tc = toolCalls.get(
                    (evt as { stepId?: string }).stepId ?? "",
                  );
                  const r = reasoning.get(
                    (evt as { stepId?: string }).stepId ?? "",
                  );
                  return (
                    <TraceEventCard
                      key={`${evt.type}-${i}`}
                      event={evt}
                      toolCall={tc}
                      reasoningText={r?.text}
                      isStreaming={r?.isStreaming}
                      onOpenArtifact={setActiveDoc}
                    />
                  );
                })}

              {finalOutput && (
                <div className="prose prose-sm dark:prose-invert max-w-none pt-4 border-t border-dashed mt-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {finalOutput}
                  </ReactMarkdown>
                </div>
              )}

              {status === "running" && (
                <TraceEventCard
                  event={{
                    type: "reasoning_delta",
                    runId: id,
                    stepId: "__pending",
                    text: "Waiting for next step...",
                    at: new Date().toISOString(),
                  }}
                  reasoningText="Waiting for next step..."
                  isStreaming={true}
                />
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}
      </div>

      <ArtifactPanel doc={activeDoc} onClose={() => setActiveDoc(null)} />
    </div>
  );
}
