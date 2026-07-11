import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SquarePenIcon } from "lucide-react";

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

export async function SidebarHistory() {
  const all = await db
    .select({
      id: runs.id,
      goal: runs.goal,
      status: runs.status,
      createdAt: runs.createdAt,
    })
    .from(runs)
    .orderBy(desc(runs.createdAt))
    .limit(50);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      <div className="p-3 border-b flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm">
          Heva AI
        </Link>
        <Link
          href="/"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New run"
        >
          <SquarePenIcon className="size-4" />
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {all.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className={cn(
                "flex items-start gap-1.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted group",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs leading-tight">{run.goal}</p>
                <p className="text-muted-foreground text-[10px]">
                  {new Date(run.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                {statusBadge(run.status)}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
