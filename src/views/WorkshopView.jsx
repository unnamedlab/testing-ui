import { useRef, useState } from 'react';
import { EXPLORER_ROWS } from '../data/data_ext.js';
import { SERIES, riskBand } from '../data/data.js';
import { Badge, Bars, Icon, TypeGlyph } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Workshop: no-code analytic app builder
   ============================================================ */

export const WIDGET_LIB = [
  ["Metric","target"], ["Object table","table"], ["Bar chart","grid"], ["Line chart","graph"],
  ["Map","globe"], ["Filter","filter"], ["Object list","layers"], ["Button","play"],
];

export function WBHeader({ children }){ return <div className="row between center" style={{ padding:"10px 14px", borderBottom:"1px solid var(--line-soft)" }}>{children}</div>; }

export function WidgetFrame({ sel, onClick, title, children, span }){
  return (
    <div onClick={onClick} className="card" style={{ padding:0, gridColumn:`span ${span||1}`, cursor:"pointer",
      borderColor: sel?"var(--accent)":"var(--line-soft)", boxShadow: sel?"0 0 0 1px var(--accent), var(--shadow-2)":"none", overflow:"hidden" }}>
      <div className="row between center" style={{ padding:"9px 12px", borderBottom:"1px solid var(--line-soft)" }}>
        <span style={{ fontSize:12.5, fontWeight:600 }}>{title}</span>
        <span className="t-faint"><Icon name="dots" size={15}/></span>
      </div>
      <div style={{ padding:14 }}>{children}</div>
    </div>
  );
}

