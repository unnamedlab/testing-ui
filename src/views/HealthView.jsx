import { useState } from 'react';
import { CHK, DATASETS, DSTATUS, INCIDENTS, SEV } from '../data/data_health.js';
import { ANALYSTS } from '../data/data_ext.js';
import { Badge, Icon, Spark, PageHeader, LineageCard } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Data Health · pipeline & dataset observability (UX-01)
   ============================================================ */

function Dot({ kind }){
  const sh = kind==="alert"?{clipPath:"polygon(50% 0,100% 100%,0 100%)"}:kind==="warn"?{borderRadius:1}:{borderRadius:"50%"};
  return <span style={{ width:8, height:8, background:`var(--${kind})`, display:"inline-block", ...sh }}/>;
}
function StatusBadge({ s }){ const { t }=useI18n(); const m=DSTATUS[s]; return <Badge kind={m.kind} dot>{t(m.label)}</Badge>; }

function Drawer({ ds, onClose }){
  const { t } = useI18n();
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:120, background:"var(--scrim-soft)", backdropFilter:"var(--scrim-blur)" }}>
      <div onClick={e=>e.stopPropagation()} className="panel" style={{ position:"absolute", top:0, right:0, bottom:0, width:400, background:"var(--bg-1)", borderRadius:0, borderLeft:"1px solid var(--line)", boxShadow:"var(--shadow-3)", overflow:"auto", animation:"slideIn .25s both" }}>
        <div style={{ padding:18, borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row between center" style={{ marginBottom:10 }}>
            <span className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="layers" size={18}/></span><StatusBadge s={ds.status}/></span>
            <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="x" size={16}/></button>
          </div>
          <div className="mono" style={{ fontSize:17, fontWeight:600 }}>{ds.name}</div>
          <div className="t-faint" style={{ fontSize:12, marginTop:3 }}>{t('{layer} · built by {pipeline} · {rows} rows', { layer: t(ds.layer), pipeline: ds.pipeline, rows: ds.rows })}</div>
        </div>
        <div style={{ padding:18 }}>
          <div className="row gap-12" style={{ marginBottom:16 }}>
            <div className="card" style={{ padding:12, flex:1 }}><div className="t-faint" style={{ fontSize:10.5 }}>{t('Freshness')}</div><div className="mono" style={{ fontSize:14, marginTop:4, color:ds.slaOk?"var(--ok)":"var(--alert)" }}>{ds.last}</div><div className="t-faint" style={{ fontSize:10.5, marginTop:2 }}>{t('SLA')} {ds.sla}</div></div>
            <div className="card" style={{ padding:12, flex:1 }}><div className="t-faint" style={{ fontSize:10.5 }}>{t('Throughput')}</div><div style={{ marginTop:8 }}><Spark data={ds.spark} color={ds.status==="failed"?"var(--alert)":"var(--accent)"} w={110} h={28}/></div></div>
          </div>
          <div className="eyebrow" style={{ marginBottom:8 }}>{t('Data-quality checks · {pass}/{total}', { pass: ds.pass, total: ds.total })}</div>
          <div className="card" style={{ overflow:"hidden", marginBottom:16 }}>
            {ds.checks.map(([name,st],i)=>{ const c=CHK[st]; return (
              <div key={i} className="row gap-10 center" style={{ padding:"10px 13px", borderBottom: i<ds.checks.length-1?"1px solid var(--line-soft)":"none" }}>
                <span style={{ color:c.c }}><Icon name={c.ic} size={15}/></span>
                <span style={{ fontSize:12.5, flex:1, color: st==="skip"?"var(--text-faint)":"var(--text-dim)" }}>{t(name)}</span>
                <span className="mono" style={{ fontSize:10.5, color:c.c, textTransform:"uppercase", letterSpacing:".08em" }}>{t(st)}</span>
              </div>
            );})}
          </div>
          {ds.drift && <div className="card" style={{ padding:13, marginBottom:16, borderLeft:"3px solid var(--warn)" }}>
            <div className="row gap-8 center" style={{ marginBottom:6 }}><span style={{ color:"var(--warn)" }}><Icon name="drift" size={16}/></span><span style={{ fontSize:13, fontWeight:600 }}>{t('Schema drift')}</span></div>
            <div className="t-dim" style={{ fontSize:12, lineHeight:1.5 }}>{t('Incoming schema diverged from the contract. Review and accept or roll back.')}</div>
          </div>}
          <div style={{ marginBottom:18 }}>
            <LineageCard chain={[
              { stage:t('Pipeline'), label:ds.pipeline, glyph:"pipeline" },
              { stage:t('Dataset'), label:ds.name, glyph:"layers" },
              { stage:t('Ontology'), label:t('ontology'), glyph:"share" },
            ]} />
          </div>
          <div className="row gap-8"><button className="btn" style={{ flex:1 }}><Icon name="play" size={14}/>{t('Re-run build')}</button><button className="btn primary" style={{ flex:1 }}><Icon name="check" size={14}/>{t('Acknowledge')}</button></div>
        </div>
      </div>
    </div>
  );
}

