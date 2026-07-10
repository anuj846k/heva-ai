import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { emitEvent } from "@/lib/events";
import { eq } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await db.update(runs).set({ status: "paused" }).where(eq(runs.id, id));

  await emitEvent({
    type: "run_paused",
    runId: id,
    at: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
