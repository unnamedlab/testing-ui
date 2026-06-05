/* AXIOM — data_projects.js
   ============================================================
   SINGLE SOURCE OF TRUTH for the "project" domain object (R-4).

   A `project` is the one canonical unit of investigation. It replaces
   the three previously-parallel models:
     • data.js          · PROJECTS  (Home "Your projects")     → removed
     • data_ext.js      · CASES     (Cases + context switcher)  → removed
     • data_projects.js · PROJECTS  (Workspaces)                → this file

   Home, Alerts & Cases, the TopBar context switcher and Workspaces are now
   all *views* of this same collection. Member ids align with ANALYSTS in
   data_ext.js (AR · MC · JD).

   Schema (superset — every consumer reads from these fields):
     id, name, sub
     status      "Active" | "In review" | "Monitoring"
     cls         classification: "SECRET" | "CONFIDENTIAL"
     scheduled   bool · standing/automated monitor
     pinned      bool · surfaced first on Home
     lead        analyst id
     members     [analyst id]
     opened      human date · "28 Apr 2026"
     updated     relative · "12m"
     progress    0–100
     sla         "On track" | "At risk"
     summary     prose
     counts      { objects, alerts, sources }
     tasks       [[label, "done"|"doing"|"todo"]]
     artifacts   [{ kind, name, owner, meta, updated, cls? }]
     activity    [[actor, text, time, "user"|"system"|"alert"]]
   ============================================================ */

export const PROJECTS = [
  {
    id: "blackfrost", name: "Operation Blackfrost", sub: "Trade-finance laundering · Aurora–Helios",
    status: "Active", cls: "SECRET", scheduled: false, pinned: true,
    lead: "AR", members: ["AR", "MC", "JD"], opened: "28 Apr 2026", updated: "12m", progress: 62, sla: "On track",
    summary: "Coordinated trade-finance laundering network between Aurora Trading and Helios Maritime, layering petroleum flows through UAE and Cyprus shell entities. Network risk 84/100.",
    counts: { objects: 1284, alerts: 12, sources: 6 },
    tasks: [["Map the Aurora→Helios chain", "done"], ["Confirm UBO of Northwind", "doing"], ["Map Blackfrost AIS gaps to port calls", "doing"], ["Draft STR", "todo"]],
    artifacts: [
      { kind: "chart", name: "Link chart Aurora–Helios", owner: "AR", meta: "42 objects · 58 links", updated: "12m", cls: "SECRET" },
      { kind: "dashboard", name: "BLACKFROST operations", owner: "MC", meta: "live", updated: "1h" },
      { kind: "notebook", name: "Layering analysis", owner: "MC", meta: "14 cells", updated: "3h" },
      { kind: "report", name: "Intelligence brief", owner: "AR", meta: "draft", updated: "12m" },
      { kind: "watchlist", name: "Maritime watch", owner: "JD", meta: "7 objects", updated: "1d" },
      { kind: "file", name: "swift_mt103_apr.csv", owner: "AR", meta: "CSV · 1.2 MB", updated: "2d", cls: "SECRET" },
      { kind: "file", name: "northwind_registry.pdf", owner: "AR", meta: "PDF · 14 pp.", updated: "1d", cls: "SECRET" },
    ],
    activity: [["AR", "updated the report", "12m", "user"], ["SYS", "SWIFT pipeline completed", "1h", "system"], ["MC", "escalated AL-3371", "6h", "alert"]],
  },
  {
    id: "nightjar", name: "Operation Nightjar", sub: "Sanctions evasion · maritime",
    status: "Active", cls: "SECRET", scheduled: false, pinned: true,
    lead: "MC", members: ["MC", "JD"], opened: "14 May 2026", updated: "1d", progress: 38, sla: "At risk",
    summary: "Tracking MV Nightjar and its charterer Meridian over repeated calls at sanctioned terminals, with AIS gaps consistent with deliberate dark activity.",
    counts: { objects: 612, alerts: 5, sources: 4 },
    tasks: [["Verify manifests", "doing"], ["OFAC cross-check", "todo"]],
    artifacts: [
      { kind: "chart", name: "Meridian–Nightjar network", owner: "MC", meta: "18 objects", updated: "2h" },
      { kind: "file", name: "meridian_manifests.pdf", owner: "MC", meta: "PDF · 22 pp.", updated: "1d", cls: "SECRET" },
    ],
    activity: [["MC", "opened the operation", "3d", "user"], ["JD", "linked MV Nightjar", "2d", "user"]],
  },
  {
    id: "tradewind", name: "Operation Tradewind", sub: "Trade-based money laundering",
    status: "Active", cls: "CONFIDENTIAL", scheduled: false, pinned: false,
    lead: "MC", members: ["MC", "JD"], opened: "12 May 2026", updated: "1h", progress: 44, sla: "At risk",
    summary: "Trade-based money laundering via over/under-invoicing across a ring of electronics importers fronting for a common beneficial owner.",
    counts: { objects: 88, alerts: 3, sources: 3 },
    tasks: [["Reconcile invoice vs. customs value", "doing"], ["Identify common UBO", "todo"]],
    artifacts: [
      { kind: "notebook", name: "Invoice variance scan", owner: "MC", meta: "9 cells", updated: "1h" },
      { kind: "report", name: "TRADEWIND weekly status", owner: "JD", meta: "draft", updated: "1d" },
    ],
    activity: [["MC", "opened the operation", "8d", "user"], ["SYS", "Customs feed ingested", "1h", "system"]],
  },
  {
    id: "supply", name: "Supply Chain Integrity", sub: "Tier-2 supplier risk",
    status: "Monitoring", cls: "CONFIDENTIAL", scheduled: true, pinned: false,
    lead: "JD", members: ["JD", "AR", "MC"], opened: "20 Mar 2026", updated: "Yesterday", progress: 81, sla: "On track",
    summary: "Standing tier-2 supplier risk monitoring for critical components, watching for ownership changes and sanctions exposure across the bill of materials.",
    counts: { objects: 301, alerts: 0, sources: 3 },
    tasks: [["Refresh supplier ownership graph", "done"], ["Quarterly exposure rollup", "doing"]],
    artifacts: [{ kind: "dashboard", name: "Supplier risk monitor", owner: "JD", meta: "live", updated: "Yesterday" }],
    activity: [["SYS", "scheduled run completed", "6h", "system"], ["AR", "cleared 3 low-risk flags", "1d", "user"]],
  },
  {
    id: "aiswatch", name: "AIS Watch", sub: "Standing maritime monitor",
    status: "Monitoring", cls: "CONFIDENTIAL", scheduled: true, pinned: false,
    lead: "AR", members: ["AR", "JD"], opened: "02 Feb 2026", updated: "30m", progress: 90, sla: "On track",
    summary: "Standing monitor for AIS gaps and rendezvous in the eastern Mediterranean, feeding candidate vessels into active operations.",
    counts: { objects: 4120, alerts: 0, sources: 2 },
    tasks: [["Review gap threshold", "todo"]],
    artifacts: [{ kind: "dashboard", name: "Monitor health", owner: "AR", meta: "live", updated: "30m" }],
    activity: [["SYS", "scheduled run completed", "30m", "system"]],
  },
  {
    id: "meridian", name: "Meridian Review", sub: "Forwarder due diligence",
    status: "In review", cls: "CONFIDENTIAL", scheduled: false, pinned: false,
    lead: "MC", members: ["MC", "AR"], opened: "20 May 2026", updated: "4h", progress: 70, sla: "On track",
    summary: "Counterparty due diligence on Meridian Logistics as a freight forwarder, ahead of a closing recommendation.",
    counts: { objects: 188, alerts: 1, sources: 3 },
    tasks: [["Collect UBO", "done"], ["Closing report", "doing"]],
    artifacts: [{ kind: "report", name: "Meridian due diligence", owner: "MC", meta: "draft", updated: "4h" }],
    activity: [["MC", "opened the review", "5d", "user"], ["AR", "uploaded meridian_ubo.pdf", "1d", "user"]],
  },
  {
    id: "fraud", name: "Card Fraud Ring NE-7", sub: "Financial crime · card-present",
    status: "Active", cls: "CONFIDENTIAL", scheduled: false, pinned: false,
    lead: "JD", members: ["JD", "MC"], opened: "08 May 2026", updated: "2d", progress: 52, sla: "At risk",
    summary: "Card-present fraud ring NE-7 cashing out cloned cards across a cluster of merchants, with mule accounts consolidating proceeds.",
    counts: { objects: 430, alerts: 6, sources: 4 },
    tasks: [["Cluster compromised merchants", "doing"], ["Trace mule accounts", "todo"]],
    artifacts: [{ kind: "chart", name: "Merchant–mule network", owner: "JD", meta: "31 objects", updated: "2d" }],
    activity: [["JD", "opened the case", "12d", "user"], ["SYS", "flagged 6 layering patterns", "2d", "alert"]],
  },
];