export function HealthView(){
  const { t } = useI18n();
  const [sel,setSel] = useState(null);
  const ds = sel ? DATASETS.find(d=>d.id===sel) : null;
  const healthy = DATASETS.filter(d=>d.status==="healthy").length;
  const fresh = DATASETS.filter(d=>d.slaOk).length;
  const pass = DATASETS.reduce((a,d)=>a+d.pass,0), tot = DATASETS.reduce((a,d)=>a+d.total,0);
  const passPct = Math.round(pass/tot*100);
  return (
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Integrate')} title={t('Data Health')}>
          <button className="btn"><Icon name="download"/>{t('Export')}</button>
          <button className="btn primary"><Icon name="bell"/>{t('Alert rules')}</button>
        </PageHeader>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
          {[["Pipelines healthy",`${healthy}/${DATASETS.length}`,"pipeline", healthy===DATASETS.length?"var(--ok)":"var(--warn)"],
            ["Datasets fresh",`${fresh}/${DATASETS.length}`,"clock", fresh===DATASETS.length?"var(--ok)":"var(--warn)"],
            ["Checks passing",passPct+"%","check", passPct>=90?"var(--ok)":passPct>=75?"var(--warn)":"var(--alert)"],
            ["Open incidents",String(INCIDENTS.length),"alertTri", INCIDENTS.length?"var(--alert)":"var(--ok)"]].map(([l,v,ic,c])=>(
            <div key={l} className="card" style={{ padding:16 }}>
              <div className="row between center"><div className="eyebrow">{t(l)}</div><span style={{ color:c }}><Icon name={ic} size={16}/></span></div>
              <div className="mono" style={{ fontSize:25, fontWeight:600, marginTop:8, color:c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:20, alignItems:"start" }}>
          <div className="card" style={{ overflow:"hidden" }}>
            <div className="row between center" style={{ padding:"13px 16px", borderBottom:"1px solid var(--line-soft)" }}><div className="eyebrow">{t('Pipelines & datasets')}</div><span className="t-faint mono" style={{ fontSize:11 }}>{t('{n} monitored', { n: DATASETS.length })}</span></div>
            <table className="tbl">
              <thead><tr><th>{t('Dataset')}</th><th>{t('Status')}</th><th>{t('Freshness')}</th><th>{t('Checks')}</th><th>{t('Trend')}</th><th></th></tr></thead>
              <tbody>
                {DATASETS.map(d=>{ const dm=DSTATUS[d.status]; return (
                  <tr key={d.id} onClick={()=>setSel(d.id)}>
                    <td><span className="row gap-8 center"><Dot kind={dm.kind==="accent"?"info":dm.kind}/><span className="mono" style={{ color:"var(--text)", fontWeight:600 }}>{d.name}</span>{d.drift && <span style={{ color:"var(--warn)" }}><Icon name="drift" size={13}/></span>}</span><div className="t-faint" style={{ fontSize:10.5, marginLeft:16 }}>{t(d.layer)}</div></td>
                    <td><StatusBadge s={d.status}/></td>
                    <td><span className="mono" style={{ fontSize:11.5, color: d.slaOk?"var(--text-dim)":"var(--alert)" }}>{d.last}</span></td>
                    <td><span className="mono" style={{ fontSize:11.5, color: d.pass===d.total?"var(--ok)":d.status==="building"?"var(--text-faint)":"var(--alert)" }}>{d.status==="building"?"—":d.pass+"/"+d.total}</span></td>
                    <td><Spark data={d.spark} color={d.status==="failed"?"var(--alert)":d.status==="degraded"?"var(--warn)":"var(--accent)"} w={80} h={24}/></td>
                    <td style={{ textAlign:"right", color:"var(--text-faint)" }}><Icon name="chevron" size={15}/></td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          <div className="col gap-16">
            <div className="card" style={{ padding:18 }}>
              <div className="row between center" style={{ marginBottom:8 }}><div className="eyebrow">{t('Checks pass rate')}</div><span className="mono" style={{ fontSize:13, fontWeight:600, color:passPct>=90?"var(--ok)":"var(--warn)" }}>{passPct}%</span></div>
              <div className="meter" style={{ height:8 }}><i style={{ width:passPct+"%", background:passPct>=90?"var(--ok)":"var(--warn)" }}/></div>
              <div className="t-faint" style={{ fontSize:11.5, marginTop:8 }}>{t('{pass} of {tot} checks passing across all datasets', { pass, tot })}</div>
            </div>
            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div className="row between center" style={{ padding:"14px 16px", borderBottom:"1px solid var(--line-soft)" }}><div className="eyebrow">{t('Active incidents')}</div><Badge kind="alert" dot>{INCIDENTS.length}</Badge></div>
              {INCIDENTS.map(inc=>{ const s=SEV[inc.sev]; return (
                <button key={inc.id} onClick={()=>setSel(DATASETS.find(d=>d.name===inc.ds)?.id)} className="col" style={{ width:"100%", textAlign:"left", border:"none", background:"none", padding:"13px 16px", borderBottom:"1px solid var(--line-soft)", borderLeft:`3px solid var(--${s.kind})`, cursor:"pointer", gap:5 }}>
                  <div className="row between center"><span className="row gap-8 center"><span className="mono t-faint" style={{ fontSize:10.5 }}>{inc.id}</span><Badge kind={s.kind} dot>{t(s.label)}</Badge></span><span className="t-faint mono" style={{ fontSize:10.5 }}>{inc.when}</span></div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{t(inc.title)}</div>
                  <div className="t-faint mono" style={{ fontSize:11 }}>{inc.ds}</div>
                  <div className="t-dim" style={{ fontSize:11.5, lineHeight:1.45 }}>{t(inc.detail)}</div>
                </button>
              );})}
            </div>
          </div>
        </div>
      </div>
      {ds && <Drawer ds={ds} onClose={()=>setSel(null)}/>}
    </div>
  );
}
