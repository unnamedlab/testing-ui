/* ============================================================
   AXIOM — MapCanvas: shared geospatial render primitives (IC-2)
   ------------------------------------------------------------
   Single source of truth for how the tactical map and its markers
   are drawn. Consumed by BOTH the full MapView and the Linked-
   brushing map panel, so the brushing map IS the real map (same
   landmasses, graticule, port diamonds and vessel arrows) — not a
   separate mock. Companion to GraphCanvas.jsx for the graph.

   Coordinate model: data positions are 0..100 in a stylized world
   frame. Callers pass the surface size (w,h); markers receive
   already-projected centers (cx,cy) plus a `scale` so the same
   shape works at full size in MapView and small in the panel.
   ============================================================ */

const project = (w, h) => ({ px: (x) => (x / 100) * w, py: (y) => (y / 100) * h });

// Gradient + blur used by the sea layer and risk halos. Ids are stable
// (`sea`, `soft`) so existing MapView references keep working.
export function MapDefs() {
  return (
    <defs>
      <radialGradient id="sea" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="oklch(0.30 0.05 230)" stopOpacity="0.5" />
        <stop offset="100%" stopColor="oklch(0.16 0.02 240)" stopOpacity="0" />
      </radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
    </defs>
  );
}

// Fixed sea wash (does not pan/zoom in MapView).
export function MapSea({ w, h }) {
  return <rect x="0" y="0" width={w} height={h} fill="url(#sea)" />;
}

// Stylized landmasses + graticule — the canonical geography. One definition,
// rendered identically (scaled) in every map surface.
export function MapLand({ w, h, graticule = true }) {
  const { px, py } = project(w, h);
  const thin = w <= 300;
  return (
    <>
      <g fill="var(--bg-2)" stroke="var(--line)" strokeWidth={thin ? 0.4 : 1} opacity="0.9">
        <path d={`M0,${py(0)} L${px(55)},${py(0)} Q${px(50)},${py(18)} ${px(40)},${py(22)} Q${px(20)},${py(28)} 0,${py(26)} Z`} />
        <path d={`M${px(58)},${py(0)} L${px(100)},${py(0)} L${px(100)},${py(45)} Q${px(80)},${py(40)} ${px(70)},${py(30)} Q${px(62)},${py(22)} ${px(58)},${py(0)} Z`} />
        <path d={`M${px(40)},${py(48)} Q${px(55)},${py(46)} ${px(66)},${py(52)} Q${px(72)},${py(64)} ${px(62)},${py(74)} Q${px(48)},${py(80)} ${px(38)},${py(72)} Q${px(34)},${py(58)} ${px(40)},${py(48)} Z`} />
        <path d={`M${px(74)},${py(54)} Q${px(86)},${py(52)} ${px(100)},${py(60)} L${px(100)},${py(100)} L${px(70)},${py(100)} Q${px(72)},${py(70)} ${px(74)},${py(54)} Z`} />
      </g>
      {graticule && (
        <g stroke="var(--grid-color)" strokeWidth={thin ? 0.3 : 1}>
          {Array.from({ length: 9 }).map((_, i) => <line key={"v" + i} x1={px((i + 1) * 10)} y1="0" x2={px((i + 1) * 10)} y2={h} />)}
          {Array.from({ length: 7 }).map((_, i) => <line key={"h" + i} x1="0" y1={py((i + 1) * 12.5)} x2={w} y2={py((i + 1) * 12.5)} />)}
        </g>
      )}
    </>
  );
}

/* ---- Port / facility marker (diamond) ---- */
export function PortMarker({
  cx, cy, name, alert, selected, dim, scale = 1,
  showLabel = true, fontSize = 11.5, labelColor = "var(--text-dim)",
  onClick, onHover,
}) {
  const s = scale;
  return (
    <g transform={`translate(${cx},${cy})`} opacity={dim ? 0.25 : 1}
       style={{ cursor: "pointer", transition: "opacity .15s" }}
       onClick={onClick} onMouseEnter={onHover}>
      {selected && <circle r={16 * s} fill="none" stroke="var(--accent)" strokeWidth={2 * s} />}
      {alert && <circle r={11 * s} fill="none" stroke="var(--alert)" strokeWidth={1.4 * s} strokeDasharray={`${2.5 * s} ${2.5 * s}`} />}
      <rect x={-5 * s} y={-5 * s} width={10 * s} height={10 * s} rx={2 * s} transform="rotate(45)"
        fill={alert ? "var(--alert)" : "var(--warn)"} stroke="var(--bg)" strokeWidth={1.5 * s} />
      {showLabel && name != null && (
        <text x={11 * s} y={4 * s} fontSize={fontSize} fontFamily="var(--font-mono)" fill={labelColor} style={{ pointerEvents: "none" }}>{name}</text>
      )}
    </g>
  );
}

/* ---- Vessel marker (heading arrow) ---- */
export function VesselMarker({
  cx, cy, name, hd = 0, alert, selected, dim, scale = 1,
  showLabel = true, fontSize = 11.5, labelColor = "var(--text)", animatedHalo = false,
  onClick, onHover,
}) {
  const s = scale;
  return (
    <g transform={`translate(${cx},${cy})`} opacity={dim ? 0.25 : 1}
       style={{ cursor: "pointer", transition: "opacity .15s" }}
       onClick={onClick} onMouseEnter={onHover}>
      {alert && animatedHalo && (
        <circle r={22 * s} fill="none" stroke="var(--alert)" strokeWidth={1.5 * s} opacity="0.5">
          <animate attributeName="r" values={`${14 * s};${24 * s};${14 * s}`} dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
        </circle>
      )}
      {alert && <circle r={13 * s} fill="none" stroke="var(--alert)" strokeWidth={1.6 * s} strokeDasharray={`${2.5 * s} ${2.5 * s}`} />}
      {selected && <circle r={15 * s} fill="none" stroke="var(--accent)" strokeWidth={2 * s} />}
      <g transform={`rotate(${hd})`}>
        <path d={`M0,${-9 * s} L${6 * s},${8 * s} L0,${4 * s} L${-6 * s},${8 * s} Z`}
          fill={alert ? "var(--alert)" : "var(--accent)"} stroke="var(--bg)" strokeWidth={1.2 * s} />
      </g>
      {showLabel && name != null && (
        <text x={12 * s} y={4 * s} fontSize={fontSize} fontWeight="600" fontFamily="var(--font-ui)" fill={labelColor} style={{ pointerEvents: "none" }}>{name}</text>
      )}
    </g>
  );
}
