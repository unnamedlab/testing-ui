import { ALERTS } from './data_ext.js';
import { PROJECTS } from './data_projects.js';

/* ============================================================
   AXIOM — Overview KPIs (consolidación · clúster A)
   Fuente ÚNICA de los KPIs de cabecera y de la salud de plataforma
   que comparten Home y Operations (el tablero guardado). Las cifras
   que pueden derivarse de datos reales se calculan aquí (no se
   hardcodean en cada vista), de modo que Home, Operations y el resto
   muestran SIEMPRE el mismo número.
   ============================================================ */

// Derivados de datos reales → una sola fuente, sin números mágicos repetidos.
export const OPEN_ALERTS = ALERTS.filter((a) => a.status !== 'closed').length;
export const ACTIVE_PROJECTS = PROJECTS.filter((p) => p.status === 'Active').length;

// Alertas abiertas / críticas de un caso, derivadas de ALERTS — para que la
// tarjeta del proyecto, el dossier y el Copilot lean SIEMPRE el mismo número
// (antes "12" hardcodeado chocaba con las 7 reales del tablero y el board).
export const openAlertsFor = (caseId) =>
  ALERTS.filter((a) => a.case === caseId && a.status !== 'closed').length;
export const criticalAlertsFor = (caseId) =>
  ALERTS.filter((a) => a.case === caseId && a.status !== 'closed' && a.sev === 'critical').length;

// blackfrost es el único caso con ALERTS sembradas: derivamos su conteo abierto
// (era un 12 fijo). Se muta el objeto PROJECTS compartido para que tarjeta,
// stat y dossier coincidan con Operaciones y la cola de Alertas. Mismo patrón
// de "derivar al cargar" que data_ext.js usa para `since`.
const _bf = PROJECTS.find((p) => p.id === 'blackfrost');
if (_bf) _bf.counts.alerts = openAlertsFor('blackfrost');

// KPIs de cabecera. `seriesKey` apunta a SERIES (en data.js) para el sparkline,
// así los datos de serie siguen viviendo donde estaban.
export const OVERVIEW_KPIS = [
  { key: 'alerts',     label: 'Open alerts',       value: String(OPEN_ALERTS), sub: '▲ 4 vs prev',   trend: 'down', seriesKey: 'alerts',  color: 'var(--alert)', icon: 'alertTri' },
  { key: 'flagged',    label: 'Flagged txns (7d)', value: '$58.7M',            sub: '▲ 18%',         trend: 'up',   seriesKey: 'txns',    color: 'var(--accent)', icon: 'swap' },
  { key: 'ingested',   label: 'Objects ingested',  value: '56.3K',             sub: '▲ 12.4K today', trend: 'up',   seriesKey: 'ingest',  color: 'var(--ok)',    icon: 'box' },
  { key: 'resolution', label: 'Resolution rate',   value: '88%',               sub: '▲ 3.1%',        trend: 'up',   seriesKey: 'resolve', color: 'var(--info)',  icon: 'merge' },
];

// Salud de plataforma — antes hardcodeada dentro de HomeView. Vive aquí para que
// Home la enlace a su módulo (Pipelines › Data Health) en vez de reimplementarla.
export const PLATFORM_HEALTH = [
  { label: 'Ingestion',         value: 92, color: 'var(--ok)' },
  { label: 'Entity resolution', value: 88, color: 'var(--accent)' },
  { label: 'Alert latency',     value: 74, color: 'var(--warn)' },
];

// Metadatos del tablero "Operations": es una VISTA GUARDADA publicada desde
// Analytics, no una pantalla independiente. Operations la lee; Analytics la
// publica (botón "Publish to dashboard" → go("dashboard")).
export const OPERATIONS_BOARD = {
  publishedFrom: 'analytics',
  updated: '8m ago',
};
