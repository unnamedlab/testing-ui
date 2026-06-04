import { useEffect, useRef, useState } from 'react';
import { ANALYSTS, COMMENTS, T_END, T_START, dstr } from '../data/data_ext.js';
import { EDGES, ENTITY_BY_ID, TRANSACTIONS, TYPE_BY_ID, fmtMoney, riskLabel } from '../data/data.js';
import { AccessControl, Lineage, MarkingChip } from '../components/Security.jsx';
import { ArtifactExplorer, Avatar, Badge, Icon, RiskPill, Tabs, TypeGlyph } from '../components/ui.jsx';

const ENT_TABS = [["overview","Overview"],["connections","Connections"],["activity","Timeline"],["transactions","Transactions"],["lineage","Lineage & access"]];

/* ============================================================
   AXIOM — Entity 360° profile
   ============================================================ */

// F-09: label for the “Back” affordance, keyed by the view the entity was opened from.
const BACK_LABEL = {
  graph: "graph", map: "map", explore: "explorer", search: "search",
  ontology: "ontology", home: "workspace", cases: "cases",
  watchlist: "watchlists", dashboard: "operations",
};

export function EntityView({ id, backView, openEntity, go, openDossier }) {
  const e = ENTITY_BY_ID[id];
  // Hooks must run on every render in the same order — keep them above the
  // early return for the not-found case (Rules of Hooks).
  const [tab, setTab] = useState("overview");
  const [comments, setComments] = useState(COMMENTS);
  const [draft, setDraft] = useState("");
  const noteRef = useRef(null);
  useEffect(()=>{ setTab("overview"); }, [id]);
  if (!e) return <div className="content" style={{ padding:40 }}>Object not found.</div>;

  const t = TYPE_BY_ID[e.type];
  function addComment(){ const x=draft.trim(); if(!x) return; setComments(c=>[{who:"AR", at:"now", on:e.name, text:x, mention:/@\w/.test(x)}, ...c]); setDraft(""); }
  const connEdges = EDGES.filter(ed => ed.s===id || ed.t===id);
  const conns = connEdges.map(ed => {
    const otherId = ed.s===id ? ed.t : ed.s;
    return { rel: ed.rel, dir: ed.s===id, ent: ENTITY_BY_ID[otherId], alert: ed.alert };
  }).filter(c=>c.ent);

  const myTxns = TRANSACTIONS.filter(tx => tx.from.includes("····") || true).slice(0, e.type==="account"?6:4);

  const timeline = [
    { t:"2026-05-28 14:02", txt:"Layering pattern flagged · TXN-88241", sev:"alert" },
    { t:"2026-05-24 09:41", txt:"Linked to Northwind Holdings by M. Cho", sev:"info" },
    { t:"2026-05-19 22:17", txt:"AIS signal gap detected near Novorossiysk", sev:"warn" },
    { t:"2026-05-11 11:30", txt:"Matched to EU sanctions Annex IV", sev:"alert" },
    { t:"2026-04-30 16:08", txt:"Object created · Corp. Registry ingest", sev:"ok" },
  ];

  return (
    <div className="content" style={{ overflow:"auto" }}>
      {/* header band */}
      <div style={{ background:"var(--bg-1)", borderBottom:"1px solid var(--line-soft)", padding:"22px 28px 0" }}>
        <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto" }}>
          <button className="btn ghost sm" onClick={()=>go(backView||"graph")} style={{ marginBottom:14, paddingLeft:6 }}>
            <Icon name="arrowRight" size={15} style={{ transform:"rotate(180deg)" }}/>Back to {BACK_LABEL[backView]||"graph"}
          </button>
          <div className="row gap-20" style={{ alignItems:"flex-start" }}>
            <div className={"tc "+t.cls} style={{ position:"relative" }}>
              <TypeGlyph type={e.type} size={64}/>
              {e.watch && <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:"var(--alert)", border:"2px solid var(--bg-1)" }}/>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="row gap-10 center" style={{ marginBottom:4 }}>
                <span className={"badge tc "+t.cls} style={{ color:"var(--c)", borderColor:"color-mix(in oklab,var(--c) 40%,transparent)" }}><span className="type-dot"/>{t.name}</span>
                <MarkingChip id={e.id} />
                {e.watch && <Badge kind="alert" dot>Watchlist</Badge>}
              </div>
              <h1 className="serif" style={{ fontSize:34, fontWeight:500, margin:"2px 0 4px", letterSpacing:"-0.02em" }}>{e.name}</h1>
              <div className="t-dim" style={{ fontSize:14.5 }}>{e.sub}</div>
            </div>
            <div className="col" style={{ alignItems:"flex-end", gap:12 }}>
              <div className="row gap-8">
                <button className="btn" onClick={()=>{ setTab("overview"); setTimeout(()=>noteRef.current?.focus(), 60); }}><Icon name="note"/>Add note</button>
                <button className="btn" onClick={openDossier}><Icon name="doc"/>Dossier</button>
                <button className="btn primary" onClick={()=>go("graph")}><Icon name="graph"/>Expand graph</button>
              </div>
              <div className="row gap-16 center">
                <div className="col" style={{ alignItems:"flex-end" }}>
                  <span className="eyebrow">Risk score</span>
                  <RiskPill r={e.risk}/>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop:18 }}>
            <Tabs variant="flush"
              items={ENT_TABS.map(([k,l])=>({ label:l, badge:k==="connections"?conns.length:undefined }))}
              value={ENT_TABS.findIndex(([k])=>k===tab)}
              onChange={i=>setTab(ENT_TABS[i][0])} />
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto", padding:"24px 28px 60px" }} className="fade-in" key={tab}>
        {tab==="overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:24 }}>
            <div className="col gap-16">
              <div className="card" style={{ padding:16 }}>
                <div className="eyebrow" style={{ marginBottom:12 }}>Properties</div>
                <div className="col gap-2">
                  {Object.entries(e.attrs).map(([k,v])=>(
                    <div key={k} className="row between" style={{ padding:"7px 0", borderBottom:"1px solid var(--line-soft)", gap:12 }}>
                      <span className="t-faint" style={{ fontSize:12.5 }}>{k}</span>
                      <span className="mono" style={{ fontSize:12.5, color:"var(--text)", textAlign:"right" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding:16 }}>
                <div className="eyebrow" style={{ marginBottom:10 }}>Source provenance</div>
                <div className="col gap-8">
                  {[["Corp. Registry API","building"],["SWIFT MT103","swap"],["AIS Vessel Feed","ship"]].map(([s,ic])=>(
                    <div key={s} className="row gap-8 center" style={{ fontSize:12.5 }}>
                      <span className="t-faint"><Icon name={ic} size={15}/></span><span className="t-dim">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding:16 }}>
                <div className="eyebrow" style={{ marginBottom:14 }}>Relationship timeline</div>
                <EntityTimeline id={id} conns={conns} />
              </div>
            </div>
            <div className="col gap-16">
              <div className="card" style={{ padding:18 }}>
                <div className="row between center" style={{ marginBottom:14 }}>
                  <div className="eyebrow">Key connections</div>
                  <button className="btn ghost sm" onClick={()=>setTab("connections")}>See all {conns.length}</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {conns.slice(0,4).map((c,i)=>(
                    <button key={i} onClick={()=>openEntity(c.ent.id)} className="card hover" style={{ padding:12, textAlign:"left", cursor:"pointer", background:"var(--bg-2)" }}>
                      <div className="row gap-10 center">
                        <TypeGlyph type={c.ent.type} size={32}/>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div className="mono t-faint" style={{ fontSize:10.5 }}>{c.dir?"":"← "}{c.rel}{c.dir?" →":""}</div>
                          <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.ent.name}</div>
                        </div>
                        {c.alert && <span style={{ color:"var(--alert)" }}><Icon name="alertTri" size={15}/></span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding:18 }}>
                <div className="eyebrow" style={{ marginBottom:12 }}>Analyst summary</div>
                <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">
                  <b style={{ color:"var(--text)" }}>{e.name}</b> sits at the center of the BLACKFROST network with
                  a <span className="t-accent">{riskLabel(e.risk).toLowerCase()}</span> risk profile. Resolved across
                  3 source systems, it shows {conns.length} confirmed links — including {conns.filter(c=>c.alert).length} flagged
                  relationships routed through sanctioned counterparties. Pattern-of-life consistent with deliberate obfuscation.
                </p>
                <div className="row gap-8" style={{ marginTop:14 }}>
                  <Badge kind="accent"><Icon name="sparkles" size={12}/> AI-generated</Badge>
                  <span className="t-faint" style={{ fontSize:11.5, alignSelf:"center" }}>Reviewed by A. Reyes · 2h ago</span>
                </div>
              </div>
              <div className="card" style={{ padding:18 }}>
                <div className="row between center" style={{ marginBottom:12 }}>
                  <div className="eyebrow">Discussion · {comments.length}</div>
                  <Badge>{comments.filter(c=>c.mention).length} mention</Badge>
                </div>
                <div className="col gap-12">
                  {comments.map((c,i)=>(
                    <div key={i} className="row gap-10" style={{ alignItems:"flex-start" }}>
                      <Avatar who={c.who} name={ANALYSTS[c.who]?.name} size={28}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="row gap-8 center"><span style={{ fontSize:13, fontWeight:600 }}>{ANALYSTS[c.who].name}</span><span className="t-faint mono" style={{ fontSize:10.5 }}>{c.at} · on {c.on}</span></div>
                        <p style={{ fontSize:13, lineHeight:1.5, margin:"3px 0 0" }} className="t-dim" dangerouslySetInnerHTML={{ __html: c.text.replace(/@(\w+)/g,"<b style='color:var(--accent)'>@$1</b>") }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row gap-8 center" style={{ marginTop:14, background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:10, padding:"6px 6px 6px 12px" }}>
                  <input ref={noteRef} value={draft} onChange={ev=>setDraft(ev.target.value)} onKeyDown={ev=>{ if(ev.key==="Enter") addComment(); }} placeholder="Comment or @mention…" style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13 }} />
                  <button className="btn primary sm" style={{ width:32, padding:0 }} onClick={addComment}><Icon name="arrowRight" size={15}/></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="connections" && (
          <div className="col gap-8" style={{ maxWidth:820 }}>
            {conns.map((c,i)=>(
              <button key={i} onClick={()=>openEntity(c.ent.id)} className="card hover" style={{ padding:14, textAlign:"left", cursor:"pointer" }}>
                <div className="row gap-14 center">
                  <TypeGlyph type={c.ent.type} size={40}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14.5, fontWeight:600 }}>{c.ent.name}</div>
                    <div className="row gap-8 center" style={{ marginTop:3 }}>
                      <span className="mono" style={{ fontSize:11.5, color:"var(--accent)" }}>{c.dir?"":"← "}{c.rel}{c.dir?" →":""}</span>
                      <span className="t-faint" style={{ fontSize:12 }}>· {TYPE_BY_ID[c.ent.type].name}</span>
                    </div>
                  </div>
                  {c.alert && <Badge kind="alert" dot>flagged link</Badge>}
                  <RiskPill r={c.ent.risk}/>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab==="activity" && (
          <div style={{ maxWidth:680 }}>
            <div style={{ position:"relative", paddingLeft:24 }}>
              <div style={{ position:"absolute", left:6, top:6, bottom:6, width:2, background:"var(--line)" }}/>
              {timeline.map((tl,i)=>(
                <div key={i} style={{ position:"relative", paddingBottom:22 }}>
                  <span style={{ position:"absolute", left:-24, top:2, width:14, height:14, borderRadius:"50%",
                    background:`var(--${tl.sev==="ok"?"ok":tl.sev})`, border:"3px solid var(--bg)", boxShadow:`0 0 0 1px var(--${tl.sev==="ok"?"ok":tl.sev})` }}/>
                  <div className="mono t-faint" style={{ fontSize:11, marginBottom:3 }}>{tl.t} UTC</div>
                  <div style={{ fontSize:14 }}>{tl.txt}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="transactions" && (
          <div style={{ maxWidth:980 }}>
            <ArtifactExplorer items={myTxns} columns={[
              { header:"ID", render:tx=><span className="mono" style={{ color:"var(--text)" }}>{tx.id}</span> },
              { header:"Date", render:tx=><span className="mono">{tx.date}</span> },
              { header:"Counterparty", key:"to" },
              { header:"Amount", align:"right", render:tx=><span className="mono" style={{ color:"var(--text)", fontWeight:600 }}>{fmtMoney(tx.amount,tx.ccy)}</span> },
              { header:"Pattern", render:tx=><Badge kind={tx.flag==="ok"?"ok":tx.flag}>{tx.note}</Badge> },
            ]} />
          </div>
        )}

        {tab==="lineage" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, maxWidth:900 }}>
            <Lineage id={id} />
            <AccessControl id={id} />
          </div>
        )}
      </div>
    </div>
  );
}

export function EntityTimeline({ id }){
  // build events from this entity's edges (using EDGE .since) + the entity's own appearance
  const ent = ENTITY_BY_ID[id];
  const evs = [];
  if(ent?.since) evs.push({ t:ent.since, label:"First observed", kind:"info" });
  EDGES.forEach(ed=>{
    if(ed.s===id || ed.t===id){
      const other = ENTITY_BY_ID[ed.s===id?ed.t:ed.s];
      if(other) evs.push({ t:ed.since, label:(ed.label||"Linked to")+" "+other.name, kind: other.risk>=80?"alert":other.risk>=60?"warn":"info", oid:other.id });
    }
  });
  evs.sort((a,b)=>a.t-b.t);
  if(evs.length===0) return <div className="t-faint" style={{ fontSize:12.5 }}>No temporal data.</div>;
  const span = Math.max(1, T_END - T_START);
  return (
    <div>
      <div style={{ position:"relative", height:26, marginBottom:10 }}>
        <div style={{ position:"absolute", left:0, right:0, top:12, height:2, background:"var(--line)" }}/>
        {evs.map((e,i)=>{ const p=((e.t-T_START)/span)*100;
          return <div key={i} title={dstr(e.t)+" · "+e.label} style={{ position:"absolute", left:`calc(${Math.max(0,Math.min(100,p))}% - 4px)`, top:8,
            width:9, height:9, borderRadius:"50%", background:`var(--${e.kind})`, border:"2px solid var(--bg-1)", boxShadow:"0 0 0 1px var(--line)" }}/>; })}
      </div>
      <div className="col gap-2" style={{ maxHeight:150, overflowY:"auto", overflowX:"hidden" }}>
        {evs.slice(0,7).map((e,i)=>(
          <div key={i} className="row gap-10 center" style={{ padding:"5px 0", borderBottom: i<Math.min(7,evs.length)-1?"1px solid var(--line-soft)":"none" }}>
            <span className="mono t-faint" style={{ fontSize:10.5, width:64, flex:"none" }}>{dstr(e.t)}</span>
            <span style={{ width:7,height:7,borderRadius:"50%",background:`var(--${e.kind})`,flex:"none" }}/>
            <span style={{ fontSize:12, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} className="t-dim">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}