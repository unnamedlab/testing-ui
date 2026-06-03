import { useEffect, useMemo, useState } from 'react';
import { B_EDGES, B_ENTITIES } from '../data/data_brushing.js';
import { Icon } from '../components/ui.jsx';
import { GraphEdge, GraphNode, typeColor } from '../components/GraphCanvas.jsx';

/* ============================================================
   AXIOM — Linked brushing
   Select/hover an entity in ANY panel → it lights up in the
   graph, map, table and timeline at once.
   The graph panel renders through the shared GraphCanvas.
   ============================================================ */
const TC = { person: typeColor("person"), org: typeColor("org"), vessel: typeColor("vessel"), port: typeColor("port"), account: typeColor("account") };
const TN = { person:"Person", org:"Organization", vessel:"Vessel", port:"Facility", account:"Account" };
const EBY = Object.fromEntries(B_ENTITIES.map(e=>[e.id,e]));
const NEI = {}; B_ENTITIES.forEach(e=>NEI[e.id]=new Set());
B_EDGES.forEach(([s,t])=>{ NEI[s].add(t); NEI[t].add(s); });

function Panel({ icon, title, sub, children }){
  return <div className="card" style={{ display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
    <div className="row between center" style={{ padding:"11px 14px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
      <div className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name={icon} size={16}/></span><span style={{ fontSize:13, fontWeight:600 }}>{title}</span></div>
      <span className="t-faint mono" style={{ fontSize:10.5 }}>{sub}</span>
    </div>
    <div style={{ flex:1, minHeight:0, position:"relative", overflow:"hidden" }}>{children}</div>
  </div>;
}
function GraphPanel({ active, isDim, onHover, onPick }){
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" style={{ display:"block" }} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>onHover(null)}>
      {B_EDGES.map(([s,t,rel,al],i)=>{ const a=EBY[s],b=EBY[t]; const on=active&&(s===active||t===active); const dim=isDim(s)||isDim(t);
        return <GraphEdge key={i} a={{x:a.gx,y:a.gy}} b={{x:b.gx,y:b.gy}} alert={al} highlighted={on} dim={dim}
          width={on?0.9:0.5} dash={al?"2 1.4":undefined} baseOpacity={on?1:0.5} transition={false} />;
      })}
      {B_ENTITIES.map(e=>{ const dim=isDim(e.id); const on=active===e.id; const r= on?4.6 : 3.4 + (e.risk/100)*1.4;
        return (
          <GraphNode key={e.id} x={e.gx} y={e.gy} r={r} color={TC[e.type]} fillMix={28}
            dim={dim} dimOpacity={0.25} ringColor={on?"var(--accent)":null} ringWidth={0.8}
            strokeWidth={on?1.1:0.7} watched={e.watch}
            label={e.name} fontSize={2.6} labelDy={r+3.4} labelColor={on?"var(--text)":"var(--text-dim)"}
            onMouseEnter={()=>onHover(e.id)} onClick={()=>onPick(e.id)} />
        );
      })}
    </svg>
  );
}
function MapPanel({ active, isDim, onHover, onPick }){
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" style={{ display:"block", background:"var(--bg-inset)" }} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>onHover(null)}>
      <g fill="var(--bg-2)" stroke="var(--line)" strokeWidth="0.4" opacity="0.9"><path d="M0,0 H46 Q42,14 32,18 Q16,22 0,21 Z"/><path d="M100,90 H44 Q56,60 76,58 Q92,60 100,46 Z"/></g>
      {[20,40,60,80].map(g=><line key={g} x1={g} y1="0" x2={g} y2="90" stroke="var(--grid-color)" strokeWidth="0.3"/>)}
      {B_ENTITIES.map(e=>{ const dim=isDim(e.id); const on=active===e.id;
        return <g key={e.id} transform={`translate(${e.mx},${e.my})`} opacity={dim?0.25:1} style={{ cursor:"pointer", transition:"opacity .15s" }} onMouseEnter={()=>onHover(e.id)} onClick={()=>onPick(e.id)}>
          {on && <circle r="4.5" fill="none" stroke="var(--accent)" strokeWidth="0.8"/>}
          {e.type==="vessel" ? <path d="M0,-3 L2,2.6 L0,1.2 L-2,2.6 Z" fill={TC[e.type]} stroke="var(--bg)" strokeWidth="0.4"/>
            : e.type==="port" ? <rect x="-2" y="-2" width="4" height="4" rx="0.6" transform="rotate(45)" fill={TC[e.type]} stroke="var(--bg)" strokeWidth="0.4"/>
            : <circle r="2.4" fill={TC[e.type]} stroke="var(--bg)" strokeWidth="0.4"/>}
          {on && <text y="-5" textAnchor="middle" fontSize="2.6" fontFamily="var(--font-mono)" fill="var(--text)">{e.name}</text>}
        </g>;
      })}
    </svg>
  );
}
function TablePanel({ active, isDim, onHover, onPick }){
  return (
    <div style={{ position:"absolute", inset:0, overflow:"auto" }} onMouseLeave={()=>onHover(null)}>
      <table className="tbl" style={{ fontSize:12 }}>
        <thead><tr><th>Object</th><th>Type</th><th style={{textAlign:"right"}}>Risk</th></tr></thead>
        <tbody>
          {B_ENTITIES.map(e=>{ const dim=isDim(e.id); const on=active===e.id;
            return <tr key={e.id} onMouseEnter={()=>onHover(e.id)} onClick={()=>onPick(e.id)} style={{ opacity:dim?0.3:1, background:on?"var(--accent-ghost)":"transparent", transition:"opacity .15s" }}>
              <td style={{ color:"var(--text)" }}><span className="row gap-8 center"><span style={{ width:8,height:8,borderRadius:2,background:TC[e.type],flex:"none" }}/><span style={{ fontWeight:on?600:500 }}>{e.name}</span></span></td>
              <td style={{ color:TC[e.type] }}>{TN[e.type]}</td>
              <td className="mono" style={{ textAlign:"right", color: e.risk>=80?"var(--alert)":"var(--text-dim)" }}>{e.risk}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
function TimePanel({ active, isDim, onHover, onPick }){
  const months=["Mar","Apr","May","Jun"];
  return (
    <div style={{ position:"absolute", inset:0, padding:"14px 16px" }} onMouseLeave={()=>onHover(null)}>
      <div style={{ position:"relative", height:"100%" }}>
        <div style={{ position:"absolute", left:0, right:0, top:"50%", height:2, background:"var(--line)" }}/>
        {months.map((m,i)=><span key={m} className="mono t-faint" style={{ position:"absolute", left:`${i/(months.length-1)*100}%`, bottom:0, fontSize:10, transform:"translateX(-50%)" }}>{m}</span>)}
        {B_ENTITIES.map(e=>{ const dim=isDim(e.id); const on=active===e.id;
          return <div key={e.id} onMouseEnter={()=>onHover(e.id)} onClick={()=>onPick(e.id)} title={e.name} style={{ position:"absolute", left:`${e.t}%`, top:"50%", transform:"translate(-50%,-50%)", cursor:"pointer", opacity:dim?0.25:1, transition:"opacity .15s", zIndex:on?5:1 }}>
            <div style={{ width:on?14:10, height:on?14:10, borderRadius:"50%", background:`color-mix(in oklab, ${TC[e.type]} 35%, var(--bg-1))`, border:`2px solid ${TC[e.type]}`, boxShadow:on?`0 0 0 3px var(--bg-1), 0 0 0 4px ${TC[e.type]}`:"none" }}/>
            {on && <div className="mono" style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", fontSize:9.5, color:"var(--text)", whiteSpace:"nowrap" }}>{e.name}</div>}
          </div>;
        })}
      </div>
    </div>
  );
}

export function BrushingView({ selId, onSelect }){
  const [sel,setSel] = useState(selId && EBY[selId] ? selId : null); // cluster ②: siembra desde la selección compartida
  const [hover,setHover] = useState(null);
  const active = hover || sel;
  // Cluster ②: reporta la selección al workbench para compartirla entre lentes.
  useEffect(()=>{ if(onSelect) onSelect(sel); }, [sel]);
  const isDim = useMemo(()=> (id)=>{ if(!active) return false; if(id===active) return false; return !NEI[active]?.has(id); }, [active]);
  function pick(id){ setSel(s=>s===id?null:id); }
  const a = active ? EBY[active] : null;
  return (
    <div className="content" style={{ display:"flex", flexDirection:"column", padding:0, overflow:"hidden" }}>
      <div className="row between center" style={{ padding:"11px 22px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
        <div className="row gap-10 center">
          <span className="badge accent"><span className="dt"/>Linked brushing</span>
          <span className="t-dim" style={{ fontSize:12.5 }}>Hover or click any object — it highlights across all four views.</span>
        </div>
        {a
          ? <div className="row gap-8 center"><span className="row gap-8 center" style={{ background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:8, padding:"4px 6px 4px 10px" }}><span style={{ width:9,height:9,borderRadius:2,background:TC[a.type] }}/><span style={{ fontSize:12.5, fontWeight:600 }}>{a.name}</span><span className="t-faint" style={{ fontSize:11 }}>· {NEI[a.id].size} links</span></span>{sel && <button className="btn ghost sm" onClick={()=>setSel(null)}><Icon name="x" size={13}/>Clear</button>}</div>
          : <span className="t-faint" style={{ fontSize:12 }}>nothing selected</span>}
      </div>
      <div style={{ flex:1, minHeight:0, display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:14, padding:16 }}>
        <Panel icon="graph" title="Connection graph" sub={B_ENTITIES.length+" objects · "+B_EDGES.length+" links"}><GraphPanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
        <Panel icon="globe" title="Geospatial" sub="live AIS"><MapPanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
        <Panel icon="table" title="Objects" sub={B_ENTITIES.length+" rows"}><TablePanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
        <Panel icon="clock" title="Timeline" sub="first observed"><TimePanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
      </div>
    </div>
  );
}
