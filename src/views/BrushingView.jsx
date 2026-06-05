import { useMemo, useState } from 'react';
import { B_EDGES, B_ENTITIES } from '../data/data_brushing.js';
import { neighbors } from '../data/graph_model.js';
import { Icon } from '../components/ui.jsx';
import { GraphEdge, GraphNode, typeColor } from '../components/GraphCanvas.jsx';
import { MapDefs, MapSea, MapLand, PortMarker, VesselMarker } from '../components/MapCanvas.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Linked brushing (IC-1)
   Select/hover an entity in ANY panel → it lights up in the
   graph, map, table and timeline at once. All four panels read
   the SAME graph engine (graph_model.js) as GraphView and
   GraphAnalysisView — neighbor relationships come from there, not
   a private fixture. The map plots objects at their REAL
   geospatial position; objects with no location aren't on the map.
   ============================================================ */
const TC = { person: typeColor("person"), org: typeColor("org"), vessel: typeColor("vessel"), port: typeColor("port"), account: typeColor("account") };
const TN = { person:"Person", org:"Organization", vessel:"Vessel", port:"Facility", account:"Account" };
const EBY = Object.fromEntries(B_ENTITIES.map(e=>[e.id,e]));
const LOCATED = B_ENTITIES.filter(e=>e.located);

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
      {B_EDGES.map(([s,t,,al],i)=>{ const a=EBY[s],b=EBY[t]; const on=active&&(s===active||t===active); const dim=isDim(s)||isDim(t);
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
  // Renders through the SAME MapCanvas primitives as MapView (IC-2): same
  // landmasses, graticule, port diamonds and vessel arrows. This panel is the
  // real map, smaller and brush-linked — not a separate mock.
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display:"block", background:"var(--bg-inset)" }} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>onHover(null)}>
      <MapDefs/>
      <MapSea w={100} h={100}/>
      <MapLand w={100} h={100}/>
      {LOCATED.map(e=>{ const dim=isDim(e.id); const on=active===e.id;
        const common={ cx:e.mx, cy:e.my, name:e.name, alert:e.risk>=80, selected:on, dim, scale:0.42,
          showLabel:on, fontSize:3, onClick:()=>onPick(e.id), onHover:()=>onHover(e.id) };
        return e.type==="vessel"
          ? <VesselMarker key={e.id} {...common} />
          : <PortMarker key={e.id} {...common} />;
      })}
    </svg>
  );
}
function TablePanel({ active, isDim, onHover, onPick }){
  const { t } = useI18n();
  return (
    <div style={{ position:"absolute", inset:0, overflow:"auto" }} onMouseLeave={()=>onHover(null)}>
      <table className="tbl" style={{ fontSize:12 }}>
        <thead><tr><th>{t('Object')}</th><th>{t('Type')}</th><th style={{textAlign:"right"}}>{t('Risk')}</th></tr></thead>
        <tbody>
          {B_ENTITIES.map(e=>{ const dim=isDim(e.id); const on=active===e.id;
            return <tr key={e.id} onMouseEnter={()=>onHover(e.id)} onClick={()=>onPick(e.id)} style={{ opacity:dim?0.3:1, background:on?"var(--accent-ghost)":"transparent", transition:"opacity .15s" }}>
              <td style={{ color:"var(--text)" }}><span className="row gap-8 center"><span style={{ width:8,height:8,borderRadius:2,background:TC[e.type],flex:"none" }}/><span style={{ fontWeight:on?600:500 }}>{e.name}</span></span></td>
              <td style={{ color:TC[e.type] }}>{t(TN[e.type])}</td>
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

export function BrushingView(){
  const { t } = useI18n();
  const [sel,setSel] = useState(null);
  const [hover,setHover] = useState(null);
  const active = hover || sel;
  const isDim = useMemo(()=> (id)=>{ if(!active) return false; if(id===active) return false; return !neighbors(active).has(id); }, [active]);
  function pick(id){ setSel(s=>s===id?null:id); }
  const a = active ? EBY[active] : null;
  return (
    <div className="content" style={{ display:"flex", flexDirection:"column", padding:0, overflow:"hidden" }}>
      <div className="row between center" style={{ padding:"11px 22px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
        <div className="row gap-10 center">
          <span className="badge accent"><span className="dt"/>{t('Linked brushing')}</span>
          <span className="t-dim" style={{ fontSize:12.5 }}>{t('Hover or click any object — it highlights across all four views.')}</span>
        </div>
        {a
          ? <div className="row gap-8 center"><span className="row gap-8 center" style={{ background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:8, padding:"4px 6px 4px 10px" }}><span style={{ width:9,height:9,borderRadius:2,background:TC[a.type] }}/><span style={{ fontSize:12.5, fontWeight:600 }}>{a.name}</span><span className="t-faint" style={{ fontSize:11 }}>· {t('{n} links', { n: neighbors(a.id).size })}</span></span>{sel && <button className="btn ghost sm" onClick={()=>setSel(null)}><Icon name="x" size={13}/>{t('Clear')}</button>}</div>
          : <span className="t-faint" style={{ fontSize:12 }}>{t('nothing selected')}</span>}
      </div>
      <div style={{ flex:1, minHeight:0, display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:14, padding:16 }}>
        <Panel icon="graph" title={t('Connection graph')} sub={t('{n} objects · {m} links', { n: B_ENTITIES.length, m: B_EDGES.length })}><GraphPanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
        <Panel icon="globe" title={t('Geospatial')} sub={t('{n} located', { n: LOCATED.length })}><MapPanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
        <Panel icon="table" title={t('Objects')} sub={t('{n} rows', { n: B_ENTITIES.length })}><TablePanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
        <Panel icon="clock" title={t('Timeline')} sub={t('first observed')}><TimePanel active={active} isDim={isDim} onHover={setHover} onPick={pick}/></Panel>
      </div>
    </div>
  );
}
