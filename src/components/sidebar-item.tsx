"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  id: string;
  goal: string;
  createdAt: string;
  initialStatus: string;
}

const statusBadge = (status: string) => {
  const variants: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    queued: { variant: "outline", label: "Queued" },
    planning: { variant: "outline", label: "Planning" },
    running: { variant: "default", label: "Running" },
    paused: { variant: "secondary", label: "Paused" },
    completed: { variant: "default", label: "Completed" },
    failed: { variant: "destructive", label: "Failed" },
  };
  const v = variants[status] ?? { variant: "outline" as const, label: status };
  return <Badge variant={v.variant}>{v.label}</Badge>;
};

export function SidebarItem({ id, goal, createdAt, initialStatus }: SidebarItemProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ runId: string; status: string }>;
      if (customEvent.detail && customEvent.detail.runId === id) {
        setStatus(customEvent.detail.status);
      }
    };

    window.addEventListener("heva-run-status", handleStatusChange);
    return () => {
      window.removeEventListener("heva-run-status", handleStatusChange);
    };
  }, [id]);

  return (
    <Link
      href={`/runs/${id}`}
      className={cn(
        "flex items-start gap-1.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted group"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs leading-tight">{goal}</p>
        <p className="text-muted-foreground text-[10px]">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        {statusBadge(status)}
      </div>
    </Link>
  );
}
