import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [run] = await db
    .select({
      id: runs.id,
      goal: runs.goal,
      status: runs.status,
      plan: runs.plan,
      currentStepIndex: runs.currentStepIndex,
      finalOutput: runs.finalOutput,
      createdAt: runs.createdAt,
    })
    .from(runs)
    .where(eq(runs.id, id))
    .limit(1);

  if (!run) {
    return Response.json({ error: "Run not found" }, { status: 404 });
  }

  return Response.json(run);
}
