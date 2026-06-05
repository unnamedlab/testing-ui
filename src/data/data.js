/* ============================================================
   AXIOM — Mock dataset: Case BLACKFROST
   Sanctions-evasion / maritime smuggling investigation
   ============================================================ */

// ---- Object type ontology ----
export const OBJECT_TYPES = [
  { id: "person",  name: "Person",       cls: "tc-person",   glyph: "user",     count: 1284,  desc: "Natural persons: directors, beneficial owners, crew, contacts." },
  { id: "org",     name: "Organization", cls: "tc-org",      glyph: "building", count: 642,   desc: "Companies, shell entities, NGOs, government bodies." },
  { id: "vessel",  name: "Vessel",       cls: "tc-vessel",   glyph: "ship",     count: 318,   desc: "Maritime vessels tracked via AIS and registry data." },
  { id: "port",    name: "Facility",     cls: "tc-port",     glyph: "anchor",   count: 196,   desc: "Ports, terminals, warehouses and physical sites." },
  { id: "account", name: "Bank Account", cls: "tc-account",  glyph: "card",     count: 2110,  desc: "Accounts at financial institutions, incl. correspondent." },
  { id: "txn",     name: "Transaction",  cls: "tc-txn",      glyph: "swap",     count: 48213, desc: "Wire transfers, trade-finance and crypto movements." },
  { id: "shipment",name: "Shipment",     cls: "tc-shipment", glyph: "box",      count: 3401,  desc: "Cargo manifests, bills of lading and customs records." },
  { id: "device",  name: "Device",       cls: "tc-device",   glyph: "phone",    count: 877,   desc: "Phones and comms endpoints from signals collection." },
];
export const TYPE_BY_ID = Object.fromEntries(OBJECT_TYPES.map(t => [t.id, t]));

// link/relationship types between object types
export const LINK_TYPES = [
  { id: "owns",       label: "owns",            from: "person",  to: "org" },
  { id: "controls",   label: "controls",        from: "org",     to: "org" },
  { id: "directs",    label: "is director of",  from: "person",  to: "org" },
  { id: "operates",   label: "operates",        from: "org",     to: "vessel" },
  { id: "holds",      label: "holds",           from: "org",     to: "account" },
  { id: "sent",       label: "sent",            from: "account", to: "txn" },
  { id: "received",   label: "received",        from: "txn",     to: "account" },
  { id: "shipped",    label: "shipped",         from: "vessel",  to: "shipment" },
  { id: "calledAt",   label: "called at",       from: "vessel",  to: "port" },
  { id: "uses",       label: "uses",            from: "person",  to: "device" },
  // relations exercised by the BLACKFROST edge set below
  { id: "formed",      label: "formed",         from: "org",     to: "org" },
  { id: "transfers",   label: "transfers",      from: "account", to: "account" },
  { id: "contracts",   label: "contracts",      from: "person",  to: "org" },
  { id: "facilitates", label: "facilitates",    from: "person",  to: "account" },
  { id: "contacts",    label: "contacts",       from: "person",  to: "person" },
  { id: "booked",      label: "booked",         from: "person",  to: "vessel" },
];
export const LINK_BY_ID = Object.fromEntries(LINK_TYPES.map(l => [l.id, l]));
// Human label for an edge's relation id; falls back to the raw value so an
// unknown/legacy rel still renders rather than vanishing.
export const linkLabel = (rel) => LINK_BY_ID[rel]?.label || rel;

