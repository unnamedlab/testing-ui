import { useRef, useState } from 'react';
import { T_END } from '../data/data_ext.js';
import { ENTITY_BY_ID, MAP_PLACES, MAP_ROUTES, MAP_VESSELS, riskLabel } from '../data/data.js';
import { TimeScrubber, useTimeline } from '../components/TimeScrubber.jsx';
import { Icon, RiskPill, Switch, TypeGlyph, useViewport } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Geospatial / tactical map
   ============================================================ */

export function MapView({ openEntity }) {
  const [sel, setSel] = useState("v-blackfrost");
  const [layers, setLayers] = useState({ routes:true, vessels:true, ports:true, risk:true });
  const [temporal, setTemporal] = useState(false);
  const [tm, setTm, playing, setPlaying] = useTimeline(T_END);
  const { ref: wrapRef, view: mv, setView: setMv, size: dims, onWheel: mWheel, zoomBy: mZoom, reset: mReset } = useViewport({ minK: 1, maxK: 4, initial: { x: 0, y: 0, k: 1 } });
  const mdrag = useRef(null);

  function mDown(e){
    const pt={x:e.clientX,y:e.clientY};
    mdrag.current={ start:pt, orig:{x:mv.x,y:mv.y} };
    const move=ev=>{ const d=mdrag.current; if(!d) return; setMv(v=>({...v, x:d.orig.x+(ev.clientX-d.start.x), y:d.orig.y+(ev.clientY-d.start.y)})); };
    const up=()=>{ mdrag.current=null; window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); };
    window.addEventListener("pointermove",move); window.addEventListener("pointerup",up);
  }
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
          <defs>
            <radialGradient id="sea" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="oklch(0.30 0.05 230)" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="oklch(0.16 0.02 240)" stopOpacity="0"/>
            </radialGradient>
            <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#sea)"/>
          <g transform={`translate(${mv.x},${mv.y}) scale(${mv.k})`}>
          {/* stylized landmasses (abstract blobs) */}
          <g fill="var(--bg-2)" stroke="var(--line)" strokeWidth="1" opacity="0.9">
            <path d={`M0,${py(0)} L${px(55)},${py(0)} Q${px(50)},${py(18)} ${px(40)},${py(22)} Q${px(20)},${py(28)} 0,${py(26)} Z`}/>
            <path d={`M${px(58)},${py(0)} L${dims.w},${py(0)} L${dims.w},${py(45)} Q${px(80)},${py(40)} ${px(70)},${py(30)} Q${px(62)},${py(22)} ${px(58)},${py(0)} Z`}/>
            <path d={`M${px(40)},${py(48)} Q${px(55)},${py(46)} ${px(66)},${py(52)} Q${px(72)},${py(64)} ${px(62)},${py(74)} Q${px(48)},${py(80)} ${px(38)},${py(72)} Q${px(34)},${py(58)} ${px(40)},${py(48)} Z`}/>
            <path d={`M${px(74)},${py(54)} Q${px(86)},${py(52)} ${dims.w},${py(60)} L${dims.w},${dims.h} L${px(70)},${dims.h} Q${px(72)},${py(70)} ${px(74)},${py(54)} Z`}/>
          </g>
          {/* graticule */}
          <g stroke="var(--grid-color)" strokeWidth="1">
            {Array.from({length:9}).map((_,i)=><line key={"v"+i} x1={px((i+1)*10)} y1="0" x2={px((i+1)*10)} y2={dims.h}/>)}
            {Array.from({length:7}).map((_,i)=><line key={"h"+i} x1="0" y1={py((i+1)*12.5)} x2={dims.w} y2={py((i+1)*12.5)}/>)}
          </g>

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
            <g key={p.id} transform={`translate(${px(p.x)},${py(p.y)})`} style={{ cursor:"pointer" }} onClick={()=>setSel(p.id)}>
              {sel===p.id && <circle r="16" fill="none" stroke="var(--accent)" strokeWidth="2"/>}
              {/* F-03: static shape cue for alert ports (colour-independent) */}
              {p.alert && <circle r="11" fill="none" stroke="var(--alert)" strokeWidth="1.4" strokeDasharray="2.5 2.5"/>}
              <rect x="-5" y="-5" width="10" height="10" rx="2" transform="rotate(45)"
                fill={p.alert?"var(--alert)":"var(--warn)"} stroke="var(--bg)" strokeWidth="1.5"/>
              <text x="11" y="4" fontSize="11.5" fontFamily="var(--font-mono)" fill="var(--text-dim)">{p.name}</text>
            </g>
          ))}

          {/* vessels */}
          {layers.vessels && MAP_VESSELS.map(v=>{
            const a = vesselAt(v); const trail = vesselTrail(v);
            return (
            <g key={v.id}>
              {trail && <path d={trail} fill="none" stroke={v.alert?"var(--alert)":"var(--accent)"} strokeWidth="1.6" opacity="0.5" strokeDasharray="1 5" strokeLinecap="round"/>}
              <g transform={`translate(${px(a.x)},${py(a.y)})`} style={{ cursor:"pointer" }} onClick={()=>setSel(v.id)}>
                {v.alert && <circle r="22" fill="none" stroke="var(--alert)" strokeWidth="1.5" opacity="0.5">
                  <animate attributeName="r" values="14;24;14" dur="2.6s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite"/>
                </circle>}
                {/* F-03: static dashed ring so alert reads without colour or motion */}
                {v.alert && <circle r="13" fill="none" stroke="var(--alert)" strokeWidth="1.6" strokeDasharray="2.5 2.5"/>}
                {sel===v.id && <circle r="15" fill="none" stroke="var(--accent)" strokeWidth="2"/>}
                <g transform={`rotate(${a.hd})`}>
                  <path d="M0,-9 L6,8 L0,4 L-6,8 Z" fill={v.alert?"var(--alert)":"var(--accent)"} stroke="var(--bg)" strokeWidth="1.2"/>
                </g>
                <text x="12" y="4" fontSize="11.5" fontWeight="600" fontFamily="var(--font-ui)" fill="var(--text)">{v.name}</text>
              </g>
            </g>
          );})}
          </g>
        </svg>

        {/* HUD: coords */}
        <div className="panel" style={{ position:"absolute", top:14, left:14, padding:"8px 12px", display:"flex", gap:16 }}>
          <span className="row gap-6 center"><span className="live-dot"/><span className="eyebrow" style={{ color:"var(--text-dim)" }}>Live AIS</span></span>
          <span className="t-faint mono" style={{ fontSize:11 }}>34.4°N · 33.0°E</span>
          <span className="t-faint mono" style={{ fontSize:11 }}>{MAP_VESSELS.length} vessels · {MAP_PLACES.length} ports</span>
        </div>

        {/* layers control */}
        <div className="panel" style={{ position:"absolute", top:14, right:14, padding:"10px 12px", width:150 }}>
          <div className="eyebrow" style={{ marginBottom:8 }}>Layers</div>
          {[["routes","Routes"],["vessels","Vessels"],["ports","Ports"],["risk","Risk zones"]].map(([k,l])=>(
            <div key={k} onClick={()=>toggle(k)} className="row between center" style={{ width:"100%", padding:"5px 2px", cursor:"pointer" }}>
              <span style={{ fontSize:12.5, color: layers[k]?"var(--text)":"var(--text-faint)" }}>{l}</span>
              <Switch on={layers[k]} onChange={()=>toggle(k)} size="sm" label={l} />
            </div>
          ))}
        </div>

        {/* zoom + temporal */}
        <div className="panel row gap-2" style={{ position:"absolute", bottom:14, left:14, padding:4 }}>
          <button className="icon-btn" onClick={()=>mZoom(1.25)}><Icon name="zoomIn"/></button>
          <button className="icon-btn" onClick={()=>mZoom(0.8)}><Icon name="zoomOut"/></button>
          <button className="icon-btn" onClick={()=>mReset({x:0,y:0,k:1})}><Icon name="target"/></button>
          <button className="icon-btn" title="Temporal analysis" onClick={()=>setTemporal(s=>!s)} style={{ color: temporal?"var(--accent)":"var(--text-dim)" }}><Icon name="clock"/></button>
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
            <div className="eyebrow" style={{ marginBottom:8 }}>{MAP_VESSELS.includes(selObj)?"Vessel":"Facility"}</div>
            <div className="row gap-12 center">
              <TypeGlyph type={MAP_VESSELS.includes(selObj)?"vessel":"port"} size={42}/>
              <div className="col gap-6" style={{ flex:1, minWidth:0 }}>
                <div className="serif" style={{ fontSize:18, fontWeight:500 }}>{selObj.name}</div>
                <RiskPill r={selObj.risk}/>
              </div>
            </div>
            <div className="col gap-2" style={{ marginTop:14 }}>
              {(MAP_VESSELS.includes(selObj)
                ? [["Speed",selObj.speed],["Heading",selObj.hd+"°"],["Status",selObj.status],["Position","34.4°N 33.0°E"]]
                : [["LOCODE",ENTITY_BY_ID[selObj.id]?.attrs?.LOCODE||"—"],["Type","Port"],["Risk",riskLabel(selObj.risk)]]
              ).map(([k,v])=>(
                <div key={k} className="row between" style={{ padding:"7px 0", borderBottom:"1px solid var(--line-soft)" }}>
                  <span className="t-faint" style={{ fontSize:12.5 }}>{k}</span>
                  <span className="mono" style={{ fontSize:12.5, color:"var(--text)" }}>{v}</span>
                </div>
              ))}
            </div>
            {ENTITY_BY_ID[selObj.id] && (
              <button className="btn primary" style={{ width:"100%", marginTop:14 }} onClick={()=>openEntity(selObj.id)}>
                <Icon name="expand"/>Open 360° profile
              </button>
            )}
          </div>
        )}
        <div style={{ padding:18 }}>
          <div className="row between center" style={{ marginBottom:12 }}>
            <div className="eyebrow">Event feed</div><span className="live-dot"/>
          </div>
          <div className="col gap-2">
            {[
              ["06:12","AIS gap · MV Blackfrost","alert"],
              ["05:48","Port call · Jebel Ali","ok"],
              ["04:30","Speed change · 11.4 kn","warn"],
              ["02:15","Entered risk zone · RUNVS","alert"],
              ["23:50","Rendezvous detected · 2 vessels","warn"],
            ].map(([t,txt,sev],i)=>(
              <div key={i} className="row gap-10" style={{ padding:"9px 0", borderBottom:"1px solid var(--line-soft)" }}>
                <span className="mono t-faint" style={{ fontSize:11, width:42, flex:"none" }}>{t}</span>
                <span style={{ marginTop:1, color:`var(--${sev==="ok"?"ok":sev})` }}><Icon name={sev==="alert"?"alertTri":sev==="warn"?"flag":"check"} size={14}/></span>
                <span style={{ fontSize:12.5 }} className="t-dim">{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
