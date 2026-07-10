import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { emitEvent } from "@/lib/events";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { toStepIndex } = await req.json();

  await db
    .update(runs)
    .set({ status: "paused", rollbackToStepIndex: toStepIndex })
    .where(eq(runs.id, id));

  await emitEvent({
    type: "rollback",
    runId: id,
    toStepIndex,
    at: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