// ---- Core entities (the investigation's main objects) ----
// graph layout coords are normalized 0..1 within the graph canvas
export const ENTITIES = [
  // people
  { id: "p-sorenson", type: "person", name: "Viktor Sørensen", sub: "Beneficial owner · NOR/CYP", risk: 92, x: .50, y: .30, watch: true,
    attrs: { "Date of birth": "1971-03-14", "Nationality": "Norway, Cyprus", "Passports": "3 (1 flagged)", "Last seen": "Limassol, CY", "Aliases": "V. Sorensen · «Frost»" } },
  { id: "p-marchetti", type: "person", name: "Elena Marchetti", sub: "Director · Aurora Trading", risk: 74, x: .30, y: .52,
    attrs: { "Date of birth": "1984-07-02", "Nationality": "Italy", "Role": "Nominee director ×6", "Last seen": "Dubai, AE" } },
  { id: "p-okonkwo", type: "person", name: "Daniel Okonkwo", sub: "Logistics broker", risk: 58, x: .70, y: .54,
    attrs: { "Date of birth": "1979-11-22", "Nationality": "Nigeria, UK", "Role": "Freight forwarder", "Last seen": "Rotterdam, NL" } },
  { id: "p-haddad", type: "person", name: "Yusuf Haddad", sub: "Financial facilitator", risk: 81, x: .18, y: .34,
    attrs: { "Date of birth": "1968-01-09", "Nationality": "Lebanon", "Role": "Money services", "Last seen": "Beirut, LB" } },

  // orgs
  { id: "o-helios", type: "org", name: "Helios Maritime Ltd", sub: "Shipping · Limassol", risk: 88, x: .50, y: .50,
    attrs: { "Incorporated": "2016-05-12 · Cyprus", "Status": "Active", "Registered agent": "Castor Corp Svcs", "Vessels operated": "2", "Sanctions": "EU Annex IV match" } },
  { id: "o-aurora", type: "org", name: "Aurora Trading FZE", sub: "Trade · Jebel Ali FZ", risk: 79, x: .26, y: .68,
    attrs: { "Incorporated": "2019-02-28 · UAE", "Status": "Active", "Directors": "Marchetti +2 nominees", "SIC": "Wholesale, petroleum" } },
  { id: "o-northwind", type: "org", name: "Northwind Holdings", sub: "Holding · BVI", risk: 70, x: .72, y: .30,
    attrs: { "Incorporated": "2014-09-03 · BVI", "Status": "Active", "Layer": "Ultimate holding", "Subsidiaries": "11" } },
  { id: "o-castor", type: "org", name: "Castor Corp Services", sub: "Formation agent", risk: 41, x: .86, y: .46,
    attrs: { "Incorporated": "2008 · Cyprus", "Status": "Active", "Role": "Mass formation agent", "Entities formed": "1,940+" } },

  // vessels
  { id: "v-blackfrost", type: "vessel", name: "MV Blackfrost", sub: "Bulk carrier · IMO 9583217", risk: 90, x: .62, y: .70, watch: true,
    attrs: { "IMO": "9583217", "Flag": "Panama → Cook Is.", "DWT": "74,200", "AIS gaps": "14 (last 90d)", "Operator": "Helios Maritime", "Class": "suspended" } },
  { id: "v-northstar", type: "vessel", name: "MV Northern Star", sub: "Tanker · IMO 9471002", risk: 67, x: .44, y: .78,
    attrs: { "IMO": "9471002", "Flag": "Liberia", "DWT": "112,000", "AIS gaps": "5", "Operator": "Helios Maritime" } },

  // ports / facilities
  { id: "f-limassol", type: "port", name: "Limassol Terminal", sub: "Port · Cyprus", risk: 35, x: .40, y: .12,
    attrs: { "LOCODE": "CYLIM", "Type": "Container + bulk", "Calls (90d)": "38" } },
  { id: "f-jebelali", type: "port", name: "Jebel Ali", sub: "Port · UAE", risk: 30, x: .14, y: .80,
    attrs: { "LOCODE": "AEJEA", "Type": "Container · FZ", "Calls (90d)": "61" } },
  { id: "f-novoross", type: "port", name: "Novorossiysk", sub: "Port · RUS", risk: 86, x: .78, y: .86, watch: true,
    attrs: { "LOCODE": "RUNVS", "Type": "Oil + bulk", "Sanctions exposure": "High" } },

  // accounts
  { id: "a-helios-eur", type: "account", name: "Helios EUR ····4471", sub: "Bank of Valletta", risk: 77, x: .60, y: .40,
    attrs: { "IBAN": "MT·····4471", "Currency": "EUR", "Opened": "2017-06", "90d volume": "€41.2M" } },
  { id: "a-aurora-usd", type: "account", name: "Aurora USD ····9920", sub: "Emirates NBD", risk: 72, x: .20, y: .54,
    attrs: { "IBAN": "AE·····9920", "Currency": "USD", "Opened": "2019-04", "90d volume": "$58.7M" } },
];
export const ENTITY_BY_ID = Object.fromEntries(ENTITIES.map(e => [e.id, e]));

