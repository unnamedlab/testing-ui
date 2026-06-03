/* ============================================================
   AXIOM — data_workspaces.js · FUENTE ÚNICA (caso = workspace)
   ------------------------------------------------------------
   Antes el MISMO caso vivía 3 veces, con cifras que se contradecían:
     · CASES        (data_ext.js)      → objects 142, alerts 7
     · PROJECTS     (data_projects.js) → objects 1284, alerts 12
     · PROJECTS     (data.js)          → alerts 12, members 7, progress 64
   y dos ficheros exportaban el MISMO nombre `PROJECTS` con datos distintos.

   Ahora hay UN registro por workspace. `CASES`, el `PROJECTS` de data_projects
   y el `PROJECTS` de data.js son PROYECCIONES de este array: el mismo caso
   reporta las mismas cifras en todas las vistas.

   Convención de campos
   --------------------
   HECHOS (únicos, sin duplicar):
     id · code · kind · classification · status · scheduled · sla
     lead · members[]  (colaboradores nombrados, iniciales)
     team              (tamaño de equipo que mostraba la tarjeta ligera de Home)
     openedIso · opened (display es) · updated · progress · pinned
     counts: { objects, alerts, sources }
   PRESENTACIÓN bilingüe SÓLO donde una vista inglesa (Cases/Reports/Home) y la
   española (Projects) mostraban copy distinta — el resto es un único valor:
     name / nameEn · sub / subEn · summary / summaryEn · tasks / tasksEn
   ============================================================ */

