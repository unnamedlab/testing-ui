import { EDGES, ENTITIES, MAP_VESSELS } from './data.js';

/* ============================================================
   AXIOM — Extended dataset for advanced modules
   (alerts/cases, sources, audit, time, facets, lineage,
    notebook, boards, security)
   ============================================================ */

// ---------- Security / classification ----------
export const CLASSIFICATION = { level: "CONFIDENTIAL", compartment: "AXIOM-INT", caveat: "NEED-TO-KNOW", color: "var(--warn)" };
export const CLASS_LEVELS = {
  // `ink` is a print-safe hex used by the dossier banner (white document, no
  // theme vars) so the bar matches the on-screen hue: U→green, C→amber, S→red.
  "UNCLASS":      { color: "var(--ok)",     short: "U", ink: "#047857" },
  "CONFIDENTIAL": { color: "var(--warn)",   short: "C", ink: "#b54708" },
  "SECRET":       { color: "var(--alert)",  short: "S", ink: "#b42318" },
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
// I8: the signed-in analyst — single source for avatar, greeting and clearance line.
export const CURRENT_USER = "AR";

// ---------- Cases ----------
// MOVED (R-4): the "case" model was unified into the single `project` domain
// object. Import { PROJECTS, PROJECT_BY_ID } from './data_projects.js' instead.

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

// ---------- Audit log ----------
export const AUDIT = [
  { actor:"AR", action:"viewed", target:"MV Blackfrost · 360°", time:"09:12:44", cls:"SECRET", ip:"10.4.2.18" },
  { actor:"MC", action:"exported", target:"Dossier · Case BLACKFROST", time:"09:08:10", cls:"SECRET", ip:"10.4.2.31" },
  { actor:"SYS",action:"resolved", target:"14 Person objects (ER merge)", time:"09:02:55", cls:"CONFIDENTIAL", ip:"—" },
  { actor:"JD", action:"assigned", target:"AL-3371 → self", time:"08:54:02", cls:"CONFIDENTIAL", ip:"10.4.7.9" },
  { actor:"AR", action:"created link", target:"Helios → Northwind", time:"08:41:19", cls:"SECRET", ip:"10.4.2.18" },
  { actor:"MC", action:"queried", target:"vessels @ Novorossiysk, >$1M", time:"08:33:47", cls:"SECRET", ip:"10.4.2.31" },
  { actor:"SYS",action:"ingested", target:"Customs Manifests · 12,402 rows", time:"08:20:00", cls:"CONFIDENTIAL", ip:"—" },
  { actor:"JD", action:"flagged", target:"a-aurora-usd as high-risk", time:"08:11:30", cls:"CONFIDENTIAL", ip:"10.4.7.9" },
  { actor:"AR", action:"login", target:"AXIOM session start", time:"08:02:14", cls:"UNCLASS", ip:"10.4.2.18" },
];

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

// ---------- Notebook ----------
export const NOTEBOOK = [
  { type:"md", text:"# BLACKFROST — Network exposure\nWorking analysis of layered flows between **Aurora Trading** and **Helios Maritime**." },
  { type:"query", lang:"AQL", text:"FROM Transaction\nWHERE to_account.holder = 'Helios Maritime'\n  AND amount > 1000000\nGROUP BY from_account\nORDER BY sum(amount) DESC", rows:4, ms:212 },
  { type:"result" },
  { type:"md", text:"Three counterparties account for **87%** of inbound volume. Aurora USD ····9920 dominates — consistent with a pass-through layering hub." },
  { type:"chart" },
];

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

// ---------- Object Explorer: synthetic population ----------
export const JURIS = ["Cyprus","UAE","BVI","Panama","Russia","Liberia","Singapore","Malta","Lebanon","UK"];
export const FLAGS = ["Panama","Liberia","Cook Is.","Marshall Is.","Malta","Cyprus"];
export const STATUSES = ["Active","Dormant","Flagged","Dissolved"];
export const FIRST = ["Viktor","Elena","Daniel","Yusuf","Anatoly","Mei","Omar","Sofia","Lars","Priya","Hassan","Nadia","Kwame","Ingrid","Tariq"];
export const LAST  = ["Sørensen","Marchetti","Okonkwo","Haddad","Volkov","Tan","Saleh","Rossi","Eriksen","Nair","Aziz","Kovač","Mensah","Lindqvist","Rahman"];
export const ORGW  = ["Helios","Aurora","Northwind","Castor","Meridian","Polaris","Orion","Vega","Tethys","Caspian","Black Sea","Levant"];
export const ORGS2 = ["Maritime","Trading","Holdings","Shipping","Logistics","Capital","Ventures","Petroleum","Freight","Marine"];
export function rng(seed){ let s=seed; return ()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; }
export function buildExplorerRows(){
  const r = rng(7); const rows = [];
  // seed with the real entities first
  ENTITIES.forEach(e=>rows.push({ id:e.id, name:e.name, type:e.type, risk:e.risk,
    juris: e.attrs?.Nationality?.split(",")[0]?.trim() || e.attrs?.["Jurisdiction"] || JURIS[Math.floor(r()*JURIS.length)],
    flag: e.attrs?.Flag?.split(" ")[0] || FLAGS[Math.floor(r()*FLAGS.length)],
    status: e.watch?"Flagged":"Active", conns: EDGES.filter(ed=>ed.s===e.id||ed.t===e.id).length, real:true }));
  for(let i=0;i<74;i++){
    const types = ["person","org","vessel","account","txn","shipment"];
    const ty = types[Math.floor(r()*types.length)];
    let name;
    if(ty==="person") name = FIRST[Math.floor(r()*FIRST.length)]+" "+LAST[Math.floor(r()*LAST.length)];
    else if(ty==="org") name = ORGW[Math.floor(r()*ORGW.length)]+" "+ORGS2[Math.floor(r()*ORGS2.length)]+" "+["Ltd","FZE","LLC","Inc","SA"][Math.floor(r()*5)];
    else if(ty==="vessel") name = "MV "+["Aurora","Pioneer","Crest","Horizon","Nordic","Valiant","Sable","Tempest"][Math.floor(r()*8)]+" "+["Wave","Star","Trader","Spirit"][Math.floor(r()*4)];
    else if(ty==="account") name = ["EUR","USD","AED","CHF"][Math.floor(r()*4)]+" ····"+(1000+Math.floor(r()*8999));
    else if(ty==="txn") name = "TXN-"+(80000+Math.floor(r()*9999));
    else name = "BL-"+(200000+Math.floor(r()*9999));
    rows.push({ id:"syn-"+i, name, type:ty, risk: Math.floor(r()*100),
      juris: JURIS[Math.floor(r()*JURIS.length)], flag: FLAGS[Math.floor(r()*FLAGS.length)],
      status: STATUSES[Math.floor(r()*STATUSES.length)], conns: Math.floor(r()*40) });
  }
  return rows;
}
export const EXPLORER_ROWS = buildExplorerRows();
