import { z } from "zod";
import { Type } from "@google/genai";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const exaApiKey = process.env.EXA_API_KEY!;
if (!exaApiKey) throw new Error("Missing EXA_API_KEY environment variable");

const webSearchSchema = z.object({ query: z.string() });
const fetchUrlSchema = z.object({ url: z.url() });
const writeFileSchema = z.object({
  filename: z.string(),
  content: z.string(),
});
const publicApiSchema = z.object({
  endpoint: z.url(),
  method: z.enum(['GET', 'POST']).optional().default('GET'),
  body: z.record(z.string(), z.unknown()).optional(),
});

export const toolDeclarations = [
  {
    name: 'web_search',
    description: 'Search the web for information relevant to the goal',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'content',
    description: 'Fetch a web page and return its text content',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: 'The URL to fetch' },
      },
      required: ['url'],
    },
  },
  {
    name: 'write_file',
    description: 'Write text content to a named file for later retrieval',
    parameters: {
      type: Type.OBJECT,
      properties: {
        filename: {
          type: Type.STRING,
          description: 'Name of the file, e.g. notes.md',
        },
        content: {
          type: Type.STRING,
          description: 'The text content to write',
        },
      },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'public_api_call',
    description: 'Make an HTTP request to a public API and return JSON data',
    parameters: {
      type: Type.OBJECT,
      properties: {
        endpoint: {
          type: Type.STRING,
          description: 'Full URL of the API endpoint',
        },
        method: {
          type: Type.STRING,
          description: 'HTTP method: GET or POST',
        },
        body: {
          type: Type.OBJECT,
          description: 'JSON body for POST requests',
        },
      },
      required: ['endpoint'],
    },
  },
];

export async function runTool(name: string, rawInput: unknown) {
  try {
    switch (name) {
      case 'web_search': {
        const { query } = webSearchSchema.parse(rawInput);
        const res = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            query,
            type: 'auto',
            numResults: 5,
            contents: { highlights: true },
          }),
          signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        return {
          ok: true as const,
          data: { results: data.results ?? [], query: data.query },
        };
      }
      case 'content': {
        const { url } = fetchUrlSchema.parse(rawInput);
        const res = await fetch('https://api.exa.ai/contents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify({
            urls: [url],
            text: { maxCharacters: 20000, verbosity: "compact" },
          }),
          signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        const text = data.results?.[0]?.text || '';
        return { ok: true as const, data: { text: text.slice(0, 5000) } };
      }
      case 'write_file': {
        const { filename, content } = writeFileSchema.parse(rawInput);
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const dir = './output';
        await mkdir(dir, { recursive: true });
        const fullPath = path.join(dir, safeName);
        await writeFile(fullPath, content, 'utf-8');
        return {
          ok: true as const,
          data: { path: fullPath, bytesWritten: content.length },
        };
      }
      case 'public_api_call': {
        const { endpoint, method, body } = publicApiSchema.parse(rawInput);
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'POST' && body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) throw new Error(`API call failed: ${res.status}`);
        return { ok: true as const, data: await res.json() };
      }
      default:
        return { ok: false as const, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : 'Tool execution failed',
    };
  }
}
