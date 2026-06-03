/* AXIOM — data_projects.js · fixture de demo regenerado
   Consumido por ProjectsView (PROJECTS, ARTIFACTS, ACCESS_MATRIX, PROJ_ROLES, PROJ_ACTIVITY).
   ids de members alineados con ANALYSTS de data_ext.js → AR · MC · JD.
   PROJECTS es ahora una PROYECCIÓN de WORKSPACES (fuente única en data_workspaces.js):
   blackfrost reporta las mismas cifras que Cases/Home. */
import { pickWorkspaces } from './data_workspaces.js';

export const PROJECTS = pickWorkspaces(["blackfrost", "nightjar", "aiswatch", "meridian"]).map((w) => ({
  id: w.id,
  name: w.name,
  sub: w.sub,
  cls: w.classification,
  status: w.status,
  scheduled: w.scheduled,
  lead: w.lead,
  members: w.members,
  opened: w.opened,
  updated: w.updated,
  progress: w.progress,
  summary: w.summary,
  counts: w.counts,
  tasks: w.tasks,
}));
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
