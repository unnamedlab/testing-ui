import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { T_END } from '../data/data_ext.js';
import { EDGES, ENTITIES, ENTITY_BY_ID, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { TimeScrubber, useTimeline } from '../components/TimeScrubber.jsx';
import { Badge, Icon, RiskPill, TypeGlyph } from '../components/ui.jsx';
import { GraphEdge, GraphNode } from '../components/GraphCanvas.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Interactive connection graph
   pan / zoom / drag nodes / select / hover-highlight
   ============================================================ */

export const GW = 1500, GH = 950; // graph-space size

export function Minimap({ pos, view, size, sel, visible }) {
  const mmW = 168, mmH = Math.round(mmW * GH/GW);
  const s = mmW/GW;
  // current viewport in graph coords
  const vx = -view.x/view.k, vy = -view.y/view.k;
  const vw = size.w/view.k, vh = size.h/view.k;
  return (
    <div className="panel" style={{ position:"absolute", bottom:14, right:14, padding:6, lineHeight:0 }}>
      <svg width={mmW} height={mmH} style={{ display:"block", borderRadius:6, background:"var(--bg-inset)" }}>
        {EDGES.map((ed,i)=>{ const a=pos[ed.s],b=pos[ed.t]; if(!a||!b) return null;
          return <line key={i} x1={a.x*s} y1={a.y*s} x2={b.x*s} y2={b.y*s} stroke="var(--line-strong)" strokeWidth="0.6" opacity="0.5"/>; })}
        {ENTITIES.map(e=>{ const p=pos[e.id]; const dim = visible && !visible.has(e.id);
          return <circle key={e.id} cx={p.x*s} cy={p.y*s} r={sel===e.id?3.4:2.2}
            className={"tc "+TYPE_BY_ID[e.type].cls} fill="var(--c)" opacity={dim?0.2:1}/>; })}
        <rect x={vx*s} y={vy*s} width={vw*s} height={vh*s} fill="var(--accent-ghost)" stroke="var(--accent)" strokeWidth="1" rx="2"/>
      </svg>
    </div>
  );
}

export function GraphView({ openEntity, focusId }) {
  const { t: tr } = useI18n();
  // node positions in graph space
  const [pos, setPos] = useState(() => {
    const m = {};
    ENTITIES.forEach(e => { m[e.id] = { x: e.x*GW, y: e.y*GH }; });
    return m;
  });
  const [view, setView] = useState({ x: 0, y: 0, k: 0.78 });
  const [sel, setSel] = useState(focusId || "p-sorenson");
  const [hover, setHover] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [typeFilter, setTypeFilter] = useState(new Set());
  const [temporal, setTemporal] = useState(false);
  const [t, setT, playing, setPlaying] = useTimeline(T_END);
  const [focusMode, setFocusMode] = useState(false);
  const [revealed, setRevealed] = useState(()=>new Set([focusId||"p-sorenson"]));
  const [size, setSize] = useState({ w:1000, h:700 });
  const svgRef = useRef(null);
  const drag = useRef(null);

  const hiddenByTime = useCallback((eid)=> temporal && ENTITY_BY_ID[eid].since > t, [temporal, t]);

  useEffect(()=>{ if(focusId){ setSel(focusId); setRevealed(new Set([focusId])); } }, [focusId]);

  // track svg size for minimap viewport
  useEffect(()=>{
    const el = svgRef.current; if(!el) return;
    const ro = new ResizeObserver(()=>{ const r=el.getBoundingClientRect(); setSize({w:r.width,h:r.height}); });
    ro.observe(el); return ()=>ro.disconnect();
  }, []);

  // center on mount
  useEffect(()=>{
    const el = svgRef.current; if(!el) return;
    const r = el.getBoundingClientRect();
    setView(v => ({ ...v, x: r.width/2 - (GW/2)*v.k, y: r.height/2 - (GH/2)*v.k }));
  }, []);

  const neighbors = useMemo(()=>{
    const m = {}; ENTITIES.forEach(e=>m[e.id]=new Set());
    EDGES.forEach(ed=>{ m[ed.s]?.add(ed.t); m[ed.t]?.add(ed.s); });
    return m;
  }, []);

  // ---- force-directed relaxation (light, on-demand) ----
  const relaxRef = useRef(null);
  function relax(){
    if(relaxRef.current) return; // already running
    let iter = 0;
    const adj = EDGES.map(e=>[e.s,e.t]);
    relaxRef.current = setInterval(()=>{
      setPos(prev=>{
        const next = {}; for(const id in prev) next[id] = { x:prev[id].x, y:prev[id].y };
        const ids = ENTITIES.map(e=>e.id);
        // repulsion (all pairs)
        for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++){
          const a=next[ids[i]], b=next[ids[j]];
          let dx=a.x-b.x, dy=a.y-b.y; let d2=dx*dx+dy*dy; if(d2<1) d2=1;
          const d=Math.sqrt(d2); const f=42000/d2;
          const fx=(dx/d)*f, fy=(dy/d)*f;
          a.x+=fx; a.y+=fy; b.x-=fx; b.y-=fy;
        }
        // spring attraction along edges
        adj.forEach(([s,t])=>{
          const a=next[s], b=next[t]; if(!a||!b) return;
          let dx=b.x-a.x, dy=b.y-a.y; const d=Math.sqrt(dx*dx+dy*dy)||1;
          const f=(d-235)*0.045;
          const fx=(dx/d)*f, fy=(dy/d)*f;
          a.x+=fx; a.y+=fy; b.x-=fx; b.y-=fy;
        });
        // gentle gravity to center
        for(const id of ids){ next[id].x += (GW/2-next[id].x)*0.006; next[id].y += (GH/2-next[id].y)*0.006; }
        return next;
      });
      if(++iter>=120){ clearInterval(relaxRef.current); relaxRef.current=null; }
    }, 16);
  }
  useEffect(()=>()=>{ if(relaxRef.current) clearInterval(relaxRef.current); }, []);

  function saveLayout(){ try{ localStorage.setItem("axiom-graph-layout", JSON.stringify(pos)); setSaved(true); setTimeout(()=>setSaved(false),1600); }catch{} }
  const [saved, setSaved] = useState(false);
  useEffect(()=>{ try{ const s=localStorage.getItem("axiom-graph-layout"); if(s){ const p=JSON.parse(s); setPos(cur=>({...cur,...p})); } }catch{} }, []);

  // focus mode: visible set = ego networks of revealed seeds (+ current selection)
  const visible = useMemo(()=>{
    if(!focusMode) return null;
    const s = new Set(); const seeds = new Set(revealed); if(sel) seeds.add(sel);
    seeds.forEach(id=>{ s.add(id); neighbors[id]?.forEach(n=>s.add(n)); });
    return s;
  }, [focusMode, revealed, sel, neighbors]);
  const hiddenByFocus = useCallback((eid)=> focusMode && visible && !visible.has(eid), [focusMode, visible]);
  function toggleFocus(){ setFocusMode(f=>{ const nf=!f; if(nf) setRevealed(new Set([sel])); return nf; }); }
  function expand(id){ setRevealed(r=> new Set([...r, id])); }

  const active = hover || sel;
  const isDim = useCallback((eid)=>{
    if (typeFilter.size && !typeFilter.has(ENTITY_BY_ID[eid].type)) return true;
    if (!active) return false;
    if (eid===active) return false;
    return !neighbors[active]?.has(eid);
  }, [active, neighbors, typeFilter]);

  // ---- pan / zoom / drag handlers ----
  function onPointerDown(e, nodeId) {
    e.stopPropagation();
    const pt = { x: e.clientX, y: e.clientY };
    if (nodeId) {
      drag.current = { type:"node", id:nodeId, start:pt, orig:{...pos[nodeId]}, moved:false };
    } else {
      drag.current = { type:"pan", start:pt, orig:{ x:view.x, y:view.y }, moved:false };
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e) {
    const d = drag.current; if(!d) return;
    const dx = e.clientX - d.start.x, dy = e.clientY - d.start.y;
    if (Math.abs(dx)+Math.abs(dy) > 3) d.moved = true;
    if (d.type==="node") {
      setPos(p => ({ ...p, [d.id]: { x: d.orig.x + dx/view.k, y: d.orig.y + dy/view.k } }));
    } else {
      setView(v => ({ ...v, x: d.orig.x + dx, y: d.orig.y + dy }));
    }
  }
  function onPointerUp() {
    const d = drag.current;
    if (d && d.type==="node" && !d.moved) { setSel(d.id); }
    if (d && d.type==="pan" && !d.moved) { setSel(null); }
    drag.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }
  function onWheel(e) {
    e.preventDefault();
    const el = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - el.left, my = e.clientY - el.top;
    setView(v => {
      const k2 = Math.min(2.2, Math.max(0.35, v.k * (e.deltaY<0 ? 1.12 : 0.89)));
      const gx = (mx - v.x)/v.k, gy = (my - v.y)/v.k;
      return { k:k2, x: mx - gx*k2, y: my - gy*k2 };
    });
  }
  function zoom(f) {
    const el = svgRef.current.getBoundingClientRect();
    const mx = el.width/2, my = el.height/2;
    setView(v => {
      const k2 = Math.min(2.2, Math.max(0.35, v.k*f));
      const gx = (mx - v.x)/v.k, gy = (my - v.y)/v.k;
      return { k:k2, x: mx - gx*k2, y: my - gy*k2 };
    });
  }
  function fit() {
    const el = svgRef.current.getBoundingClientRect();
    const k = Math.min(el.width/GW, el.height/GH)*0.9;
    setView({ k, x: el.width/2 - (GW/2)*k, y: el.height/2 - (GH/2)*k });
  }

  function toggleType(t) {
    setTypeFilter(prev => { const n = new Set(prev); n.has(t)?n.delete(t):n.add(t); return n; });
  }

  const selEnt = sel ? ENTITY_BY_ID[sel] : null;
  const radius = (e) => 20 + (e.risk/100)*14 + (e.watch?4:0);

  return (
    <div className="content" style={{ overflow:"hidden" }}>
      <div className="canvas-fill grid-bg" style={{ overflow:"hidden", cursor: drag.current?.type==="pan"?"grabbing":"grab" }}>
        <svg ref={svgRef} width="100%" height="100%" onPointerDown={(e)=>onPointerDown(e,null)} onWheel={onWheel}
          style={{ display:"block", touchAction:"none" }}>
          <defs>
            <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L6 3 L0 6 z" fill="var(--line-strong)" />
            </marker>
            <marker id="arrowA" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0 0 L6 3 L0 6 z" fill="var(--alert)" />
            </marker>
          </defs>
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {/* edges */}
            {EDGES.map((ed,i)=>{
              const a = pos[ed.s], b = pos[ed.t]; if(!a||!b) return null;
              if (temporal && (ed.since > t || hiddenByTime(ed.s) || hiddenByTime(ed.t))) return null;
              if (hiddenByFocus(ed.s) || hiddenByFocus(ed.t)) return null;
              const dim = isDim(ed.s) || isDim(ed.t);
              const onActive = active && (ed.s===active||ed.t===active);
              const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
              return (
                <GraphEdge key={i} a={a} b={b} alert={ed.alert} highlighted={onActive} dim={dim}
                  marker={ed.alert?"url(#arrowA)":"url(#arrow)"}
                  label={(onActive||ed.alert) && showLabels && (
                    <g transform={`translate(${mx},${my})`}>
                      <rect x={-(ed.rel.length*3.3+8)} y="-9" width={ed.rel.length*6.6+16} height="18" rx="9"
                        fill="var(--bg-1)" stroke={ed.alert?"var(--alert)":"var(--line)"} strokeWidth="1"/>
                      <text textAnchor="middle" y="4" fontSize="10.5" fontFamily="var(--font-mono)"
                        fill={ed.alert?"var(--alert)":"var(--text-dim)"}>{ed.rel}</text>
                    </g>
                  )} />
              );
            })}
            {/* nodes */}
            {ENTITIES.map(e=>{
              if (hiddenByTime(e.id)) return null;
              if (hiddenByFocus(e.id)) return null;
              const p = pos[e.id]; const r = radius(e);
              const dim = isDim(e.id);
              const isSel = sel===e.id;
              const tcls = TYPE_BY_ID[e.type].cls;
              return (
                <GraphNode key={e.id} className={"tc "+tcls} x={p.x} y={p.y} r={r} dim={dim}
                  glyph={TYPE_BY_ID[e.type].glyph} glyphScale={0.038}
                  selected={isSel} selectedRingAnimated strokeWidth={isSel?3:2}
                  circleStyle={{ filter: e.watch?"drop-shadow(0 0 8px color-mix(in oklab,var(--c) 60%,transparent))":"none" }}
                  watched={e.watch} watchRing={e.watch} badgeR={5} badgeStroke={2}
                  label={e.name} showLabel={showLabels} fontSize={12.5} labelDy={r+15}
                  onPointerDown={(ev)=>onPointerDown(ev,e.id)}
                  onMouseEnter={()=>setHover(e.id)} onMouseLeave={()=>setHover(null)}
                  onDoubleClick={()=> focusMode ? expand(e.id) : openEntity(e.id)} />
              );
            })}
          </g>
        </svg>

        {/* top-left toolbar */}
        <div style={{ position:"absolute", top:14, left:14, display:"flex", gap:10, flexWrap:"wrap", maxWidth:"60%" }}>
          <div className="panel row gap-2" style={{ padding:4 }}>
            <button className="icon-btn" onClick={()=>zoom(1.2)} title={tr('Zoom in')}><Icon name="zoomIn"/></button>
            <button className="icon-btn" onClick={()=>zoom(0.83)} title={tr('Zoom out')}><Icon name="zoomOut"/></button>
            <button className="icon-btn" onClick={fit} title={tr('Fit')}><Icon name="target"/></button>
            <button className={"icon-btn"} onClick={()=>setShowLabels(s=>!s)} title={tr('Labels')} style={{ color: showLabels?"var(--accent)":"var(--text-dim)" }}><Icon name="doc"/></button>
            <button className={"icon-btn"} onClick={()=>setTemporal(s=>!s)} title={tr('Temporal analysis')} style={{ color: temporal?"var(--accent)":"var(--text-dim)" }}><Icon name="clock"/></button>
            <button className={"icon-btn"} onClick={toggleFocus} title={tr('Focus / expand mode')} style={{ color: focusMode?"var(--accent)":"var(--text-dim)" }}><Icon name="focus"/></button>
            <div style={{ width:1, height:20, background:"var(--line)", margin:"0 2px" }}/>
            <button className={"icon-btn"} onClick={relax} title={tr('Auto-arrange (force layout)')}><Icon name="sparkles"/></button>
            <button className={"icon-btn"} onClick={saveLayout} title={tr('Save layout')} style={{ color: saved?"var(--ok)":"var(--text-dim)" }}><Icon name={saved?"check":"bookmark"}/></button>
          </div>
          <div className="panel row gap-6 center wrap" style={{ padding:"6px 10px" }}>
            <span className="eyebrow" style={{ marginRight:2 }}>{tr('Filter')}</span>
            {OBJECT_TYPES.slice(0,6).map(ot=>(
              <button key={ot.id} onClick={()=>toggleType(ot.id)}
                className={"tc "+ot.cls}
                style={{ display:"flex", alignItems:"center", gap:5, border:"none", background: typeFilter.has(ot.id)?"var(--c)":"none",
                  padding:"3px 8px", borderRadius:6, cursor:"pointer", fontSize:11.5,
                  color: typeFilter.has(ot.id)?"var(--bg)":"var(--text-dim)" }} title={tr(ot.name)}>
                <span className="type-dot" style={{ background: typeFilter.has(ot.id)?"var(--bg)":"var(--c)" }}/>{tr(ot.name)}
              </button>
            ))}
          </div>
        </div>

        {/* hint */}
        <div className="panel" style={{ position:"absolute", bottom:14, left:14, padding:"7px 12px", display:"flex", gap:14 }}>
          <span className="t-faint mono" style={{ fontSize:11 }}>{tr('drag · pan')}</span>
          <span className="t-faint mono" style={{ fontSize:11 }}>{tr('scroll · zoom')}</span>
          <span className="t-faint mono" style={{ fontSize:11 }}>{focusMode ? tr('2× click · expand neighbors') : tr('2× click · open 360°')}</span>
        </div>

        {/* minimap */}
        <Minimap pos={pos} view={view} size={size} sel={sel} visible={visible} />

        {/* temporal scrubber */}
        {temporal && (
          <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)" }}>
            <TimeScrubber value={t} onChange={setT} playing={playing} setPlaying={setPlaying} width={580} />
          </div>
        )}

        {/* inspector */}
        {selEnt && (
          <div className="panel" style={{ position:"absolute", top:14, right:14, width:300, boxShadow:"var(--shadow-3)", overflow:"hidden", animation:"rise .25s both" }}>
            <div style={{ padding:16, borderBottom:"1px solid var(--line-soft)" }}>
              <div className="row between" style={{ alignItems:"flex-start" }}>
                <TypeGlyph type={selEnt.type} size={44}/>
                <button className="icon-btn" onClick={()=>setSel(null)} style={{ width:28,height:28 }}><Icon name="x" size={16}/></button>
              </div>
              <div className="serif" style={{ fontSize:19, fontWeight:500, marginTop:10 }}>{selEnt.name}</div>
              <div className="t-faint" style={{ fontSize:12.5, marginTop:2 }}>{tr(TYPE_BY_ID[selEnt.type].name)} · {selEnt.sub}</div>
              <div className="row gap-8 center" style={{ marginTop:12 }}>
                <RiskPill r={selEnt.risk}/>
                {selEnt.watch && <Badge kind="alert" dot>{tr('watch')}</Badge>}
              </div>
            </div>
            <div style={{ padding:"12px 16px", maxHeight:180, overflow:"auto" }}>
              <div className="eyebrow" style={{ marginBottom:8 }}>{tr('Connected · {n}', { n: neighbors[sel]?.size||0 })}</div>
              <div className="col gap-2">
                {[...(neighbors[sel]||[])].map(nid=>(
                  <button key={nid} onClick={()=>setSel(nid)} className="row gap-8 center hov" style={{ padding:"6px", border:"none", borderRadius:7, cursor:"pointer", textAlign:"left" }}>
                    <TypeGlyph type={ENTITY_BY_ID[nid].type} size={24}/>
                    <span style={{ fontSize:12.5, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ENTITY_BY_ID[nid].name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding:12, borderTop:"1px solid var(--line-soft)" }}>
              <button className="btn primary" style={{ width:"100%" }} onClick={()=>openEntity(sel)}><Icon name="expand"/>{tr('Open 360° profile')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
