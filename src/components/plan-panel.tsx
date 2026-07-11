'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  XCircleIcon,
} from 'lucide-react';
import { toolNames, formatToolName } from '@/lib/tools';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlanStep } from '@/lib/types';
import { Loader2Icon } from 'lucide-react';

interface PlanPanelProps {
  plan: PlanStep[];
  isEditing: boolean;
  onSavePlan: (plan: PlanStep[]) => void;
  onCancelEdit: () => void;
  currentStepIndex: number;
}

const statusIcon = (status: PlanStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className='size-4 text-green-600 shrink-0' />;
    case 'running':
      return <ClockIcon className='size-4 animate-pulse shrink-0' />;
    case 'failed':
      return <XCircleIcon className='size-4 text-red-600 shrink-0' />;
    default:
      return <CircleIcon className='size-4 text-muted-foreground shrink-0' />;
  }
};

export function PlanPanel({
  plan,
  isEditing,
  onSavePlan,
  onCancelEdit,
  currentStepIndex,
}: PlanPanelProps) {
  const [editablePlan, setEditablePlan] = useState<PlanStep[]>(plan);
  const [isSaving, setIsSaving] = useState(false);

  if (plan.length === 0) return null;

  if (isEditing) {
    return (
      <div className='space-y-3'>
        <h3 className='font-semibold text-sm'>Edit Plan</h3>
        {editablePlan.map((step, i) => (
          <div key={step.id} className='space-y-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-xs'>
                  Step {i + 1}
                </span>
                {statusIcon(step.status)}
                {step.status === 'completed' ? (
                  <span className='font-medium text-xs'>{formatToolName(step.toolName)}</span>
                ) : (
                  <select
                    value={step.toolName}
                    onChange={(e) => {
                      const next = [...editablePlan];
                      next[i] = { ...next[i], toolName: e.target.value };
                      setEditablePlan(next);
                    }}
                    className='text-xs bg-background border border-input rounded px-1.5 py-0.5 text-foreground focus:outline-none'
                  >
                    {toolNames.map((name) => (
                      <option key={name} value={name}>
                        {formatToolName(name)}
                      </option>
                    ))}
                  </select>
                )}
                {step.status === 'completed' && (
                  <Badge variant='secondary' className='text-[10px] h-4'>
                    Completed
                  </Badge>
                )}
              </div>
              {step.status !== 'completed' && (
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-6 px-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs'
                  onClick={() => {
                    const next = editablePlan.filter((_, idx) => idx !== i);
                    setEditablePlan(next);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <Textarea
              value={step.description}
              disabled={step.status === 'completed'}
              onChange={(e) => {
                const next = [...editablePlan];
                next[i] = { ...next[i], description: e.target.value };
                setEditablePlan(next);
              }}
              placeholder='Step description...'
              className='min-h-[40px] text-xs resize-none'
            />
          </div>
        ))}
        <Button
          size='sm'
          variant='outline'
          className='w-full text-xs h-8 border-dashed'
          onClick={() => {
            const newStep: PlanStep = {
              id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              description: '',
              toolName: 'web_search',
              input: {},
              status: 'pending',
            };
            setEditablePlan([...editablePlan, newStep]);
          }}
        >
          + Add Step
        </Button>
        <div className='flex gap-2 pt-1.5'>
          <Button
            size='sm'
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              try {
                await onSavePlan(editablePlan);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
            Save Plan
          </Button>
          <Button size='sm' variant='outline' disabled={isSaving} onClick={onCancelEdit}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <h3 className='font-semibold text-sm'>Plan</h3>
      {plan.map((step, i) => (
        <div
          key={step.id}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
            step.status === 'completed'
              ? 'bg-muted/50 text-muted-foreground'
              : step.status === 'running'
                ? 'bg-primary/5 text-foreground'
                : step.status === 'failed'
                  ? 'bg-destructive/5 text-destructive'
                  : 'bg-background text-muted-foreground',
          )}
        >
          <span className='text-muted-foreground text-xs w-5'>{i + 1}</span>
          {statusIcon(step.status)}
          <Badge variant='secondary' className='text-[10px] h-4 shrink-0'>
            {formatToolName(step.toolName)}
          </Badge>
          <span className='truncate'>{step.description}</span>
        </div>
      ))}
    </div>
  );
}
