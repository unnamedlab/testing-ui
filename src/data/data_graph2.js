/* AXIOM — data_graph2.js · UNIFICADO (cluster ②)
   Antes era un fixture propio (G2_* distinto al del lienzo principal).
   Ahora DERIVA de data.js: GraphAnalysisView opera sobre el MISMO
   grafo (entidades/aristas) que GraphView. Conclusiones comparables. */
import { ENTITIES, EDGES } from './data.js';

// nodos en el espacio normalizado que espera GraphAnalysisView (viewBox 0..100 × 0..86)
export const G2_NODES = ENTITIES.map((e) => ({
  id: e.id, name: e.name, type: e.type,
  x: +(e.x * 100).toFixed(1), y: +(e.y * 86).toFixed(1),
}));

// aristas como pares [a, b] sobre los mismos ids del grafo principal
export const G2_EDGES = EDGES.map((e) => [e.s, e.t]);
