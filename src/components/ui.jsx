import { useEffect, useState } from 'react';
import { TYPE_BY_ID, riskBand, riskLabel } from '../data/data.js';
import { useI18n } from '../i18n.jsx';

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
  focus: '<circle cx="12" cy="12" r="2.8"/><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="3.8" r="1.7"/><circle cx="19.1" cy="16" r="1.7"/><circle cx="4.9" cy="16" r="1.7"/>',
  link: '<path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 16h6"/>',
  play: '<path d="M7 5v14l11-7z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2m15.5-6.5-2 2M8.5 15.5l-2 2m11 0-2-2M8.5 8.5l-2-2"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  note: '<path d="M5 4h14v12l-5 5H5z"/><path d="M14 21v-5h5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  sparkles: '<path d="M12 3l1.8 4.8L19 9l-5.2 1.2L12 15l-1.8-4.8L5 9l5.2-1.2z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 17 5-4 4 3 3-2 4 3"/>',
  lock: '<rect x="4.5" y="11" width="15" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  pulse: '<path d="M3 12h4l2.5-7 5 14L17 12h4"/>',
  drift: '<path d="M4 7h7M4 12h12M4 17h7"/><path d="m16 5 4 4-4 4"/>',
  model: '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><circle cx="12" cy="13" r="2.2"/><path d="M12 7.2v3.6M10.4 14.4 6.4 16.4M13.6 14.4l4 2"/>',
  func: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  crown: '<path d="M5 18h14l1.5-9-5 4-3.5-7-3.5 7-5-4z"/>',
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 13l-2 2m8-12c3 1 5 3 6 6l-7 7-5-5 7-7zM14 7a1.5 1.5 0 1 0 2 2"/>',
  route: '<circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8 17.5 16 6.5M6 16.6V13a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3v-.4"/>',
  bars: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  line: '<path d="M3 17l5-6 4 3 8-9M3 21h18"/>',
  area: '<path d="M3 16l5-5 4 2 8-7v11H3z"/>',
  donut: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
  pivot: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
  report: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15h4"/>',
  beaker: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 14h9"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  folderOpen: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2H7l-4 9z"/><path d="M3 7v11h17l3-9H7"/>',
  branch: '<circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><circle cx="18" cy="7" r="2.6"/><path d="M6 8.6v6.8M8.6 6.4H13a4 4 0 0 1 4 4v.4M18 9.6c0 5-4 6.4-9 6.4"/>',
  commit: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v5.8M12 15.2V21"/>',
  hdd: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M5 13l2.5-7h9L19 13M7 16.5h.01M11 16.5h6"/>',
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
  const { t } = useI18n();
  const band = riskBand(r);
  return <span className={"badge " + band}><span className="dt" />{r} · {t(riskLabel(r))}</span>;
}

// ---- F-06: single source of truth for on/off toggles ----
// role="switch" + aria-checked so assistive tech announces state; accent fill;
// consistent sizing. Replaces the per-view hand-rolled <span>-in-<button> toggles.
export function Switch({ on, onChange, label, size }) {
  const w = size === "sm" ? 30 : 34;
  const h = size === "sm" ? 17 : 19;
  const knob = h - 4;
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="hit-pad"
      onClick={(e)=>{ e.stopPropagation(); onChange && onChange(!on); }}
      style={{ width:w, height:h, borderRadius:h, border:"none", padding:0, flex:"none", cursor:"pointer",
        background: on ? "var(--accent)" : "var(--bg-3)", position:"relative", transition:"background .15s" }}>
      <span style={{ position:"absolute", top:2, left: on ? w-knob-2 : 2, width:knob, height:knob, borderRadius:"50%",
        background:"var(--bg-1)", boxShadow:"0 1px 2px oklch(0 0 0 / 0.4)", transition:"left .15s" }}/>
    </button>
  );
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

// section header (in-page section title) — uses the tokenized --title-section
export function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="row between center" style={{ marginBottom: 14, gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 5 }}>{eyebrow}</div>}
        <div className="h-section">{title}</div>
      </div>
      <div className="row gap-8 center" style={{ flex: "none" }}>{children}</div>
    </div>
  );
}