export const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map(p => [p.id, p]));

// The active project surfaced in the TopBar context switcher (single source of truth).
export const ACTIVE_PROJECT = "blackfrost";

// I8: deterministic case-reference suffix — replaces the hardcoded "-0612" magic
// literal in the dossier / reports header. Stable per project id, no stored data.
export function caseRef(id) {
  let h = 0;
  for (const ch of String(id || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String((h % 9000) + 1000); // 4 digits, 1000–9999
}

// ---- Shared governance config (not per-project) ----
export const ACCESS_MATRIX = {
  caps: ["View", "Comment", "Edit", "Action", "Export", "Admin"],
  rows: [["Lead", [1, 1, 1, 1, 1, 1]], ["Investigator", [1, 1, 1, 1, 1, 0]], ["Reviewer", [1, 1, 0, 0, 1, 0]], ["Read-only", [1, 0, 0, 0, 0, 0]]],
};
export const PROJ_ROLES = [
  { name: "Lead", scope: "Full control + administration" },
  { name: "Investigator", scope: "Read · write · actions" },
  { name: "Reviewer", scope: "Read · comment" },
  { name: "Read-only", scope: "Read" },
];

// Project-level role of a member — a PROJ_ROLES name ("Lead" | "Investigator" |
// …), distinct from the analyst's job title (ANALYSTS[id].role, e.g. "Financial
// Analyst"). The lead carries "Lead"; every other member is an "Investigator".
// Single source of truth so the Members table and the per-role counts agree and
// never compare job titles against project-role names (which never match → the
// counts used to always render 0).
export function projectRoleOf(project, memberId) {
  return memberId === project.lead ? "Lead" : "Investigator";
}
