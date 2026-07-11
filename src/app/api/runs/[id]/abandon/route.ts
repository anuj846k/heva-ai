import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { emitEvent } from "@/lib/events";
import { eq } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await db.update(runs).set({ status: "failed" }).where(eq(runs.id, id));

  await emitEvent({
    type: "run_status",
    runId: id,
    status: "failed",
    at: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
