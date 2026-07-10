import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { startAgent } from "@/lib/runner";
import { desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { goal } = await req.json();
  if (!goal || typeof goal !== "string") {
    return Response.json({ error: "goal is required" }, { status: 400 });
  }
  const [run] = await db
    .insert(runs)
    .values({ goal, status: "queued" })
    .returning({ id: runs.id });

  queueMicrotask(() => startAgent(run.id, goal));

  return Response.json({ id: run.id });
} 

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const all = await db
    .select({
      id: runs.id,
      goal: runs.goal,
      status: runs.status,
      createdAt: runs.createdAt,
    })
    .from(runs)
    .orderBy(desc(runs.createdAt))
    .limit(limit)
    .offset(offset);

  return Response.json(all);
}
