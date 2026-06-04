/* AXIOM — data_brushing.js · projection for BrushingView (IC-1)
   Projection of the shared graph engine (graph_model.js) into the four
   linked panels. The graph is the SAME one GraphView and
   GraphAnalysisView render — adjacency comes from graph_model, not a
   private fixture.

   Map coords (mx/my) now use the object's REAL geospatial position when
   it has one (ports, vessels), so the "Geospatial" panel is an actual
   map consistent with MapView — not a copy of the graph layout. Objects
   with no physical location (people, orgs, accounts) are flagged
   `located:false` and simply don't appear on the map panel; they still
   participate in the graph, table and timeline. */
import { GRAPH_NODES, GRAPH_LINKS } from './graph_model.js';

const N = GRAPH_NODES.length || 1;

// gx/gy: graph panel (0..100 × 0..90) · mx/my: REAL map position · t: % on timeline
export const B_ENTITIES = GRAPH_NODES.map((n) => ({
  id: n.id,
  name: n.name,
  type: n.type,
  risk: n.risk,
  watch: n.watch,
  gx: +(n.nx * 100).toFixed(1),
  gy: +(n.ny * 90).toFixed(1),
  located: !!n.geo,
  mx: n.geo ? n.geo.x : null,
  my: n.geo ? n.geo.y : null,
  t: +((n.seq / (N - 1 || 1)) * 100).toFixed(1),
}));

// edges [s, t, rel, alert] over the same ids
export const B_EDGES = GRAPH_LINKS.map((l) => [l.s, l.t, l.rel, l.alert]);
