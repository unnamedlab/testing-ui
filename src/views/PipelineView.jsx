import { useRef, useState } from 'react';
import { PIPELINE_EDGES, PIPELINE_NODES, SERIES } from '../data/data.js';
import { Badge, ICONS, Icon, Spark } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Pipeline Builder (node canvas)
   ============================================================ */

export const NODE_W = 188, NODE_H = 64;
export const KIND_META = {
  source:    { color:"var(--info)",   label:"Source" },
  transform: { color:"var(--accent)", label:"Transform" },
  sink:      { color:"var(--ok)",     label:"Output" },
};
export const STATUS_META = {
  live:    { c:"var(--ok)",   t:"Live" },
  ok:      { c:"var(--text-faint)", t:"Idle" },
  running: { c:"var(--accent)", t:"Running" },
  warn:    { c:"var(--warn)",  t:"Warning" },
};

export function PipelineView() {
  const [nodes, setNodes] = useState(()=>PIPELINE_NODES.map(n=>({...n})));
  const [view, setView] = useState({ x: 40, y: 30, k: 0.9 });
  const [sel, setSel] = useState("tf-resolve");
  const [running, setRunning] = useState(true);
  const svgRef = useRef(null);
  const drag = useRef(null);
  const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));

  function onDown(e, id) {
    e.stopPropagation();
    const pt={x:e.clientX,y:e.clientY};
    drag.current = id
      ? { type:"node", id, start:pt, orig:{x:byId[id].x,y:byId[id].y}, moved:false }
      : { type:"pan", start:pt, orig:{x:view.x,y:view.y}, moved:false };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }
  function onMove(e){
    const d=drag.current; if(!d) return;
    const dx=e.clientX-d.start.x, dy=e.clientY-d.start.y;
    if(Math.abs(dx)+Math.abs(dy)>3) d.moved=true;
    if(d.type==="node") setNodes(ns=>ns.map(n=>n.id===d.id?{...n,x:d.orig.x+dx/view.k,y:d.orig.y+dy/view.k}:n));
    else setView(v=>({...v,x:d.orig.x+dx,y:d.orig.y+dy}));
  }
  function onUp(){
    const d=drag.current;
    if(d&&d.type==="node"&&!d.moved) setSel(d.id);
    if(d&&d.type==="pan"&&!d.moved) setSel(null);
    drag.current=null;
    window.removeEventListener("pointermove",onMove);
    window.removeEventListener("pointerup",onUp);
  }
  function onWheel(e){
    e.preventDefault();
    const el=svgRef.current.getBoundingClientRect();
    const mx=e.clientX-el.left,my=e.clientY-el.top;
    setView(v=>{ const k2=Math.min(1.8,Math.max(0.45,v.k*(e.deltaY<0?1.1:0.9)));
      const gx=(mx-v.x)/v.k,gy=(my-v.y)/v.k; return {k:k2,x:mx-gx*k2,y:my-gy*k2}; });
  }

  function edgePath(a,b){
    const x1=a.x+NODE_W, y1=a.y+NODE_H/2, x2=b.x, y2=b.y+NODE_H/2;
    const dx=Math.max(40,(x2-x1)/2);
    return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
  }

  const selNode = sel ? byId[sel] : null;

  return (
    <div className="content" style={{ display:"flex", overflow:"hidden" }}>
      {/* palette */}
      <aside style={{ width:210, borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", flex:"none" }}>
        <div style={{ padding:"16px 14px 8px" }}><div className="eyebrow">Node library</div></div>
        {Object.entries(KIND_META).map(([k,m])=>(
          <div key={k} style={{ padding:"4px 12px 12px" }}>
            <div className="t-faint mono" style={{ fontSize:10.5, letterSpacing:".1em", textTransform:"uppercase", margin:"8px 2px 6px" }}>{m.label}s</div>
            {(k==="source"?[["AIS / Kafka","ship"],["SWIFT MT103","swap"],["Customs S3","box"],["Registry API","building"]]
              :k==="transform"?[["Cleanse","filter"],["Entity Resolution","merge"],["Enrichment","shield"]]
              :[["Ontology","share"],["Alert Engine","bell"],["Export","download"]]).map(([l,ic])=>(
              <div key={l} className="palette-item" draggable>
                <span style={{ color:m.color }}><Icon name={ic} size={16}/></span>
                <span style={{ fontSize:12.5 }}>{l}</span>
              </div>
            ))}
          </div>
        ))}
        <style>{`
          .palette-item{ display:flex; align-items:center; gap:9px; padding:8px 10px; border:1px solid var(--line-soft);
            border-radius:8px; background:var(--bg-2); margin-bottom:6px; cursor:grab; transition:border-color .12s,transform .12s; }
          .palette-item:hover{ border-color:var(--line-strong); transform:translateX(2px); }
        `}</style>
      </aside>

      {/* canvas */}
      <div style={{ flex:1, position:"relative", minWidth:0 }}>
        {/* run bar */}
        <div className="row between center" style={{ padding:"10px 16px", borderBottom:"1px solid var(--line-soft)", background:"var(--bg-1)", position:"relative", zIndex:5 }}>
          <div className="row gap-10 center">
            <span className="serif" style={{ fontSize:16 }}>blackfrost_ingest</span>
            <Badge kind="accent" dot>v3 · main</Badge>
            <span className="t-faint mono" style={{ fontSize:11 }}>last run 2m ago · 12,402 rows</span>
          </div>
          <div className="row gap-8 center">
            {running && <span className="row gap-6 center"><span className="live-dot"/><span className="t-dim" style={{ fontSize:12 }}>2 nodes running</span></span>}
            <button className="btn"><Icon name="history"/>Runs</button>
            <button className="btn primary" onClick={()=>setRunning(r=>!r)}><Icon name={running?"check":"play"}/>{running?"Running":"Run pipeline"}</button>
          </div>
        </div>

        <div className="dotgrid-bg" style={{ position:"absolute", inset:"53px 0 0 0", overflow:"hidden", cursor:drag.current?.type==="pan"?"grabbing":"grab" }}>
          <svg ref={svgRef} width="100%" height="100%" onPointerDown={(e)=>onDown(e,null)} onWheel={onWheel} style={{ touchAction:"none" }}>
            <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
              {/* edges */}
              {PIPELINE_EDGES.map(([s,t],i)=>{
                const a=byId[s],b=byId[t]; if(!a||!b) return null;
                const onSel = sel && (s===sel||t===sel);
                const live = running && (a.status==="live"||a.status==="running"||b.status==="running");
                return (
                  <g key={i}>
                    <path d={edgePath(a,b)} fill="none" stroke={onSel?"var(--accent)":"var(--line-strong)"} strokeWidth={onSel?2.4:1.6} opacity={onSel?1:0.7}/>
                    {live && <circle r="3.5" fill="var(--accent)">
                      <animateMotion dur="1.8s" repeatCount="indefinite" path={edgePath(a,b)}/>
                    </circle>}
                  </g>
                );
              })}
              {/* nodes */}
              {nodes.map(n=>{
                const m=KIND_META[n.kind], st=STATUS_META[n.status];
                const isSel=sel===n.id;
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`} style={{ cursor:"pointer" }}
                     onPointerDown={(e)=>onDown(e,n.id)}>
                    <rect width={NODE_W} height={NODE_H} rx="12" fill="var(--bg-1)"
                      stroke={isSel?"var(--accent)":"var(--line)"} strokeWidth={isSel?2.2:1.4}
                      style={{ filter: isSel?"drop-shadow(0 6px 20px oklch(0 0 0 /0.4))":"none" }}/>
                    <rect width="4" height={NODE_H} rx="2" fill={m.color}/>
                    <g transform="translate(16,16)">
                      <rect width="32" height="32" rx="9" fill={`color-mix(in oklab, ${m.color} 16%, var(--bg-2))`}/>
                      <g transform="translate(7,7)" style={{ color:m.color }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:ICONS[n.icon]}}/>
                      </g>
                    </g>
                    <text x="58" y="27" fontSize="13.5" fontWeight="600" fontFamily="var(--font-ui)" fill="var(--text)">{n.label.length>18?n.label.slice(0,17)+"…":n.label}</text>
                    <text x="58" y="44" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">{n.sub}</text>
                    <circle cx={NODE_W-14} cy="16" r="4" fill={st.c}>
                      {(n.status==="live"||n.status==="running")&&<animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>}
                    </circle>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* zoom controls */}
          <div className="panel row gap-2" style={{ position:"absolute", bottom:14, left:14, padding:4 }}>
            <button className="icon-btn" onClick={()=>setView(v=>({...v,k:Math.min(1.8,v.k*1.15)}))}><Icon name="zoomIn"/></button>
            <button className="icon-btn" onClick={()=>setView(v=>({...v,k:Math.max(0.45,v.k*0.87)}))}><Icon name="zoomOut"/></button>
          </div>
        </div>

        {/* inspector */}
        {selNode && (
          <div className="panel" style={{ position:"absolute", top:65, right:14, width:286, boxShadow:"var(--shadow-3)", overflow:"hidden", animation:"rise .22s both", zIndex:6 }}>
            <div style={{ padding:16, borderBottom:"1px solid var(--line-soft)" }}>
              <div className="row between center">
                <Badge kind={selNode.kind==="source"?"info":selNode.kind==="sink"?"ok":"accent"}>{KIND_META[selNode.kind].label}</Badge>
                <span className="row gap-6 center" style={{ fontSize:11.5, color:STATUS_META[selNode.status].c }}><span style={{ width:7,height:7,borderRadius:"50%",background:"currentColor" }}/>{STATUS_META[selNode.status].t}</span>
              </div>
              <div className="serif" style={{ fontSize:18, fontWeight:500, marginTop:10 }}>{selNode.label}</div>
              <div className="t-faint mono" style={{ fontSize:11.5, marginTop:2 }}>{selNode.sub}</div>
            </div>
            <div style={{ padding:16 }}>
              <div className="eyebrow" style={{ marginBottom:10 }}>Configuration</div>
              <div className="col gap-2">
                {[["Schedule", selNode.kind==="source"?"Every 1h":"On upstream"],["Rows / run","12,402"],["Schema drift","Auto-evolve"],["Owner","data-eng"]].map(([k,v])=>(
                  <div key={k} className="row between" style={{ padding:"7px 0", borderBottom:"1px solid var(--line-soft)" }}>
                    <span className="t-faint" style={{ fontSize:12.5 }}>{k}</span>
                    <span className="mono" style={{ fontSize:12.5, color:"var(--text)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="eyebrow" style={{ margin:"16px 0 8px" }}>Throughput</div>
              <Spark data={SERIES.ingest} w={250} h={44} area />
              <div className="row gap-8" style={{ marginTop:16 }}>
                <button className="btn sm" style={{ flex:1 }}><Icon name="settings" size={14}/>Configure</button>
                <button className="btn sm" style={{ flex:1 }}><Icon name="doc" size={14}/>Preview</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
