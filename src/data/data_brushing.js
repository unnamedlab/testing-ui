/* AXIOM — data_brushing.js · UNIFICADO (cluster ②)
   Antes era un fixture propio (B_* distinto). Ahora DERIVA de data.js:
   el brushing enlazado opera sobre el MISMO grafo que GraphView y
   GraphAnalysisView. */
import { ENTITIES, EDGES } from './data.js';

const N = ENTITIES.length || 1;
// gx/gy: panel grafo (0..100 × 0..90) · mx/my: panel mapa · t: % en timeline
export const B_ENTITIES = ENTITIES.map((e, i) => ({
  id: e.id, name: e.name, type: e.type, risk: e.risk, watch: !!e.watch,
  gx: +(e.x * 100).toFixed(1), gy: +(e.y * 90).toFixed(1),
  mx: +(e.x * 100).toFixed(1), my: +(e.y * 90).toFixed(1),
  t: +((i / (N - 1)) * 100).toFixed(1),
}));

// aristas [s, t, rel, alert] sobre los mismos ids
export const B_EDGES = EDGES.map((e) => [e.s, e.t, e.rel, !!e.alert]);
