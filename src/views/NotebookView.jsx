import { useState } from 'react';
import { SERIES } from '../data/data.js';
import { Bars, Icon } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Notebook (ad-hoc analysis cells)
   ============================================================ */

export function NotebookView({ go }){
  const [ran, setRan] = useState(true);
  const [extra, setExtra] = useState([]);
  const [adding, setAdding] = useState(false);
  const [cellDraft, setCellDraft] = useState("");
  function addCell(kind){
    if(kind==="md" || kind==="query"){ setAdding(kind); setCellDraft(""); }
  }
  function commitCell(){
    if(!cellDraft.trim()){ setAdding(false); return; }
    setExtra(x=>[...x, { kind: adding==='md'?'Markdown':'AQL · query', text: cellDraft }]);
    setAdding(false); setCellDraft("");
  }
  const counterparties = [
    ["Aurora USD ····9920","$20.4M",87],
    ["Northwind Holdings","$9.1M",61],
    ["Castor Corp Svcs","$0.14M",4],
    ["Trade finance · ENBD","$2.3M",18],
  ];
  return (
    <div className="content" style={{ overflow:"auto" }}>
      <div className="row between center" style={{ padding:"14px 24px", borderBottom:"1px solid var(--line-soft)", position:"sticky", top:0, background:"var(--bg-1)", zIndex:5 }}>
        <div className="row gap-10 center">
          <Icon name="note" size={18} style={{ color:"var(--accent)" }}/>
          <span className="serif" style={{ fontSize:16 }}>blackfrost_flows.aqlnb</span>
          <span className="t-faint mono" style={{ fontSize:11 }}>saved 4m ago · AR</span>
        </div>
        <div className="row gap-8">
          <div style={{ position:"relative" }}>
            <button className="btn" onClick={()=>setAdding(a=>a?false:"menu")}><Icon name="plus"/>Add cell</button>
            {adding==="menu" && (
              <div className="panel rise" style={{ position:"absolute", top:"110%", right:0, padding:6, zIndex:20, minWidth:160 }}>
                <button className="cmd-row" style={{ padding:"8px 10px" }} onClick={()=>addCell("md")}><Icon name="note" size={15}/><span style={{ fontSize:13 }}>Markdown</span></button>
                <button className="cmd-row" style={{ padding:"8px 10px" }} onClick={()=>addCell("query")}><Icon name="table" size={15}/><span style={{ fontSize:13 }}>AQL query</span></button>
              </div>
            )}
          </div>
          <button className="btn primary" onClick={()=>setRan(true)}><Icon name="play"/>Run all</button>
        </div>
      </div>

      <div style={{ maxWidth:840, margin:"0 auto", padding:"26px 24px 60px" }} className="fade-in">
        {/* md */}
        <Cell kind="Markdown" idx={1}>
          <h1 className="serif" style={{ fontSize:26, fontWeight:600, margin:"0 0 8px", letterSpacing:"-0.01em" }}>BLACKFROST — Network exposure</h1>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">Working analysis of layered flows between <b style={{color:"var(--text)"}}>Aurora Trading</b> and <b style={{color:"var(--text)"}}>Helios Maritime</b>.</p>
        </Cell>

        {/* query */}
        <Cell kind="AQL · query" idx={2} run onRun={()=>setRan(true)} meta={ran?"4 rows · 212ms":null}>
          <pre style={{ margin:0, fontFamily:"var(--font-mono)", fontSize:12.5, lineHeight:1.6, color:"var(--text)", whiteSpace:"pre-wrap" }}>
{"\n"}<span style={{color:"var(--violet)"}}>FROM</span>{" Transaction\n"}<span style={{color:"var(--violet)"}}>WHERE</span>{" to_account.holder = "}<span style={{color:"var(--ok)"}}>{"'Helios Maritime'"}</span>{"\n  "}<span style={{color:"var(--violet)"}}>AND</span>{" amount > "}<span style={{color:"var(--warn)"}}>1000000</span>{"\n"}<span style={{color:"var(--violet)"}}>GROUP BY</span>{" from_account\n"}<span style={{color:"var(--violet)"}}>ORDER BY</span>{" sum(amount) "}<span style={{color:"var(--violet)"}}>DESC</span></pre>
        </Cell>

        {/* result */}
        {ran && <Cell kind="Result" idx={2} out>
          <table className="tbl" style={{ fontSize:12.5 }}>
            <thead><tr><th>from_account</th><th style={{textAlign:"right"}}>sum(amount)</th><th style={{width:160}}>share</th></tr></thead>
            <tbody>
              {counterparties.map(([n,v,p])=>(
                <tr key={n}><td style={{color:"var(--text)"}}>{n}</td><td className="mono" style={{textAlign:"right",color:"var(--text)",fontWeight:600}}>{v}</td>
                  <td><div className="row gap-8 center"><div className="meter" style={{flex:1}}><i style={{width:p+"%"}}/></div><span className="mono t-faint" style={{fontSize:11,width:30}}>{p}%</span></div></td></tr>
              ))}
            </tbody>
          </table>
        </Cell>}

        {/* md */}
        <Cell kind="Markdown" idx={3}>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">Three counterparties account for <b style={{color:"var(--accent)"}}>87%</b> of inbound volume. Aurora USD ····9920 dominates — consistent with a pass-through layering hub.</p>
        </Cell>

        {/* chart */}
        {ran && <Cell kind="Chart" idx={4} out>
          <div className="row between center" style={{ marginBottom:12 }}><span className="eyebrow">Inbound volume by month</span><button className="btn ghost sm" onClick={()=>go("graph")}>Open in graph <Icon name="arrowRight" size={13}/></button></div>
          <Bars data={SERIES.txns} w={760} h={140} color="var(--accent)" />
        </Cell>}

        {/* user-added cells */}
        {extra.map((c,i)=>(
          <Cell key={i} kind={c.kind} idx={5+i}>
            {c.kind==="Markdown"
              ? <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">{c.text}</p>
              : <pre style={{ margin:0, fontFamily:"var(--font-mono)", fontSize:12.5, lineHeight:1.6, color:"var(--text)", whiteSpace:"pre-wrap" }}>{c.text}</pre>}
          </Cell>
        ))}

        {/* inline new-cell editor */}
        {(adding==="md"||adding==="query") && (
          <div className="row gap-12" style={{ marginBottom:18, alignItems:"flex-start" }}>
            <div className="mono t-faint" style={{ fontSize:11, width:34, textAlign:"right", paddingTop:14, flex:"none" }}>[+]</div>
            <div className="card" style={{ flex:1, minWidth:0, overflow:"hidden", borderLeft:"3px solid var(--accent)" }}>
              <div className="row between center" style={{ padding:"7px 12px", borderBottom:"1px solid var(--line-soft)", background:"var(--bg-1)" }}>
                <span className="eyebrow">New {adding==="md"?"Markdown":"AQL query"} cell</span>
                <button className="icon-btn" onClick={()=>setAdding(false)} style={{ width:24,height:24 }}><Icon name="plus" size={13} style={{transform:"rotate(45deg)"}}/></button>
              </div>
              <textarea autoFocus value={cellDraft} onChange={e=>setCellDraft(e.target.value)} placeholder={adding==="md"?"Write markdown…":"FROM Transaction WHERE …"}
                style={{ width:"100%", minHeight:70, padding:14, background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily: adding==="md"?"var(--font-ui)":"var(--font-mono)", fontSize:13, resize:"vertical", boxSizing:"border-box" }} />
              <div className="row gap-8" style={{ padding:"8px 12px", borderTop:"1px solid var(--line-soft)", justifyContent:"flex-end" }}>
                <button className="btn ghost sm" onClick={()=>setAdding(false)}>Cancel</button>
                <button className="btn primary sm" onClick={commitCell}><Icon name="check" size={13}/>Add cell</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Cell({ kind, idx, children, run, out, meta, onRun }){
  return (
    <div className="row gap-12" style={{ marginBottom:18, alignItems:"flex-start" }}>
      <div className="mono t-faint" style={{ fontSize:11, width:34, textAlign:"right", paddingTop:14, flex:"none" }}>[{idx}]</div>
      <div className="card" style={{ flex:1, minWidth:0, overflow:"hidden", borderLeft: out?"3px solid var(--accent-dim)":"1px solid var(--line-soft)" }}>
        <div className="row between center" style={{ padding:"7px 12px", borderBottom:"1px solid var(--line-soft)", background:"var(--bg-1)" }}>
          <span className="eyebrow">{kind}</span>
          <span className="row gap-10 center">
            {meta && <span className="mono t-faint" style={{ fontSize:10.5 }}>{meta}</span>}
            {run && <button className="btn ghost sm" onClick={onRun} style={{ height:24 }}><Icon name="play" size={13}/>Run</button>}
          </span>
        </div>
        <div style={{ padding: kind==="Result"?0:16 }}>{children}</div>
      </div>
    </div>
  );
}