// ---- Graph edges (relationships among core entities) ----
export const EDGES = [
  { s: "p-sorenson", t: "o-northwind", rel: "owns", strength: 3 },
  { s: "p-sorenson", t: "o-helios", rel: "controls", strength: 3, alert: true },
  { s: "o-northwind", t: "o-helios", rel: "controls", strength: 2 },
  { s: "o-northwind", t: "o-aurora", rel: "controls", strength: 2 },
  { s: "p-marchetti", t: "o-aurora", rel: "directs", strength: 2 },
  { s: "o-castor", t: "o-helios", rel: "formed", strength: 1 },
  { s: "o-castor", t: "o-aurora", rel: "formed", strength: 1 },
  { s: "o-helios", t: "v-blackfrost", rel: "operates", strength: 3, alert: true },
  { s: "o-helios", t: "v-northstar", rel: "operates", strength: 2 },
  { s: "o-helios", t: "a-helios-eur", rel: "holds", strength: 2 },
  { s: "o-aurora", t: "a-aurora-usd", rel: "holds", strength: 2 },
  { s: "a-aurora-usd", t: "a-helios-eur", rel: "transfers", strength: 3, alert: true },
  { s: "v-blackfrost", t: "f-novoross", rel: "calledAt", strength: 2, alert: true },
  { s: "v-blackfrost", t: "f-limassol", rel: "calledAt", strength: 1 },
  { s: "v-northstar", t: "f-jebelali", rel: "calledAt", strength: 2 },
  { s: "v-northstar", t: "f-limassol", rel: "calledAt", strength: 1 },
  { s: "p-okonkwo", t: "o-aurora", rel: "contracts", strength: 1 },
  { s: "p-haddad", t: "a-aurora-usd", rel: "facilitates", strength: 2 },
  { s: "p-haddad", t: "p-sorenson", rel: "contacts", strength: 1 },
  { s: "p-okonkwo", t: "v-blackfrost", rel: "booked", strength: 1 },
];

// ---- Transactions feed (for entity 360 / dashboard) ----
export const TRANSACTIONS = [
  { id: "TXN-88241", date: "2026-05-28", from: "Aurora USD ····9920", to: "Helios EUR ····4471", amount: 4_820_000, ccy: "USD", flag: "alert", note: "Layered · 3 hops" },
  { id: "TXN-88107", date: "2026-05-22", from: "Helios EUR ····4471", to: "Castor Corp Svcs", amount: 142_000, ccy: "EUR", flag: "warn", note: "Round-trip" },
  { id: "TXN-87990", date: "2026-05-19", from: "Northwind Holdings", to: "Aurora USD ····9920", amount: 9_100_000, ccy: "USD", flag: "alert", note: "Structuring" },
  { id: "TXN-87744", date: "2026-05-11", from: "Aurora USD ····9920", to: "Trade finance · ENBD", amount: 2_300_000, ccy: "USD", flag: "ok", note: "LC settlement" },
  { id: "TXN-87520", date: "2026-05-04", from: "Helios EUR ····4471", to: "Bunker supplier · PIR", amount: 880_000, ccy: "EUR", flag: "warn", note: "Sanctioned port" },
  { id: "TXN-87333", date: "2026-04-27", from: "Aurora USD ····9920", to: "Helios EUR ····4471", amount: 6_450_000, ccy: "USD", flag: "alert", note: "Layered · 5 hops" },
];

