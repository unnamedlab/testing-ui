import { useMemo, useState } from 'react';
import { DOCS } from '../data/data_evidence.js';
import { TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, TypeGlyph } from '../components/ui.jsx';
import { MarkingChip } from '../components/Security.jsx';

/* ============================================================
   AXIOM — Evidence / Document viewer
   PDF highlights · image detections · CSV mapping → extraction.
   ============================================================ */
function tcls(type){ return (TYPE_BY_ID[type]||{}).cls || "tc-org"; }
function tname(type){ return (TYPE_BY_ID[type]||{}).name || type; }
function confColor(c){ return c>=0.9?"var(--ok)":c>=0.78?"var(--warn)":"var(--alert)"; }
const RES = { matched:{ kind:"ok", label:"matched" }, new:{ kind:"info", label:"new object" }, review:{ kind:"warn", label:"review" } };

function Mention({ ent, surface, selected, onClick }){
  return (
    <span className={"tc "+tcls(ent.type)} onClick={(e)=>{ e.stopPropagation(); onClick(ent.id); }}
      title={`${tname(ent.type)} · ${ent.res} · ${Math.round(ent.conf*100)}%`}
      style={{ cursor:"pointer", color:"var(--text)", padding:"0 3px", borderRadius:4,
        background: selected ? "color-mix(in oklab, var(--c) 30%, transparent)" : "color-mix(in oklab, var(--c) 13%, transparent)",
        borderBottom:"2px solid var(--c)", boxShadow: selected ? "0 0 0 1px var(--c)" : "none", transition:"background .12s, box-shadow .12s", whiteSpace:"nowrap" }}>
      {surface}
    </span>
  );
}
function PdfView({ doc, sel, onSel }){
  const byId = useMemo(()=>Object.fromEntries(doc.entities.map(e=>[e.id,e])),[doc]);
  return (
    <div style={{ maxWidth:720, margin:"0 auto", background:"var(--bg-1)", border:"1px solid var(--line)", borderRadius:10, boxShadow:"var(--shadow-2)", overflow:"hidden" }}>
      <div style={{ background:`color-mix(in oklab, var(--alert) 16%, var(--bg-inset))`, borderBottom:"1px solid color-mix(in oklab,var(--alert) 40%,transparent)", textAlign:"center", padding:"5px", fontFamily:"var(--font-mono)", fontSize:10.5, letterSpacing:".18em", fontWeight:600, color:"var(--alert)" }}>{doc.cls} // AXIOM-INT // NEED-TO-KNOW</div>
      <div style={{ padding:"34px 44px 44px" }}>
        <div className="eyebrow" style={{ marginBottom:8 }}>{doc.sub}</div>
        <h2 className="serif" style={{ fontSize:23, fontWeight:600, margin:"0 0 22px", letterSpacing:"-0.01em", lineHeight:1.2 }}>{doc.title}</h2>
        <div style={{ fontFamily: doc.mono?"var(--font-mono)":"var(--font-serif)", fontSize: doc.mono?13:15.5, lineHeight: doc.mono?2:1.75, color:"var(--text-dim)" }}>
          {doc.body.map((para,pi)=>(
            <p key={pi} style={{ margin: doc.mono?"0":"0 0 16px", whiteSpace: doc.mono?"pre":"normal" }}>
              {para.map((seg,si)=> Array.isArray(seg)
                ? <Mention key={si} ent={byId[seg[0]]} surface={seg[1]} selected={sel===seg[0]} onClick={onSel}/>
                : <span key={si} style={{ color: doc.mono?"var(--text-faint)":"inherit" }}>{seg}</span>) }
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
function ImageView({ doc, sel, onSel }){
  return (
    <div style={{ maxWidth:760, margin:"0 auto" }}>
      <div style={{ position:"relative", borderRadius:10, overflow:"hidden", border:"1px solid var(--line)", boxShadow:"var(--shadow-2)", aspectRatio:"16 / 10", backgroundImage:"repeating-linear-gradient(45deg, var(--bg-2) 0 14px, var(--bg-inset) 14px 28px)" }}>
        <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center" }}><span className="mono" style={{ fontSize:12, color:"var(--text-faint)", letterSpacing:".08em" }}>satellite imagery — drop real capture here</span></div>
        {doc.boxes.map(b=>{ const on=sel===b.id; const e=doc.entities.find(x=>x.id===b.id);
          return (
            <div key={b.id} className={"tc "+tcls(b.type)} onClick={(ev)=>{ ev.stopPropagation(); onSel(b.id); }}
              style={{ position:"absolute", left:b.x+"%", top:b.y+"%", width:b.w+"%", height:b.h+"%", border:"2px solid var(--c)", borderRadius:4, cursor:"pointer",
                background: on?"color-mix(in oklab, var(--c) 22%, transparent)":"color-mix(in oklab, var(--c) 8%, transparent)", boxShadow: on?"0 0 0 2px var(--c), var(--shadow-2)":"none", transition:"all .12s" }}>
              <span className="mono" style={{ position:"absolute", top:-19, left:-2, fontSize:10, fontWeight:600, color:"var(--c)", background:"var(--bg-inset)", border:"1px solid var(--c)", borderRadius:4, padding:"1px 5px", whiteSpace:"nowrap" }}>{e?.name}{e && <span style={{ opacity:.7 }}> · {Math.round(e.conf*100)}%</span>}</span>
            </div>
          );
        })}
      </div>
      <div className="t-faint mono" style={{ fontSize:11, marginTop:10, textAlign:"center" }}>click a detection to inspect · {doc.boxes.length} objects found</div>
    </div>
  );
}
function CsvView({ doc, sel, onSel }){
  return (
    <div style={{ maxWidth:880, margin:"0 auto" }}>
      <div className="card" style={{ padding:16, marginBottom:14 }}>
        <div className="eyebrow" style={{ marginBottom:10 }}>Column mapping → ontology</div>
        <div className="row gap-8 wrap">
          {doc.columns.map(c=>(
            <div key={c.name} className="row gap-8 center" style={{ padding:"7px 10px", background:"var(--bg-2)", borderRadius:8, border:"1px solid var(--line-soft)" }}>
              <span className="mono" style={{ fontSize:12, color:"var(--text)" }}>{c.name}</span>
              <Icon name="arrowRight" size={13} style={{ color:"var(--text-faint)" }}/>
              {c.type ? <span className={"tc "+tcls(c.type)} style={{ color:"var(--c)", fontFamily:"var(--font-mono)", fontSize:12, display:"inline-flex", gap:5, alignItems:"center" }}><span className="type-dot"/>{c.map}</span>
                : <span className="mono t-faint" style={{ fontSize:12 }}>{c.map}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead><tr>{doc.columns.map(c=><th key={c.name}>{c.name}</th>)}</tr></thead>
          <tbody>
            {doc.rows.map((r,ri)=>(
              <tr key={ri}>
                {r.map((cell,ci)=>{ const col=doc.columns[ci]; const e=col.type ? doc.entities.find(x=>x.name.split(" ·")[0]===cell || x.name===cell) : null; const on=e && sel===e.id;
                  return <td key={ci} onClick={e?(ev)=>{ ev.stopPropagation(); onSel(e.id); }:undefined} style={{ color: col.type?"var(--text)":"var(--text-dim)", cursor: e?"pointer":"default", background: on?"var(--accent-ghost)":"transparent" }}>
                    {col.type && e && <span className={"tc "+tcls(col.type)+" type-dot"} style={{ display:"inline-block", marginRight:7, verticalAlign:"middle" }}/>}{cell}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function ExtractionPanel({ doc, sel, onSel }){
  const [f,setF] = useState("all");
  const list = f==="all" ? doc.entities : doc.entities.filter(e=>e.res===f);
  const n = { matched:doc.entities.filter(e=>e.res==="matched").length, new:doc.entities.filter(e=>e.res==="new").length, review:doc.entities.filter(e=>e.res==="review").length };
  return (
    <aside style={{ width:344, flex:"none", borderLeft:"1px solid var(--line-soft)", background:"var(--bg-1)", display:"flex", flexDirection:"column", minHeight:0 }}>
      <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid var(--line-soft)" }}>
        <div className="row between center" style={{ marginBottom:10 }}>
          <div className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="sparkles" size={17}/></span><span className="serif" style={{ fontSize:16 }}>Extracted entities</span></div>
          <Badge kind="accent">{doc.entities.length}</Badge>
        </div>
        <div className="row gap-6 wrap">
          {[["all","All",doc.entities.length],["matched","Matched",n.matched],["new","New",n.new],["review","Review",n.review]].map(([k,l,c])=>(
            <button key={k} className={"chip"+(f===k?" on":"")} onClick={()=>setF(k)} style={{ height:26 }}>{l} <span className="t-faint" style={{ marginLeft:2 }}>{c}</span></button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:"8px 10px" }}>
        {list.map(e=>{ const r=RES[e.res]; const on=sel===e.id; return (
          <button key={e.id} onClick={()=>onSel(on?null:e.id)} className="card" style={{ width:"100%", textAlign:"left", padding:12, marginBottom:8, cursor:"pointer", borderColor: on?"var(--accent)":"var(--line-soft)", boxShadow: on?"0 0 0 1px var(--accent)":"none", background: on?"var(--bg-2)":"var(--bg-1)" }}>
            <div className="row gap-10 center">
              <TypeGlyph type={e.type} size={32}/>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div><div className="t-faint" style={{ fontSize:11, marginTop:1 }}>{tname(e.type)}</div></div>
              <Badge kind={r.kind} dot>{r.label}</Badge>
            </div>
            <div className="row gap-8 center" style={{ marginTop:10 }}>
              <span className="mono" style={{ fontSize:11, color:confColor(e.conf), width:34 }}>{Math.round(e.conf*100)}%</span>
              <div className="meter" style={{ flex:1 }}><i style={{ width:Math.round(e.conf*100)+"%", background:confColor(e.conf) }}/></div>
              {e.res==="matched" ? <span className="t-faint row gap-4 center" style={{ fontSize:11 }}><Icon name="link" size={12}/>ontology</span> : <span className="t-faint" style={{ fontSize:11 }}>{e.res==="new"?"unlinked":"ambiguous"}</span>}
            </div>
            {on && (
              <div className="row gap-6" style={{ marginTop:11 }}>
                {e.res==="matched" ? <button className="btn sm" style={{ flex:1 }}><Icon name="expand" size={13}/>Open 360°</button> : <button className="btn sm" style={{ flex:1 }}><Icon name="plus" size={13}/>{e.res==="new"?"Create object":"Resolve"}</button>}
                <button className="btn primary sm" style={{ flex:1 }}><Icon name="graph" size={13}/>Add to graph</button>
              </div>
            )}
          </button>
        );})}
      </div>
      <div style={{ borderTop:"1px solid var(--line-soft)", padding:14 }}>
        <div className="row between" style={{ marginBottom:10 }}>
          {[["Source",doc.source],["Ingested",doc.ingested],["SHA-256",doc.sha]].map(([k,v])=>(
            <div key={k} style={{ minWidth:0 }}><div className="t-faint" style={{ fontSize:10 }}>{k}</div><div className="mono" style={{ fontSize:11, color:"var(--text-dim)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v}</div></div>
          ))}
        </div>
        <div className="row gap-8 center" style={{ padding:"8px 10px", borderRadius:8, background:"var(--bg-2)", marginBottom:10 }}>
          <span className="t-faint"><Icon name="shield" size={14}/></span><span className="t-faint" style={{ fontSize:11 }}>Extracted by AXIOM NLP · review pending · provenance retained.</span>
        </div>
        <button className="btn primary" style={{ width:"100%" }}><Icon name="check" size={15}/>Confirm {n.matched} matches</button>
      </div>
    </aside>
  );
}
function DocList({ docs, selId, onSel }){
  return (
    <aside style={{ width:248, flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
      <div style={{ padding:"16px 16px 8px" }} className="row between center"><div className="eyebrow">Evidence · {docs.length}</div><button className="btn ghost sm" style={{ width:26, padding:0 }}><Icon name="plus" size={15}/></button></div>
      <div style={{ padding:"0 8px 16px" }}>
        {docs.map(d=>{ const on=selId===d.id; const ic=d.kind==="image"?"image":d.kind==="csv"?"table":"doc";
          return (
            <button key={d.id} onClick={()=>onSel(d.id)} className="row gap-10 center" style={{ width:"100%", textAlign:"left", border:"none", background: on?"var(--accent-ghost)":"none", borderRadius:9, padding:"10px", cursor:"pointer", marginBottom:2, boxShadow: on?"inset 0 0 0 1px var(--accent-dim)":"none" }}>
              <div style={{ width:30,height:30,borderRadius:8,flex:"none",display:"grid",placeItems:"center", background:"var(--bg-2)", color: on?"var(--accent)":"var(--text-dim)" }}><Icon name={ic} size={16}/></div>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color: on?"var(--text)":"var(--text-dim)" }}>{d.name}</div><div className="t-faint mono" style={{ fontSize:10 }}>{d.entities.length} entities</div></div>
              <MarkingChip level={d.cls} size="sm"/>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function EvidenceView(){
  const [docId,setDocId] = useState(DOCS[0].id);
  const [sel,setSel] = useState(null);
  const doc = DOCS.find(d=>d.id===docId);
  function pickDoc(id){ setDocId(id); setSel(null); }
  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <DocList docs={DOCS} selId={docId} onSel={pickDoc}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div className="row between center" style={{ padding:"11px 18px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
          <div className="row gap-10 center">
            <Icon name={doc.kind==="image"?"image":doc.kind==="csv"?"table":"doc"} size={17} style={{ color:"var(--accent)" }}/>
            <span style={{ fontSize:14, fontWeight:600 }}>{doc.name}</span>
            <span className="t-faint mono" style={{ fontSize:11 }}>{doc.pages}</span>
          </div>
          <div className="row gap-8">
            <button className="btn sm"><Icon name="sparkles" size={14}/>Re-run extraction</button>
            <button className="btn sm"><Icon name="download" size={14}/>Download</button>
            <button className="btn primary sm"><Icon name="plus" size={14}/>Add to case</button>
          </div>
        </div>
        <div className="content grid-bg" style={{ flex:1, overflow:"auto", padding:"28px 28px 60px" }} onClick={()=>setSel(null)}>
          {doc.kind==="pdf" && <PdfView doc={doc} sel={sel} onSel={setSel}/>}
          {doc.kind==="image" && <ImageView doc={doc} sel={sel} onSel={setSel}/>}
          {doc.kind==="csv" && <CsvView doc={doc} sel={sel} onSel={setSel}/>}
        </div>
      </div>
      <ExtractionPanel doc={doc} sel={sel} onSel={setSel}/>
    </div>
  );
}
