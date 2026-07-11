'use client';

import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning';
import {
  ToolCard,
  ToolCardHeader,
  ToolCardContent,
  ToolCardInput,
  ToolCardOutput,
} from '@/components/ai-elements/tool-card';
import type { ToolCallState } from '@/hooks/use-trace-events';
import type { TraceEvent } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircleIcon, InfoIcon, RotateCcwIcon, FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatToolName } from '@/lib/tools';

interface TraceEventCardProps {
  event: TraceEvent;
  toolCall?: ToolCallState;
  reasoningText?: string;
  isStreaming?: boolean;
  onOpenArtifact?: (doc: { docType: 'markdown' | 'html' | 'json' | 'csv'; title: string; content: string }) => void;
}

export function TraceEventCard({
  event,
  toolCall,
  reasoningText,
  isStreaming,
  onOpenArtifact,
}: TraceEventCardProps) {
  if (event.type === 'run_paused') {
    return (
      <Alert variant='default' className='border-yellow-500/50 bg-yellow-500/5'>
        <InfoIcon className='size-4' />
        <AlertDescription className='text-sm'>
          Paused — edit plan or resume to continue
        </AlertDescription>
      </Alert>
    );
  }

  if (event.type === 'run_resumed') {
    return (
      <Alert variant='default' className='border-green-500/50 bg-green-500/5'>
        <InfoIcon className='size-4' />
        <AlertDescription className='text-sm'>Resumed</AlertDescription>
      </Alert>
    );
  }

  if (event.type === 'rollback') {
    return (
      <Alert variant='default' className='border-orange-500/50 bg-orange-500/5'>
        <RotateCcwIcon className='size-4' />
        <AlertDescription className='text-sm'>
          Rolled back to step {event.toStepIndex as number}
        </AlertDescription>
      </Alert>
    );
  }

  if (event.type === 'tool_error' && !toolCall) {
    const te = event as Record<string, unknown>;
    return (
      <Alert variant='destructive'>
        <AlertCircleIcon className='size-4' />
        <AlertDescription className='text-sm'>
          {String(te.tool)}: {String(te.error)}
        </AlertDescription>
      </Alert>
    );
  }

  if (event.type === 'reasoning_delta' && reasoningText) {
    return (
      <Reasoning isStreaming={isStreaming ?? false} defaultOpen={isStreaming}>
        <ReasoningTrigger />
        <ReasoningContent>{reasoningText}</ReasoningContent>
      </Reasoning>
    );
  }

  if (event.type === 'tool_started') {
    if (!toolCall) return null;

    if (toolCall.tool === 'create_document') {
      const output = toolCall.output as { docType: 'markdown' | 'html' | 'json' | 'csv'; title: string; content: string } | undefined;
      return (
        <ToolCard defaultOpen>
          <ToolCardHeader
            toolName={formatToolName(toolCall.tool)}
            state={toolCall.state}
            duration={
              toolCall.startedAt && toolCall.completedAt
                ? `${((new Date(toolCall.completedAt).getTime() - new Date(toolCall.startedAt).getTime()) / 1000).toFixed(1)}s`
                : undefined
            }
          />
          <ToolCardContent>
            {toolCall.input != null && (
              <ToolCardInput input={toolCall.input as Record<string, unknown>} />
            )}
            {toolCall.state === 'completed' && output && (
              <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileTextIcon className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium truncate">{output.title}</span>
                </div>
                {onOpenArtifact && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 shrink-0"
                    onClick={() => onOpenArtifact(output)}
                  >
                    Open Artifact
                  </Button>
                )}
              </div>
            )}
          </ToolCardContent>
        </ToolCard>
      );
    }

    if (toolCall.tool === 'show_map' && toolCall.state === 'completed') {
      const output = toolCall.output as { query: string; mode?: 'place' | 'directions' | 'search'; origin?: string; destination?: string } | undefined;
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (output && key) {
        let src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(output.query)}`;
        if (output.mode === 'search') {
          src = `https://www.google.com/maps/embed/v1/search?key=${key}&q=${encodeURIComponent(output.query)}`;
        } else if (output.mode === 'directions' && output.origin && output.destination) {
          src = `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${encodeURIComponent(output.origin)}&destination=${encodeURIComponent(output.destination)}`;
        }
        return (
          <div className="rounded-lg border border-border bg-card overflow-hidden my-2">
            <div className="bg-muted/40 px-3 py-2 border-b text-xs font-medium text-muted-foreground">
              Google Maps — {output.mode ? output.mode.toUpperCase() : 'PLACE'}
            </div>
            <div className="relative w-full aspect-video">
              <iframe
                title="Google Maps Embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={src}
              />
            </div>
          </div>
        );
      }
    }

    return (
      <ToolCard defaultOpen>
        <ToolCardHeader
          toolName={formatToolName(toolCall.tool)}
          state={toolCall.state}
          duration={
            toolCall.startedAt && toolCall.completedAt
              ? `${((new Date(toolCall.completedAt).getTime() - new Date(toolCall.startedAt).getTime()) / 1000).toFixed(1)}s`
              : undefined
          }
        />
        <ToolCardContent>
          {toolCall.input != null && (
            <ToolCardInput input={toolCall.input as Record<string, unknown>} />
          )}
          {(toolCall.output || toolCall.error) && (
            <ToolCardOutput
              output={toolCall.output || undefined}
              errorText={toolCall.error}
            />
          )}
        </ToolCardContent>
      </ToolCard>
    );
  }

  return null;
}
