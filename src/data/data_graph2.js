/* AXIOM — data_graph2.js · projection for GraphAnalysisView (IC-1)
   This is now just a COORDINATE PROJECTION of the shared graph engine
   (graph_model.js) into the viewBox GraphAnalysisView draws in
   (0..100 × 0..86). The graph itself — nodes, edges, adjacency,
   pathfinding, centrality — lives in graph_model.js and is shared by
   every lens. No separate fixture, no separate topology. */
import { GRAPH_NODES, GRAPH_LINKS } from './graph_model.js';

// nodes in the normalized space GraphAnalysisView expects
export const G2_NODES = GRAPH_NODES.map((n) => ({
  id: n.id,
  name: n.name,
  type: n.type,
  x: +(n.nx * 100).toFixed(1),
  y: +(n.ny * 86).toFixed(1),
}));

// edges as [a, b] id pairs over the same graph
export const G2_EDGES = GRAPH_LINKS.map((l) => [l.s, l.t]);
