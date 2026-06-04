import { useEffect, useRef, useState } from 'react';
import { AGENTS, EVALS, FUNCTIONS, TOOLS } from '../data/data_agents.js';
import { ENTITY_BY_ID } from '../data/data.js';
import { Badge, Icon, Switch, WBBar, TypeGlyph, CatalogGrid, CatalogCard, PageHeader } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Reason · Agent / Logic builder (UX-01 i18n)
   ============================================================ */
function ent(id){ return ENTITY_BY_ID[id] || { name:id, type:"txn", sub:"" }; }
function AgentGlyph({ a, size }){
  const s=size||38;
  return <div style={{ width:s,height:s,borderRadius:Math.round(s*0.28),flex:"none",display:"grid",placeItems:"center",
    background:`color-mix(in oklab, ${a.color} 16%, var(--bg-2))`, color:a.color, boxShadow:`inset 0 0 0 1px color-mix(in oklab, ${a.color} 32%, transparent)` }}>
    <Icon name={a.icon} size={Math.round(s*0.5)}/></div>;
}
function mdBold(t){ return t.split(/(\*\*[^*]+\*\*)/g).map((p,i)=> p.startsWith("**") ? <b key={i} style={{ color:"var(--text)", fontWeight:600 }}>{p.slice(2,-2)}</b> : <span key={i}>{p}</span>); }