// ---- Shipments ----
export const SHIPMENTS = [
  { id: "BL-204417", vessel: "MV Blackfrost", commodity: "Steel billets (declared)", origin: "Novorossiysk", dest: "Jebel Ali", status: "alert", note: "Manifest mismatch" },
  { id: "BL-204390", vessel: "MV Northern Star", commodity: "Crude oil", origin: "Limassol", dest: "Singapore", status: "ok", note: "Cleared" },
  { id: "BL-204362", vessel: "MV Blackfrost", commodity: "Machinery parts", origin: "Limassol", dest: "Novorossiysk", status: "warn", note: "AIS gap en route" },
];

// ---- Map nodes (geospatial) — lon/lat-ish normalized to a stylized world frame 0..100 ----
export const MAP_PLACES = [
  { id: "f-limassol", name: "Limassol", type: "port", x: 57.5, y: 41, risk: 35 },
  { id: "f-jebelali", name: "Jebel Ali", type: "port", x: 64, y: 47, risk: 30 },
  { id: "f-novoross", name: "Novorossiysk", type: "port", x: 58.5, y: 33, risk: 86, alert: true },
  { id: "f-piraeus",  name: "Piraeus", type: "port", x: 53, y: 40, risk: 44 },
  { id: "f-singapore",name: "Singapore", type: "port", x: 78, y: 58, risk: 22 },
  { id: "f-rotterdam",name: "Rotterdam", type: "port", x: 48.5, y: 27, risk: 28 },
];
// live vessel positions (x,y in same frame) with heading
export const MAP_VESSELS = [
  { id: "v-blackfrost", name: "MV Blackfrost", x: 60, y: 38, hd: 145, risk: 90, speed: "11.4 kn", status: "AIS gap 06:12", alert: true },
  { id: "v-northstar", name: "MV Northern Star", x: 70, y: 52, hd: 95, risk: 67, speed: "13.1 kn", status: "Underway" },
];
// routes: array of place/vessel ids forming a polyline
export const MAP_ROUTES = [
  { id: "r1", pts: ["f-novoross", "v-blackfrost", "f-jebelali"], alert: true },
  { id: "r2", pts: ["f-limassol", "v-northstar", "f-singapore"] },
];

// ---- Pipelines (data integration) ----
export const PIPELINE_NODES = [
  // sources
  { id: "src-ais", kind: "source", label: "AIS Vessel Feed", sub: "Kafka · live", x: 60, y: 70, status: "live", icon: "ship" },
  { id: "src-swift", kind: "source", label: "SWIFT MT103", sub: "SFTP · hourly", x: 60, y: 200, status: "ok", icon: "swap" },
  { id: "src-customs", kind: "source", label: "Customs Manifests", sub: "S3 · daily", x: 60, y: 330, status: "ok", icon: "box" },
  { id: "src-registry", kind: "source", label: "Corp. Registry API", sub: "REST · daily", x: 60, y: 460, status: "warn", icon: "building" },
  // transforms
  { id: "tf-clean", kind: "transform", label: "Cleanse & Standardize", sub: "PySpark", x: 350, y: 120, status: "ok", icon: "filter" },
  { id: "tf-resolve", kind: "transform", label: "Entity Resolution", sub: "ML · fuzzy match", x: 350, y: 300, status: "running", icon: "merge" },
  { id: "tf-enrich", kind: "transform", label: "Sanctions Enrichment", sub: "OFAC · EU lists", x: 350, y: 460, status: "ok", icon: "shield" },
  // ontology sink
  { id: "snk-onto", kind: "sink", label: "Ontology Objects", sub: "AXIOM graph", x: 660, y: 230, status: "ok", icon: "share" },
  { id: "snk-alert", kind: "sink", label: "Alert Engine", sub: "rules + ML", x: 660, y: 400, status: "live", icon: "bell" },
];
export const PIPELINE_EDGES = [
  ["src-ais", "tf-clean"], ["src-swift", "tf-clean"], ["src-customs", "tf-resolve"],
  ["src-registry", "tf-resolve"], ["tf-clean", "tf-resolve"],
  ["tf-resolve", "tf-enrich"], ["tf-resolve", "snk-onto"],
  ["tf-enrich", "snk-onto"], ["tf-enrich", "snk-alert"], ["snk-onto", "snk-alert"],
];

