/* AXIOM — data_projects.js · fixture de demo regenerado
   Consumido por ProjectsView (PROJECTS, ARTIFACTS, ACCESS_MATRIX, PROJ_ROLES, PROJ_ACTIVITY).
   ids de members alineados con ANALYSTS de data_ext.js → AR · MC · JD. */
export const PROJECTS = [
  { id: "blackfrost", name: "Operación Blackfrost", sub: "Blanqueo trade-finance · Aurora–Helios", cls: "SECRET", status: "Active", scheduled: false, lead: "AR", members: ["AR", "MC", "JD"], opened: "28 abr 2026", updated: "12m", progress: 62,
    summary: "Red coordinada de blanqueo vía trade-finance entre Aurora Trading y Helios Maritime. Riesgo de red 84/100.", counts: { objects: 1284, alerts: 12, sources: 6 },
    tasks: [["Mapear cadena Aurora→Helios", "done"], ["UBO de Northwind", "doing"], ["Confirmar gaps AIS", "doing"], ["Redactar STR", "todo"]] },
  { id: "nightjar", name: "Operación Nightjar", sub: "Evasión de sanciones · marítimo", cls: "SECRET", status: "Active", scheduled: false, lead: "MC", members: ["MC", "JD"], opened: "14 may 2026", updated: "1d", progress: 38,
    summary: "Seguimiento de MV Nightjar y su fletador Meridian por escalas en terminales sancionadas.", counts: { objects: 612, alerts: 5, sources: 4 },
    tasks: [["Verificar manifiestos", "doing"], ["Cruce OFAC", "todo"]] },
  { id: "aiswatch", name: "AIS Watch", sub: "Monitor marítimo permanente", cls: "CONFIDENTIAL", status: "Active", scheduled: true, lead: "AR", members: ["AR", "JD"], opened: "02 feb 2026", updated: "30m", progress: 90,
    summary: "Monitor permanente de gaps AIS y rendezvous en el Mediterráneo oriental.", counts: { objects: 4120, alerts: 0, sources: 2 },
    tasks: [["Revisar umbral de gap", "todo"]] },
  { id: "meridian", name: "Revisión Meridian", sub: "Due diligence de forwarder", cls: "CONFIDENTIAL", status: "Review", scheduled: false, lead: "MC", members: ["MC", "AR"], opened: "20 may 2026", updated: "4h", progress: 70,
    summary: "Diligencia debida sobre Meridian Logistics como contraparte.", counts: { objects: 188, alerts: 1, sources: 3 },
    tasks: [["Recopilar UBO", "done"], ["Informe de cierre", "doing"]] },
];
export const ARTIFACTS = {
  blackfrost: [
    { kind: "chart", name: "Link chart Aurora–Helios", owner: "AR", meta: "42 objetos · 58 enlaces", updated: "12m", cls: "SECRET" },
    { kind: "dashboard", name: "Operaciones BLACKFROST", owner: "MC", meta: "live", updated: "1h" },
    { kind: "notebook", name: "Análisis de layering", owner: "MC", meta: "14 celdas", updated: "3h" },
    { kind: "report", name: "Brief de inteligencia", owner: "AR", meta: "borrador", updated: "12m" },
    { kind: "watchlist", name: "Watch marítima", owner: "JD", meta: "7 objetos", updated: "1d" },
    { kind: "file", name: "swift_mt103_apr.csv", owner: "AR", meta: "CSV · 1.2 MB", updated: "2d", cls: "SECRET" },
    { kind: "file", name: "northwind_registry.pdf", owner: "AR", meta: "PDF · 14 pág.", updated: "1d", cls: "SECRET" },
  ],
  nightjar: [
    { kind: "chart", name: "Red Meridian–Nightjar", owner: "MC", meta: "18 objetos", updated: "2h" },
    { kind: "file", name: "meridian_manifests.pdf", owner: "MC", meta: "PDF · 22 pág.", updated: "1d", cls: "SECRET" },
  ],
  aiswatch: [{ kind: "dashboard", name: "Salud del monitor", owner: "AR", meta: "live", updated: "30m" }],
  meridian: [{ kind: "report", name: "Due diligence Meridian", owner: "MC", meta: "borrador", updated: "4h" }],
};
export const ACCESS_MATRIX = {
  caps: ["Ver", "Comentar", "Editar", "Acción", "Exportar", "Admin"],
  rows: [["Lead", [1, 1, 1, 1, 1, 1]], ["Investigator", [1, 1, 1, 1, 1, 0]], ["Reviewer", [1, 1, 0, 0, 1, 0]], ["Read-only", [1, 0, 0, 0, 0, 0]]],
};
export const PROJ_ROLES = [
  { name: "Lead", scope: "Control total + administración" },
  { name: "Investigator", scope: "Lectura · escritura · acciones" },
  { name: "Reviewer", scope: "Lectura · comentar" },
  { name: "Read-only", scope: "Lectura" },
];
export const PROJ_ACTIVITY = {
  blackfrost: [["AR", "actualizó el informe", "12m", "user"], ["SYS", "pipeline SWIFT completó", "1h", "system"], ["MC", "escaló ALR-3187", "6h", "alert"]],
  nightjar: [["MC", "abrió la operación", "3d", "user"], ["JD", "vinculó MV Nightjar", "2d", "user"]],
  aiswatch: [["SYS", "ejecución programada completada", "30m", "system"]],
  meridian: [["MC", "abrió la revisión", "5d", "user"], ["AR", "subió meridian_ubo.pdf", "1d", "user"]],
};
