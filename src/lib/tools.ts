import { z } from "zod";
import { Type } from "@google/genai";


const webSearchSchema = z.object({ query: z.string() });
const fetchUrlSchema = z.object({ url: z.url() });
const createDocumentSchema = z.object({
  docType: z.enum(['markdown', 'html', 'json', 'csv']),
  title: z.string(),
  content: z.string(),
});
const showMapSchema = z.object({
  query: z.string(),
  mode: z.enum(['place', 'directions', 'search']).optional().default('place'),
  origin: z.string().optional(),
  destination: z.string().optional(),
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
    name: 'create_document',
    description:
      'Create a structured artifact document for the user. Use markdown for reports and text, html for interactive pages or visualizations, json for structured data, csv for tabular data.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        docType: {
          type: Type.STRING,
          description: 'Document type: markdown, html, json, or csv',
        },
        title: {
          type: Type.STRING,
          description: 'Human-readable title for the document',
        },
        content: {
          type: Type.STRING,
          description: 'Full content of the document',
        },
      },
      required: ['docType', 'title', 'content'],
    },
  },
  {
    name: 'show_map',
    description: 'Render an interactive Google Map for locations, searches, or directions. Mode can be: place (single location), search (finding matching places near a query), or directions (route between origin and destination).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Address, business name, or query to highlight on the map. Required for place and search modes.',
        },
        mode: {
          type: Type.STRING,
          description: 'Map view mode: place, search, or directions',
        },
        origin: {
          type: Type.STRING,
          description: 'Starting location for directions mode',
        },
        destination: {
          type: Type.STRING,
          description: 'End location for directions mode',
        },
      },
      required: ['query'],
    },
  },
];

export const toolNames = toolDeclarations.map((t) => t.name) as [string, ...string[]];
export type ToolName = typeof toolNames[number];

export async function runTool(name: string, rawInput: unknown) {
  try {
    switch (name) {
      case 'web_search': {
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) throw new Error("Missing EXA_API_KEY environment variable");
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
        const exaApiKey = process.env.EXA_API_KEY;
        if (!exaApiKey) throw new Error("Missing EXA_API_KEY environment variable");
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
      case 'create_document': {
        const { docType, title, content } = createDocumentSchema.parse(rawInput);
        return {
          ok: true as const,
          data: { docType, title, content, created: true },
        };
      }
      case 'show_map': {
        const parsed = showMapSchema.parse(rawInput);
        return {
          ok: true as const,
          data: { ...parsed, rendered: true },
        };
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

export function formatToolName(name: string): string {
  const mapping: Record<string, string> = {
    web_search: 'Search',
    content: 'Read Webpage',
    create_document: 'Create Document',
    show_map: 'Google Map',
  };
  return mapping[name] ?? name;
}


