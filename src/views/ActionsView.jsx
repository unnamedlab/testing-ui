import { useEffect, useState } from 'react';
import { ACTION_TYPES, AUTO_RULES, EFFECT, SEED_ACTIONS, nextId } from '../data/data_actions.js';
import { ENTITY_BY_ID, TYPE_BY_ID } from '../data/data.js';
import { ANALYSTS } from '../data/data_ext.js';
import { ArtifactExplorer, Avatar, Badge, ColorGlyph, Icon, Modal, PageHeader, Switch, Tabs, TypeGlyph } from '../components/ui.jsx';
import { MarkingChip } from '../components/Security.jsx';
import { RulesEngine } from '../components/RulesEngine.jsx';

const ACT_TABS = [["center","Action center"],["catalog","Action types"],["auto","Automations"],["log","Log"]];

/* ============================================================
   AXIOM — Actions / write-back
   Ontology objects become operational: parameters → effects
   (write-back) → approval → audit.
   ============================================================ */
const ME = "AR";
const TARGETS = ["a-aurora-usd","v-blackfrost","o-helios","p-sorenson","o-northwind","a-helios-eur"];

const STATUS = {
  pending:  { kind:"warn",   label:"pending approval" },
  executing:{ kind:"accent", label:"executing" },
  applied:  { kind:"ok",     label:"applied" },
  rejected: { kind:"alert",  label:"rejected" },
};
function StatusBadge({ s }){ const m=STATUS[s]; return <Badge kind={m.kind} dot>{m.label}</Badge>; }
function ActionGlyph({ type, size }){ const a=ACTION_TYPES[type]; return <ColorGlyph icon={a.icon} color={a.color} size={size||38} />; }
function EffectRow({ e }){
  const m=EFFECT[e.kind];
  return <div className="row gap-10" style={{ padding:"8px 0", alignItems:"flex-start" }}>
    <span style={{ width:24,height:24,borderRadius:7,flex:"none",display:"grid",placeItems:"center",color:m.c,background:`color-mix(in oklab, ${m.c} 15%, transparent)` }}><Icon name={m.icon} size={14}/></span>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:12.5, color:"var(--text)" }}>{e.text}</div>
      <div className="t-faint mono" style={{ fontSize:10, marginTop:1, letterSpacing:".06em", textTransform:"uppercase" }}>{m.label}</div>
    </div>
  </div>;
}
function Param({ p, value, onChange }){
  if(p.type==="toggle") return <div className="row between center"><span style={{ fontSize:12.5, color:"var(--text-dim)" }}>{p.label}</span><Switch on={value} onChange={onChange}/></div>;
  if(p.type==="text") return (
    <div><div className="t-faint" style={{ fontSize:11.5, marginBottom:5 }}>{p.label}</div>
      <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={p.ph}
        style={{ width:"100%", padding:"8px 11px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13, outline:"none" }} /></div>
  );
  return (
    <div><div className="t-faint" style={{ fontSize:11.5, marginBottom:6 }}>{p.label}</div>
      <div className="row gap-6 wrap">{p.options.map(o=><button key={o} className={"chip"+(value===o?" on":"")} onClick={()=>onChange(o)}>{o}</button>)}</div></div>
  );
}
function initParams(at){ const o={}; ACTION_TYPES[at].params.forEach(p=>o[p.key]=p.def); return o; }

function InvokeModal({ preAction, onClose, onSubmit }){
  const [target,setTarget] = useState("a-aurora-usd");
  const objType = ENTITY_BY_ID[target].type;
  const applies = Object.keys(ACTION_TYPES).filter(k=>ACTION_TYPES[k].targets.includes(objType));
  const [actionId,setActionId] = useState(preAction && applies.includes(preAction) ? preAction : applies[0]);
  const [params,setParams] = useState(()=>initParams(actionId));
  const [just,setJust] = useState("");
  useEffect(()=>{ if(!applies.includes(actionId)) setActionId(applies[0]); }, [target]);
  useEffect(()=>{ setParams(initParams(actionId)); }, [actionId]);
  const at = ACTION_TYPES[actionId]; const needsApproval = at.approval.length>0;
  const o = ENTITY_BY_ID[target];
  return (
    <Modal open onClose={onClose} width="min(900px,96vw)" scrimPad={20} panelStyle={{ maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        <div className="row between center" style={{ padding:"15px 20px", borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row gap-10 center"><span style={{ color:"var(--accent)" }}><Icon name="bolt" size={18}/></span><span className="serif" style={{ fontSize:18 }}>Take an action</span></div>
          <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="x" size={16}/></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", minHeight:0, flex:1 }}>
          <div style={{ padding:20, overflow:"auto", borderRight:"1px solid var(--line-soft)" }}>
            <div className="eyebrow" style={{ marginBottom:8 }}>Target object</div>
            <div className="row gap-8 wrap" style={{ marginBottom:18 }}>
              {TARGETS.map(id=>(
                <button key={id} onClick={()=>setTarget(id)} className="row gap-8 center" style={{ border:"1px solid "+(target===id?"var(--accent)":"var(--line)"), background:target===id?"var(--accent-ghost)":"var(--bg-2)", borderRadius:9, padding:"6px 10px 6px 6px", cursor:"pointer" }}>
                  <TypeGlyph type={ENTITY_BY_ID[id].type} size={24}/><span style={{ fontSize:12.5, fontWeight:600, color:"var(--text)" }}>{ENTITY_BY_ID[id].name}</span>
                </button>
              ))}
            </div>
            <div className="eyebrow" style={{ marginBottom:8 }}>Action</div>
            <div className="row gap-8 wrap" style={{ marginBottom:18 }}>
              {applies.map(k=>(
                <button key={k} onClick={()=>setActionId(k)} className="row gap-8 center" style={{ border:"1px solid "+(actionId===k?"var(--accent)":"var(--line)"), background:actionId===k?"var(--accent-ghost)":"var(--bg-2)", borderRadius:9, padding:"6px 11px 6px 7px", cursor:"pointer" }}>
                  <span style={{ color:ACTION_TYPES[k].color }}><Icon name={ACTION_TYPES[k].icon} size={15}/></span>
                  <span style={{ fontSize:12.5, fontWeight:600, color:"var(--text)" }}>{ACTION_TYPES[k].name}</span>
                </button>
              ))}
            </div>
            <div className="eyebrow" style={{ marginBottom:10 }}>Parameters</div>
            <div className="col gap-14" style={{ marginBottom:18 }}>
              {at.params.map(p=><Param key={p.key} p={p} value={params[p.key]} onChange={v=>setParams(s=>({...s,[p.key]:v}))} />)}
            </div>
            <div className="eyebrow" style={{ marginBottom:6 }}>Justification <span className="t-faint" style={{ textTransform:"none", letterSpacing:0 }}>· logged with the action</span></div>
            <textarea value={just} onChange={e=>setJust(e.target.value)} placeholder="Why is this action warranted?"
              style={{ width:"100%", minHeight:62, background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13, padding:10, resize:"vertical", outline:"none" }} />
          </div>
          <div style={{ padding:20, overflow:"auto", background:"var(--bg-inset)" }}>
            <div className="card" style={{ padding:14, marginBottom:14, background:"var(--bg-1)" }}>
              <div className="row gap-10 center"><TypeGlyph type={o.type} size={34}/>
                <div style={{ minWidth:0 }}><div style={{ fontSize:13.5, fontWeight:600 }}>{o.name}</div><div className="t-faint" style={{ fontSize:11.5 }}>{TYPE_BY_ID[o.type].name} · {o.sub}</div></div>
              </div>
            </div>
            <div className="eyebrow" style={{ marginBottom:4 }}>On apply, AXIOM will</div>
            <div style={{ marginBottom:14 }}>{at.effects.map((e,i)=><EffectRow key={i} e={e}/>)}</div>
            <div className="card" style={{ padding:"11px 13px", background:"var(--bg-1)" }}>
              <div className="row between center" style={{ marginBottom: needsApproval?8:0 }}><span className="t-faint" style={{ fontSize:11.5 }}>Classification</span><MarkingChip level={at.cls} size="sm"/></div>
              {needsApproval && (
                <div className="row gap-8 center" style={{ paddingTop:8, borderTop:"1px solid var(--line-soft)" }}>
                  <span style={{ color:"var(--violet)" }}><Icon name="shield" size={15}/></span>
                  <span style={{ fontSize:11.5, color:"var(--text-dim)" }}>Requires approval: <b style={{ color:"var(--text)" }}>{at.approval.join(" + ")}</b></span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row between center" style={{ padding:"14px 20px", borderTop:"1px solid var(--line-soft)" }}>
          <span className="t-faint" style={{ fontSize:12 }}>{needsApproval ? "Submits for approval — not applied until reviewed." : "Applies immediately to the ontology and source systems."}</span>
          <div className="row gap-8">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={()=>onSubmit({ type:actionId, target, params, just })}><Icon name={needsApproval?"arrowRight":"bolt"} size={15}/>{needsApproval ? "Submit for approval" : "Apply action"}</button>
          </div>
        </div>
    </Modal>
  );
}
function ReviewModal({ act, onClose, onDecide }){
  const at = ACTION_TYPES[act.type]; const o = ENTITY_BY_ID[act.target];
  return (
    <Modal open onClose={onClose} width="min(560px,94vw)" scrimPad={20}>
        <div className="row between center" style={{ padding:"15px 20px", borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row gap-10 center"><ActionGlyph type={act.type} size={30}/><div><div style={{ fontSize:15, fontWeight:600 }}>{at.name}</div><div className="t-faint mono" style={{ fontSize:11 }}>{act.id}</div></div></div>
          <MarkingChip level={at.cls}/>
        </div>
        <div style={{ padding:20 }}>
          <div className="card" style={{ padding:13, marginBottom:14, background:"var(--bg-2)" }}>
            <div className="row gap-10 center"><TypeGlyph type={o.type} size={32}/><div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13.5, fontWeight:600 }}>{o.name}</div><div className="t-faint" style={{ fontSize:11.5 }}>{o.sub}</div></div><Badge kind="alert" dot>risk {o.risk}</Badge></div>
          </div>
          <div className="row gap-16" style={{ marginBottom:14 }}>
            <div><div className="t-faint" style={{ fontSize:11 }}>Requested by</div><div className="row gap-7 center" style={{ marginTop:4 }}><Avatar who={act.by} name={ANALYSTS[act.by]?.name} size={22}/><span style={{ fontSize:13 }}>{ANALYSTS[act.by].name}</span></div></div>
            <div><div className="t-faint" style={{ fontSize:11 }}>Parameters</div><div className="mono" style={{ fontSize:12, marginTop:5, color:"var(--text-dim)" }}>{Object.entries(act.params||{}).map(([k,v])=>k+": "+v).join(" · ")}</div></div>
          </div>
          {act.just && <div style={{ marginBottom:14 }}><div className="t-faint" style={{ fontSize:11, marginBottom:4 }}>Justification</div><div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.5 }}>{act.just}</div></div>}
          <div className="eyebrow" style={{ marginBottom:4 }}>Effects</div>
          <div style={{ marginBottom:6 }}>{at.effects.map((e,i)=><EffectRow key={i} e={e}/>)}</div>
        </div>
        <div className="row between center" style={{ padding:"14px 20px", borderTop:"1px solid var(--line-soft)" }}>
          <span className="t-faint" style={{ fontSize:11.5 }}>Two-person integrity · you are <b style={{ color:"var(--text)" }}>{ANALYSTS[ME].name}</b></span>
          <div className="row gap-8"><button className="btn" onClick={()=>onDecide("rejected")}><Icon name="x" size={15}/>Reject</button><button className="btn primary" onClick={()=>onDecide("approve")}><Icon name="check" size={15}/>Approve &amp; apply</button></div>
        </div>
    </Modal>
  );
}
function PendingCard({ act, onReview }){
  const at=ACTION_TYPES[act.type]; const o=ENTITY_BY_ID[act.target];
  return (
    <div className="card" style={{ padding:16, borderLeft:`3px solid ${at.color}` }}>
      <div className="row between center" style={{ marginBottom:12 }}>
        <div className="row gap-12 center"><ActionGlyph type={act.type} size={36}/><div><div style={{ fontSize:14.5, fontWeight:600 }}>{at.name}</div><div className="t-faint mono" style={{ fontSize:11 }}>{act.id} · {act.ts}</div></div></div>
        <StatusBadge s={act.status}/>
      </div>
      <div className="row gap-10 center" style={{ padding:"9px 11px", background:"var(--bg-2)", borderRadius:9, marginBottom:12 }}>
        <TypeGlyph type={o.type} size={28}/><div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600 }}>{o.name}</div><div className="t-faint" style={{ fontSize:11 }}>{TYPE_BY_ID[o.type].name} · {o.sub}</div></div>
        <span className="row gap-7 center"><Avatar who={act.by} name={ANALYSTS[act.by]?.name} size={22}/><span className="t-faint" style={{ fontSize:11.5 }}>{ANALYSTS[act.by].name.split(" ")[0]}</span></span>
      </div>
      {act.just && <div className="t-dim" style={{ fontSize:12.5, lineHeight:1.5, marginBottom:12 }}>“{act.just}”</div>}
      <div className="row between center">
        <span className="row gap-8 center"><MarkingChip level={at.cls} size="sm"/><span className="t-faint" style={{ fontSize:11 }}>needs {at.approval.join(" + ")}</span></span>
        <button className="btn primary sm" onClick={()=>onReview(act.id)}><Icon name="shield" size={14}/>Review</button>
      </div>
    </div>
  );
}
function RecentRow({ act }){
  const at=ACTION_TYPES[act.type]; const o=ENTITY_BY_ID[act.target];
  return (
    <div className="row gap-12 center" style={{ padding:"12px 16px", borderBottom:"1px solid var(--line-soft)" }}>
      <span style={{ color:at.color }}><Icon name={at.icon} size={17}/></span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13 }}><b style={{ fontWeight:600 }}>{at.name}</b> <span className="t-dim">on {o.name}</span></div>
        <div className="t-faint" style={{ fontSize:11, marginTop:1 }}>by {ANALYSTS[act.by]?.name||act.by}{act.approver&&act.approver!=="auto"?` · approved ${ANALYSTS[act.approver]?.name||act.approver}`:act.approver==="auto"?" · auto":""}</div>
      </div>
      <StatusBadge s={act.status}/>
      <span className="t-faint mono" style={{ fontSize:11, width:50, textAlign:"right" }}>{act.ts}</span>
    </div>
  );
}
function ActionCenter({ actions, onNew, onReview, rules, toggleRule }){
  const [f,setF] = useState("all");
  const pending = actions.filter(a=>a.status==="pending");
  const recent = actions.filter(a=>a.status!=="pending");
  const shown = f==="all"?recent:recent.filter(a=>a.status===f||(f==="applied"&&a.status==="executing"));
  const today = actions.filter(a=>a.status==="applied"||a.status==="executing").length;
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Operations · Action center" title="Actions">
          <button className="btn primary" onClick={onNew}><Icon name="bolt"/>New action</button>
        </PageHeader>
        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:12 }}>Pending approval · {pending.length}</div>
            <div className="col gap-12" style={{ marginBottom:28 }}>
              {pending.map(a=><PendingCard key={a.id} act={a} onReview={onReview}/>)}
              {pending.length===0 && <div className="card col center" style={{ padding:"32px 0", gap:8, color:"var(--text-faint)" }}><Icon name="check" size={22}/><span style={{ fontSize:13 }}>Nothing awaiting approval</span></div>}
            </div>
            <div className="row between center" style={{ marginBottom:12 }}>
              <div className="eyebrow">Recent activity</div>
              <div className="seg">{["all","applied","rejected"].map(k=><button key={k} className={f===k?"on":""} onClick={()=>setF(k)}>{k[0].toUpperCase()+k.slice(1)}</button>)}</div>
            </div>
            <div className="card" style={{ overflow:"hidden" }}>
              {shown.map(a=><RecentRow key={a.id} act={a}/>)}
              {shown.length===0 && <div className="t-faint" style={{ padding:"22px", textAlign:"center", fontSize:13 }}>No actions.</div>}
            </div>
          </div>
          <div className="col gap-16">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="card" style={{ padding:16 }}><div className="eyebrow">Applied today</div><div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:8 }}>{today}</div></div>
              <div className="card" style={{ padding:16 }}><div className="eyebrow">Pending</div><div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:8, color:pending.length?"var(--warn)":"var(--text)" }}>{pending.length}</div></div>
            </div>
            <div className="card" style={{ padding:18 }}>
              <div className="row between center" style={{ marginBottom:12 }}><div className="eyebrow">Automated actions</div><span className="live-dot"/></div>
              <div className="col gap-2">
                {rules.map(r=>(
                  <div key={r.id} className="row between center" style={{ padding:"10px 0", borderBottom:"1px solid var(--line-soft)" }}>
                    <div style={{ flex:1, minWidth:0, paddingRight:12 }}><div style={{ fontSize:12.5, fontWeight:600, color: r.on?"var(--text)":"var(--text-faint)" }}>{r.name}</div><div className="t-faint" style={{ fontSize:11, marginTop:2 }}>{r.runs} · {r.needs}</div></div>
                    <Switch on={r.on} onChange={()=>toggleRule(r.id)} size="sm"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding:16 }}>
              <div className="row gap-8 center"><span className="t-faint"><Icon name="shield" size={15}/></span><span className="t-faint" style={{ fontSize:11.5, lineHeight:1.5 }}>Every action writes to the audit log with actor, approver, parameters and effects. Write-backs are reversible.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Catalog({ onRun }){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Operations · Action types" title="Action catalog" sub="Defined, governed actions that operate on ontology objects. Each declares its targets, effects and approval chain." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))", gap:16 }}>
          {Object.keys(ACTION_TYPES).map(k=>{ const a=ACTION_TYPES[k]; return (
            <div key={k} className="card" style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
              <div className="row between center"><ActionGlyph type={k} size={40}/><MarkingChip level={a.cls} size="sm"/></div>
              <div><div style={{ fontSize:15, fontWeight:600 }}>{a.name}</div><div className="t-dim" style={{ fontSize:12.5, marginTop:3, lineHeight:1.45 }}>{a.desc}</div></div>
              <div className="row gap-6 wrap">{a.targets.map(t=><span key={t} className={"tc "+TYPE_BY_ID[t].cls} style={{ fontSize:11, color:"var(--c)", fontFamily:"var(--font-mono)", display:"inline-flex", gap:5, alignItems:"center" }}><span className="type-dot"/>{TYPE_BY_ID[t].name}</span>)}</div>
              <div className="divider"/>
              <div className="row between center"><span className="t-faint" style={{ fontSize:11 }}>{a.approval.length?`Approval: ${a.approval.join(" + ")}`:"No approval"}</span><button className="btn sm" onClick={()=>onRun(k)}><Icon name="bolt" size={13}/>Run</button></div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}
function Log({ actions, go }){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Operations · Audit · kind=action" title="Action log">
          <button className="btn ghost sm" onClick={()=>go && go("govern")}>Full audit log <Icon name="arrowRight" size={14}/></button>
        </PageHeader>
        <ArtifactExplorer items={actions} columns={[
          { header:"ID", render:a=><span className="mono" style={{ color:"var(--text)" }}>{a.id}</span> },
          { header:"Action", render:a=>{ const at=ACTION_TYPES[a.type]; return <span className="row gap-8 center"><span style={{ color:at.color }}><Icon name={at.icon} size={15}/></span>{at.name}</span>; } },
          { header:"Target", render:a=>ENTITY_BY_ID[a.target]?.name },
          { header:"Actor", render:a=><span className="row gap-7 center"><Avatar who={a.by} name={ANALYSTS[a.by]?.name} size={20}/>{ANALYSTS[a.by]?.name||a.by}</span> },
          { header:"Approver", dim:true, render:a=>a.approver==="auto"?"auto":a.approver?(ANALYSTS[a.approver]?.name||a.approver):"—" },
          { header:"Status", render:a=><StatusBadge s={a.status}/> },
          { header:"Class", render:a=><MarkingChip level={ACTION_TYPES[a.type].cls} size="sm"/> },
          { header:"When", render:a=><span className="mono t-faint">{a.ts}</span> },
        ]} />
      </div>
    </div>
  );
}

function Automations({ rules, toggleRule }){
  const on = rules.filter(r=>r.on).length;
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:"var(--page-wide)", margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Operations · Automations" title="Event-driven actions">
          <span className="live-dot"/><span className="t-faint mono" style={{ fontSize:11.5 }}>{on} of {rules.length} active</span>
        </PageHeader>
        <div className="t-dim" style={{ fontSize:14, marginBottom:22, maxWidth:"68ch" }}>Rules fire actions automatically when conditions are met — the standing counterpart to manual actions and agent reasoning. Each still writes to the same audit log and honors the same approval chains.</div>
        <RulesEngine rules={rules} onToggle={toggleRule} />
      </div>
    </div>
  );
}

export function ActionsView({ go }){
  const [tab,setTab] = useState("center");
  const [actions,setActions] = useState(SEED_ACTIONS);
  const [rules,setRules] = useState(AUTO_RULES);
  const [invoke,setInvoke] = useState(null);
  const [review,setReview] = useState(null);
  function submit({ type, target, params, just }){
    const at=ACTION_TYPES[type]; const needs=at.approval.length>0;
    const act={ id:nextId(), type, target, params, just, by:ME, approver:null, status: needs?"pending":"executing", ts:"just now" };
    setActions(a=>[act,...a]); setInvoke(null); setTab("center");
    if(!needs) setTimeout(()=>setActions(a=>a.map(x=>x.id===act.id?{...x,status:"applied",approver:"auto"}:x)), 900);
  }
  function decide(kind){
    const id=review; setReview(null);
    if(kind==="rejected"){ setActions(a=>a.map(x=>x.id===id?{...x,status:"rejected",approver:ME}:x)); return; }
    setActions(a=>a.map(x=>x.id===id?{...x,status:"executing",approver:ME}:x));
    setTimeout(()=>setActions(a=>a.map(x=>x.id===id?{...x,status:"applied"}:x)), 1000);
  }
  const reviewAct = review ? actions.find(a=>a.id===review) : null;
  return (
    <>
      <div style={{ padding:"0 28px", borderBottom:"1px solid var(--line-soft)", background:"var(--bg-1)", flex:"none" }}>
        <Tabs variant="flush"
          items={ACT_TABS.map(([k,l])=>({ label:l, badge:k==="center"?actions.filter(a=>a.status==="pending").length:undefined }))}
          value={ACT_TABS.findIndex(([k])=>k===tab)}
          onChange={i=>setTab(ACT_TABS[i][0])} />
      </div>
      {tab==="center" && <ActionCenter actions={actions} onNew={()=>setInvoke({})} onReview={setReview} rules={rules} toggleRule={id=>setRules(rs=>rs.map(r=>r.id===id?{...r,on:!r.on}:r))}/>}
      {tab==="catalog" && <Catalog onRun={k=>setInvoke({ preAction:k })}/>}
      {tab==="auto" && <Automations rules={rules} toggleRule={id=>setRules(rs=>rs.map(r=>r.id===id?{...r,on:!r.on}:r))}/>}
      {tab==="log" && <Log actions={actions} go={go}/>}
      {invoke && <InvokeModal preAction={invoke.preAction} onClose={()=>setInvoke(null)} onSubmit={submit}/>}
      {reviewAct && <ReviewModal act={reviewAct} onClose={()=>setReview(null)} onDecide={decide}/>}
    </>
  );
}
