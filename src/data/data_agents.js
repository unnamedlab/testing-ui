/* AXIOM — data_agents.js · fixture de demo regenerado
   Consumido por ReasonView (AGENTS, TOOLS, FUNCTIONS, EVALS). */
export const TOOLS = {
  search: { name: "Buscar ontología", desc: "Consulta objetos y propiedades", icon: "search" },
  graph:  { name: "Recorrer grafo",   desc: "Caminos y vecinos en el grafo", icon: "graph" },
  txn:    { name: "Analizar flujos",  desc: "Transacciones y patrones", icon: "swap" },
  geo:    { name: "Geoespacial",      desc: "Tracks AIS y escalas", icon: "globe" },
  model:  { name: "Invocar modelo",   desc: "Scoring de riesgo", icon: "model" },
};
export const AGENTS = [
  {
    id: "ag-triage", name: "Triage de alertas", desc: "Clasifica y prioriza alertas entrantes.",
    icon: "bell", color: "var(--accent)", model: "claude-sonnet", scope: "Caso BLACKFROST",
    instructions: "Evalúa cada alerta, correlaciona con objetos del caso y propone severidad. Cita siempre los objetos.",
    tools: ["search", "graph", "model"], approval: true, grounding: true,
    sample: "¿Qué alertas deberían escalarse hoy?",
    run: {
      steps: [
        { tool: "search", arg: "alertas abiertas · caso", out: "12 alertas, 3 críticas" },
        { tool: "graph", arg: "vecinos de MV Blackfrost", out: "ligado a Helios + Aurora" },
        { tool: "model", arg: "risk_scorer(network)", out: "84/100 · crítico" },
      ],
      answer: "**3 alertas** requieren escalado: la cadena de layering Aurora→Helios ($4.8M) y dos gaps AIS de MV Blackfrost cerca de puertos sancionados.",
      cites: ["v-blackfrost", "o-helios", "a-aurora-usd"],
      action: { type: "Escalar alerta", target: "v-blackfrost", approval: "Lead" },
    },
  },
  {
    id: "ag-ubo", name: "Resolución de UBO", desc: "Traza titularidad real entre capas societarias.",
    icon: "merge", color: "var(--violet)", model: "claude-sonnet", scope: "Ontología",
    instructions: "Sigue cadenas de propiedad hasta la persona física. No inventes vínculos sin evidencia.",
    tools: ["search", "graph"], approval: false, grounding: true,
    sample: "¿Quién controla Helios Maritime?",
    run: {
      steps: [
        { tool: "graph", arg: "cadena de propiedad · Helios", out: "Helios ← Northwind ← Sørensen" },
        { tool: "search", arg: "agente formador", out: "Castor Corp Services" },
      ],
      answer: "**Viktor Sørensen** controla Helios vía Northwind Holdings (BVI). Ambas formadas por Castor Corp.",
      cites: ["p-sorenson", "o-northwind", "o-helios"],
      action: null,
    },
  },
  {
    id: "ag-maritime", name: "Analista marítimo", desc: "Detecta comportamiento anómalo de buques.",
    icon: "globe", color: "var(--ok)", model: "claude-haiku", scope: "Feed AIS",
    instructions: "Analiza tracks AIS, gaps y escalas en terminales sancionadas.",
    tools: ["geo", "graph"], approval: true, grounding: true,
    sample: "¿Buques con comportamiento sospechoso esta semana?",
    run: {
      steps: [
        { tool: "geo", arg: "gaps AIS · 7d", out: "MV Blackfrost: 2 gaps" },
        { tool: "geo", arg: "escalas · puertos OFAC", out: "Novorossiysk ×2" },
      ],
      answer: "**MV Blackfrost** registró 2 gaps AIS coincidiendo con escalas en Novorossiysk (sancionado).",
      cites: ["v-blackfrost", "f-novoross"],
      action: { type: "Añadir a watchlist", target: "v-blackfrost", approval: "—" },
    },
  },
];
export const FUNCTIONS = [
  { name: "risk_score", sig: "(object) → number", steps: ["Reúne features del objeto", "Invoca risk_scorer:v3", "Normaliza 0–100"] },
  { name: "shortest_path", sig: "(a, b) → path[]", steps: ["BFS sobre el grafo", "Devuelve la cadena mínima de enlaces"] },
  { name: "layering_chains", sig: "(account) → chains[]", steps: ["Sigue transferencias salientes", "Agrupa por 3–5 saltos", "Marca las > $1M"] },
];
export const EVALS = [
  { agent: "Triage de alertas", cases: 48, pass: 46, score: "96%", last: "2h" },
  { agent: "Resolución de UBO", cases: 30, pass: 27, score: "90%", last: "1d" },
  { agent: "Analista marítimo", cases: 22, pass: 18, score: "82%", last: "5h" },
];
