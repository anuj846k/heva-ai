import { resumeAgent } from "@/lib/runner";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  queueMicrotask(() => resumeAgent(id));

  return Response.json({ ok: true });
}
