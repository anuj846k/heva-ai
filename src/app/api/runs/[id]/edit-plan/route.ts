import { db } from "@/db/drizzle";
import { runs } from "@/db/schema";
import { emitEvent } from "@/lib/events";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { plan } = await req.json();

  const existing = await db
    .select({ id: runs.id })
    .from(runs)
    .where(eq(runs.id, id))
    .limit(1);

  if (!existing.length) {
    return Response.json({ error: "run not found" }, { status: 404 });
  }

  await db.update(runs).set({ plan }).where(eq(runs.id, id));

  await emitEvent({
    type: "plan_edited",
    runId: id,
    plan,
    at: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