export const WORKSPACES = [
  {
    id: "blackfrost", code: "BLACKFROST", kind: "case", pinned: true,
    name: "Operación Blackfrost", nameEn: "Case BLACKFROST",
    sub: "Blanqueo trade-finance · Aurora–Helios", subEn: "Sanctions evasion · maritime",
    classification: "SECRET", status: "Active", scheduled: false, sla: "On track",
    lead: "AR", members: ["AR", "MC", "JD"], team: 7,
    openedIso: "2026-04-30", opened: "30 abr 2026", updated: "12m", progress: 64,
    counts: { objects: 1284, alerts: 12, sources: 6 },
    summary: "Red coordinada de blanqueo vía trade-finance entre Aurora Trading y Helios Maritime. Riesgo de red 84/100.",
    summaryEn: "Suspected sanctions-evasion network moving petroleum via flag-hopping vessels and layered trade-finance flows through UAE and Cyprus shell entities.",
    tasks: [["Mapear cadena Aurora→Helios", "done"], ["UBO de Northwind", "doing"], ["Confirmar gaps AIS", "doing"], ["Redactar STR", "todo"]],
    tasksEn: [["Confirm UBO of Helios Maritime", "done"], ["Subpoena ENBD account records", "doing"], ["Map Blackfrost AIS gaps to port calls", "doing"], ["Brief liaison partner", "todo"]],
  },
  {
    id: "tradewind", code: "TRADEWIND", kind: "case", pinned: false,
    name: "Operation TRADEWIND", nameEn: "Operation TRADEWIND",
    sub: "Trade-based laundering", subEn: "Trade-based laundering",
    classification: "CONFIDENTIAL", status: "Active", scheduled: false, sla: "At risk",
    lead: "MC", members: ["MC", "JD"], team: 4,
    openedIso: "2026-05-12", opened: "12 may 2026", updated: "1h", progress: 38,
    counts: { objects: 88, alerts: 3, sources: 3 },
    summary: "Trade-based money laundering via over/under-invoicing across electronics importers.",
    summaryEn: "Trade-based money laundering via over/under-invoicing across electronics importers.",
    tasks: [], tasksEn: [],
  },
  {
    id: "supply", code: "SUPPLY", kind: "case", pinned: false,
    name: "Supply Chain Integrity", nameEn: "Supply Chain Integrity",
    sub: "Tier-2 supplier risk", subEn: "Tier-2 supplier risk",
    classification: "CONFIDENTIAL", status: "Monitoring", scheduled: false, sla: "On track",
    lead: "JD", members: ["JD", "AR", "MC"], team: 11,
    openedIso: "2026-03-20", opened: "20 mar 2026", updated: "Yesterday", progress: 81,
    counts: { objects: 301, alerts: 0, sources: 4 },
    summary: "Tier-2 supplier risk monitoring for critical components.",
    summaryEn: "Tier-2 supplier risk monitoring for critical components.",
    tasks: [], tasksEn: [],
  },
  {
    id: "fraud", code: "NE-7", kind: "case", pinned: false,
    name: "Card Fraud Ring NE-7", nameEn: "Card Fraud Ring NE-7",
    sub: "Financial crime", subEn: "Financial crime",
    classification: "CONFIDENTIAL", status: "Active", scheduled: false, sla: "On track",
    lead: "MC", members: ["MC", "JD"], team: 5,
    openedIso: "2026-05-01", opened: "01 may 2026", updated: "2d", progress: 52,
    counts: { objects: 240, alerts: 6, sources: 3 },
    summary: "Anillo de fraude con tarjeta NE-7 · delito financiero.",
    summaryEn: "Card-fraud ring NE-7 · financial crime.",
    tasks: [], tasksEn: [],
  },
  {
    id: "nightjar", code: "NIGHTJAR", kind: "case", pinned: false,
    name: "Operación Nightjar", nameEn: "Operation NIGHTJAR",
    sub: "Evasión de sanciones · marítimo", subEn: "Sanctions evasion · maritime",
    classification: "SECRET", status: "Active", scheduled: false, sla: "On track",
    lead: "MC", members: ["MC", "JD"], team: 2,
    openedIso: "2026-05-14", opened: "14 may 2026", updated: "1d", progress: 38,
    counts: { objects: 612, alerts: 5, sources: 4 },
    summary: "Seguimiento de MV Nightjar y su fletador Meridian por escalas en terminales sancionadas.",
    summaryEn: "Tracking MV Nightjar and its charterer Meridian across calls at sanctioned terminals.",
    tasks: [["Verificar manifiestos", "doing"], ["Cruce OFAC", "todo"]],
    tasksEn: [["Verify manifests", "doing"], ["OFAC cross-check", "todo"]],
  },
  {
    id: "aiswatch", code: "AISWATCH", kind: "monitor", pinned: false,
    name: "AIS Watch", nameEn: "AIS Watch",
    sub: "Monitor marítimo permanente", subEn: "Standing maritime monitor",
    classification: "CONFIDENTIAL", status: "Active", scheduled: true, sla: "On track",
    lead: "AR", members: ["AR", "JD"], team: 2,
    openedIso: "2026-02-02", opened: "02 feb 2026", updated: "30m", progress: 90,
    counts: { objects: 4120, alerts: 0, sources: 2 },
    summary: "Monitor permanente de gaps AIS y rendezvous en el Mediterráneo oriental.",
    summaryEn: "Standing monitor for AIS gaps and rendezvous in the eastern Mediterranean.",
    tasks: [["Revisar umbral de gap", "todo"]],
    tasksEn: [["Review gap threshold", "todo"]],
  },
  {
    id: "meridian", code: "MERIDIAN", kind: "case", pinned: false,
    name: "Revisión Meridian", nameEn: "Meridian Review",
    sub: "Due diligence de forwarder", subEn: "Forwarder due diligence",
    classification: "CONFIDENTIAL", status: "Review", scheduled: false, sla: "On track",
    lead: "MC", members: ["MC", "AR"], team: 2,
    openedIso: "2026-05-20", opened: "20 may 2026", updated: "4h", progress: 70,
    counts: { objects: 188, alerts: 1, sources: 3 },
    summary: "Diligencia debida sobre Meridian Logistics como contraparte.",
    summaryEn: "Due diligence on Meridian Logistics as a counterparty.",
    tasks: [["Recopilar UBO", "done"], ["Informe de cierre", "doing"]],
    tasksEn: [["Collect UBO", "done"], ["Closing report", "doing"]],
  },
];

export const WORKSPACE_BY_ID = Object.fromEntries(WORKSPACES.map((w) => [w.id, w]));

// Selecciona y ORDENA workspaces por una lista de ids (cada proyección preserva
// el conjunto/orden que esa vista mostraba históricamente).
export const pickWorkspaces = (ids) => ids.map((id) => WORKSPACE_BY_ID[id]).filter(Boolean);
