import { useState } from 'react';
import { MODELS, OBJECTIVES, VST } from '../data/data_models.js';
import { Badge, Icon, Lineage, PageHeader, Spark, Stat, Switch, Tabs } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Model / ML management
   ============================================================ */

function Registry(){
  const [sel,setSel] = useState("risk");
  const m = MODELS.find(x=>x.id===sel);
  const champ = m.versions.find(v=>v.st==="champion");
  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <aside style={{ width:236, flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
        <div className="row between center" style={{ padding:"14px 14px 8px" }}><div className="eyebrow">Models · {MODELS.length}</div></div>
        <div style={{ padding:"0 8px 16px" }}>
          {MODELS.map(x=>(
            <button key={x.id} onClick={()=>setSel(x.id)} className="row gap-10 center" style={{ width:"100%", textAlign:"left", border:"none", background:sel===x.id?"var(--accent-ghost)":"none", borderRadius:9, padding:"10px", cursor:"pointer", marginBottom:2, boxShadow:sel===x.id?"inset 0 0 0 1px var(--accent-dim)":"none" }}>
              <span style={{ width:30,height:30,borderRadius:8,flex:"none",display:"grid",placeItems:"center",background:"var(--bg-2)",color:x.status==="deployed"?"var(--ok)":"var(--warn)" }}><Icon name="model" size={16}/></span>
              <div style={{ flex:1, minWidth:0 }}><div className="mono" style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:sel===x.id?"var(--text)":"var(--text-dim)" }}>{x.name}</div><div className="t-faint" style={{ fontSize:10.5, marginTop:1 }}>{x.type} · {x.status}</div></div>
            </button>
          ))}
        </div>
      </aside>
      <div style={{ flex:1, overflow:"auto", padding:"22px 26px 50px", minWidth:0 }}>
        <div style={{ maxWidth:760 }}>
          <div className="row between" style={{ alignItems:"flex-start", marginBottom:18 }}>
            <div>
              <div className="row gap-10 center" style={{ marginBottom:5 }}><span className="eyebrow">{m.obj}</span><Badge kind={m.status==="deployed"?"ok":"warn"} dot>{m.status}</Badge></div>
              <h1 className="serif mono" style={{ fontSize:25, fontWeight:600, margin:0, letterSpacing:"-0.01em" }}>{m.name}</h1>
              <div className="t-faint" style={{ fontSize:12.5, marginTop:3 }}>{m.type} · owner {m.owner} · champion {champ.v}</div>
            </div>
            <div className="row gap-8"><button className="btn"><Icon name="history" size={15}/>Compare</button><button className="btn primary"><Icon name="rocket" size={15}/>New version</button></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
            <Stat label={m.m1.n} value={m.m1.v} valueColor="var(--ok)"/>
            <Stat label={m.m2.n} value={m.m2.v}/>
            <Stat label="Inference" value={m.deploy.p95} valueColor={m.deploy.live?"var(--accent)":"var(--text-faint)"}/>
          </div>
          <div className="eyebrow" style={{ marginBottom:10 }}>Versions</div>
          <div className="card" style={{ overflow:"hidden", marginBottom:22 }}>
            <table className="tbl">
              <thead><tr><th>Version</th><th>Status</th><th>{m.m1.n}</th><th>{m.m2.n}</th><th>By</th><th>When</th><th></th></tr></thead>
              <tbody>
                {m.versions.map(v=>{ const s=VST[v.st]; return (
                  <tr key={v.v}>
                    <td className="mono" style={{ color:"var(--text)", fontWeight:600 }}>{v.v}</td>
                    <td>{v.st==="champion"?<Badge kind="accent" dot><Icon name="crown" size={11}/> champion</Badge>:<Badge kind={s.kind} dot>{s.label}</Badge>}</td>
                    <td className="mono">{v.a.split(" ")[1]}</td>
                    <td className="mono">{v.b.split(" ")[1]}</td>
                    <td>{v.by}</td>
                    <td className="mono t-faint">{v.when}</td>
                    <td style={{ textAlign:"right" }}>{v.st==="archived" && <button className="btn ghost sm">Promote</button>}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          <div className="eyebrow" style={{ marginBottom:10 }}>Deploy as function</div>
          <div className="card" style={{ padding:16, marginBottom:22 }}>
            <div className="row between center" style={{ marginBottom:14 }}>
              <div className="row gap-10 center"><span style={{ color:m.deploy.live?"var(--ok)":"var(--text-faint)" }}><Icon name="func" size={18}/></span><div><div className="mono" style={{ fontSize:13, fontWeight:600 }}>{m.deploy.fn}</div><div className="t-faint mono" style={{ fontSize:11, marginTop:2 }}>{m.deploy.endpoint}</div></div></div>
              <span className="row gap-8 center"><span className="t-faint" style={{ fontSize:11.5 }}>{m.deploy.live?"Live":"Offline"}</span><Switch on={m.deploy.live} onChange={()=>{}}/></span>
            </div>
            <div className="row between center" style={{ paddingTop:12, borderTop:"1px solid var(--line-soft)" }}>
              <div className="row gap-16">
                <div><div className="t-faint" style={{ fontSize:10.5 }}>Calls</div><div className="mono" style={{ fontSize:13, marginTop:2 }}>{m.deploy.calls}</div></div>
                <div><div className="t-faint" style={{ fontSize:10.5 }}>p95 latency</div><div className="mono" style={{ fontSize:13, marginTop:2 }}>{m.deploy.p95}</div></div>
              </div>
              <Spark data={m.deploy.spark} w={120} h={30} area color={m.deploy.live?"var(--accent)":"var(--text-faint)"} fill={m.deploy.live?"var(--accent-ghost)":"color-mix(in oklab, var(--text-faint) 14%, transparent)"}/>
            </div>
          </div>
          <div className="eyebrow" style={{ marginBottom:10 }}>Lineage</div>
          <div className="card" style={{ padding:16 }}>
            <Lineage chain={[
              ...m.inputs.map(i=>({ stage:"Entrada", label:i, glyph:"layers" })),
              { stage:"Modelo", label:`${m.name}:${champ.v}`, glyph:"model" },
              { stage:"Función", label:`${m.deploy.fn.split("(")[0]}()`, glyph:"func" },
            ]} />
            <div style={{ marginTop:14 }}><div className="t-faint" style={{ fontSize:11, marginBottom:7 }}>Consumed by</div>
              <div className="row gap-6 wrap">{m.usedBy.map(u=><span key={u} className="chip" style={{ cursor:"default" }}>{u}</span>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ObjectivesTab(){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="ML · objectives" title="Modeling objectives" sub="Each objective frames a problem, its data, the metric to beat and the candidate models competing for champion." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))", gap:16 }}>
          {OBJECTIVES.map(o=>(
            <div key={o.name} className="card" style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
              <div className="row between center"><span style={{ color:"var(--accent)" }}><Icon name="target" size={20}/></span><Badge kind={o.status==="deployed"?"ok":"warn"} dot>{o.status}</Badge></div>
              <div><div style={{ fontSize:15, fontWeight:600 }}>{o.name}</div><div className="t-faint mono" style={{ fontSize:12, marginTop:3 }}>{o.model} · {o.type}</div></div>
              <div className="row between center" style={{ padding:"10px 0", borderTop:"1px solid var(--line-soft)", borderBottom:"1px solid var(--line-soft)" }}>
                <div><div className="t-faint" style={{ fontSize:10.5 }}>Target metric</div><div className="mono" style={{ fontSize:14, marginTop:2 }}>{o.metric.n} {o.metric.v}</div></div>
                <div style={{ textAlign:"right" }}><div className="t-faint" style={{ fontSize:10.5 }}>Champion</div><div className="mono t-accent" style={{ fontSize:14, marginTop:2 }}>{o.champion}</div></div>
              </div>
              <div className="row between center"><span className="t-faint" style={{ fontSize:11.5 }}>{o.candidates} candidates · {o.datasets.length} datasets</span><button className="btn ghost sm">Open <Icon name="arrowRight" size={13}/></button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function DeploymentsTab(){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:980, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="ML · serving" title="Deployments" />
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>Function</th><th>Model</th><th>Mode</th><th>Calls</th><th>p95</th><th>Status</th></tr></thead>
            <tbody>
              {MODELS.map(m=>(
                <tr key={m.id}>
                  <td><span className="row gap-8 center"><span style={{ color:m.deploy.live?"var(--accent)":"var(--text-faint)" }}><Icon name="func" size={15}/></span><span className="mono" style={{ color:"var(--text)" }}>{m.deploy.fn.split("(")[0]}()</span></span></td>
                  <td className="mono t-dim">{m.name}:{m.versions.find(v=>v.st==="champion")?.v}</td>
                  <td>{m.deploy.live?"Live":"Batch"}</td>
                  <td className="mono">{m.deploy.calls}</td>
                  <td className="mono">{m.deploy.p95}</td>
                  <td>{m.deploy.live?<Badge kind="ok" dot>serving</Badge>:<Badge kind="warn" dot>offline</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ModelsView(){
  const [tab,setTab] = useState("registry");
  const TABS = [["registry","Registry"],["objectives","Objectives"],["deploy","Deployments"]];
  return (
    <>
      <div style={{ padding:"0 28px", borderBottom:"1px solid var(--line-soft)", background:"var(--bg-1)", flex:"none" }}>
        <Tabs variant="flush"
          items={TABS.map(([k,l])=>({ label:l }))}
          value={TABS.findIndex(([k])=>k===tab)}
          onChange={i=>setTab(TABS[i][0])} />
      </div>
      {tab==="registry" && <Registry/>}
      {tab==="objectives" && <ObjectivesTab/>}
      {tab==="deploy" && <DeploymentsTab/>}
    </>
  );
}
