"use client";

import { Button } from "@/components/ui/button";
import { Undo2Icon } from "lucide-react";

interface ControlBarProps {
  status: string;
  onRollback: (stepIndex: number) => void;
  onEditPlan: () => void;
  completedStepCount: number;
  isEditing: boolean;
}

export function ControlBar({
  status,
  onRollback,
  onEditPlan,
  completedStepCount,
  isEditing,
}: ControlBarProps) {
  if (status !== "paused") return null;

  return (
    <div className="border-t bg-muted/30 p-2">
      {completedStepCount > 0 && (
        <div className="flex items-center gap-2">
          <Undo2Icon className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">Rollback to:</span>
          {Array.from({ length: completedStepCount }, (_, i) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              onClick={() => onRollback(i + 1)}
              className="h-7 px-2 text-xs"
            >
              Step {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
