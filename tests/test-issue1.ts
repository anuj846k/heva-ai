import 'dotenv/config';
import { createPlan, askGeminiForStep, generateFinalOutput } from "../src/lib/gemini";
import { runTool } from "../src/lib/tools";

const GOAL = 'Research top 3 AI note-taking apps and write a summary to file';

async function main() {
  console.log(`🎯 GOAL: "${GOAL}"\n`);
  console.log('='.repeat(60));

  // 1. Create plan
  console.log('\n📋 PLANNING...\n');
  const plan = await createPlan(GOAL);
  console.log(`Created ${plan.length} steps:\n`);
  plan.forEach((s, i) =>
    console.log(`  ${i + 1}. ${s.description} (tool: ${s.toolName})`),
  );

  // 2. Execute each step
  console.log(`\n${'='.repeat(60)}`);
  console.log('\n🚀 EXECUTING...\n');

  let contextSummary = '';

  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    console.log(`\n--- Step ${i + 1}/${plan.length}: ${step.description} ---`);

    // 2a. Ask Gemini what to do
    const { reasoningText, functionCall } = await askGeminiForStep(
      step.description,
      step.toolName,
      contextSummary || 'No previous steps completed yet.',
      step.input as Record<string, unknown> | undefined,
    );
    console.log(`🧠 Reasoning: ${reasoningText}`);

    if (!functionCall || !functionCall.name || !functionCall.args) {
      console.log(`⚠️  Invalid function call returned, skipping.`);
      continue;
    }

    // 2b. Execute the tool
    console.log(
      `🔧 Calling: ${functionCall.name}(${JSON.stringify(functionCall.args)})`,
    );
    const result = await runTool(functionCall.name, functionCall.args);

    if (result.ok) {
      console.log(`✅ Tool succeeded`);
      const dataPreview = JSON.stringify(result.data).slice(0, 500);
      console.log(`📦 Response: ${dataPreview}`);
      contextSummary += `\nStep "${step.description}" (${functionCall.name}): ${dataPreview}`;
    } else {
      console.log(`❌ Tool failed: ${result.error}`);
      contextSummary += `\nStep "${step.description}" FAILED: ${result.error}`;
      break;
    }
  }

  // 3. Final output
  console.log(`\n${"=".repeat(60)}`);
  console.log("\n📄 GENERATING FINAL SUMMARY...\n");
  const finalOutput = await generateFinalOutput(GOAL, contextSummary);
  console.log(finalOutput);
}

main().catch(console.error);