function Console({ agent }){
  const { t: tr } = useI18n();
  const [phase,setPhase] = useState("idle");
  const [shown,setShown] = useState(0);
  const [sent,setSent] = useState(false);
  const timers = useRef([]);
  useEffect(()=>{ timers.current.forEach(clearTimeout); timers.current=[]; setPhase("idle"); setShown(0); setSent(false); }, [agent.id]);
  function run(){
    timers.current.forEach(clearTimeout); timers.current=[]; setSent(false); setPhase("running"); setShown(0);
    const steps=agent.run.steps;
    steps.forEach((_,i)=> timers.current.push(setTimeout(()=>setShown(i+1), 550*(i+1))));
    timers.current.push(setTimeout(()=>setPhase("done"), 550*steps.length + 400));
  }
  const r = agent.run;
  return (
    <aside style={{ width:392, flex:"none", borderLeft:"1px solid var(--line-soft)", background:"var(--bg-inset)", display:"flex", flexDirection:"column", minHeight:0 }}>
      <div className="row between center" style={{ padding:"13px 16px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
        <div className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="play" size={16}/></span><span className="serif" style={{ fontSize:15 }}>{tr('Test console')}</span></div>
        <Badge>{tr('preview')}</Badge>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:16 }}>
        <div className="row gap-8 center" style={{ background:"var(--bg-1)", border:"1px solid var(--line)", borderRadius:11, padding:"6px 6px 6px 12px", marginBottom:14 }}>
          <input defaultValue={agent.sample} style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13 }}/>
          <button className="btn primary sm" style={{ width:34, padding:0 }} onClick={run}><Icon name="play" size={15}/></button>
        </div>
        {phase==="idle" && <div className="col center" style={{ padding:"40px 0", gap:10, color:"var(--text-faint)" }}><Icon name="sparkles" size={24}/><span style={{ fontSize:12.5 }}>{tr('Run the agent to see its reasoning')}</span></div>}
        {phase!=="idle" && <>
          <div className="eyebrow" style={{ marginBottom:10 }}>{tr('Reasoning trace')}</div>
          <div style={{ position:"relative", paddingLeft:18, marginBottom:16 }}>
            <div style={{ position:"absolute", left:7, top:4, bottom:8, width:2, background:"var(--line)" }}/>
            {r.steps.slice(0,shown).map((s,i)=>{ const tl=TOOLS[s.tool]; return (
              <div key={i} className="fade-in" style={{ position:"relative", paddingBottom:14 }}>
                <span style={{ position:"absolute", left:-18, top:1, width:16, height:16, borderRadius:5, display:"grid", placeItems:"center", background:"var(--bg-3)", color:"var(--accent)", border:"2px solid var(--bg-inset)" }}><Icon name={tl.icon} size={10}/></span>
                <div style={{ fontSize:12, fontWeight:600 }}>{tr(tl.name)}</div>
                <div className="mono" style={{ fontSize:11, color:"var(--accent-2)", margin:"2px 0" }}>{s.arg}</div>
                <div className="t-dim" style={{ fontSize:11.5, lineHeight:1.45 }}>→ {s.out}</div>
              </div>
            );})}
            {phase==="running" && <div className="row gap-6 center t-faint" style={{ fontSize:12 }}><span className="live-dot" style={{ background:"var(--accent)" }}/>{tr('thinking…')}</div>}
          </div>
          {phase==="done" && <>
            <div className="card" style={{ padding:14, marginBottom:12, background:"var(--bg-1)" }}>
              <div className="row gap-8 center" style={{ marginBottom:8 }}><span style={{ color:"var(--accent)" }}><Icon name="sparkles" size={15}/></span><span className="eyebrow">{tr('Grounded answer')}</span></div>
              <p style={{ fontSize:13, lineHeight:1.6, margin:0 }} className="t-dim">{mdBold(r.answer)}</p>
              <div className="row gap-6 wrap" style={{ marginTop:12 }}>
                {r.cites.map(id=>{ const e=ent(id); return (
                  <span key={id} className="row gap-6 center" style={{ background:"var(--bg-2)", border:"1px solid var(--line-soft)", borderRadius:7, padding:"3px 8px 3px 4px" }}>
                    <TypeGlyph type={e.type} size={18}/><span style={{ fontSize:11.5, fontWeight:600 }}>{e.name}</span>
                  </span>
                );})}
              </div>
            </div>
            {r.action && (
              <div className="card" style={{ padding:14, borderLeft:"3px solid var(--accent)", background:"var(--bg-1)" }}>
                <div className="row gap-8 center" style={{ marginBottom:10 }}><span style={{ color:"var(--accent)" }}><Icon name="bolt" size={15}/></span><span className="eyebrow">{tr('Proposed action')}</span></div>
                <div className="row gap-10 center" style={{ marginBottom:12 }}>
                  <TypeGlyph type={ent(r.action.target).type} size={30}/>
                  <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600 }}>{tr(r.action.type)}</div><div className="t-faint" style={{ fontSize:11 }}>{tr('on {name} · approval: {a}', { name: ent(r.action.target).name, a: r.action.approval })}</div></div>
                </div>
                {sent
                  ? <div className="row gap-8 center" style={{ padding:"8px 10px", background:"var(--warn-ghost)", borderRadius:8, color:"var(--warn)" }}><Icon name="check" size={15}/><span style={{ fontSize:12, fontWeight:600 }}>{tr('Sent to Action center · pending approval')}</span></div>
                  : <button className="btn primary sm" style={{ width:"100%" }} onClick={()=>setSent(true)}><Icon name="arrowRight" size={14}/>{tr('Send for approval')}</button>}
                <div className="t-faint" style={{ fontSize:10.5, marginTop:8, textAlign:"center" }}>{tr('The agent proposes — a human applies. Never auto-executed.')}</div>
              </div>
            )}
          </>}
        </>}
      </div>
    </aside>
  );
}
function Builder({ agent }){
  const { t: tr } = useI18n();
  const [tools,setTools] = useState({});
  const [approval,setApproval] = useState(true);
  const [grounding,setGrounding] = useState(true);
  useEffect(()=>{ const o={}; Object.keys(TOOLS).forEach(k=>o[k]=agent.tools.includes(k)); setTools(o); setApproval(agent.approval); setGrounding(agent.grounding); }, [agent.id]);
  return (
    <div style={{ flex:1, overflow:"auto", padding:"22px 24px 50px", minWidth:0 }}>
      <div style={{ maxWidth:640 }}>
        <PageHeader glyph={<AgentGlyph a={agent} size={44}/>} title={tr(agent.name)} sub={tr(agent.desc)} />
        <div className="row gap-6 wrap" style={{ margin:"12px 0 20px" }}>
          <span className="chip"><Icon name="cpu" size={13}/>{agent.model}</span>
          <span className="chip"><Icon name="folder" size={13}/>{tr('scope: {s}', { s: tr(agent.scope) })}</span>
        </div>
        <div className="eyebrow" style={{ marginBottom:8 }}>{tr('Instructions')}</div>
        <textarea defaultValue={agent.instructions} style={{ width:"100%", minHeight:96, background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:10, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13, lineHeight:1.55, padding:12, resize:"vertical", outline:"none", marginBottom:22 }}/>
        <div className="eyebrow" style={{ marginBottom:10 }}>{tr('Tools')} <span className="t-faint" style={{ textTransform:"none", letterSpacing:0 }}>· {tr('what the agent may call')}</span></div>
        <div className="card" style={{ overflow:"hidden", marginBottom:22 }}>
          {Object.keys(TOOLS).map((k,i)=>{ const tl=TOOLS[k]; const on=tools[k]; return (
            <div key={k} className="row gap-12 center" style={{ padding:"12px 14px", borderBottom: i<Object.keys(TOOLS).length-1?"1px solid var(--line-soft)":"none" }}>
              <span style={{ width:30,height:30,borderRadius:8,flex:"none",display:"grid",placeItems:"center", background:on?"var(--accent-ghost)":"var(--bg-2)", color:on?"var(--accent)":"var(--text-faint)" }}><Icon name={tl.icon} size={16}/></span>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, color:on?"var(--text)":"var(--text-dim)" }}>{tr(tl.name)}</div><div className="t-faint" style={{ fontSize:11.5, marginTop:1 }}>{tr(tl.desc)}</div></div>
              <Switch on={on} onChange={v=>setTools(s=>({...s,[k]:v}))} label={tr(tl.name)}/>
            </div>
          );})}
        </div>
        <div className="eyebrow" style={{ marginBottom:10 }}>{tr('Guardrails')}</div>
        <div className="card" style={{ padding:"4px 14px" }}>
          {[["Require human approval for actions",approval,setApproval,"Proposed actions never auto-apply"],["Grounding required",grounding,setGrounding,"Every claim must cite an object or document"]].map(([l,v,set,sub],i)=>(
            <div key={i} className="row between center" style={{ padding:"12px 0", borderBottom: i===0?"1px solid var(--line-soft)":"none" }}>
              <div style={{ flex:1, paddingRight:12 }}><div style={{ fontSize:13, fontWeight:600 }}>{tr(l)}</div><div className="t-faint" style={{ fontSize:11.5, marginTop:1 }}>{tr(sub)}</div></div>
              <Switch on={v} onChange={set} label={tr(l)}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function AgentsTab(){
  const { t: tr } = useI18n();
  const [selId,setSelId] = useState(AGENTS[0].id);
  const agent = AGENTS.find(a=>a.id===selId);
  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <aside style={{ width:"var(--master-w)", flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
        <div className="row between center" style={{ padding:"14px 14px 8px" }}><div className="eyebrow">{tr('Agents')} · {AGENTS.length}</div><button className="btn ghost sm" style={{ width:26, padding:0 }}><Icon name="plus" size={15}/></button></div>
        <div style={{ padding:"0 8px 16px" }}>
          {AGENTS.map(a=>(
            <button key={a.id} onClick={()=>setSelId(a.id)} className="row gap-10 center" style={{ width:"100%", textAlign:"left", border:"none", background:selId===a.id?"var(--accent-ghost)":"none", borderRadius:9, padding:"10px", cursor:"pointer", marginBottom:2, boxShadow:selId===a.id?"inset 0 0 0 1px var(--accent-dim)":"none" }}>
              <AgentGlyph a={a} size={32}/>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:selId===a.id?"var(--text)":"var(--text-dim)" }}>{tr(a.name)}</div><div className="t-faint" style={{ fontSize:10.5, marginTop:1 }}>{tr('{n} tools', { n: a.tools.length })}{a.approval?" · "+tr('gated'):""}</div></div>
            </button>
          ))}
        </div>
      </aside>
      <Builder agent={agent}/>
      <Console agent={agent}/>
    </div>
  );
}
function LogicTab(){
  const { t: tr } = useI18n();
  return (
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow={tr('Decide & Act')} title={tr('Functions')}
          sub={tr('Reusable, typed building blocks — deterministic logic the agents and the ontology call.')} />
        <CatalogGrid min={300}>
          {FUNCTIONS.map(f=>(
            <CatalogCard key={f.name} icon="code" iconColor="var(--violet)" title={f.name} mono>
              <div className="mono" style={{ fontSize:11.5, color:"var(--accent-2)", padding:"6px 9px", background:"var(--bg-inset)", borderRadius:7 }}>{f.sig}</div>
              <div className="col gap-2">{f.steps.map((s,i)=>(<div key={i} className="row gap-8 center" style={{ padding:"5px 0" }}><span className="mono t-faint" style={{ fontSize:10, width:14 }}>{i+1}</span><span className="t-dim" style={{ fontSize:12 }}>{tr(s)}</span></div>))}</div>
            </CatalogCard>
          ))}
        </CatalogGrid>
      </div>
    </div>
  );
}
function EvalsTab(){
  const { t: tr } = useI18n();
  return (
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:920, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow={tr('Decide & Act')} title={tr('Evals')} />
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>{tr('Agent')}</th><th>{tr('Test cases')}</th><th>{tr('Passing')}</th><th>{tr('Score')}</th><th>{tr('Last run')}</th><th></th></tr></thead>
            <tbody>
              {EVALS.map(e=>{ const pct=parseInt(e.score); return (
                <tr key={e.agent}>
                  <td style={{ color:"var(--text)", fontWeight:600 }}>{tr(e.agent)}</td>
                  <td className="mono">{e.cases}</td><td className="mono">{e.pass}/{e.cases}</td>
                  <td><span className="row gap-8 center" style={{ maxWidth:140 }}><div className="meter" style={{ flex:1 }}><i style={{ width:e.score, background: pct>=95?"var(--ok)":pct>=85?"var(--warn)":"var(--alert)" }}/></div><span className="mono" style={{ fontSize:11.5, color: pct>=95?"var(--ok)":pct>=85?"var(--warn)":"var(--alert)" }}>{e.score}</span></span></td>
                  <td className="mono t-faint">{e.last}</td>
                  <td style={{ textAlign:"right" }}><button className="btn ghost sm"><Icon name="play" size={13}/>{tr('Run')}</button></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ReasonView(){
  const { t: tr } = useI18n();
  const [tab,setTab] = useState("agents");
  return (
    <>
      <WBBar mode={tab} setMode={setTab}
        tabs={[["agents","Agent Studio"],["logic","Logic functions"],["evals","Evals"]]}
        actions={tab==="agents" && <button className="btn primary sm"><Icon name="check" size={14}/>{tr('Publish agent')}</button>} />
      {tab==="agents" && <AgentsTab/>}
      {tab==="logic" && <LogicTab/>}
      {tab==="evals" && <EvalsTab/>}
    </>
  );
}
