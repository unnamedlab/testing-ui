import { EDGES, ENTITIES, MAP_VESSELS } from './data.js';
import { pickWorkspaces } from './data_workspaces.js';

/* ============================================================
   AXIOM — Extended dataset for advanced modules
   (alerts/cases, sources, audit, time, facets, lineage,
    notebook, boards, security)
   ============================================================ */

// ---------- Security / classification ----------
export const CLASSIFICATION = { level: "CONFIDENTIAL", compartment: "AXIOM-INT", caveat: "NEED-TO-KNOW", color: "var(--warn)" };
export const CLASS_LEVELS = {
  "UNCLASS":      { color: "var(--ok)",     short: "U" },
  "CONFIDENTIAL": { color: "var(--warn)",   short: "C" },
  "SECRET":       { color: "var(--alert)",  short: "S" },
  "TOP SECRET":   { color: "var(--violet)", short: "TS" },
};
// per-entity markings
export const ENTITY_MARKINGS = {
  "p-sorenson": "SECRET", "o-helios": "SECRET", "v-blackfrost": "SECRET",
  "f-novoross": "SECRET", "a-aurora-usd": "CONFIDENTIAL", "a-helios-eur": "CONFIDENTIAL",
};
export function markingFor(id){ return ENTITY_MARKINGS[id] || "CONFIDENTIAL"; }

// ---------- Time range + tracks (for time-scrubber) ----------
export const T_START = Date.parse("2026-03-01T00:00:00Z");
export const T_END   = Date.parse("2026-06-02T12:00:00Z");
export const DAY = 86400000;
export function dstr(ms){ return new Date(ms).toISOString().slice(0,10); }

// when each relationship became known/active (by EDGES index)
export const EDGE_SINCE_DAYS = [2, 6, 10, 14, 9, 4, 5, 40, 44, 18, 20, 70, 78, 60, 50, 33, 55, 72, 80, 82];
EDGES.forEach((e,i)=>{ e.since = T_START + (EDGE_SINCE_DAYS[i]||0)*DAY; });
// when each entity first appeared
export const ENT_SINCE_DAYS = { "p-sorenson":0,"o-northwind":2,"o-helios":4,"o-aurora":9,"p-marchetti":14,
  "o-castor":16,"a-helios-eur":18,"a-aurora-usd":20,"v-blackfrost":40,"v-northstar":42,
  "f-limassol":44,"f-jebelali":46,"f-novoross":55,"p-okonkwo":33,"p-haddad":50 };
ENTITIES.forEach(e=>{ e.since = T_START + ((ENT_SINCE_DAYS[e.id]??0))*DAY; });

// vessel movement keyframes (day-offset, x, y, hd) in the map 0..100 frame
MAP_VESSELS.find(v=>v.id==="v-blackfrost").track = [
  [40,58.5,33,150],[55,59.2,35,150],[70,60,38,145],[80,61,42,140],[93,64,47,135]
].map(([d,x,y,hd])=>({t:T_START+d*DAY,x,y,hd}));
MAP_VESSELS.find(v=>v.id==="v-northstar").track = [
  [42,55,40,95],[55,60,44,95],[70,66,48,95],[80,70,52,95],[93,78,58,95]
].map(([d,x,y,hd])=>({t:T_START+d*DAY,x,y,hd}));

// key timeline ticks for the scrubber labels
export const TIME_EVENTS = [
  { d: 4,  label: "Helios incorporated", sev:"info" },
  { d: 40, label: "Blackfrost acquired", sev:"warn" },
  { d: 70, label: "First layering wire", sev:"alert" },
  { d: 78, label: "AIS gap · Novorossiysk", sev:"alert" },
  { d: 90, label: "Sanctions match", sev:"alert" },
];

// ---------- Alerts queue ----------
export const ALERTS = [
  { id:"AL-3391", title:"Layering pattern · 3-hop wire", type:"Financial", sev:"critical", status:"new",          entity:"a-aurora-usd", assignee:null,   sla:2,  created:"8m",  case:"blackfrost", conf:"$4.82M" },
  { id:"AL-3388", title:"AIS signal loss in risk zone",  type:"Maritime",  sev:"critical", status:"triage",       entity:"v-blackfrost", assignee:"AR",   sla:6,  created:"34m", case:"blackfrost", conf:"06:12 gap" },
  { id:"AL-3385", title:"EU Annex IV sanctions match",   type:"Sanctions", sev:"critical", status:"investigating",entity:"o-helios",     assignee:"MC",   sla:1,  created:"2h",  case:"blackfrost", conf:"98% conf" },
  { id:"AL-3380", title:"Beneficial-owner concealment",  type:"Corporate", sev:"high",     status:"triage",       entity:"p-sorenson",   assignee:"AR",   sla:18, created:"5h",  case:"blackfrost", conf:"6 nominees" },
  { id:"AL-3377", title:"Round-trip transaction",        type:"Financial", sev:"high",     status:"new",          entity:"a-helios-eur", assignee:null,   sla:12, created:"6h",  case:"blackfrost", conf:"€142K" },
  { id:"AL-3371", title:"Bunkering at sanctioned port",  type:"Maritime",  sev:"high",     status:"escalated",    entity:"f-novoross",   assignee:"JD",   sla:0,  created:"9h",  case:"blackfrost", conf:"RUNVS" },
  { id:"AL-3360", title:"Manifest / cargo mismatch",     type:"Logistics", sev:"medium",   status:"investigating",entity:"v-blackfrost", assignee:"MC",   sla:30, created:"1d",  case:"blackfrost", conf:"BL-204417" },
  { id:"AL-3344", title:"Nominee director cluster",      type:"Corporate", sev:"medium",   status:"closed",       entity:"p-marchetti",  assignee:"AR",   sla:null,created:"2d",  case:"blackfrost", conf:"resolved" },
  { id:"AL-3331", title:"Rapid account velocity",        type:"Financial", sev:"low",      status:"closed",       entity:"a-aurora-usd", assignee:"JD",   sla:null,created:"3d",  case:"tradewind",  conf:"false +" },
];
export const ALERT_STATUSES = [
  { id:"new", label:"New", color:"var(--info)" },
  { id:"triage", label:"Triage", color:"var(--warn)" },
  { id:"investigating", label:"Investigating", color:"var(--accent)" },
  { id:"escalated", label:"Escalated", color:"var(--alert)" },
  { id:"closed", label:"Closed", color:"var(--text-faint)" },
];
export const ANALYSTS = {
  AR:{name:"Ana Reyes", role:"Lead Analyst"}, MC:{name:"Marcus Cho", role:"Financial Analyst"},
  JD:{name:"Jamal Diallo", role:"Maritime Analyst"}, null:{name:"Unassigned", role:""},
};

