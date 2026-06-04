/* AXIOM — data_agents.js · demo fixture (UX-01: English source).
   Consumed by ReasonView (AGENTS, TOOLS, FUNCTIONS, EVALS). */
export const TOOLS = {
  search: { name: "Search ontology", desc: "Query objects and properties", icon: "search" },
  graph:  { name: "Traverse graph",  desc: "Paths and neighbors in the graph", icon: "graph" },
  txn:    { name: "Analyze flows",   desc: "Transactions and patterns", icon: "swap" },
  geo:    { name: "Geospatial",      desc: "AIS tracks and port calls", icon: "globe" },
  model:  { name: "Invoke model",    desc: "Risk scoring", icon: "model" },
};
export const AGENTS = [
  {
    id: "ag-triage", name: "Alert triage", desc: "Classifies and prioritizes incoming alerts.",
    icon: "bell", color: "var(--accent)", model: "claude-sonnet", scope: "Case BLACKFROST",
    instructions: "Assess each alert, correlate with case objects and propose a severity. Always cite the objects.",
    tools: ["search", "graph", "model"], approval: true, grounding: true,
    sample: "Which alerts should be escalated today?",
    run: {
      steps: [
        { tool: "search", arg: "open alerts · case", out: "12 alerts, 3 critical" },
        { tool: "graph", arg: "neighbors of MV Blackfrost", out: "linked to Helios + Aurora" },
        { tool: "model", arg: "risk_scorer(network)", out: "84/100 · critical" },
      ],
      answer: "**3 alerts** need escalation: the Aurora→Helios layering chain ($4.8M) and two AIS gaps of MV Blackfrost near sanctioned ports.",
      cites: ["v-blackfrost", "o-helios", "a-aurora-usd"],
      action: { type: "Escalate alert", target: "v-blackfrost", approval: "Lead" },
    },
  },
  {
    id: "ag-ubo", name: "UBO resolution", desc: "Traces beneficial ownership across corporate layers.",
    icon: "merge", color: "var(--violet)", model: "claude-sonnet", scope: "Ontology",
    instructions: "Follow ownership chains down to the natural person. Don't invent links without evidence.",
    tools: ["search", "graph"], approval: false, grounding: true,
    sample: "Who controls Helios Maritime?",
    run: {
      steps: [
        { tool: "graph", arg: "ownership chain · Helios", out: "Helios ← Northwind ← Sørensen" },
        { tool: "search", arg: "formation agent", out: "Castor Corp Services" },
      ],
      answer: "**Viktor Sørensen** controls Helios via Northwind Holdings (BVI). Both formed by Castor Corp.",
      cites: ["p-sorenson", "o-northwind", "o-helios"],
      action: null,
    },
  },
  {
    id: "ag-maritime", name: "Maritime analyst", desc: "Detects anomalous vessel behavior.",
    icon: "globe", color: "var(--ok)", model: "claude-haiku", scope: "AIS feed",
    instructions: "Analyze AIS tracks, gaps and calls at sanctioned terminals.",
    tools: ["geo", "graph"], approval: true, grounding: true,
    sample: "Vessels with suspicious behavior this week?",
    run: {
      steps: [
        { tool: "geo", arg: "AIS gaps · 7d", out: "MV Blackfrost: 2 gaps" },
        { tool: "geo", arg: "calls · OFAC ports", out: "Novorossiysk ×2" },
      ],
      answer: "**MV Blackfrost** logged 2 AIS gaps coinciding with calls at Novorossiysk (sanctioned).",
      cites: ["v-blackfrost", "f-novoross"],
      action: { type: "Add to watchlist", target: "v-blackfrost", approval: "—" },
    },
  },
];
export const FUNCTIONS = [
  { name: "risk_score", sig: "(object) → number", steps: ["Gather object features", "Invoke risk_scorer:v3", "Normalize 0–100"] },
  { name: "shortest_path", sig: "(a, b) → path[]", steps: ["BFS over the graph", "Return the minimal link chain"] },
  { name: "layering_chains", sig: "(account) → chains[]", steps: ["Follow outgoing transfers", "Group by 3–5 hops", "Flag those > $1M"] },
];
export const EVALS = [
  { agent: "Alert triage", cases: 48, pass: 46, score: "96%", last: "2h" },
  { agent: "UBO resolution", cases: 30, pass: 27, score: "90%", last: "1d" },
  { agent: "Maritime analyst", cases: 22, pass: 18, score: "82%", last: "5h" },
];