// ---- Home workspace ----
export const APPS = [
  { id: "ontology", name: "Ontology Explorer", desc: "Object types, properties & links", icon: "share", view: "ontology", color: "var(--violet)" },
  { id: "graph", name: "Graph", desc: "Investigate connections", icon: "graph", view: "graph", color: "var(--accent)" },
  { id: "map", name: "Geospatial", desc: "Vessels, ports & routes", icon: "globe", view: "map", color: "var(--warn)" },
  { id: "pipeline", name: "Pipeline Builder", desc: "Integrate & transform data", icon: "pipeline", view: "pipeline", color: "var(--ok)" },
  { id: "dashboard", name: "Operations", desc: "Live metrics & alerts", icon: "grid", view: "dashboard", color: "var(--info)" },
  { id: "workshop", name: "Workshop", desc: "Build analytic apps", icon: "blocks", view: "workshop", color: "oklch(0.74 0.13 330)" },
];

// ---- Projects / investigations ----
// MOVED (R-4): unified into the single `project` domain object.
// Import { PROJECTS } from './data_projects.js' instead.

export const ACTIVITY = [
  { who: "Entity Resolution", what: "merged 14 duplicate Person objects", when: "2m", kind: "system" },
  { who: "Alert Engine", what: "flagged TXN-88241 · layering pattern", when: "8m", kind: "alert" },
  { who: "A. Reyes", what: "added note to MV Blackfrost", when: "21m", kind: "user" },
  { who: "AIS Vessel Feed", what: "detected AIS gap · MV Blackfrost", when: "34m", kind: "alert" },
  { who: "M. Cho", what: "linked Helios Maritime → Northwind", when: "1h", kind: "user" },
  { who: "Sanctions Enrichment", what: "matched 3 objects to EU Annex IV", when: "2h", kind: "system" },
];

export const NOTIFS = [
  { title: "Layering pattern detected", body: "TXN-88241 · $4.82M across 3 hops", time: "8m", sev: "alert" },
  { title: "AIS signal lost", body: "MV Blackfrost · near Novorossiysk", time: "34m", sev: "warn" },
  { title: "New sanctions match", body: "Helios Maritime → EU Annex IV", time: "2h", sev: "alert" },
  { title: "Pipeline completed", body: "Customs Manifests · 12,402 rows", time: "3h", sev: "ok" },
];

// dashboard time-series (sparkline-ish)
export const SERIES = {
  alerts:  [4,6,3,8,5,9,7,12,8,11,14,10,13,18,12,15],
  txns:    [120,142,98,160,180,150,210,190,230,205,260,240,288,255,300,290],
  ingest:  [60,62,58,70,64,72,68,74,80,76,82,78,86,84,90,92],
  resolve: [40,52,48,60,58,66,62,70,68,74,72,80,78,84,82,88],
};

export function fmtMoney(n, ccy) {
  const sym = ccy === "EUR" ? "€" : ccy === "USD" ? "$" : "";
  if (n >= 1e6) return sym + (n/1e6).toFixed(2) + "M";
  if (n >= 1e3) return sym + (n/1e3).toFixed(0) + "K";
  return sym + n.toLocaleString();
}
export function riskBand(r) { return r >= 80 ? "alert" : r >= 55 ? "warn" : "ok"; }
export function riskLabel(r) { return r >= 80 ? "Critical" : r >= 55 ? "Elevated" : "Low"; }
