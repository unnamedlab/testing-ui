import { useState } from 'react';
import { MODELS, OBJECTIVES, VST } from '../data/data_models.js';
import { Badge, Icon, Spark, Switch, WBBar, CatalogGrid, CatalogCard, PageHeader, LineageSteps } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Model / ML management (UX-01 i18n)
   ============================================================ */

function Registry({ liveById, setLiveById }){
  const { t } = useI18n();
  const [sel,setSel] = useState("risk");
  const m = MODELS.find(x=>x.id===sel);
  const champ = m.versions.find(v=>v.st==="champion");
  // BUG-4: the deploy toggle drives real (lifted) state instead of a no-op
  // onChange. Flipping it updates the switch, the Live/Offline label, the
  // inference KPI, the sparkline AND the Deployments tab.
  const live = liveById[sel];
  const toggleLive = () => setLiveById(s => ({ ...s, [sel]: !s[sel] }));
  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <aside style={{ width:"var(--master-w)", flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
        <div className="row between center" style={{ padding:"14px 14px 8px" }}><div className="eyebrow">{t('Models')} · {MODELS.length}</div></div>
        <div style={{ padding:"0 8px 16px" }}>
          {MODELS.map(x=>(
            <button key={x.id} onClick={()=>setSel(x.id)} className="row gap-10 center" style={{ width:"100%", textAlign:"left", border:"none", background:sel===x.id?"var(--accent-ghost)":"none", borderRadius:9, padding:"10px", cursor:"pointer", marginBottom:2, boxShadow:sel===x.id?"inset 0 0 0 1px var(--accent-dim)":"none" }}>
              <span style={{ width:30,height:30,borderRadius:8,flex:"none",display:"grid",placeItems:"center",background:"var(--bg-2)",color:x.status==="deployed"?"var(--ok)":"var(--warn)" }}><Icon name="model" size={16}/></span>
              <div style={{ flex:1, minWidth:0 }}><div className="mono" style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:sel===x.id?"var(--text)":"var(--text-dim)" }}>{x.name}</div><div className="t-faint" style={{ fontSize:10.5, marginTop:1 }}>{t(x.type)} · {t(x.status)}</div></div>
            </button>
          ))}
        </div>
      </aside>
      <div style={{ flex:1, overflow:"auto", padding:"22px 26px 50px", minWidth:0 }}>
        <div style={{ maxWidth:760 }}>
          <PageHeader mono title={m.name} eyebrow={t(m.obj)}
            sub={<span className="row gap-8 center" style={{ flexWrap:"wrap" }}><Badge kind={m.status==="deployed"?"ok":"warn"} dot>{t(m.status)}</Badge><span className="t-faint" style={{ fontSize:12.5 }}>{t(m.type)} · {t('owner')} {m.owner} · {t('champion')} {champ.v}</span></span>}>
            <button className="btn"><Icon name="history" size={15}/>{t('Compare')}</button>
            <button className="btn primary"><Icon name="rocket" size={15}/>{t('New version')}</button>
          </PageHeader>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
            <div className="card" style={{ padding:15 }}><div className="eyebrow">{t(m.m1.n)}</div><div className="mono" style={{ fontSize:23, fontWeight:600, marginTop:6, color:"var(--ok)" }}>{m.m1.v}</div></div>
            <div className="card" style={{ padding:15 }}><div className="eyebrow">{t(m.m2.n)}</div><div className="mono" style={{ fontSize:23, fontWeight:600, marginTop:6 }}>{m.m2.v}</div></div>
            <div className="card" style={{ padding:15 }}><div className="eyebrow">{t('Inference')}</div><div className="mono" style={{ fontSize:23, fontWeight:600, marginTop:6, color:live?"var(--accent)":"var(--text-faint)" }}>{m.deploy.p95}</div></div>
          </div>
          <div className="eyebrow" style={{ marginBottom:10 }}>{t('Versions')}</div>
          <div className="card" style={{ overflow:"hidden", marginBottom:22 }}>
            <table className="tbl">
              <thead><tr><th>{t('Version')}</th><th>{t('Status')}</th><th>{t(m.m1.n)}</th><th>{t(m.m2.n)}</th><th>{t('By')}</th><th>{t('When')}</th><th></th></tr></thead>
              <tbody>
                {m.versions.map(v=>{ const s=VST[v.st]; return (
                  <tr key={v.v}>
                    <td className="mono" style={{ color:"var(--text)", fontWeight:600 }}>{v.v}</td>
                    <td>{v.st==="champion"?<Badge kind="accent" dot><Icon name="crown" size={11}/> {t('champion')}</Badge>:<Badge kind={s.kind} dot>{t(s.label)}</Badge>}</td>
                    <td className="mono">{v.a.split(" ")[1]}</td>
                    <td className="mono">{v.b.split(" ")[1]}</td>
                    <td>{v.by}</td>
                    <td className="mono t-faint">{v.when}</td>
                    <td style={{ textAlign:"right" }}>{v.st==="archived" && <button className="btn ghost sm">{t('Promote')}</button>}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          <div className="eyebrow" style={{ marginBottom:10 }}>{t('Deploy as function')}</div>
          <div className="card" style={{ padding:16, marginBottom:22 }}>
            <div className="row between center" style={{ marginBottom:14 }}>
              <div className="row gap-10 center"><span style={{ color:live?"var(--ok)":"var(--text-faint)" }}><Icon name="func" size={18}/></span><div><div className="mono" style={{ fontSize:13, fontWeight:600 }}>{m.deploy.fn}</div><div className="t-faint mono" style={{ fontSize:11, marginTop:2 }}>{m.deploy.endpoint}</div></div></div>
              <span className="row gap-8 center"><span className="t-faint" style={{ fontSize:11.5 }}>{live?t('Live'):t('Offline')}</span><Switch on={live} onChange={toggleLive} label={live?t('Live'):t('Offline')}/></span>
            </div>
            <div className="row between center" style={{ paddingTop:12, borderTop:"1px solid var(--line-soft)" }}>
              <div className="row gap-16">
                <div><div className="t-faint" style={{ fontSize:10.5 }}>{t('Calls')}</div><div className="mono" style={{ fontSize:13, marginTop:2 }}>{m.deploy.calls}</div></div>
                <div><div className="t-faint" style={{ fontSize:10.5 }}>{t('p95 latency')}</div><div className="mono" style={{ fontSize:13, marginTop:2 }}>{m.deploy.p95}</div></div>
              </div>
              <Spark data={m.deploy.spark} color={live?"var(--accent)":"var(--text-faint)"} area/>
            </div>
          </div>
          <div className="eyebrow" style={{ marginBottom:10 }}>{t('Data lineage')}</div>
          <div className="card" style={{ padding:16 }}>
            <LineageSteps chain={[
              ...m.inputs.map(i=>({ stage:t('Source'), label:i, glyph:"layers" })),
              { stage:t('Model'), label:`${m.name}:${champ.v}`, glyph:"model" },
              { stage:t('Function'), label:`${m.deploy.fn.split("(")[0]}()`, glyph:"func" },
            ]} />
            <div style={{ marginTop:14 }}><div className="t-faint" style={{ fontSize:11, marginBottom:7 }}>{t('Consumed by')}</div>
              <div className="row gap-6 wrap">{m.usedBy.map(u=><span key={u} className="chip" style={{ cursor:"default" }}>{t(u)}</span>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ObjectivesTab(){
  const { t } = useI18n();
  return (
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Integrate')} title={t('Modeling objectives')}
          sub={t('Each objective frames a problem, its data, the metric to beat and the candidate models competing for champion.')} />
        <CatalogGrid min={330}>
          {OBJECTIVES.map(o=>(
            <CatalogCard key={o.name} icon="target" title={t(o.name)} desc={o.model + " · " + t(o.type)}
              badge={<Badge kind={o.status==="deployed"?"ok":"warn"} dot>{t(o.status)}</Badge>}
              footer={<><span className="t-faint" style={{ fontSize:11.5 }}>{t('{c} candidates · {d} datasets', { c: o.candidates, d: o.datasets.length })}</span><button className="btn ghost sm">{t('Open')} <Icon name="arrowRight" size={13}/></button></>}>
              <div className="row between center" style={{ padding:"10px 0", borderTop:"1px solid var(--line-soft)", borderBottom:"1px solid var(--line-soft)" }}>
                <div><div className="t-faint" style={{ fontSize:10.5 }}>{t('Target metric')}</div><div className="mono" style={{ fontSize:14, marginTop:2 }}>{t(o.metric.n)} {o.metric.v}</div></div>
                <div style={{ textAlign:"right" }}><div className="t-faint" style={{ fontSize:10.5 }}>{t('Champion')}</div><div className="mono t-accent" style={{ fontSize:14, marginTop:2 }}>{o.champion}</div></div>
              </div>
            </CatalogCard>
          ))}
        </CatalogGrid>
      </div>
    </div>
  );
}
function DeploymentsTab({ liveById }){
  const { t } = useI18n();
  return (
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:980, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Integrate')} title={t('Deployments')} />
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>{t('Function')}</th><th>{t('Model')}</th><th>{t('Mode')}</th><th>{t('Calls')}</th><th>p95</th><th>{t('Status')}</th></tr></thead>
            <tbody>
              {MODELS.map(m=>{ const lv=liveById[m.id]; return (
                <tr key={m.id}>
                  <td><span className="row gap-8 center"><span style={{ color:lv?"var(--accent)":"var(--text-faint)" }}><Icon name="func" size={15}/></span><span className="mono" style={{ color:"var(--text)" }}>{m.deploy.fn.split("(")[0]}()</span></span></td>
                  <td className="mono t-dim">{m.name}:{m.versions.find(v=>v.st==="champion")?.v}</td>
                  <td>{lv?t('Live'):t('Batch')}</td>
                  <td className="mono">{m.deploy.calls}</td>
                  <td className="mono">{m.deploy.p95}</td>
                  <td>{lv?<Badge kind="ok" dot>{t('serving')}</Badge>:<Badge kind="warn" dot>{t('offline')}</Badge>}</td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ModelsView(){
  const [tab,setTab] = useState("registry");
  // BUG-4: live/offline is shared state so the Registry toggle and the
  // Deployments overview stay in sync.
  const [liveById,setLiveById] = useState(() => Object.fromEntries(MODELS.map(x => [x.id, x.deploy.live])));
  return (
    <>
      <WBBar mode={tab} setMode={setTab}
        tabs={[["registry","Registry"],["objectives","Objectives"],["deploy","Deployments"]]} />
      {tab==="registry" && <Registry liveById={liveById} setLiveById={setLiveById}/>}
      {tab==="objectives" && <ObjectivesTab/>}
      {tab==="deploy" && <DeploymentsTab liveById={liveById}/>}
    </>
  );
}
