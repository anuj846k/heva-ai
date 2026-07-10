import 'dotenv/config';
import { db } from '@/db/drizzle';
import { runs } from '@/db/schema';
import { subscribeToRun, getPastEvents } from '@/lib/events';
import { startAgent } from '@/lib/runner';

async function main() {
  const goal = 'Research top 3 AI note-taking apps and write a summary to file';
  const [run] = await db
    .insert(runs)
    .values({ goal, status: 'queued' })
    .returning({ id: runs.id });

  console.log(`Created run: ${run.id}`);
  console.log(`Goal: "${goal}"\n`);

  const eventLog: string[] = [];
  const unsubscribe = subscribeToRun(run.id, (evt) => {
    const icon =
      evt.type === 'plan_created'
        ? '📋'
        : evt.type === 'reasoning_delta'
          ? '🧠'
          : evt.type === 'tool_started'
            ? '🔧'
            : evt.type === 'tool_result'
              ? '✅'
              : evt.type === 'tool_error'
                ? '❌'
                : evt.type === 'final_output'
                  ? '📄'
                  : evt.type === 'run_status'
                    ? '🔄'
                    : 'ℹ️';
    console.log(`${icon} ${evt.type}`);
    eventLog.push(evt.type);
  });
  console.log('\n🚀 Starting agent...\n');
  await startAgent(run.id, goal);

  const dbEvents = await getPastEvents(run.id);
  console.log(
    `\n📊 Live events: ${eventLog.length}, DB events: ${dbEvents.length}`,
  );
  console.log(`✅ Match: ${eventLog.length === dbEvents.length}`);

  unsubscribe();
}
main().catch(console.error);