// ---------- Cases ----------
// Proyección de WORKSPACES (fuente única en data_workspaces.js). Antes esta lista
// definía sus propias cifras (objects 142 · alerts 7) que contradecían a Projects/Home.
export const CASES = pickWorkspaces(["blackfrost", "tradewind", "supply"]).map((w) => ({
  id: w.id,
  name: w.nameEn,
  status: w.status,
  classification: w.classification,
  lead: w.lead,
  opened: w.openedIso,
  members: w.members,
  alerts: w.counts.alerts,
  objects: w.counts.objects,
  sla: w.sla,
  summary: w.summaryEn,
  tasks: w.tasksEn,
}));
export const CASE_BY_ID = Object.fromEntries(CASES.map(c=>[c.id,c]));

// ---------- Data sources ----------
export const SOURCES = [
  { id:"ais",    name:"AIS Vessel Feed",     vendor:"Spire Maritime", proto:"Kafka",  cadence:"Streaming", health:98, records:"1.2B", fresh:"live",   owner:"data-eng", icon:"ship",     status:"healthy" },
  { id:"swift",  name:"SWIFT MT103",          vendor:"Core Banking",   proto:"SFTP",   cadence:"Hourly",    health:99, records:"48.2M", fresh:"12m ago",owner:"fin-int",  icon:"swap",     status:"healthy" },
  { id:"customs",name:"Customs Manifests",    vendor:"WCO Datahub",    proto:"S3",     cadence:"Daily",     health:95, records:"3.4M",  fresh:"3h ago", owner:"data-eng", icon:"box",      status:"healthy" },
  { id:"registry",name:"Corporate Registry",  vendor:"OpenCorporates", proto:"REST",   cadence:"Daily",     health:71, records:"642K",  fresh:"31h ago",owner:"osint",    icon:"building", status:"degraded" },
  { id:"ofac",   name:"Sanctions Lists",      vendor:"OFAC / EU",      proto:"REST",   cadence:"Daily",     health:100,records:"38K",   fresh:"6h ago", owner:"compliance",icon:"shield",  status:"healthy" },
  { id:"sigint", name:"Comms Metadata",       vendor:"Internal",       proto:"Kafka",  cadence:"Streaming", health:88, records:"210M",  fresh:"live",   owner:"sigint",   icon:"phone",    status:"healthy" },
];
export const CONNECTORS = [
  ["Kafka","pipeline"],["Amazon S3","box"],["PostgreSQL","table"],["REST API","share"],
  ["SFTP","download"],["Snowflake","layers"],["Salesforce","building"],["Elastic","search"],
  ["Kafka topic","swap"],["Google BigQuery","grid"],["MongoDB","doc"],["Webhook","bell"],
];

// ---------- Audit log → movido a data_audit.js (store único de eventos) ----------
// El registro de auditoría vive ahora en data/data_audit.js (AUDIT_EVENTS), leído por
// Governance (ledger con filtro por kind) y Admin (vista forense con Source IP).

// ---------- Lineage (per entity provenance chain) ----------
export function lineageFor(id){
  return [
    { stage:"Source", label: id.startsWith("v-")?"AIS Vessel Feed":id.startsWith("a-")?"SWIFT MT103":"Corporate Registry", icon:"download", meta:"raw record" },
    { stage:"Transform", label:"Cleanse & Standardize", icon:"filter", meta:"schema mapped" },
    { stage:"Transform", label:"Entity Resolution", icon:"merge", meta:"3 records merged" },
    { stage:"Transform", label:"Sanctions Enrichment", icon:"shield", meta:"OFAC + EU" },
    { stage:"Object", label:"Ontology object", icon:"share", meta:"published" },
  ];
}

// ---------- Collaboration ----------
export const BOARDS = [
  { id:"b1", name:"BLACKFROST · Link chart", kind:"graph", owner:"AR", collab:3, updated:"12m" },
  { id:"b2", name:"Vessel movement brief", kind:"map", owner:"JD", collab:2, updated:"1h" },
  { id:"b3", name:"Financial flows", kind:"chart", owner:"MC", collab:4, updated:"3h" },
];
export const COMMENTS = [
  { who:"MC", at:"34m", on:"MV Blackfrost", text:"AIS gap lines up exactly with the Novorossiysk call. Worth a STR.", reacts:2 },
  { who:"JD", at:"1h",  on:"Helios Maritime", text:"Registry agent Castor formed 1,940+ shells — flag the whole cluster?", reacts:1 },
  { who:"AR", at:"2h",  on:"Aurora USD ····9920", text:"@Marcus can you pull the correspondent leg on TXN-88241?", reacts:0, mention:true },
];
