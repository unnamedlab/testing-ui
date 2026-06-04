import { useMemo, useState } from 'react';
import { G2_EDGES, G2_NODES } from '../data/data_graph2.js';
import { shortestPath as bfsPath, commonNeighbors, centrality } from '../data/graph_model.js';
import { Icon } from '../components/ui.jsx';
import { GraphEdge, GraphNode, GRAPH_TYPE_GLYPH as TG, typeColor } from '../components/GraphCanvas.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Advanced graph analysis (IC-1)
   Pathfinding (BFS) · common neighbors · centrality — all run on
   the SHARED graph engine (graph_model.js), the same one
   GraphView and BrushingView use. G2_NODES is only the coordinate
   projection for this view's viewBox; the topology, adjacency and
   algorithms are not re-implemented here.
   ============================================================ */
const TC = { person: typeColor("person"), org: typeColor("org"), vessel: typeColor("vessel"), port: typeColor("port"), account: typeColor("account") };
const NBY = Object.fromEntries(G2_NODES.map(n=>[n.id,n]));
const MODES = [["path","Shortest path","route"],["common","Common neighbors","merge"],["central","Centrality","target"]];

export function GraphAnalysisView(){
  const { t } = useI18n();
  const [mode,setMode] = useState("path");
  const [picks,setPicks] = useState([]);
  const cen = useMemo(()=>centrality(),[]);
  const cenById = Object.fromEntries(cen.map(c=>[c.id,c]));
  function clickNode(id){ if(mode==="central"){ setPicks([id]); return; } setPicks(p=> p.includes(id) ? p.filter(x=>x!==id) : p.length>=2 ? [id] : [...p,id]); }
  function setMode2(m){ setMode(m); setPicks([]); }
  const path = (mode==="path" && picks.length===2) ? bfsPath(picks[0],picks[1]) : null;
  const pathNodes = new Set(path||[]);
  const pathEdge = (a,b)=> path && path.some((n,i)=> i<path.length-1 && ((path[i]===a&&path[i+1]===b)||(path[i]===b&&path[i+1]===a)));
  const shared = (mode==="common" && picks.length===2) ? commonNeighbors(picks[0], picks[1]) : [];
  const sharedSet = new Set(shared);
  function nodeState(id){
    if(mode==="central") return picks[0]===id?"sel":"on";
    if(mode==="path"){ if(!path) return picks.includes(id)?"sel":"on"; return picks.includes(id)?"sel":pathNodes.has(id)?"path":"dim"; }
    if(picks.length<2) return picks.includes(id)?"sel":"on";
    return picks.includes(id)?"sel":sharedSet.has(id)?"shared":"dim";
  }
  const nr = (id)=> mode==="central" ? 3 + (cenById[id].score/100)*4.5 : 3.6;

  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <aside style={{ width:288, flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", padding:"16px 16px 30px" }}>
        <div className="eyebrow" style={{ marginBottom:10 }}>{t('Graph analysis')}</div>
        <div className="seg" style={{ width:"100%", marginBottom:18 }}>{MODES.map(([k,l,ic])=><button key={k} className={mode===k?"on":""} onClick={()=>setMode2(k)} title={t(l)} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><Icon name={ic} size={13}/></button>)}</div>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{t(MODES.find(m=>m[0]===mode)[1])}</div>
        <div className="t-faint" style={{ fontSize:12, lineHeight:1.5, marginBottom:16 }}>
          {mode==="path" && t("Pick two objects on the graph to trace the shortest chain of links between them.")}
          {mode==="common" && t("Pick two objects to reveal the entities they both connect to.")}
          {mode==="central" && t("Ranks objects by how central they are to the network (degree + betweenness).")}
        </div>
        {mode!=="central" && <>
          <div className="col gap-8" style={{ marginBottom:14 }}>
            {[0,1].map(i=>(
              <div key={i} className="row gap-8 center" style={{ padding:"8px 10px", background:"var(--bg-2)", border:"1px solid "+(picks[i]?"var(--accent-dim)":"var(--line-soft)"), borderRadius:9 }}>
                <span className="mono t-faint" style={{ fontSize:10, width:14 }}>{i===0?"A":"B"}</span>
                {picks[i] ? <><span style={{ width:9,height:9,borderRadius:2,background:TC[NBY[picks[i]].type] }}/><span style={{ fontSize:12.5, fontWeight:600, flex:1 }}>{NBY[picks[i]].name}</span></> : <span className="t-faint" style={{ fontSize:12, flex:1 }}>{t('click a node…')}</span>}
              </div>
            ))}
          </div>
          {picks.length>0 && <button className="btn ghost sm" onClick={()=>setPicks([])} style={{ marginBottom:16 }}><Icon name="x" size={13}/>{t('Clear')}</button>}
        </>}
        {mode==="path" && path && (
          <div className="card" style={{ padding:14 }}>
            <div className="row between center" style={{ marginBottom:10 }}><div className="eyebrow">{t('Shortest path')}</div><span className="badge accent"><span className="dt"/>{t('{n} hops', { n: path.length-1 })}</span></div>
            <div style={{ position:"relative", paddingLeft:14 }}>
              <div style={{ position:"absolute", left:4, top:6, bottom:6, width:2, background:"var(--accent-dim)" }}/>
              {path.map((id,i)=>(
                <div key={id} className="row gap-8 center" style={{ position:"relative", padding:"5px 0" }}>
                  <span style={{ position:"absolute", left:-14, width:9, height:9, borderRadius:"50%", background:TC[NBY[id].type], border:"2px solid var(--bg-1)" }}/>
                  <span style={{ fontSize:12.5, fontWeight:600 }}>{NBY[id].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {mode==="path" && picks.length===2 && !path && <div className="t-faint" style={{ fontSize:12.5 }}>{t('No path connects these objects.')}</div>}
        {mode==="common" && picks.length===2 && (
          <div className="card" style={{ padding:14 }}>
            <div className="row between center" style={{ marginBottom:10 }}><div className="eyebrow">{t('Common neighbors')}</div><span className="badge ok"><span className="dt"/>{shared.length}</span></div>
            {shared.length? shared.map(id=>(<div key={id} className="row gap-8 center" style={{ padding:"6px 0" }}><span style={{ width:9,height:9,borderRadius:2,background:TC[NBY[id].type] }}/><span style={{ fontSize:12.5, fontWeight:600 }}>{NBY[id].name}</span></div>)) : <div className="t-faint" style={{ fontSize:12 }}>{t('No shared connections.')}</div>}
          </div>
        )}
        {mode==="central" && (
          <div className="card" style={{ padding:14 }}>
            <div className="eyebrow" style={{ marginBottom:10 }}>{t('Centrality ranking')}</div>
            <div className="col gap-2">
              {cen.map((c,i)=>(
                <button key={c.id} onClick={()=>setPicks([c.id])} className="row gap-8 center" style={{ border:"none", background:picks[0]===c.id?"var(--accent-ghost)":"none", borderRadius:7, padding:"6px 6px", cursor:"pointer", textAlign:"left" }}>
                  <span className="mono t-faint" style={{ fontSize:10.5, width:14 }}>{i+1}</span>
                  <span style={{ width:8,height:8,borderRadius:2,background:TC[NBY[c.id].type],flex:"none" }}/>
                  <span style={{ fontSize:12, fontWeight:600, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{NBY[c.id].name}</span>
                  <div className="meter" style={{ width:50 }}><i style={{ width:c.score+"%", background:i===0?"var(--accent)":"var(--accent-2)" }}/></div>
                  <span className="mono" style={{ fontSize:11, width:22, textAlign:"right" }}>{c.score}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
      <div className="canvas-fill grid-bg" style={{ position:"relative", flex:1 }}>
        <svg viewBox="0 0 100 86" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display:"block" }}>
          {G2_EDGES.map(([a,a2],i)=>{ const A=NBY[a],B=NBY[a2]; const onP=pathEdge(a,a2);
            const dim = (mode==="path"&&path&&!onP) || (mode==="common"&&picks.length===2);
            return <GraphEdge key={i} a={A} b={B} highlighted={onP} dim={dim} baseOpacity={0.6}
              width={onP?1.1:0.5} transition={false} />;
          })}
          {G2_NODES.map(n=>{ const st=nodeState(n.id); const dim=st==="dim"; const r=nr(n.id);
            const ring = st==="sel"?"var(--accent)":st==="shared"?"var(--ok)":st==="path"?"var(--accent)":null;
            return (
              <GraphNode key={n.id} x={n.x} y={n.y} r={r} color={TC[n.type]} glyph={TG[n.type]} glyphScale={0.045}
                dim={dim} ringColor={ring} strokeWidth={st==="on"?0.7:1} fillMix={26}
                label={n.name} fontSize={2.5} labelDy={r+3} labelColor="var(--text-dim)"
                onClick={()=>clickNode(n.id)}>
                {mode==="central" && <text y={-r-1.4} textAnchor="middle" fontSize="2.6" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--accent)" style={{ pointerEvents:"none" }}>{cenById[n.id].score}</text>}
              </GraphNode>
            );
          })}
        </svg>
        <div className="panel" style={{ position:"absolute", bottom:14, left:14, padding:"7px 12px" }}>
          <span className="t-faint mono" style={{ fontSize:11 }}>{mode==="central"?t('node size = centrality'):t('click two nodes to analyze')}</span>
        </div>
      </div>
    </div>
  );
}