// ---- UX-02 / UX-4: PageHeader — el ÚNICO bloque de título de página ----
// eyebrow + título + subtítulo + acciones. `variant` ("page" | "hero") elige la
// escala. `glyph` antepone un icono/insignia (cabeceras de detalle: modelo, agente).
// `mono` renderiza el título en monoespaciada (ids tipo código: modelos, repos).
export function PageHeader({ eyebrow, title, sub, variant, glyph, mono, children }) {
  const titleEl = mono
    ? <h1 className="mono" style={{ fontSize: "var(--title-page)", fontWeight: 600, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1 }}>{title}</h1>
    : <h1 className={variant === "hero" ? "h-hero" : "h-page"}>{title}</h1>;
  const body = (
    <div style={{ minWidth: 0 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      {titleEl}
      {sub && <div className="ph-sub">{sub}</div>}
    </div>
  );
  return (
    <div className="page-head">
      <div className="ph-l" style={glyph ? { display: "flex", gap: 14, alignItems: "center" } : undefined}>
        {glyph}
        {body}
      </div>
      {children && <div className="ph-actions">{children}</div>}
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

// F-10: shared loading placeholder for object lists. Makes the skeleton a reused
// pattern (Explorer + Search) instead of a one-off, so the brief load state reads
// as an intentional system decision across the "browse objects" surfaces.
export function ListSkeleton({ rows }){
  return (
    <div className="col gap-8">
      {Array.from({length:rows||6}).map((_,i)=>(
        <div key={i} className="card" style={{ padding:14 }}>
          <div className="row gap-14 center">
            <Skeleton w={40} h={40} r={11}/>
            <div className="col gap-8" style={{ flex:1, minWidth:0 }}>
              <Skeleton w={`${38+(i*11)%40}%`} h={13}/>
              <Skeleton w={`${22+(i*7)%18}%`} h={11}/>
            </div>
            <Skeleton w={72} h={20} r={20}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- UX-5: estado vacío unificado --------------------------------------------
// Reemplaza las copias hand-rolled "card col center + Icon check" que vivían en
// Resolve / Actions / Governance / NotifDrawer. Un único patrón, una sola fuente.
export function EmptyState({ icon, title, hint, compact }) {
  return (
    <div className="card col center" style={{ padding: compact ? "22px 16px" : "34px 18px", gap: 8, color: "var(--text-faint)", textAlign: "center" }}>
      <Icon name={icon || "check"} size={compact ? 20 : 22} />
      <div style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 500 }}>{title}</div>
      {hint && <div style={{ fontSize: 11.5, maxWidth: "40ch", lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

/* ============================================================
   Capa de primitivas compartida (integración de la auditoría)
   Mueve aquí componentes que vivían dentro de vistas y unifica
   los que estaban reimplementados: Avatar, Tabs, Lineage.
   ============================================================ */

// ---- Avatar (antes Avatar2 en CasesView.jsx) ----
// `who` = iniciales; `name` opcional para el tooltip. Sin dependencia de datos.
export function Avatar({ who, name, size }) {
  const s = size || 26;
  if (!who) return (
    <span style={{ width:s, height:s, borderRadius:7, border:"1.5px dashed var(--line-strong)", display:"grid", placeItems:"center", color:"var(--text-faint)", flex:"none" }}>
      <Icon name="user" size={s*0.5} />
    </span>
  );
  return (
    <span title={name || who} style={{ width:s, height:s, borderRadius:7, display:"grid", placeItems:"center",
      fontSize:s*0.4, fontWeight:600, color:"var(--accent-text)", background:"linear-gradient(150deg,var(--accent),var(--accent-2))", flex:"none" }}>{who}</span>
  );
}

// ---- Tabs: sub-navegación DENTRO del detalle de un objeto (entity 360, project
// detail). Regla de navegación (UX-1): WBBar = conmutador de secciones de MÓDULO
// (motor + lentes); Tabs (subrayado) = sub-navegación a nivel de detalle/objeto. ----
// items: [{ label, icon?, badge? }]; value: índice activo; onChange(i).
export function Tabs({ items, value, onChange, variant }) {
  return (
    <div className={"tabs" + (variant ? " " + variant : "")} role="tablist">
      {items.map((it, i) => (
        <button key={i} type="button" role="tab" aria-selected={value === i}
          className={"tab" + (value === i ? " on" : "")} onClick={() => onChange(i)}>
          {it.icon && <Icon name={it.icon} size={14} />}{it.label}
          {it.badge != null && <span className="tab-badge">{it.badge}</span>}
        </button>
      ))}
    </div>
  );
}

// ---- Lineage (consolidación · clúster G + colisión de nombres) ----
// LineageSteps = primitiva (pasos origen→transformación→destino, recibe `chain`).
// LineageCard  = ÚNICO envoltorio de tarjeta de linaje, con UN solo rótulo
//                ("Data lineage") en toda la app. La versión ligada a un objeto
//                vive en Security.ObjectLineage({ id }).
// chain: [{ stage?, label, meta?, glyph? }].
export function LineageCard({ chain, title, verified }) {
  const { t } = useI18n();
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row between center" style={{ marginBottom: 14 }}>
        <div className="eyebrow">{t(title || 'Data lineage')}</div>
        {verified && <span className="badge accent"><Icon name="check" size={12} />{t('Verified')}</span>}
      </div>
      <LineageSteps chain={chain} />
    </div>
  );
}

export function LineageSteps({ chain }) {
  return (
    <div className="lin">
      {chain.map((s, i) => (
        <div key={i} className={"lin-step" + (i === chain.length - 1 ? " dest" : "")}>
          <span className="lin-ic">{(s.glyph || s.icon) && <Icon name={s.glyph || s.icon} size={17} />}</span>
          <div style={{ minWidth: 0 }}>
            {s.stage && <div className="lin-stage">{s.stage}</div>}
            <div className="lin-l">{s.label}</div>
            {s.meta && <div className="lin-m">{s.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- CatalogGrid + CatalogCard (P3) ------------------------------------------
// One primitive for the "typed catalog" pattern previously hand-rolled in
// Actions·Action types, Reason·Logic functions and Models·Objectives: a
// responsive grid of cards, each with a glyph, title, optional badge/desc,
// free body (chips, steps, metrics…) and an optional footer (meta + action).
export function CatalogGrid({ min, gap, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min || 300}px, 1fr))`, gap: gap || 16 }}>
      {children}
    </div>
  );
}

export function CatalogCard({ icon, iconColor, title, mono, badge, desc, footer, onClick, children }) {
  const c = iconColor || "var(--accent)";
  return (
    <div className={"card" + (onClick ? " hover" : "")} onClick={onClick}
      style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, cursor: onClick ? "pointer" : "default" }}>
      <div className="row between center">
        {icon && <span style={{ width: 40, height: 40, borderRadius: 11, flex: "none", display: "grid", placeItems: "center",
          background: `color-mix(in oklab, ${c} 16%, var(--bg-2))`, color: c, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 32%, transparent)` }}>
          <Icon name={icon} size={20} /></span>}
        {badge}
      </div>
      <div>
        <div className={mono ? "mono" : ""} style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        {desc && <div className="t-dim" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.45 }}>{desc}</div>}
      </div>
      {children}
      {footer && <>
        <div className="divider" />
        <div className="row between center">{footer}</div>
      </>}
    </div>
  );
}

// ---- WBBar (R-1 / I-1) -------------------------------------------------------
// The single, canonical module tab bar. Phase 2 introduced it for the
// Graph/Ontology/Pipelines workbenches; it now lives here as a shared primitive
// so every "engine + lenses" module (incl. CasesWorkbench) uses ONE switcher
// instead of hand-rolling its own .seg. Optional slots:
//   counts   { tabKey: number }  — a muted count beside a tab label
//   controls node                — extra controls after the tabs (e.g. filters)
//   actions  node                — right-aligned actions (e.g. a "New" button)
//   hint     string              — muted helper text (translated)
export function WBBar({ tabs, mode, setMode, hint, counts, controls, actions }) {
  const { t } = useI18n();
  return (
    <div className="wb-bar">
      <div className="seg" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={mode === k}
            className={mode === k ? "on" : ""} onClick={() => setMode(k)}>
            {t(label)}
            {counts && counts[k] != null && <span className="mono" style={{ opacity: .7, marginLeft: 6 }}>{counts[k]}</span>}
          </button>
        ))}
      </div>
      {controls}
      {hint && <span className="wb-hint">{t(hint)}</span>}
      {actions && <div className="wb-actions">{actions}</div>}
    </div>
  );
}

// ---- Seg (consolidación · conmutador inline) -------------------------------
// Control segmentado para alternar OPCIONES inline (rango temporal, tipo de
// gráfico, etc.). NO confundir con WBBar (secciones de módulo) ni Tabs (sub-nav
// de detalle). options: string | { v, l, ic }. (Antes reimplementado en Analytics.)
export function Seg({ value, options, onChange }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => {
        const v = (o && typeof o === "object") ? o.v : o;
        const l = (o && typeof o === "object") ? o.l : o;
        return (
          <button key={v} type="button" role="tab" aria-selected={value === v}
            className={value === v ? "on" : ""} onClick={() => onChange && onChange(v)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {o && o.ic && <Icon name={o.ic} size={14} />}{l}
          </button>
        );
      })}
    </div>
  );
}
