/* ============================================================
   AXIOM — data_audit.js · REGISTRO DE AUDITORÍA ÚNICO (cluster ⑥)
   ------------------------------------------------------------
   Antes existían TRES ledgers independientes:
     · GovernanceView   → const AUDIT inline (acciones + accesos hardcoded)
     · data_ext.AUDIT   → eventos de sesión/acceso con IP (lo leía Admin)
     · ActionsView.Log  → su propio listado de acciones
   Ahora hay UN solo registro canónico (AUDIT_LOG) y cada vista es una LENTE
   filtrada sobre él:
     · Governance → ledger completo (todas las clases de evento)
     · Admin      → slice de seguridad (access · export · view · system · login)
     · Actions    → slice de acciones (kind === 'action'), en vivo desde SEED_ACTIONS
   Los eventos de acción DERIVAN del mismo SEED_ACTIONS que consume ActionsView,
   así que hay una única fuente de verdad para las acciones.
   ============================================================ */
import { ENTITY_BY_ID } from './data.js';
import { ACTION_TYPES, SEED_ACTIONS } from './data_actions.js';

// metadatos por clase de evento (icono + color para las lentes)
export const AUDIT_KINDS = {
  action: { icon: 'bolt',     c: 'var(--accent)',   label: 'Actions' },
  access: { icon: 'shield',   c: 'var(--warn)',     label: 'Access' },
  export: { icon: 'download', c: 'var(--violet)',   label: 'Exports' },
  view:   { icon: 'table',    c: 'var(--text-dim)', label: 'Views' },
  system: { icon: 'sparkles', c: 'var(--accent-2)', label: 'System' },
  login:  { icon: 'user',     c: 'var(--text-dim)', label: 'Sessions' },
};

const nm = (id) => ENTITY_BY_ID[id]?.name || id;

// 1) Eventos de ACCIÓN — derivados del MISMO seed que usa el Action center.
const actionEvents = SEED_ACTIONS.map((a) => ({
  id: a.id, kind: 'action',
  actor: a.by, approver: a.approver, status: a.status,
  action: ACTION_TYPES[a.type]?.name || a.type,
  target: nm(a.target), objectId: a.target,
  cls: ACTION_TYPES[a.type]?.cls || 'CONFIDENTIAL',
  ts: a.ts, time: a.time || '—', ip: a.ip || '10.4.2.20',
}));

// 2) Eventos de SEGURIDAD / sesión — antes repartidos entre Governance y data_ext.
//    Una sola definición; conservan time + IP para la lente de Admin.
const securityEvents = [
  { id:'EV-514', kind:'access', actor:'MC', action:'Granted Read · Write',     target:'L. Marsh → Aurora Trading FZE', cls:'SECRET',       ts:'8m ago',  time:'09:14:02', ip:'10.4.2.31' },
  { id:'EV-513', kind:'access', actor:'AR', action:'Access denied — clearance', target:'Helios dossier (TS/SCI)',        cls:'TOP SECRET',   ts:'31m ago', time:'08:51:48', ip:'10.4.2.18' },
  { id:'EV-512', kind:'view',   actor:'AR', action:'viewed',                    target:'MV Blackfrost · 360°',           cls:'SECRET',       ts:'09:12:44',time:'09:12:44', ip:'10.4.2.18' },
  { id:'EV-511', kind:'export', actor:'MC', action:'exported',                  target:'Dossier · Case BLACKFROST',      cls:'SECRET',       ts:'09:08:10',time:'09:08:10', ip:'10.4.2.31' },
  { id:'EV-510', kind:'system', actor:'SYS',action:'resolved',                  target:'14 Person objects (ER merge)',   cls:'CONFIDENTIAL', ts:'09:02:55',time:'09:02:55', ip:'—' },
  { id:'EV-509', kind:'access', actor:'JD', action:'assigned',                  target:'AL-3371 → self',                 cls:'CONFIDENTIAL', ts:'08:54:02',time:'08:54:02', ip:'10.4.7.9' },
  { id:'EV-508', kind:'system', actor:'AR', action:'created link',              target:'Helios → Northwind',             cls:'SECRET',       ts:'08:41:19',time:'08:41:19', ip:'10.4.2.18' },
  { id:'EV-507', kind:'view',   actor:'MC', action:'queried',                   target:'vessels @ Novorossiysk, >$1M',   cls:'SECRET',       ts:'08:33:47',time:'08:33:47', ip:'10.4.2.31' },
  { id:'EV-506', kind:'system', actor:'SYS',action:'ingested',                  target:'Customs Manifests · 12,402 rows',cls:'CONFIDENTIAL', ts:'08:20:00',time:'08:20:00', ip:'—' },
  { id:'EV-505', kind:'access', actor:'JD', action:'flagged',                   target:'a-aurora-usd as high-risk',      cls:'CONFIDENTIAL', ts:'08:11:30',time:'08:11:30', ip:'10.4.7.9' },
  { id:'EV-504', kind:'login',  actor:'AR', action:'login',                     target:'AXIOM session start',            cls:'UNCLASS',      ts:'08:02:14',time:'08:02:14', ip:'10.4.2.18' },
];

// Ledger canónico (acciones recientes primero, luego seguridad/sesión).
export const AUDIT_LOG = [...actionEvents, ...securityEvents];

// Lentes: qué clases ve cada vista.
export const AUDIT_LENS = {
  governance: Object.keys(AUDIT_KINDS),
  admin: ['access', 'export', 'view', 'system', 'login'],
  actions: ['action'],
};

export function auditByLens(lens) {
  const ks = AUDIT_LENS[lens] || Object.keys(AUDIT_KINDS);
  return AUDIT_LOG.filter((r) => ks.includes(r.kind));
}
export function auditByKind(kind) {
  return kind === 'all' ? AUDIT_LOG : AUDIT_LOG.filter((r) => r.kind === kind);
}

// Lente preparada para Admin (mantiene la forma { actor, action, target, time, cls, ip }).
export const ADMIN_AUDIT = auditByLens('admin');
