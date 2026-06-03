/* ============================================================
   AXIOM — data_audit.js · STORE ÚNICO DE EVENTOS (auditoría)
   ------------------------------------------------------------
   Antes el "registro de auditoría" vivía 3 veces:
     · Governance › Audit log  → sintetizaba su propio array inline
     · Admin › Audit           → leía `AUDIT` de data_ext.js
     · Actions › Log           → tabla propia sobre SEED_ACTIONS
   Ahora hay UNA fuente. Cada sitio la lee filtrada por `kind`:
     · Governance = ledger completo con chips por kind
     · Admin      = vista forense (todas, columna Source IP)
     · Actions    = los eventos kind="action" (vía SEED_ACTIONS, su fuente)

   Forma del evento:
     { kind, ts, actor, event, object?(id de entidad), target?(texto), cls, ip? }
   Los eventos de acción DERIVAN de SEED_ACTIONS → una sola verdad para el
   historial de acciones (la misma cola que pinta Actions › Log).
   ============================================================ */
import { ACTION_TYPES, SEED_ACTIONS } from './data_actions.js';
import { ENTITIES } from './data.js';
import { ANALYSTS } from './data_ext.js';

export const AUDIT_KIND_META = {
  action: { label: "Acción",   icon: "bolt",     c: "var(--accent)" },
  access: { label: "Acceso",   icon: "shield",   c: "var(--warn)" },
  export: { label: "Export",   icon: "download", c: "var(--violet)" },
  view:   { label: "Consulta", icon: "table",    c: "var(--text-dim)" },
  system: { label: "Sistema",  icon: "cpu",      c: "var(--ok)" },
  auth:   { label: "Sesión",   icon: "lock",     c: "var(--info)" },
};

const ACTORS = Object.keys(ANALYSTS || {}).filter((k) => k !== "null").slice(0, 5);
const pick = (i) => ACTORS[i % (ACTORS.length || 1)];

// Eventos de acción derivados de la cola real (misma fuente que Actions › Log).
const actionEvents = SEED_ACTIONS.slice(0, 5).map((a) => ({
  kind: "action",
  ts: a.ts,
  actor: a.by,
  event: ACTION_TYPES[a.type]?.name || a.type,
  object: a.target,
  cls: ACTION_TYPES[a.type]?.cls || "CONFIDENTIAL",
}));

// Acceso / export / consulta (antes inline en Governance) + forenses con IP
// (antes en data_ext.AUDIT: login, ingest, query, link, flag, resolve…).
const ledgerEvents = [
  { kind: "access", ts: "8m ago",   actor: pick(1), event: "Granted Read · Write",        object: ENTITIES[2]?.id, cls: "SECRET" },
  { kind: "export", ts: "23m ago",  actor: pick(0), event: "Exported dossier (PDF)",       object: ENTITIES[0]?.id, target: "Dossier · Case BLACKFROST", cls: "SECRET", ip: "10.4.2.31" },
  { kind: "access", ts: "1h ago",   actor: pick(2), event: "Access denied — clearance",    object: ENTITIES[4]?.id, cls: "TOP SECRET" },
  { kind: "view",   ts: "2h ago",   actor: pick(3), event: "Opened object 360°",           object: ENTITIES[1]?.id, cls: "CONFIDENTIAL" },
  { kind: "export", ts: "4h ago",   actor: pick(1), event: "Shared with liaison partner",  object: ENTITIES[3]?.id, cls: "SECRET" },
  { kind: "view",   ts: "09:12:44", actor: "AR",  event: "Viewed 360°",            target: "MV Blackfrost · 360°",       cls: "SECRET",       ip: "10.4.2.18" },
  { kind: "system", ts: "09:02:55", actor: "SYS", event: "Resolved entities (ER)",  target: "14 Person objects",          cls: "CONFIDENTIAL" },
  { kind: "action", ts: "08:54:02", actor: "JD",  event: "Assigned alert",          target: "AL-3371 → self",             cls: "CONFIDENTIAL", ip: "10.4.7.9" },
  { kind: "action", ts: "08:41:19", actor: "AR",  event: "Created link",            target: "Helios → Northwind",         cls: "SECRET",       ip: "10.4.2.18" },
  { kind: "view",   ts: "08:33:47", actor: "MC",  event: "Ran query",               target: "vessels @ Novorossiysk, >$1M", cls: "SECRET",     ip: "10.4.2.31" },
  { kind: "system", ts: "08:20:00", actor: "SYS", event: "Ingested dataset",        target: "Customs Manifests · 12,402 rows", cls: "CONFIDENTIAL" },
  { kind: "action", ts: "08:11:30", actor: "JD",  event: "Flagged high-risk",       target: "a-aurora-usd",               cls: "CONFIDENTIAL", ip: "10.4.7.9" },
  { kind: "auth",   ts: "08:02:14", actor: "AR",  event: "Login — session start",   target: "AXIOM session",              cls: "UNCLASS",      ip: "10.4.2.18" },
];

export const AUDIT_EVENTS = [...actionEvents, ...ledgerEvents];

// Helper: filtra el store por kind (o todo si no se pasa kind / "all").
export const auditByKind = (kind) =>
  !kind || kind === "all" ? AUDIT_EVENTS : AUDIT_EVENTS.filter((e) => e.kind === kind);
