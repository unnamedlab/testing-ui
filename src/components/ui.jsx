import { useEffect, useState } from 'react';
import { TYPE_BY_ID, riskBand, riskLabel } from '../data/data.js';

/* ============================================================
   AXIOM — Icons + shared UI primitives
   ============================================================ */

// ---- Icon set (stroke, 24 grid) ----
export const ICONS = {
  axiom: '<path d="M12 2 4 7v10l8 5 8-5V7z"/><path d="M12 7v10M8 9.5l8 5M16 9.5l-8 5"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  ship: '<path d="M3 14l1.5 5.5a2 2 0 0 0 1.9 1.5h11.2a2 2 0 0 0 1.9-1.5L21 14"/><path d="M5 14V9l7-3 7 3v5"/><path d="M12 3v3"/>',
  anchor: '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.2V21M5 13a7 7 0 0 0 14 0M5 13H3m16 0h2"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  share: '<circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="m8.2 11 6.6-3.6M8.2 13l6.6 3.6"/>',
  graph: '<circle cx="6" cy="7" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="16" cy="17" r="2"/><circle cx="8" cy="16" r="2"/><path d="M7.6 8.4 14.6 15M8 8l8-1.5M16 15l-7 .6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21C9.5 18.5 8.2 15.4 8.2 12S9.5 5.5 12 3z"/>',
  pipeline: '<rect x="3" y="5" width="6" height="6" rx="1.5"/><rect x="3" y="13" width="6" height="6" rx="1.5"/><rect x="15" y="9" width="6" height="6" rx="1.5"/><path d="M9 8h3v4h3M9 16h3v-4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  blocks: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="8" y="13" width="8" height="8" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 2 7H4c.5-1 2-2 2-7z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  merge: '<path d="M7 4v4a5 5 0 0 0 5 5h5M17 13l-3-3m3 3-3 3M7 20v-7"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9.5 12 1.8 1.8L15 10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"/>',
  moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4 6.3 6.3 0 0 0 20 13.5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  arrowRight: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  alertTri: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17.5v.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M5 21h14"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  link: '<path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 16h6"/>',
  play: '<path d="M7 5v14l11-7z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2m15.5-6.5-2 2M8.5 15.5l-2 2m11 0-2-2M8.5 8.5l-2-2"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  note: '<path d="M5 4h14v12l-5 5H5z"/><path d="M14 21v-5h5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  sparkles: '<path d="M12 3l1.8 4.8L19 9l-5.2 1.2L12 15l-1.8-4.8L5 9l5.2-1.2z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
};

export function Icon({ name, size, style, className }) {
  const path = ICONS[name] || ICONS.dots;
  return (
    <svg width={size||20} height={size||20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} dangerouslySetInnerHTML={{ __html: path }} />
  );
}

// ---- type glyph w/ colored ring ----
export function TypeGlyph({ type, size }) {
  const t = TYPE_BY_ID[type];
  const s = size || 30;
  return (
    <div className={"tc " + (t?.cls||"")} style={{
      width: s, height: s, borderRadius: s*0.3, flex: "none",
      display: "grid", placeItems: "center",
      background: "color-mix(in oklab, var(--c) 16%, var(--bg-2))",
      color: "var(--c)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--c) 35%, transparent)",
    }}>
      <Icon name={t?.glyph||"dots"} size={s*0.52} />
    </div>
  );
}

export function Badge({ kind, children, dot }) {
  return <span className={"badge " + (kind||"")}>{dot && <span className="dt" />}{children}</span>;
}

export function RiskPill({ r }) {
  const band = riskBand(r);
  return <span className={"badge " + band}><span className="dt" />{r} · {riskLabel(r)}</span>;
}

// ---- sparkline ----
export function Spark({ data, w, h, color, fill, area }) {
  w = w||120; h = h||34; color = color || "var(--accent)";
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v,i) => [ (i/(data.length-1))*w, h - ((v-min)/rng)*(h-4) - 2 ]);
  const d = pts.map((p,i)=> (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const ad = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {area && <path d={ad} fill={fill||"var(--accent-ghost)"} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.6" fill={color} />
    </svg>
  );
}

// ---- mini bar chart ----
export function Bars({ data, w, h, color }) {
  w = w||140; h = h||40; color = color||"var(--accent)";
  const max = Math.max(...data)||1;
  const bw = w/data.length;
  return (
    <svg width={w} height={h} style={{ display:"block" }}>
      {data.map((v,i)=>{
        const bh = (v/max)*(h-2);
        return <rect key={i} x={i*bw+1} y={h-bh} width={bw-2.5} height={bh} rx="1.5"
          fill={i===data.length-1 ? color : "color-mix(in oklab, "+color+" 38%, transparent)"} />;
      })}
    </svg>
  );
}

// donut/radial gauge
export function Gauge({ value, size, label, sub, color }) {
  size = size || 92; color = color || "var(--accent)";
  const r = size/2 - 8, c = 2*Math.PI*r;
  const off = c * (1 - value/100);
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition:"stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)", filter:"drop-shadow(0 0 5px "+color+")" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", textAlign:"center" }}>
        <div>
          <div className="mono" style={{ fontSize:18, fontWeight:600, color:"var(--text)" }}>{label}</div>
          {sub && <div className="eyebrow" style={{ marginTop:2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// section header
export function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="row between center" style={{ marginBottom: 14, gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</div>}
        <div className="serif" style={{ fontSize: 21, fontWeight: 500, letterSpacing:"-0.01em" }}>{title}</div>
      </div>
      <div className="row gap-8 center" style={{ flex: "none" }}>{children}</div>
    </div>
  );
}

// stat card
export function Stat({ label, value, sub, trend, series, color, icon }) {
  return (
    <div className="card" style={{ padding: 16, display:"flex", flexDirection:"column", gap:10, minWidth:0 }}>
      <div className="row between center">
        <div className="eyebrow">{label}</div>
        {icon && <span className="t-faint"><Icon name={icon} size={16}/></span>}
      </div>
      <div className="row between center" style={{ gap:10 }}>
        <div>
          <div className="mono" style={{ fontSize: 26, fontWeight: 600, lineHeight:1, letterSpacing:"-0.02em" }}>{value}</div>
          {sub && <div style={{ fontSize:12, marginTop:6 }} className={trend==="up"?"t-accent":trend==="down"?"":"t-dim"}>
            <span style={{ color: trend==="up"?"var(--ok)":trend==="down"?"var(--alert)":"var(--text-faint)" }}>{sub}</span>
          </div>}
        </div>
        {series && <Spark data={series} color={color||"var(--accent)"} area w={108} h={38} />}
      </div>
    </div>
  );
}

// empty/placeholder image slot (striped)
export function ImgSlot({ label, h, style }) {
  return (
    <div style={{
      height: h||140, borderRadius:"var(--radius)", border:"1px dashed var(--line-strong)",
      backgroundImage:"repeating-linear-gradient(45deg, var(--bg-2) 0 10px, transparent 10px 20px)",
      display:"grid", placeItems:"center", color:"var(--text-faint)", ...style,
    }}>
      <span className="mono" style={{ fontSize:11, letterSpacing:".08em" }}>{label||"placeholder"}</span>
    </div>
  );
}

export function Skeleton({ w, h, r }){
  return <span className="skel" style={{ display:"block", width:w||"100%", height:h||14, borderRadius:r!=null?r:6 }} />;
}
export function useLoad(ms){
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ const id=setTimeout(()=>setLoading(false), ms||650); return ()=>clearTimeout(id); }, []);
  return loading;
}