export function WorkshopView(){
  const [sel, setSel] = useState("w-table");
  const [name] = useState("Vessel Watch");
  const [extra, setExtra] = useState([]);
  const [over, setOver] = useState(false);
  const [published, setPublished] = useState(false);
  const dragKind = useRef(null);

  function onDrop(e){
    e.preventDefault(); setOver(false);
    const k = dragKind.current || e.dataTransfer.getData("text/plain");
    if(!k) return;
    const id = "w-x"+Date.now();
    setExtra(x=>[...x, { id, kind:k }]); setSel(id); dragKind.current=null;
  }

  return (
    <div className="content" style={{ display:"flex", overflow:"hidden", height:"100%" }}>
      {/* palette */}
      <aside style={{ width:200, borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", flex:"none" }}>
        <div style={{ padding:"14px 14px 8px" }}><div className="eyebrow">Widgets</div></div>
        <div style={{ padding:"0 12px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {WIDGET_LIB.map(([l,ic])=>(
            <div key={l} className="palette-item" draggable
              onDragStart={e=>{ dragKind.current=l; e.dataTransfer.setData("text/plain",l); e.dataTransfer.effectAllowed="copy"; }}
              style={{ flexDirection:"column", gap:7, padding:"12px 8px", alignItems:"center", textAlign:"center" }}>
              <span style={{ color:"var(--accent)" }}><Icon name={ic} size={18}/></span>
              <span style={{ fontSize:11 }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"4px 14px" }}><div className="eyebrow" style={{ marginBottom:8 }}>Data binding</div>
          <div className="card" style={{ padding:10, fontSize:12 }}>            <div className="row gap-8 center"><TypeGlyph type="vessel" size={24}/><span style={{ fontWeight:600 }}>Vessel</span></div>
            <div className="t-faint" style={{ fontSize:11, marginTop:6 }}>318 objects · 6 properties bound</div>
          </div>
        </div>
        <style>{`.palette-item{ display:flex; align-items:center; border:1px solid var(--line-soft); border-radius:9px; background:var(--bg-2); cursor:grab; transition:border-color .12s,transform .12s; } .palette-item:hover{ border-color:var(--accent-dim); transform:translateY(-1px); }`}</style>
      </aside>

      {/* canvas */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <WBHeader>
          <div className="row gap-10 center"><Icon name="blocks" size={18} style={{ color:"var(--accent)" }}/><span className="serif" style={{ fontSize:16, whiteSpace:"nowrap" }}>{name}</span><Badge dot kind="accent">draft</Badge></div>
          <div className="row gap-8"><button className="btn"><Icon name="settings"/>Logic</button><button className="btn primary" onClick={()=>{ setPublished(true); setTimeout(()=>setPublished(false), 2200); }}><Icon name={published?"check":"play"}/>{published?"Published":"Publish app"}</button></div>
        </WBHeader>
        <div onDragOver={e=>{ e.preventDefault(); setOver(true); }} onDragLeave={()=>setOver(false)} onDrop={onDrop}
          style={{ flex:1, overflow:"auto", padding:20, outline: over?"2px dashed var(--accent)":"none", outlineOffset:-8, transition:"outline-color .12s" }} className="dotgrid-bg">
          <div style={{ maxWidth:920, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {/* filter bar */}
            <WidgetFrame span={4} sel={sel==="w-filter"} onClick={()=>setSel("w-filter")} title="Filter bar">
              <div className="row gap-8 wrap">
                <span className="chip on">Flag: all</span><span className="chip">Risk ≥ 60</span><span className="chip">AIS gaps {">"} 3</span><span className="chip">Operator: Helios</span>
              </div>
            </WidgetFrame>
            {/* metrics */}
            {[["Watched vessels","318","var(--accent)"],["High risk","41","var(--alert)"],["AIS gaps 24h","12","var(--warn)"],["In risk zone","3","var(--alert)"]].map(([l,v,c],i)=>(
              <WidgetFrame key={i} sel={sel==="w-m"+i} onClick={()=>setSel("w-m"+i)} title={l}>
                <div className="mono" style={{ fontSize:26, fontWeight:600, color:c }}>{v}</div>
              </WidgetFrame>
            ))}
            {/* table */}
            <WidgetFrame span={2} sel={sel==="w-table"} onClick={()=>setSel("w-table")} title="Vessel table">
              <table className="tbl" style={{ fontSize:12 }}>
                <thead><tr><th>Vessel</th><th>Flag</th><th style={{textAlign:"right"}}>Risk</th></tr></thead>
                <tbody>
                  {EXPLORER_ROWS.filter(r=>r.type==="vessel").slice(0,5).map(r=>(
                    <tr key={r.id}><td style={{color:"var(--text)"}}>{r.name}</td><td>{r.flag}</td><td style={{textAlign:"right"}}><span className={"badge "+riskBand(r.risk)}>{r.risk}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </WidgetFrame>
            {/* chart */}
            <WidgetFrame span={2} sel={sel==="w-chart"} onClick={()=>setSel("w-chart")} title="AIS gaps · 7d">
              <Bars data={SERIES.alerts} w={360} h={120} color="var(--accent)" />
            </WidgetFrame>
            {/* user-dropped widgets */}
            {extra.map(w=>(
              <WidgetFrame key={w.id} span={w.kind==="Object table"||w.kind==="Map"||w.kind==="Line chart"||w.kind==="Bar chart"?2:1} sel={sel===w.id} onClick={()=>setSel(w.id)} title={w.kind}>
                {w.kind==="Metric" ? <div className="mono" style={{ fontSize:26, fontWeight:600, color:"var(--accent)" }}>—</div>
                  : w.kind==="Bar chart"||w.kind==="Line chart" ? <Bars data={SERIES.txns} w={340} h={110} color="var(--violet)"/>
                  : w.kind==="Filter" ? <div className="row gap-8 wrap"><span className="chip on">New filter</span><span className="chip">+ condition</span></div>
                  : w.kind==="Map" ? <div className="col center" style={{ height:90, color:"var(--text-faint)", gap:6 }}><Icon name="globe" size={22}/><span style={{ fontSize:11 }}>Map widget</span></div>
                  : w.kind==="Button" ? <button className="btn primary sm">Action</button>
                  : <div className="col gap-6">{[0,1,2].map(i=><div key={i} className="row between" style={{ padding:"5px 0", borderBottom:"1px solid var(--line-soft)" }}><span style={{ fontSize:12, color:"var(--text-dim)" }}>Row {i+1}</span><span className="mono t-faint" style={{ fontSize:11 }}>—</span></div>)}</div>}
              </WidgetFrame>
            ))}
            {extra.length===0 && (
              <div style={{ gridColumn:"span 4", border:"1.5px dashed var(--line)", borderRadius:12, padding:"22px", textAlign:"center", color:"var(--text-faint)" }}>
                <span style={{ fontSize:12.5 }}>Drag a widget from the left to add it to the app →</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* properties */}
      <aside style={{ width:248, borderLeft:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", flex:"none" }}>
        <div style={{ padding:"14px 16px 8px" }}><div className="eyebrow">Widget properties</div></div>
        <div style={{ padding:"4px 16px 16px" }}>
          {[["Widget type","Object table"],["Bound object","Vessel"],["Visible columns","name, flag, risk"],["Sort","risk desc"],["Row action","Open 360°"],["Page size","25"]].map(([k,v])=>(
            <div key={k} style={{ marginBottom:12 }}>
              <div className="t-faint" style={{ fontSize:11, marginBottom:4 }}>{k}</div>
              <div className="row between center" style={{ padding:"7px 10px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:8 }}>
                <span style={{ fontSize:12.5 }}>{v}</span><span className="t-faint"><Icon name="chevDown" size={14}/></span>
              </div>
            </div>
          ))}
          <button className="btn sm" style={{ width:"100%", marginTop:4 }}><Icon name="link" size={14}/>Bind to graph selection</button>
        </div>
      </aside>
    </div>
  );
}
