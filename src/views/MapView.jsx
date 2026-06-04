import { useEffect, useRef, useState } from 'react';
import { T_END } from '../data/data_ext.js';
import { ENTITY_BY_ID, MAP_PLACES, MAP_ROUTES, MAP_VESSELS, riskLabel } from '../data/data.js';
import { TimeScrubber, useTimeline } from '../components/TimeScrubber.jsx';
import { Icon, RiskPill, Switch, TypeGlyph } from '../components/ui.jsx';
import { MapDefs, MapLand, PortMarker, VesselMarker } from '../components/MapCanvas.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Geospatial / tactical map (UX-01 i18n)
   ============================================================ */

export function MapView({ openEntity }) {
  const { t: tr } = useI18n();
  const [sel, setSel] = useState("v-blackfrost");
  const [layers, setLayers] = useState({ routes:true, vessels:true, ports:true, risk:true });
  const wrapRef = useRef(null);
  const [dims, setDims] = useState({ w:1200, h:800 });
  const [temporal, setTemporal] = useState(false);
  const [tm, setTm, playing, setPlaying] = useTimeline(T_END);
  const [mv, setMv] = useState({ x:0, y:0, k:1 });
  const mdrag = useRef(null);

  function mDown(e){
    const pt={x:e.clientX,y:e.clientY};
    mdrag.current={ start:pt, orig:{x:mv.x,y:mv.y} };
    const move=ev=>{ const d=mdrag.current; if(!d) return; setMv(v=>({...v, x:d.orig.x+(ev.clientX-d.start.x), y:d.orig.y+(ev.clientY-d.start.y)})); };
    const up=()=>{ mdrag.current=null; window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); };
    window.addEventListener("pointermove",move); window.addEventListener("pointerup",up);
  }
  function mWheel(e){
    e.preventDefault();
    const r=wrapRef.current.getBoundingClientRect();
    const mx=e.clientX-r.left, my=e.clientY-r.top;
    setMv(v=>{ const k2=Math.min(4,Math.max(1,v.k*(e.deltaY<0?1.12:0.89)));
      const gx=(mx-v.x)/v.k, gy=(my-v.y)/v.k; return {k:k2, x:mx-gx*k2, y:my-gy*k2}; });
  }
  function mZoom(f){
    const cx=dims.w/2, cy=dims.h/2;
    setMv(v=>{ const k2=Math.min(4,Math.max(1,v.k*f)); const gx=(cx-v.x)/v.k, gy=(cy-v.y)/v.k; return {k:k2,x:cx-gx*k2,y:cy-gy*k2}; });
  }
  function mReset(){ setMv({x:0,y:0,k:1}); }

  useEffect(()=>{
    const el = wrapRef.current; if(!el) return;
    const ro = new ResizeObserver(()=>{ const r=el.getBoundingClientRect(); setDims({w:r.width,h:r.height}); });
    ro.observe(el); return ()=>ro.disconnect();
  }, []);

  // interpolate a vessel's position along its track at time tm
  function vesselAt(v){
    if(!temporal || !v.track) return { x:v.x, y:v.y, hd:v.hd };
    const tr = v.track;
    if(tm<=tr[0].t) return tr[0];
    if(tm>=tr[tr.length-1].t) return tr[tr.length-1];
    for(let i=0;i<tr.length-1;i++){
      if(tm>=tr[i].t && tm<=tr[i+1].t){
        const f=(tm-tr[i].t)/(tr[i+1].t-tr[i].t);
        return { x:tr[i].x+(tr[i+1].x-tr[i].x)*f, y:tr[i].y+(tr[i+1].y-tr[i].y)*f, hd:tr[i].hd };
      }
    }
    return tr[0];
  }
  function vesselTrail(v){
    if(!temporal || !v.track) return null;
    const now = vesselAt(v);
    const pts = v.track.filter(k=>k.t<=tm).concat([now]);
    return pts.map((p,i)=>(i?"L":"M")+px(p.x)+" "+py(p.y)).join(" ");
  }

  const px = (x)=> (x/100)*dims.w;
  const py = (y)=> (y/100)*dims.h;
  const allPts = {};
  MAP_PLACES.forEach(p=>allPts[p.id]={x:p.x,y:p.y});
  MAP_VESSELS.forEach(v=>{ const a=vesselAt(v); allPts[v.id]={x:a.x,y:a.y}; });

  const selObj = MAP_VESSELS.find(v=>v.id===sel) || MAP_PLACES.find(p=>p.id===sel);

  function toggle(k){ setLayers(l=>({...l,[k]:!l[k]})); }

  return (
    <div className="content" style={{ display:"flex", overflow:"hidden" }}>
      <div ref={wrapRef} style={{ flex:1, position:"relative", minWidth:0, background:"var(--bg-inset)", overflow:"hidden" }}>
        {/* base map */}
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0, cursor: mdrag.current?"grabbing":"grab", touchAction:"none" }}
          onPointerDown={mDown} onWheel={mWheel}>
          <MapDefs />
          <rect width="100%" height="100%" fill="url(#sea)"/>
          <g transform={`translate(${mv.x},${mv.y}) scale(${mv.k})`}>
          {/* canonical landmasses + graticule (shared MapCanvas) */}
          <MapLand w={dims.w} h={dims.h} />

          {/* routes */}
          {layers.routes && MAP_ROUTES.map(r=>{
            const pts = r.pts.map(id=>allPts[id]).filter(Boolean);
            const d = pts.map((p,i)=>(i?"L":"M")+px(p.x)+" "+py(p.y)).join(" ");
            return (
              <g key={r.id}>
                <path d={d} fill="none" stroke={r.alert?"var(--alert)":"var(--accent)"} strokeWidth={r.alert?3:2}
                  strokeDasharray={r.alert?"9 5":"2 7"} strokeLinecap="round" opacity="0.85">
                  <animate attributeName="stroke-dashoffset" values="18;0" dur="1.2s" repeatCount="indefinite"/>
                </path>
              </g>
            );
          })}

          {/* risk halos */}
          {layers.risk && MAP_PLACES.filter(p=>p.risk>=70).map(p=>(
            <circle key={"h"+p.id} cx={px(p.x)} cy={py(p.y)} r="46" fill="var(--alert)" opacity="0.10" filter="url(#soft)"/>
          ))}

          {/* ports */}
          {layers.ports && MAP_PLACES.map(p=>(
            <PortMarker key={p.id} cx={px(p.x)} cy={py(p.y)} name={p.name}
              alert={p.alert} selected={sel===p.id} onClick={()=>setSel(p.id)} />
          ))}

          {/* vessels */}
          {layers.vessels && MAP_VESSELS.map(v=>{
            const a = vesselAt(v); const trail = vesselTrail(v);
            return (
            <g key={v.id}>
              {trail && <path d={trail} fill="none" stroke={v.alert?"var(--alert)":"var(--accent)"} strokeWidth="1.6" opacity="0.5" strokeDasharray="1 5" strokeLinecap="round"/>}
              <VesselMarker cx={px(a.x)} cy={py(a.y)} name={v.name} hd={a.hd}
                alert={v.alert} selected={sel===v.id} animatedHalo onClick={()=>setSel(v.id)} />
            </g>
          );})}
          </g>
        </svg>

        {/* HUD: coords */}
        <div className="panel" style={{ position:"absolute", top:14, left:14, padding:"8px 12px", display:"flex", gap:16 }}>
          <span className="row gap-6 center"><span className="live-dot"/><span className="eyebrow" style={{ color:"var(--text-dim)" }}>{tr('Live AIS')}</span></span>
          <span className="t-faint mono" style={{ fontSize:11 }}>34.4°N · 33.0°E</span>
          <span className="t-faint mono" style={{ fontSize:11 }}>{tr('{n} vessels · {m} ports', { n: MAP_VESSELS.length, m: MAP_PLACES.length })}</span>
        </div>

        {/* layers control */}
        <div className="panel" style={{ position:"absolute", top:14, right:14, padding:"10px 12px", width:150 }}>
          <div className="eyebrow" style={{ marginBottom:8 }}>{tr('Layers')}</div>
          {[["routes","Routes"],["vessels","Vessels"],["ports","Ports"],["risk","Risk zones"]].map(([k,l])=>(
            <div key={k} onClick={()=>toggle(k)} className="row between center" style={{ width:"100%", padding:"5px 2px", cursor:"pointer" }}>
              <span style={{ fontSize:12.5, color: layers[k]?"var(--text)":"var(--text-faint)" }}>{tr(l)}</span>
              <Switch on={layers[k]} onChange={()=>toggle(k)} size="sm" label={tr(l)} />
            </div>
          ))}
        </div>

        {/* zoom + temporal */}
        <div className="panel row gap-2" style={{ position:"absolute", bottom:14, left:14, padding:4 }}>
          <button className="icon-btn" onClick={()=>mZoom(1.25)}><Icon name="zoomIn"/></button>
          <button className="icon-btn" onClick={()=>mZoom(0.8)}><Icon name="zoomOut"/></button>
          <button className="icon-btn" onClick={mReset}><Icon name="target"/></button>
          <button className="icon-btn" title={tr('Temporal analysis')} onClick={()=>setTemporal(s=>!s)} style={{ color: temporal?"var(--accent)":"var(--text-dim)" }}><Icon name="clock"/></button>
        </div>

        {/* temporal scrubber */}
        {temporal && (
          <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)" }}>
            <TimeScrubber value={tm} onChange={setTm} playing={playing} setPlaying={setPlaying} width={560} />
          </div>
        )}

        {/* minimap */}
        <div className="panel" style={{ position:"absolute", bottom:14, right:14, padding:5, lineHeight:0 }}>
          <svg width="132" height="84" style={{ display:"block", borderRadius:6, background:"var(--bg-inset)" }}>
            <g fill="var(--bg-2)" stroke="var(--line)" strokeWidth="0.5">
              <path d="M0,0 H72 Q66,18 52,24 Q28,30 0,28 Z"/><path d="M132,84 H56 Q70,56 92,55 Q116,56 132,42 Z"/>
            </g>
            {MAP_PLACES.map(p=><rect key={p.id} x={p.x/100*132-1.5} y={p.y/100*84-1.5} width="3" height="3" fill={p.alert?"var(--alert)":"var(--warn)"} transform={`rotate(45 ${p.x/100*132} ${p.y/100*84})`}/>)}
            {MAP_VESSELS.map(v=>{ const a=vesselAt(v); return <circle key={v.id} cx={a.x/100*132} cy={a.y/100*84} r="2" fill={v.alert?"var(--alert)":"var(--accent)"}/>; })}
            <rect x={(-mv.x/mv.k)/dims.w*132} y={(-mv.y/mv.k)/dims.h*84} width={132/mv.k} height={84/mv.k}
              fill="var(--accent-ghost)" stroke="var(--accent)" strokeWidth="1" rx="2"/>
          </svg>
        </div>
      </div>

      {/* right rail: selection + feed */}
      <aside style={{ width:300, borderLeft:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", flex:"none" }}>
        {selObj && (
          <div style={{ padding:18, borderBottom:"1px solid var(--line-soft)" }}>
            <div className="eyebrow" style={{ marginBottom:8 }}>{MAP_VESSELS.includes(selObj)?tr('Vessel'):tr('Facility')}</div>
            <div className="row gap-12 center">
              <TypeGlyph type={MAP_VESSELS.includes(selObj)?"vessel":"port"} size={42}/>
              <div className="col gap-6" style={{ flex:1, minWidth:0 }}>
                <div className="serif" style={{ fontSize:18, fontWeight:500 }}>{selObj.name}</div>
                <RiskPill r={selObj.risk}/>
              </div>
            </div>
            <div className="col gap-2" style={{ marginTop:14 }}>
              {(MAP_VESSELS.includes(selObj)
                ? [["Speed",selObj.speed],["Heading",selObj.hd+"°"],["Status",tr(selObj.status)],["Position","34.4°N 33.0°E"]]
                : [["LOCODE",ENTITY_BY_ID[selObj.id]?.attrs?.LOCODE||"—"],["Type",tr("Port")],["Risk",tr(riskLabel(selObj.risk))]]
              ).map(([k,v])=>(
                <div key={k} className="row between" style={{ padding:"7px 0", borderBottom:"1px solid var(--line-soft)" }}>
                  <span className="t-faint" style={{ fontSize:12.5 }}>{tr(k)}</span>
                  <span className="mono" style={{ fontSize:12.5, color:"var(--text)" }}>{v}</span>
                </div>
              ))}
            </div>
            {ENTITY_BY_ID[selObj.id] && (
              <button className="btn primary" style={{ width:"100%", marginTop:14 }} onClick={()=>openEntity(selObj.id)}>
                <Icon name="expand"/>{tr('Open 360° profile')}
              </button>
            )}
          </div>
        )}
        <div style={{ padding:18 }}>
          <div className="row between center" style={{ marginBottom:12 }}>
            <div className="eyebrow">{tr('Event feed')}</div><span className="live-dot"/>
          </div>
          <div className="col gap-2">
            {[
              ["06:12","AIS gap · MV Blackfrost","alert"],
              ["05:48","Port call · Jebel Ali","ok"],
              ["04:30","Speed change · 11.4 kn","warn"],
              ["02:15","Entered risk zone · RUNVS","alert"],
              ["23:50","Rendezvous detected · 2 vessels","warn"],
            ].map(([tt,txt,sev],i)=>(
              <div key={i} className="row gap-10" style={{ padding:"9px 0", borderBottom:"1px solid var(--line-soft)" }}>
                <span className="mono t-faint" style={{ fontSize:11, width:42, flex:"none" }}>{tt}</span>
                <span style={{ marginTop:1, color:`var(--${sev==="ok"?"ok":sev})` }}><Icon name={sev==="alert"?"alertTri":sev==="warn"?"flag":"check"} size={14}/></span>
                <span style={{ fontSize:12.5 }} className="t-dim">{tr(txt)}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
