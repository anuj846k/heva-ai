"use client";

import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";

export type ToolState = "running" | "completed" | "error";

const statusLabels: Record<ToolState, string> = {
  running: "Running",
  completed: "Completed",
  error: "Error",
};

const statusIcons: Record<ToolState, ReactNode> = {
  running: <ClockIcon className="size-4 animate-pulse" />,
  completed: <CheckCircleIcon className="size-4 text-green-600" />,
  error: <XCircleIcon className="size-4 text-red-600" />,
};

const getStatusBadge = (state: ToolState) => (
  <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
    {statusIcons[state]}
    {statusLabels[state]}
  </Badge>
);

export type ToolCardProps = ComponentProps<typeof Collapsible>;

export const ToolCard = ({ className, ...props }: ToolCardProps) => (
  <Collapsible
    className={cn("group not-prose mb-0 w-full rounded-md border", className)}
    defaultOpen
    {...props}
  />
);

export type ToolCardHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  toolName: string;
  state: ToolState;
  duration?: string;
};

export const ToolCardHeader = ({
  className,
  toolName,
  state,
  duration,
  ...props
}: ToolCardHeaderProps) => (
  <CollapsibleTrigger
    className={cn(
      "flex w-full items-center justify-between gap-4 p-3",
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      <WrenchIcon className="size-4 text-muted-foreground" />
      <span className="font-medium text-sm">{toolName}</span>
      {getStatusBadge(state)}
      {duration && (
        <span className="text-muted-foreground text-xs">· {duration}</span>
      )}
    </div>
    <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
);

export type ToolCardContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolCardContent = ({
  className,
  ...props
}: ToolCardContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 space-y-3 p-4 pt-0 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className,
    )}
    {...props}
  />
);

export type ToolCardInputProps = ComponentProps<"div"> & {
  input: unknown;
};

export const ToolCardInput = ({
  className,
  input,
  ...props
}: ToolCardInputProps) => {
  const value = typeof input === "string" ? input : JSON.stringify(input, null, 2);
  return (
    <div className={cn("space-y-2 overflow-hidden", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Parameters
      </h4>
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
        {value}
      </pre>
    </div>
  );
};

export type ToolCardOutputProps = ComponentProps<"div"> & {
  output: unknown;
  errorText?: string;
};

export const ToolCardOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolCardOutputProps) => {
  if (!output && !errorText) return null;

  const value = typeof output === "string" ? output : JSON.stringify(output, null, 2);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? "Error" : "Result"}
      </h4>
      <div
        className={cn(
          "overflow-x-auto rounded-md px-3 py-2 font-mono text-xs",
          errorText
            ? "bg-destructive/10 text-destructive"
            : "bg-muted",
        )}
      >
        {errorText ? (
          <span>{errorText}</span>
        ) : (
          <pre>{value}</pre>
        )}
      </div>
    </div>
  );
};
