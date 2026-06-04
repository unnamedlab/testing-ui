import { useEffect, useRef, useState } from 'react';
import { AGENTS, EVALS, FUNCTIONS, TOOLS } from '../data/data_agents.js';

const RSN_TABS = [["agents","Agent Studio"],["logic","Logic functions"],["evals","Evals"]];
import { ENTITY_BY_ID } from '../data/data.js';
import { AnswerCard, ArtifactExplorer, Badge, ColorGlyph, Icon, MasterItem, MasterList, PageHeader, Switch, Tabs, TypeGlyph } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Reason · Agent / Logic builder
   Agents = instructions + tools + guardrails; runs produce a
   grounded answer (cited objects) and may propose an Action.
   ============================================================ */
function ent(id){ return ENTITY_BY_ID[id] || { name:id, type:"txn", sub:"" }; }
function AgentGlyph({ a, size }){ return <ColorGlyph icon={a.icon} color={a.color} size={size||38} />; }

function Console({ agent }){
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
    <aside style={{ width:"var(--drawer)", flex:"none", borderLeft:"1px solid var(--line-soft)", background:"var(--bg-inset)", display:"flex", flexDirection:"column", minHeight:0 }}>
      <div className="row between center" style={{ padding:"13px 16px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
        <div className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="play" size={16}/></span><span className="serif" style={{ fontSize:15 }}>Test console</span></div>
        <Badge>preview</Badge>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:16 }}>
        <div className="row gap-8 center" style={{ background:"var(--bg-1)", border:"1px solid var(--line)", borderRadius:11, padding:"6px 6px 6px 12px", marginBottom:14 }}>
          <input defaultValue={agent.sample} style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13 }}/>
          <button className="btn primary sm" style={{ width:34, padding:0 }} onClick={run}><Icon name="play" size={15}/></button>
        </div>
        {phase==="idle" && <div className="col center" style={{ padding:"40px 0", gap:10, color:"var(--text-faint)" }}><Icon name="sparkles" size={24}/><span style={{ fontSize:12.5 }}>Run the agent to see its reasoning</span></div>}
        {phase!=="idle" && <>
          <div className="eyebrow" style={{ marginBottom:10 }}>Reasoning trace</div>
          <div style={{ position:"relative", paddingLeft:18, marginBottom:16 }}>
            <div style={{ position:"absolute", left:7, top:4, bottom:8, width:2, background:"var(--line)" }}/>
            {r.steps.slice(0,shown).map((s,i)=>{ const t=TOOLS[s.tool]; return (
              <div key={i} className="fade-in" style={{ position:"relative", paddingBottom:14 }}>
                <span style={{ position:"absolute", left:-18, top:1, width:16, height:16, borderRadius:5, display:"grid", placeItems:"center", background:"var(--bg-3)", color:"var(--accent)", border:"2px solid var(--bg-inset)" }}><Icon name={t.icon} size={10}/></span>
                <div style={{ fontSize:12, fontWeight:600 }}>{t.name}</div>
                <div className="mono" style={{ fontSize:11, color:"var(--accent-2)", margin:"2px 0" }}>{s.arg}</div>
                <div className="t-dim" style={{ fontSize:11.5, lineHeight:1.45 }}>→ {s.out}</div>
              </div>
            );})}
            {phase==="running" && <div className="row gap-6 center t-faint" style={{ fontSize:12 }}><span className="live-dot" style={{ background:"var(--accent)" }}/>thinking…</div>}
          </div>
          {phase==="done" && <>
            <AnswerCard text={r.answer} cites={r.cites} style={{ marginBottom:12 }} />
            {r.action && (
              <div className="card" style={{ padding:14, borderLeft:"3px solid var(--accent)", background:"var(--bg-1)" }}>
                <div className="row gap-8 center" style={{ marginBottom:10 }}><span style={{ color:"var(--accent)" }}><Icon name="bolt" size={15}/></span><span className="eyebrow">Proposed action</span></div>
                <div className="row gap-10 center" style={{ marginBottom:12 }}>
                  <TypeGlyph type={ent(r.action.target).type} size={30}/>
                  <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600 }}>{r.action.type}</div><div className="t-faint" style={{ fontSize:11 }}>on {ent(r.action.target).name} · approval: {r.action.approval}</div></div>
                </div>
                {sent
                  ? <div className="row gap-8 center" style={{ padding:"8px 10px", background:"var(--warn-ghost)", borderRadius:8, color:"var(--warn)" }}><Icon name="check" size={15}/><span style={{ fontSize:12, fontWeight:600 }}>Sent to Action center · pending approval</span></div>
                  : <button className="btn primary sm" style={{ width:"100%" }} onClick={()=>setSent(true)}><Icon name="arrowRight" size={14}/>Send for approval</button>}
                <div className="t-faint" style={{ fontSize:10.5, marginTop:8, textAlign:"center" }}>The agent proposes — a human applies. Never auto-executed.</div>
              </div>
            )}
          </>}
        </>}
      </div>
    </aside>
  );
}
function Builder({ agent }){
  const [tools,setTools] = useState({});
  const [approval,setApproval] = useState(true);
  const [grounding,setGrounding] = useState(true);
  useEffect(()=>{ const o={}; Object.keys(TOOLS).forEach(k=>o[k]=agent.tools.includes(k)); setTools(o); setApproval(agent.approval); setGrounding(agent.grounding); }, [agent.id]);
  return (
    <div style={{ flex:1, overflow:"auto", padding:"22px 24px 50px", minWidth:0 }}>
      <div style={{ maxWidth:640 }}>
        <div className="row gap-12 center" style={{ marginBottom:6 }}>
          <AgentGlyph a={agent} size={44}/>
          <div style={{ flex:1, minWidth:0 }}><h1 className="serif" style={{ fontSize:24, fontWeight:500, margin:0, letterSpacing:"-0.01em" }}>{agent.name}</h1><div className="t-faint" style={{ fontSize:12.5, marginTop:2 }}>{agent.desc}</div></div>
        </div>
        <div className="row gap-6 wrap" style={{ margin:"12px 0 20px" }}>
          <span className="chip"><Icon name="cpu" size={13}/>{agent.model}</span>
          <span className="chip"><Icon name="folder" size={13}/>scope: {agent.scope}</span>
        </div>
        <div className="eyebrow" style={{ marginBottom:8 }}>Instructions</div>
        <textarea defaultValue={agent.instructions} style={{ width:"100%", minHeight:96, background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:10, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13, lineHeight:1.55, padding:12, resize:"vertical", outline:"none", marginBottom:22 }}/>
        <div className="eyebrow" style={{ marginBottom:10 }}>Tools <span className="t-faint" style={{ textTransform:"none", letterSpacing:0 }}>· what the agent may call</span></div>
        <div className="card" style={{ overflow:"hidden", marginBottom:22 }}>
          {Object.keys(TOOLS).map((k,i)=>{ const t=TOOLS[k]; const on=tools[k]; return (
            <div key={k} className="row gap-12 center" style={{ padding:"12px 14px", borderBottom: i<Object.keys(TOOLS).length-1?"1px solid var(--line-soft)":"none" }}>
              <span style={{ width:30,height:30,borderRadius:8,flex:"none",display:"grid",placeItems:"center", background:on?"var(--accent-ghost)":"var(--bg-2)", color:on?"var(--accent)":"var(--text-faint)" }}><Icon name={t.icon} size={16}/></span>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, color:on?"var(--text)":"var(--text-dim)" }}>{t.name}</div><div className="t-faint" style={{ fontSize:11.5, marginTop:1 }}>{t.desc}</div></div>
              <Switch on={on} onChange={v=>setTools(s=>({...s,[k]:v}))}/>
            </div>
          );})}
        </div>
        <div className="eyebrow" style={{ marginBottom:10 }}>Guardrails</div>
        <div className="card" style={{ padding:"4px 14px" }}>
          {[["Require human approval for actions",approval,setApproval,"Proposed actions never auto-apply"],["Grounding required",grounding,setGrounding,"Every claim must cite an object or document"]].map(([l,v,set,sub],i)=>(
            <div key={i} className="row between center" style={{ padding:"12px 0", borderBottom: i===0?"1px solid var(--line-soft)":"none" }}>
              <div style={{ flex:1, paddingRight:12 }}><div style={{ fontSize:13, fontWeight:600 }}>{l}</div><div className="t-faint" style={{ fontSize:11.5, marginTop:1 }}>{sub}</div></div>
              <Switch on={v} onChange={set}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function AgentsTab(){
  const [selId,setSelId] = useState(AGENTS[0].id);
  const agent = AGENTS.find(a=>a.id===selId);
  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <MasterList title="Agents" count={AGENTS.length} onAdd={()=>{}}>
          {AGENTS.map(a=>(
            <MasterItem key={a.id} active={selId===a.id} onClick={()=>setSelId(a.id)}>
              <AgentGlyph a={a} size={32}/>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:selId===a.id?"var(--text)":"var(--text-dim)" }}>{a.name}</div><div className="t-faint" style={{ fontSize:10.5, marginTop:1 }}>{a.tools.length} tools{a.approval?" · gated":""}</div></div>
            </MasterItem>
          ))}
      </MasterList>
      <Builder agent={agent}/>
      <Console agent={agent}/>
    </div>
  );
}
function LogicTab(){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Reason · Logic" title="Functions" sub="Reusable, typed building blocks — deterministic logic the agents and the ontology call." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {FUNCTIONS.map(f=>(
            <div key={f.name} className="card" style={{ padding:18 }}>
              <div className="row gap-10 center" style={{ marginBottom:10 }}><span style={{ color:"var(--violet)" }}><Icon name="code" size={18}/></span><span className="mono" style={{ fontSize:13, fontWeight:600 }}>{f.name}</span></div>
              <div className="mono" style={{ fontSize:11.5, color:"var(--accent-2)", marginBottom:12, padding:"6px 9px", background:"var(--bg-inset)", borderRadius:7 }}>{f.sig}</div>
              <div className="col gap-2">{f.steps.map((s,i)=>(<div key={i} className="row gap-8 center" style={{ padding:"5px 0" }}><span className="mono t-faint" style={{ fontSize:10, width:14 }}>{i+1}</span><span className="t-dim" style={{ fontSize:12 }}>{s}</span></div>))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function EvalsTab(){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page-narrow)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Reason · Evaluation" title="Evals" />
        <ArtifactExplorer items={EVALS} columns={[
          { header:"Agent", render:e=><span style={{ color:"var(--text)", fontWeight:600 }}>{e.agent}</span> },
          { header:"Test cases", render:e=><span className="mono">{e.cases}</span> },
          { header:"Passing", render:e=><span className="mono">{e.pass}/{e.cases}</span> },
          { header:"Score", render:e=>{ const pct=parseInt(e.score); return <span className="row gap-8 center" style={{ maxWidth:140 }}><div className="meter" style={{ flex:1 }}><i style={{ width:e.score, background: pct>=95?"var(--ok)":pct>=85?"var(--warn)":"var(--alert)" }}/></div><span className="mono" style={{ fontSize:11.5, color: pct>=95?"var(--ok)":pct>=85?"var(--warn)":"var(--alert)" }}>{e.score}</span></span>; } },
          { header:"Last run", render:e=><span className="mono t-faint">{e.last}</span> },
          { header:"", align:"right", render:()=><button className="btn ghost sm"><Icon name="play" size={13}/>Run</button> },
        ]} />
      </div>
    </div>
  );
}

export function ReasonView(){
  const [tab,setTab] = useState("agents");
  return (
    <>
      <div className="row between center" style={{ padding:"0 28px", borderBottom:"1px solid var(--line-soft)", background:"var(--bg-1)", flex:"none" }}>
        <Tabs variant="flush"
          items={RSN_TABS.map(([k,l])=>({ label:l }))}
          value={RSN_TABS.findIndex(([k])=>k===tab)}
          onChange={i=>setTab(RSN_TABS[i][0])} />
        {tab==="agents" && <button className="btn primary sm"><Icon name="check" size={14}/>Publish agent</button>}
      </div>
      {tab==="agents" && <AgentsTab/>}
      {tab==="logic" && <LogicTab/>}
      {tab==="evals" && <EvalsTab/>}
    </>
  );
}
