import { GoogleGenAI } from '@google/genai';
import * as z from 'zod';
import { toolDeclarations } from './tools';
import type { PlanStep } from './types';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

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
    model: 'gemini-2.5-flash',
    contents: `Break this goal into 3-6 concrete steps. Goal: "${goal}".
Each step must use one of: web_search, content, write_file, public_api_call.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: planJsonSchema,
    },
  });

  const parsed: PlanOutput = planOutputSchema.parse(JSON.parse(response.text!));
  return parsed.steps.map((s) => ({ ...s, status: 'pending' as const }));
}

export async function askGeminiForStep(
  stepDescription: string,
  contextSummary: string,
) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Context so far: ${contextSummary}\n\nCurrent step: ${stepDescription}\n\nExplain your reasoning in 1-2 sentences before acting.`,
    config: {
      tools: [{ functionDeclarations: toolDeclarations }],
    },
  });

  return {
    reasoningText: response.text ?? '',
    functionCall: response.functionCalls?.[0] ?? null,
  };
}
