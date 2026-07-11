import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SquarePenIcon } from "lucide-react";
import { SidebarItem } from "@/components/sidebar-item";

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
            <SidebarItem
              key={run.id}
              id={run.id}
              goal={run.goal}
              createdAt={run.createdAt.toISOString()}
              initialStatus={run.status}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
