import { useState } from 'react';
import { CHK, DATASETS, INCIDENTS, SEV } from '../data/data_health.js';
import { ANALYSTS } from '../data/data_ext.js';
import { ArtifactExplorer, Badge, Drawer, Icon, Lineage, PageHeader, Spark, Stat, StatusBadge, statusMeta } from '../components/ui.jsx';
import { rulesByContext } from '../data/data_rules.js';
import { RulesEngine } from '../components/RulesEngine.jsx';

/* ============================================================
   AXIOM — Data Health · pipeline & dataset observability
   ============================================================ */

function Dot({ kind }){
  const sh = kind==="alert"?{clipPath:"polygon(50% 0,100% 100%,0 100%)"}:kind==="warn"?{borderRadius:1}:{borderRadius:"50%"};
  return <span style={{ width:8, height:8, background:`var(--${kind})`, display:"inline-block", ...sh }}/>;
}
function DatasetDrawer({ ds, onClose }){
  return (
    <Drawer open onClose={onClose}>
        <div style={{ padding:18, borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row between center" style={{ marginBottom:10 }}>
            <span className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="layers" size={18}/></span><StatusBadge status={ds.status}/></span>
            <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="x" size={16}/></button>
          </div>
          <div className="mono" style={{ fontSize:17, fontWeight:600 }}>{ds.name}</div>
          <div className="t-faint" style={{ fontSize:12, marginTop:3 }}>{ds.layer} · built by {ds.pipeline} · {ds.rows} rows</div>
        </div>
        <div style={{ padding:18 }}>
          <div className="row gap-12" style={{ marginBottom:16 }}>
            <div className="card" style={{ padding:12, flex:1 }}><div className="t-faint" style={{ fontSize:10.5 }}>Freshness</div><div className="mono" style={{ fontSize:14, marginTop:4, color:ds.slaOk?"var(--ok)":"var(--alert)" }}>{ds.last}</div><div className="t-faint" style={{ fontSize:10.5, marginTop:2 }}>SLA {ds.sla}</div></div>
            <div className="card" style={{ padding:12, flex:1 }}><div className="t-faint" style={{ fontSize:10.5 }}>Throughput</div><div style={{ marginTop:8 }}><Spark data={ds.spark} color={ds.status==="failed"?"var(--alert)":"var(--accent)"} w={110} h={24}/></div></div>
          </div>
          <div className="eyebrow" style={{ marginBottom:8 }}>Data-quality checks · {ds.pass}/{ds.total}</div>
          <div className="card" style={{ overflow:"hidden", marginBottom:16 }}>
            {ds.checks.map(([name,st],i)=>{ const c=CHK[st]; return (
              <div key={i} className="row gap-10 center" style={{ padding:"10px 13px", borderBottom: i<ds.checks.length-1?"1px solid var(--line-soft)":"none" }}>
                <span style={{ color:c.c }}><Icon name={c.ic} size={15}/></span>
                <span style={{ fontSize:12.5, flex:1, color: st==="skip"?"var(--text-faint)":"var(--text-dim)" }}>{name}</span>
                <span className="mono" style={{ fontSize:10.5, color:c.c, textTransform:"uppercase", letterSpacing:".08em" }}>{st}</span>
              </div>
            );})}
          </div>
          {ds.drift && <div className="card" style={{ padding:13, marginBottom:16, borderLeft:"3px solid var(--warn)" }}>
            <div className="row gap-8 center" style={{ marginBottom:6 }}><span style={{ color:"var(--warn)" }}><Icon name="drift" size={16}/></span><span style={{ fontSize:13, fontWeight:600 }}>Schema drift</span></div>
            <div className="t-dim" style={{ fontSize:12, lineHeight:1.5 }}>Incoming schema diverged from the contract. Review and accept or roll back.</div>
          </div>}
          <div className="eyebrow" style={{ marginBottom:8 }}>Lineage</div>
          <div style={{ marginBottom:18 }}>
            <Lineage chain={[
              { stage:"Pipeline", label: ds.pipeline, glyph:"pipeline" },
              { stage:"Dataset", label: ds.name, glyph:"database" },
              { stage:"Destino", label:"Ontology", meta:"published object", glyph:"share" },
            ]} />
          </div>
          <div className="row gap-8"><button className="btn" style={{ flex:1 }}><Icon name="play" size={14}/>Re-run build</button><button className="btn primary" style={{ flex:1 }}><Icon name="check" size={14}/>Acknowledge</button></div>
        </div>
    </Drawer>
  );
}

export function HealthView(){
  const [sel,setSel] = useState(null);
  const [showRules,setShowRules] = useState(false);
  const [dataRules,setDataRules] = useState(() => rulesByContext("data"));
  const toggleRule = (id) => setDataRules(rs => rs.map(r => r.id===id ? { ...r, on:!r.on } : r));
  const ds = sel ? DATASETS.find(d=>d.id===sel) : null;
  const healthy = DATASETS.filter(d=>d.status==="healthy").length;
  const fresh = DATASETS.filter(d=>d.slaOk).length;
  const pass = DATASETS.reduce((a,d)=>a+d.pass,0), tot = DATASETS.reduce((a,d)=>a+d.total,0);
  const passPct = Math.round(pass/tot*100);
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Data Integration · observability" title="Data Health">
          <button className="btn"><Icon name="download"/>Export</button>
          <button className={"btn"+(showRules?" primary":"")} onClick={()=>setShowRules(s=>!s)}><Icon name="bell"/>Alert rules</button>
        </PageHeader>
        {showRules && (
          <div className="card" style={{ padding:18, marginBottom:18 }}>
            <div className="eyebrow" style={{ marginBottom:12 }}>Reglas de datos · contexto data</div>
            <RulesEngine rules={dataRules} onToggle={toggleRule} />
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
          {[["Pipelines healthy",`${healthy}/${DATASETS.length}`,"pipeline", healthy===DATASETS.length?"var(--ok)":"var(--warn)"],
            ["Datasets fresh",`${fresh}/${DATASETS.length}`,"clock", fresh===DATASETS.length?"var(--ok)":"var(--warn)"],
            ["Checks passing",passPct+"%","check", passPct>=90?"var(--ok)":passPct>=75?"var(--warn)":"var(--alert)"],
            ["Open incidents",String(INCIDENTS.length),"alertTri", INCIDENTS.length?"var(--alert)":"var(--ok)"]].map(([l,v,ic,c])=>(
            <Stat key={l} label={l} value={v} icon={ic} valueColor={c} iconColor={c}/>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:20, alignItems:"start" }}>
          <ArtifactExplorer items={DATASETS} onOpen={d=>setSel(d.id)} title="Pipelines & datasets" meta={`${DATASETS.length} monitored`} columns={[
            { header:"Dataset", render:d=>{ const dm=statusMeta(d.status); return <><span className="row gap-8 center"><Dot kind={dm.kind==="accent"?"info":dm.kind}/><span className="mono" style={{ color:"var(--text)", fontWeight:600 }}>{d.name}</span>{d.drift && <span style={{ color:"var(--warn)" }}><Icon name="drift" size={13}/></span>}</span><div className="t-faint" style={{ fontSize:10.5, marginLeft:16 }}>{d.layer}</div></>; } },
            { header:"Status", render:d=><StatusBadge status={d.status}/> },
            { header:"Freshness", render:d=><span className="mono" style={{ fontSize:11.5, color: d.slaOk?"var(--text-dim)":"var(--alert)" }}>{d.last}</span> },
            { header:"Checks", render:d=><span className="mono" style={{ fontSize:11.5, color: d.pass===d.total?"var(--ok)":d.status==="building"?"var(--text-faint)":"var(--alert)" }}>{d.status==="building"?"—":d.pass+"/"+d.total}</span> },
            { header:"Trend", render:d=><Spark data={d.spark} w={80} h={24} color={d.status==="failed"?"var(--alert)":d.status==="degraded"?"var(--warn)":"var(--accent)"}/> },
            { header:"", align:"right", render:()=><span style={{ color:"var(--text-faint)" }}><Icon name="chevron" size={15}/></span> },
          ]} />
          <div className="col gap-16">
            <div className="card" style={{ padding:18 }}>
              <div className="row between center" style={{ marginBottom:8 }}><div className="eyebrow">Checks pass rate</div><span className="mono" style={{ fontSize:13, fontWeight:600, color:passPct>=90?"var(--ok)":"var(--warn)" }}>{passPct}%</span></div>
              <div className="meter" style={{ height:8 }}><i style={{ width:passPct+"%", background:passPct>=90?"var(--ok)":"var(--warn)" }}/></div>
              <div className="t-faint" style={{ fontSize:11.5, marginTop:8 }}>{pass} of {tot} checks passing across all datasets</div>
            </div>
            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div className="row between center" style={{ padding:"14px 16px", borderBottom:"1px solid var(--line-soft)" }}><div className="eyebrow">Active incidents</div><Badge kind="alert" dot>{INCIDENTS.length}</Badge></div>
              {INCIDENTS.map(inc=>{ const s=SEV[inc.sev]; return (
                <button key={inc.id} onClick={()=>setSel(DATASETS.find(d=>d.name===inc.ds)?.id)} className="col" style={{ width:"100%", textAlign:"left", border:"none", background:"none", padding:"13px 16px", borderBottom:"1px solid var(--line-soft)", borderLeft:`3px solid var(--${s.kind})`, cursor:"pointer", gap:5 }}>
                  <div className="row between center"><span className="row gap-8 center"><span className="mono t-faint" style={{ fontSize:10.5 }}>{inc.id}</span><Badge kind={s.kind} dot>{s.label}</Badge></span><span className="t-faint mono" style={{ fontSize:10.5 }}>{inc.when}</span></div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{inc.title}</div>
                  <div className="t-faint mono" style={{ fontSize:11 }}>{inc.ds}</div>
                  <div className="t-dim" style={{ fontSize:11.5, lineHeight:1.45 }}>{inc.detail}</div>
                </button>
              );})}
            </div>
          </div>
        </div>
      </div>
      {ds && <DatasetDrawer ds={ds} onClose={()=>setSel(null)}/>}
    </div>
  );
}
