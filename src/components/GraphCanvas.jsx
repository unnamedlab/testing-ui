import { ICONS } from './ui.jsx';

/* ============================================================
   AXIOM — GraphCanvas: shared graph render primitives
   ------------------------------------------------------------
   Single source of truth for how a node and an edge are drawn,
   consumed by all three graph surfaces (GraphView, Graph
   Analysis, Linked brushing). The graph DATA, adjacency and
   algorithms are shared too — see data/graph_model.js. Each
   surface keeps only its own coordinate space and interaction
   shell; the drawing vocabulary lives here, so the three look
   identical and there is one place to restyle the graph.
   ============================================================ */

// One palette for the normalized graphs (analysis + brushing). The main
// GraphView keeps colouring via the `tc <cls>` CSS class (var(--c)); pass
// className="tc <cls>" and leave `color` undefined to use it.
export const GRAPH_TYPE_COLOR = {
  person:  "var(--info)",
  org:     "var(--violet)",
  vessel:  "var(--accent)",
  port:    "var(--warn)",
  account: "var(--ok)",
  txn:     "var(--accent-2)",
  facility:"var(--warn)",
  shipment:"var(--ok)",
  device:  "var(--info)",
};
export const typeColor = (type) => GRAPH_TYPE_COLOR[type] || "var(--text-dim)";

// Glyph name per type for the normalized graphs (maps to ICONS keys).
export const GRAPH_TYPE_GLYPH = {
  person:"user", org:"building", vessel:"ship", port:"anchor", account:"card",
};

/* ---- Edge ----
   a / b: {x,y} endpoints in the surface's own coordinate space.
   color: base stroke when not alert/highlighted.
   label: optional JSX rendered after the line (e.g. relation pill). */
export function GraphEdge({
  a, b, color, alert, highlighted, dim, width, dash, marker, label, baseOpacity = 1, transition = true,
}) {
  if (!a || !b) return null;
  const stroke = alert ? "var(--alert)" : highlighted ? "var(--accent)" : (color || "var(--line-strong)");
  const sw = width != null ? width : (alert ? 2.2 : highlighted ? 2 : 1.3);
  return (
    <g opacity={dim ? 0.12 : baseOpacity} style={transition ? { transition: "opacity .2s" } : undefined}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={sw}
        strokeDasharray={dash || (alert ? "6 4" : "none")} markerEnd={marker} />
      {label}
    </g>
  );
}

/* ---- Node ----
   Renders the circle + optional glyph + state rings + label, in the
   caller's coordinate space. Color comes either from `color` or, when
   omitted, from `var(--c)` (set by a `tc <cls>` className on root).
   Handlers and `children` are passed through so each surface keeps its
   own interaction (drag, pick, hover, dbl-click, score badges…). */
export function GraphNode({
  className, x, y, r, color,
  glyph, glyphScale = 0.04,
  label, showLabel = true, fontSize = 12.5, labelDy, labelColor = "var(--text)",
  selected, selectedRingAnimated, selectedColor = "var(--accent)", strokeWidth, fillMix = 22, circleStyle,
  ringColor, ringWidth = 0.9,
  watched, watchRing, badgeR, badgeStroke,
  dim, dimOpacity = 0.22,
  onPointerDown, onMouseEnter, onMouseLeave, onDoubleClick, onClick,
  children,
}) {
  const col = color || "var(--c)";
  const dy = labelDy != null ? labelDy : r + 15;
  const bR = badgeR != null ? badgeR : Math.max(1.1, r * 0.16);
  const bSW = badgeStroke != null ? badgeStroke : Math.max(0.4, r * 0.06);
  return (
    <g className={className} transform={`translate(${x},${y})`} opacity={dim ? dimOpacity : 1}
       style={{ transition: "opacity .2s", cursor: "pointer" }}
       onPointerDown={onPointerDown} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
       onDoubleClick={onDoubleClick} onClick={onClick}>
      {selected && selectedRingAnimated && (
        <circle r={r + 9} fill="none" stroke={selectedColor} strokeWidth="2" opacity="0.6">
          <animate attributeName="r" values={`${r + 6};${r + 11};${r + 6}`} dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      {ringColor && <circle r={r + 2} fill="none" stroke={ringColor} strokeWidth={ringWidth} />}
      <circle r={r} fill={`color-mix(in oklab, ${col} ${fillMix}%, var(--bg-1))`} stroke={col}
        strokeWidth={strokeWidth != null ? strokeWidth : (selected ? 3 : 2)} style={circleStyle} />
      {glyph && (
        <g style={{ color: col }} transform={`translate(-${r * 0.46},-${r * 0.46}) scale(${r * glyphScale})`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: ICONS[glyph] }} />
        </g>
      )}
      {watchRing && <circle r={r + 4} fill="none" stroke="var(--alert)" strokeWidth="1.5"
        strokeDasharray="3 3" opacity="0.75" style={{ pointerEvents: "none" }} />}
      {watched && <circle cx={r * 0.72} cy={-r * 0.72} r={bR}
        fill="var(--alert)" stroke="var(--bg)" strokeWidth={bSW} />}
      {showLabel && label != null && (
        <text textAnchor="middle" y={dy} fontSize={fontSize} fontFamily="var(--font-ui)" fontWeight="600"
          fill={dim ? "var(--text-faint)" : labelColor} style={{ pointerEvents: "none" }}>{label}</text>
      )}
      {children}
    </g>
  );
}
