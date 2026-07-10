import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  ThinkingLevel,
} from '@google/genai';
import * as z from 'zod';
import { toolDeclarations } from './tools';
import type { PlanStep } from './types';

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error('Missing GOOGLE_API_KEY environment variable');

const ai = new GoogleGenAI({ apiKey });

const planOutputSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      toolName: z.enum([
        'web_search',
        'content',
        'write_file',
        'public_api_call',
      ]),
      input: z.record(z.string(), z.unknown()),
    }),
  ),
});

type PlanOutput = z.infer<typeof planOutputSchema>;

const planJsonSchema = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          description: { type: 'string' },
          toolName: { type: 'string' },
          input: { type: 'object' },
        },
        required: ['id', 'description', 'toolName', 'input'],
      },
    },
  },
  required: ['steps'],
};

export async function createPlan(goal: string): Promise<PlanStep[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Break this goal into 3-6 concrete steps. Goal: "${goal}".
Each step must use one of: web_search, content, write_file, public_api_call.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: planJsonSchema,
    },
  });

  const text = response.text;
  if (!text)
    throw new Error('Plan creation failed: empty response from Gemini');

  const parsed: PlanOutput = planOutputSchema.parse(JSON.parse(text));
  return parsed.steps.map((s) => ({ ...s, status: 'pending' as const }));
}

function extractThoughts(
  response: Awaited<ReturnType<typeof ai.models.generateContent>>,
) {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return '';
  return parts
    .filter((p) => p.thought === true)
    .map((p) => p.text ?? '')
    .join('\n');
}

export async function askGeminiForStep(
  stepDescription: string,
  toolName: string,
  contextSummary: string,
  plannedInput?: Record<string, unknown>,
) {
  const inputHint = plannedInput
    ? `\n\nPlanned input hint: ${JSON.stringify(plannedInput)}`
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Context so far: ${contextSummary}\n\nCurrent step: ${stepDescription}\n\nIntended tool: ${toolName}${inputHint}`,
    config: {
      tools: [{ functionDeclarations: toolDeclarations as any }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.VALIDATED,
          allowedFunctionNames: [toolName],
        },
      },

      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
        includeThoughts: true,
      },
    },
  });

  return {
    reasoningText: extractThoughts(response) || response.text || '',
    functionCall: response.functionCalls?.[0] ?? null,
  };
}

export async function generateFinalOutput(
  goal: string,
  contextSummary: string,
) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Goal: "${goal}"\n\nHere is everything the tools discovered:\n\n${contextSummary}\n\nWrite a clean, structured final summary of the findings. Include all key information.`,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
        includeThoughts: true,
      },
    },
  });

  return response.text || 'No final output generated.';
}
