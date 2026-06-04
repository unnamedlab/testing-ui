/* ============================================================
   AXIOM — graph_model.js · THE graph engine (IC-1)
   ------------------------------------------------------------
   One model, three lenses. Every graph surface — GraphView,
   GraphAnalysisView (pathfinding/centrality) and BrushingView
   (linked brushing) — reads the SAME nodes, edges, adjacency
   and algorithms from here. Before, each lens re-derived its
   own adjacency + BFS + centrality, so the "single engine" was
   only visual. Now there is literally one engine.

   Everything is derived from data.js (ENTITIES / EDGES), and
   physical objects (ports, vessels) carry their REAL geospatial
   position from MAP_PLACES / MAP_VESSELS so the brushing map is
   an actual map, consistent with MapView — not a re-plot of the
   graph layout.
   ============================================================ */
import { ENTITIES, EDGES, MAP_PLACES, MAP_VESSELS } from './data.js';

// ---- Real geospatial positions, keyed by object id (stylized world frame 0..100) ----
const GEO = {};
MAP_PLACES.forEach((p) => { GEO[p.id] = { x: p.x, y: p.y }; });
MAP_VESSELS.forEach((v) => { GEO[v.id] = { x: v.x, y: v.y }; });

// ---- Canonical node list (one per investigation entity) ----
// nx/ny: normalized layout 0..1 (shared topology across lenses)
// geo:   real position when the object physically exists in space, else null
// seq:   stable index (drives the brushing timeline / "first observed")
export const GRAPH_NODES = ENTITIES.map((e, i) => ({
  id: e.id,
  name: e.name,
  type: e.type,
  risk: e.risk,
  watch: !!e.watch,
  nx: e.x,
  ny: e.y,
  geo: GEO[e.id] || null,
  seq: i,
}));

// ---- Canonical edge list (relation + alert + strength preserved) ----
export const GRAPH_LINKS = EDGES.map((e) => ({
  s: e.s,
  t: e.t,
  rel: e.rel,
  alert: !!e.alert,
  strength: e.strength || 1,
}));

export const NODE_BY_ID = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]));

// ---- Undirected adjacency — the single source of truth for "who connects to whom" ----
export const ADJACENCY = (() => {
  const adj = {};
  GRAPH_NODES.forEach((n) => { adj[n.id] = new Set(); });
  GRAPH_LINKS.forEach(({ s, t }) => { adj[s]?.add(t); adj[t]?.add(s); });
  return adj;
})();

export const neighbors = (id) => ADJACENCY[id] || new Set();

// ---- Shortest path (BFS) over the canonical graph ----
export function shortestPath(s, t) {
  if (s === t) return [s];
  const prev = { [s]: null };
  const q = [s];
  while (q.length) {
    const u = q.shift();
    for (const v of ADJACENCY[u] || []) {
      if (!(v in prev)) {
        prev[v] = u;
        if (v === t) {
          const path = [];
          let x = t;
          while (x != null) { path.unshift(x); x = prev[x]; }
          return path;
        }
        q.push(v);
      }
    }
  }
  return null;
}

// ---- Common neighbors of two nodes ----
export function commonNeighbors(a, b) {
  const nb = neighbors(b);
  return [...neighbors(a)].filter((x) => nb.has(x));
}

// ---- Centrality (degree + betweenness) over the canonical graph ----
// Returns [{ id, deg, btw, score }] sorted by score desc.
export function centrality() {
  const deg = {};
  const btw = {};
  const ids = GRAPH_NODES.map((n) => n.id);
  ids.forEach((id) => { deg[id] = neighbors(id).size; btw[id] = 0; });
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const p = shortestPath(ids[i], ids[j]);
      if (!p) continue;
      for (let k = 1; k < p.length - 1; k++) btw[p[k]]++;
    }
  }
  const maxB = Math.max(1, ...Object.values(btw));
  const maxD = Math.max(1, ...Object.values(deg));
  return ids
    .map((id) => ({
      id,
      deg: deg[id],
      btw: btw[id],
      score: Math.round((0.5 * deg[id] / maxD + 0.5 * btw[id] / maxB) * 100),
    }))
    .sort((a, b) => b.score - a.score);
}
