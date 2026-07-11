const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 660" width="100%" height="100%">
  <!-- Definitions for gradients and markers -->
  <defs>
    <linearGradient id="grad-client" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#3730A3" />
    </linearGradient>
    <linearGradient id="grad-server" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0891B2" />
      <stop offset="100%" stop-color="#155E75" />
    </linearGradient>
    <linearGradient id="grad-db" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#064E3B" />
    </linearGradient>
    <linearGradient id="grad-llm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <drop-shadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.08" />
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6B7280" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="1000" height="660" fill="#F8FAFC" rx="16" />
  
  <!-- Boundary Regions -->
  <rect x="25" y="25" width="280" height="610" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" rx="12" filter="url(#shadow)" />
  <text x="165" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#1E293B" text-anchor="middle" letter-spacing="1">CLIENT (NEXT.JS UI)</text>

  <rect x="330" y="25" width="340" height="610" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" rx="12" filter="url(#shadow)" />
  <text x="500" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#1E293B" text-anchor="middle" letter-spacing="1">SERVER ROUTER &amp; RUNNER</text>

  <rect x="695" y="25" width="280" height="610" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" rx="12" filter="url(#shadow)" />
  <text x="835" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#1E293B" text-anchor="middle" letter-spacing="1">EXTERNAL DATA &amp; AI</text>

  <!-- CLIENT COMPONENTS -->
  <!-- Run Console Card -->
  <g transform="translate(45, 90)">
    <rect width="240" height="70" fill="url(#grad-client)" rx="8" />
    <text x="20" y="30" font-family="system-ui" font-size="13" font-weight="600" fill="#FFFFFF">Trace &amp; Artifact Dashboard</text>
    <text x="20" y="50" font-family="system-ui" font-size="11" fill="#E0E7FF">React states, EventSource listener</text>
  </g>

  <!-- Interactive Controls -->
  <g transform="translate(45, 230)">
    <rect width="240" height="70" fill="#EEF2F6" stroke="#4F46E5" stroke-width="1.5" rx="8" />
    <text x="20" y="30" font-family="system-ui" font-size="13" font-weight="600" fill="#1E293B">Interruption Panel</text>
    <text x="20" y="50" font-family="system-ui" font-size="11" fill="#4B5563">Pause, edit plan steps, resume, rollback</text>
  </g>
  
  <!-- Active Document Previewer -->
  <g transform="translate(45, 380)">
    <rect width="240" height="220" fill="#EEF2F6" stroke="#E2E8F0" stroke-width="1" rx="8" />
    <rect x="0" y="0" width="240" height="30" fill="#E2E8F0" rx="8" />
    <text x="20" y="20" font-family="system-ui" font-size="12" font-weight="600" fill="#334155">Resizable Side Artifact</text>
    <text x="20" y="55" font-family="system-ui" font-size="11" fill="#475569">• Markdown parser (GFM)</text>
    <text x="20" y="80" font-family="system-ui" font-size="11" fill="#475569">• Sandbox Iframe for Live HTML</text>
    <text x="20" y="105" font-family="system-ui" font-size="11" fill="#475569">• JSON Pretty Printer</text>
    <text x="20" y="130" font-family="system-ui" font-size="11" fill="#475569">• CSV Tabular Parser</text>
    <text x="20" y="155" font-family="system-ui" font-size="11" fill="#475569">• Drag Handle (280px-900px)</text>
    <text x="20" y="180" font-family="system-ui" font-size="11" fill="#475569">• Slide-out animation triggers</text>
  </g>

  <!-- SERVER COMPONENTS -->
  <!-- Event Publisher -->
  <g transform="translate(350, 90)">
    <rect width="300" height="70" fill="url(#grad-server)" rx="8" />
    <text x="20" y="30" font-family="system-ui" font-size="13" font-weight="600" fill="#FFFFFF">SSE Stream Route (/stream)</text>
    <text x="20" y="50" font-family="system-ui" font-size="11" fill="#CFFAFE">Pub/Sub listeners pushing raw server events</text>
  </g>

  <!-- Agent Execution Runner Loop -->
  <g transform="translate(350, 230)">
    <rect width="300" height="230" fill="#F1F5F9" stroke="#0891B2" stroke-width="1.5" rx="8" />
    <rect x="0" y="0" width="300" height="30" fill="#E2E8F0" rx="8" />
    <text x="20" y="20" font-family="system-ui" font-size="12" font-weight="600" fill="#0F172A">Core Runner Loop (runner.ts)</text>
    <text x="20" y="55" font-family="system-ui" font-size="11" fill="#334155">1. Generate plan steps using LLM</text>
    <text x="20" y="75" font-family="system-ui" font-size="11" fill="#334155">2. Check for dynamic interruption status</text>
    <text x="20" y="95" font-family="system-ui" font-size="11" fill="#334155">3. Execute active tool &amp; commit output</text>
    <text x="20" y="115" font-family="system-ui" font-size="11" fill="#334155">4. Save step context summary checkpoint</text>
    <text x="20" y="135" font-family="system-ui" font-size="11" fill="#334155">5. Auto-pause on tool execution failure</text>
    <text x="20" y="155" font-family="system-ui" font-size="11" fill="#334155">6. Loop steps or exit on target completion</text>
    <text x="20" y="175" font-family="system-ui" font-size="11" fill="#334155">7. Stream final Markdown summary inline</text>
    <text x="20" y="195" font-family="system-ui" font-size="11" fill="#334155">8. Checkpoints save for exact rollback</text>
  </g>
  
  <!-- Interruption Control Router -->
  <g transform="translate(350, 520)">
    <rect width="300" height="80" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" rx="8" />
    <text x="20" y="30" font-family="system-ui" font-size="12" font-weight="600" fill="#334155">Execution Controller Routes</text>
    <text x="20" y="50" font-family="system-ui" font-size="10" fill="#64748B">GET/POST /pause, /resume, /rollback, /edit-plan</text>
    <text x="20" y="65" font-family="system-ui" font-size="10" fill="#64748B">Modifies DB run states &amp; signals runner loop</text>
  </g>

  <!-- DATABASE AND EXTERNAL LAYER -->
  <!-- Drizzle & Neon DB -->
  <g transform="translate(715, 90)">
    <rect width="240" height="110" fill="url(#grad-db)" rx="8" />
    <text x="20" y="30" font-family="system-ui" font-size="13" font-weight="600" fill="#FFFFFF">Neon PostgreSQL Database</text>
    <text x="20" y="55" font-family="system-ui" font-size="11" fill="#A7F3D0">• Runs Table (Metadata &amp; Plan)</text>
    <text x="20" y="75" font-family="system-ui" font-size="11" fill="#A7F3D0">• RunEvents Table (Execution Logs)</text>
    <text x="20" y="95" font-family="system-ui" font-size="11" fill="#A7F3D0">• Checkpoints Table (State Rollbacks)</text>
  </g>

  <!-- Gemini LLM Orchestrator -->
  <g transform="translate(715, 220)">
    <rect width="240" height="90" fill="url(#grad-llm)" rx="8" />
    <text x="20" y="30" font-family="system-ui" font-size="13" font-weight="600" fill="#FFFFFF">Gemini 3.5 Flash API</text>
    <text x="20" y="55" font-family="system-ui" font-size="11" fill="#FDE68A">• Dynamic Planner</text>
    <text x="20" y="75" font-family="system-ui" font-size="11" fill="#FDE68A">• Tool Call Argument Solver</text>
  </g>
  
  <!-- Active Tool Integrations -->
  <g transform="translate(715, 330)">
    <rect width="240" height="270" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" rx="8" />
    <rect x="0" y="0" width="240" height="30" fill="#E2E8F0" rx="8" />
    <text x="20" y="20" font-family="system-ui" font-size="12" font-weight="600" fill="#334155">4 Core Tools (tools.ts)</text>
    
    <text x="20" y="55" font-family="system-ui" font-size="11" font-weight="700" fill="#0F172A">1. web_search (Search)</text>
    <text x="25" y="72" font-family="system-ui" font-size="10" fill="#64748B">Queries Exa Search API for URLs</text>
    
    <text x="20" y="105" font-family="system-ui" font-size="11" font-weight="700" fill="#0F172A">2. content (Read Webpage)</text>
    <text x="25" y="122" font-family="system-ui" font-size="10" fill="#64748B">Fetches compact markup text layers</text>
    
    <text x="20" y="155" font-family="system-ui" font-size="11" font-weight="700" fill="#0F172A">3. create_document (Document)</text>
    <text x="25" y="172" font-family="system-ui" font-size="10" fill="#64748B">Generates MD, CSV, JSON, HTML</text>

    <text x="20" y="205" font-family="system-ui" font-size="11" font-weight="700" fill="#0F172A">4. show_map (Google Map)</text>
    <text x="25" y="222" font-family="system-ui" font-size="10" fill="#64748B">Embeds maps API with responsive frames</text>
  </g>

  <!-- CONNECTING ARROWS -->
  <!-- 1. EventSource Subscription: Client Listener <- Stream Route -->
  <path d="M 350 125 L 295 125" stroke="#6B7280" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#arrow)" />
  <text x="317" y="115" font-family="system-ui" font-size="10" font-weight="700" fill="#4B5563" text-anchor="middle">SSE</text>

  <!-- 2. UI Action commands (pause, edit, resume) Client -> Controller Router -->
  <path d="M 285 265 L 310 265 L 310 560 L 350 560" stroke="#4F46E5" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
  <text x="316" y="325" font-family="system-ui" font-size="10" font-weight="700" fill="#4F46E5" text-anchor="start">COMMANDS</text>

  <!-- 3. Server Event Emitter -> SSE Broker (Internal Server Bus) -->
  <path d="M 500 230 L 500 160" stroke="#0891B2" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
  <text x="510" y="195" font-family="system-ui" font-size="10" font-weight="700" fill="#0891B2" text-anchor="start">EMIT</text>

  <!-- 4. Controller Router -> Runner State updates (DB flag trigger) -->
  <path d="M 500 520 L 500 460" stroke="#64748B" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
  <text x="510" y="495" font-family="system-ui" font-size="10" font-weight="700" fill="#64748B" text-anchor="start">SIGNAL</text>

  <!-- 5. Server Runner -> DB Commit (Read/Write) -->
  <path d="M 650 245 L 685 245 L 685 145 L 715 145" stroke="#059669" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
  <text x="692" y="195" font-family="system-ui" font-size="10" font-weight="700" fill="#059669" text-anchor="start">DB SYNC</text>

  <!-- 6. Server Runner -> Gemini API (Ask next plan step / solve args) -->
  <path d="M 650 265 L 715 265" stroke="#D97706" stroke-width="1.5" marker-end="url(#arrow)" />
  <text x="682" y="258" font-family="system-ui" font-size="10" font-weight="700" fill="#D97706" text-anchor="middle">ASK LLM</text>

  <!-- 7. Server Runner -> Tools runner Execution -->
  <path d="M 650 345 L 685 345 L 685 465 L 715 465" stroke="#6B7280" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
  <text x="692" y="415" font-family="system-ui" font-size="10" font-weight="700" fill="#4B5563" text-anchor="start">CALL TOOL</text>

  <!-- 8. Document Creation -> UI Slide-out display -->
  <path d="M 165 380 L 165 160" stroke="#4F46E5" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow)" fill="none" />
  <text x="175" y="205" font-family="system-ui" font-size="10" font-weight="700" fill="#4F46E5">AUTO OPEN</text>
</svg>`;

fs.writeFileSync('public/flow.svg', svgContent, 'utf-8');
console.log('flow.svg updated with horizontal arrow labels');
