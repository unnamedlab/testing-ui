import { useRef, useState } from 'react';
import { ALERTS, ALERT_STATUSES, ANALYSTS, CASES, CASE_BY_ID } from '../data/data_ext.js';
import { ENTITY_BY_ID, TYPE_BY_ID } from '../data/data.js';
import { AccessControl, MarkingChip } from '../components/Security.jsx';
import { Avatar, Badge, Icon, RiskPill, Stat, TypeGlyph } from '../components/ui.jsx';
import { RulesView } from './RulesView.jsx';
import { EvidenceView } from './EvidenceView.jsx';

/* ============================================================
   AXIOM — Alerts triage + Case management
   ============================================================ */

export const SEV_META = {
  critical:{ c:"var(--alert)", label:"Critical" },
  high:    { c:"var(--warn)",  label:"High" },
  medium:  { c:"var(--info)",  label:"Medium" },
  low:     { c:"var(--text-faint)", label:"Low" },
};


export function AlertCard({ a, onClick, dragStart }){
  const sev = SEV_META[a.sev]; const ent = ENTITY_BY_ID[a.entity];
  return (
    <div draggable onDragStart={dragStart} onClick={onClick} className="card hover" style={{ padding:12, cursor:"pointer", borderLeft:`3px solid ${sev.c}` }}>
      <div className="row between center" style={{ marginBottom:8 }}>
        <span className="row gap-6 center"><span style={{ width:7,height:7,borderRadius:"50%",background:sev.c }}/><span className="mono t-faint" style={{ fontSize:10.5 }}>{a.id}</span></span>
        {a.sla!=null && a.status!=="closed" && <span className="mono" style={{ fontSize:10.5, color: a.sla<=2?"var(--alert)":a.sla<=12?"var(--warn)":"var(--text-faint)" }}>{a.sla===0?"SLA breached":a.sla+"h SLA"}</span>}
      </div>
      <div style={{ fontSize:13, fontWeight:600, lineHeight:1.35, marginBottom:10 }}>{a.title}</div>
      <div className="row between center">
        <span className="row gap-6 center">{ent && <TypeGlyph type={ent.type} size={22}/>}<span className="t-faint" style={{ fontSize:11 }}>{a.conf}</span></span>
        <Avatar who={a.assignee} name={ANALYSTS[a.assignee]?.name} size={22}/>
      </div>
    </div>
  );
}

export function AlertsBoard({ alerts, setAlerts, openAlert }){
  const dragId = useRef(null);
  function onDrop(status){ const id=dragId.current; if(id) setAlerts(as=>as.map(a=>a.id===id?{...a,status}:a)); dragId.current=null; }
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${ALERT_STATUSES.length},minmax(218px,1fr))`, gap:14, padding:"18px 20px", overflowX:"auto", height:"100%", alignItems:"start" }}>
      {ALERT_STATUSES.map(st=>{
        const list = alerts.filter(a=>a.status===st.id);
        return (
          <div key={st.id} onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(st.id)} style={{ minWidth:0 }}>
            <div className="row between center" style={{ marginBottom:10, padding:"0 2px" }}>
              <span className="row gap-8 center"><span style={{ width:8,height:8,borderRadius:2,background:st.color }}/><span style={{ fontSize:13, fontWeight:600 }}>{st.label}</span></span>
              <span className="mono t-faint" style={{ fontSize:11 }}>{list.length}</span>
            </div>
            <div className="col gap-10" style={{ minHeight:80, padding:6, borderRadius:12, background:"var(--bg-inset)", border:"1px solid var(--line-soft)" }}>
              {list.map(a=><AlertCard key={a.id} a={a} onClick={()=>openAlert(a.id)} dragStart={()=>dragId.current=a.id} />)}
              {list.length===0 && <div className="t-faint" style={{ fontSize:12, textAlign:"center", padding:"18px 0" }}>—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AlertDrawer({ id, alerts, setAlerts, onClose, openEntity }){
  const a = alerts.find(x=>x.id===id); if(!a) return null;
  const sev = SEV_META[a.sev]; const ent = ENTITY_BY_ID[a.entity];
  function set(patch){ setAlerts(as=>as.map(x=>x.id===id?{...x,...patch}:x)); }
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:120, background:"var(--scrim-soft)", backdropFilter:"var(--scrim-blur)" }}>
      <div onClick={e=>e.stopPropagation()} className="panel" style={{ position:"absolute", top:0, right:0, bottom:0, width:380, background:"var(--bg-1)",
        borderRadius:0, borderLeft:"1px solid var(--line)", boxShadow:"var(--shadow-3)", overflow:"auto", animation:"slideIn .25s both" }}>
        <div style={{ padding:18, borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row between center">
            <span className="row gap-8 center"><span style={{ width:9,height:9,borderRadius:"50%",background:sev.c }}/><span className="mono t-faint" style={{ fontSize:12 }}>{a.id}</span><Badge kind={a.sev==="critical"?"alert":a.sev==="high"?"warn":"info"}>{sev.label}</Badge></span>
            <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{ transform:"rotate(45deg)" }}/></button>
          </div>
          <h2 className="serif" style={{ fontSize:21, fontWeight:500, margin:"12px 0 6px", letterSpacing:"-0.01em" }}>{a.title}</h2>
          <div className="t-dim" style={{ fontSize:13 }}>{a.type} · {a.conf} · {a.created} ago</div>
        </div>
        <div style={{ padding:18 }}>
          {ent && <button onClick={()=>openEntity(a.entity)} className="card hover" style={{ padding:12, width:"100%", textAlign:"left", cursor:"pointer", marginBottom:18 }}>
            <div className="eyebrow" style={{ marginBottom:8 }}>Subject</div>
            <div className="row gap-10 center"><TypeGlyph type={ent.type} size={34}/>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ent.name}</div><div className="t-faint" style={{ fontSize:11.5 }}>{TYPE_BY_ID[ent.type].name}</div></div>
              <RiskPill r={ent.risk}/>
            </div>
          </button>}

          <div className="eyebrow" style={{ marginBottom:8 }}>Status</div>
          <div className="row gap-6 wrap" style={{ marginBottom:18 }}>
            {ALERT_STATUSES.map(s=>(
              <button key={s.id} onClick={()=>set({status:s.id})} className={"chip"+(a.status===s.id?" on":"")}>{s.label}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom:8 }}>Assignee</div>
          <div className="row gap-6 wrap" style={{ marginBottom:18 }}>
            {Object.keys(ANALYSTS).filter(k=>k!=="null").map(k=>(
              <button key={k} onClick={()=>set({assignee:k})} className={"chip"+(a.assignee===k?" on":"")}><Avatar who={k} name={ANALYSTS[k]?.name} size={18}/>{ANALYSTS[k].name.split(" ")[0]}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom:10 }}>Triage notes</div>
          <textarea placeholder="Add your assessment…" style={{ width:"100%", minHeight:70, background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13, padding:10, resize:"vertical", outline:"none" }} />
        </div>
        <div className="row gap-8" style={{ padding:18, borderTop:"1px solid var(--line-soft)", position:"sticky", bottom:0, background:"var(--bg-1)" }}>
          <button className="btn" style={{ flex:1 }} onClick={()=>set({status:"escalated"})}><Icon name="flag"/>Escalate</button>
          <button className="btn primary" style={{ flex:1 }} onClick={()=>{ set({status:"closed"}); onClose(); }}><Icon name="check"/>Resolve</button>
        </div>
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(34px)}to{transform:none}}`}</style>
    </div>
  );
}

export function CaseDetail({ c, onBack, openDossier, go }){
  return (
    <div style={{ maxWidth:1080, margin:"0 auto", padding:"24px 28px 60px" }} className="fade-in">
      <button className="btn ghost sm" onClick={onBack} style={{ marginBottom:16, paddingLeft:6 }}><Icon name="arrowRight" size={15} style={{ transform:"rotate(180deg)" }}/>All cases</button>
      <div className="row between" style={{ alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div className="row gap-10 center" style={{ marginBottom:6 }}>
            <MarkingChip level={c.classification} /><Badge kind={c.status==="Active"?"accent":""} dot>{c.status}</Badge>
            <span className="t-faint mono" style={{ fontSize:11 }}>opened {c.opened}</span>
          </div>
          <h1 className="serif" style={{ fontSize:32, fontWeight:500, margin:0, letterSpacing:"-0.02em" }}>{c.name}</h1>
        </div>
        <div className="row gap-8">
          <button className="btn" onClick={()=>go("graph")}><Icon name="graph"/>Link chart</button>
          <button className="btn primary" onClick={openDossier}><Icon name="doc"/>Generate dossier</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        <Stat label="Linked objects" value={c.objects} icon="share"/>
        <Stat label="Open alerts" value={c.alerts} icon="alertTri" color="var(--alert)"/>
        <Stat label="Team" value={c.members.length} icon="user"/>
        <Stat label="SLA" value={c.sla} icon="clock" color={c.sla==="At risk"?"var(--warn)":"var(--ok)"}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
        <div>
          <div className="card" style={{ padding:18, marginBottom:16 }}>
            <div className="eyebrow" style={{ marginBottom:10 }}>Summary</div>
            <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">{c.summary}</p>
          </div>
          {c.tasks.length>0 && <div className="card" style={{ padding:18 }}>
            <div className="eyebrow" style={{ marginBottom:12 }}>Investigation tasks</div>
            <div className="col gap-2">
              {c.tasks.map(([txt,st],i)=>(
                <div key={i} className="row gap-10 center" style={{ padding:"9px 0", borderBottom: i<c.tasks.length-1?"1px solid var(--line-soft)":"none" }}>
                  <span style={{ width:18,height:18,borderRadius:6,display:"grid",placeItems:"center",flex:"none",
                    border: st==="done"?"none":"1.5px solid var(--line-strong)", background: st==="done"?"var(--ok)":st==="doing"?"var(--warn-ghost)":"transparent",
                    color:"var(--bg)" }}>{st==="done"&&<Icon name="check" size={12}/>}{st==="doing"&&<span style={{width:6,height:6,borderRadius:"50%",background:"var(--warn)"}}/>}</span>
                  <span style={{ fontSize:13.5, flex:1, textDecoration: st==="done"?"line-through":"none", color: st==="done"?"var(--text-faint)":"var(--text)" }}>{txt}</span>
                  <span className="t-faint mono" style={{ fontSize:10.5 }}>{st}</span>
                </div>
              ))}
            </div>
          </div>}
        </div>
        <div className="col gap-16">
          <div className="card" style={{ padding:18 }}>
            <div className="eyebrow" style={{ marginBottom:12 }}>Team</div>
            <div className="col gap-10">
              {c.members.map(m=>(
                <div key={m} className="row gap-10 center"><Avatar who={m} name={ANALYSTS[m]?.name} size={30}/><div><div style={{ fontSize:13, fontWeight:600 }}>{ANALYSTS[m].name}</div><div className="t-faint" style={{ fontSize:11.5 }}>{ANALYSTS[m].role}{m===c.lead?" · Lead":""}</div></div></div>
              ))}
            </div>
          </div>
          <AccessControl id={"case-"+c.id} level={c.classification} />
        </div>
      </div>
    </div>
  );
}

export function CasesView({ openEntity, go, openDossier, initialMode }){
  const [mode, setMode] = useState(initialMode || "alerts"); // alerts | cases | rules | evidence
  const [alerts, setAlerts] = useState(()=>ALERTS.map(a=>({...a})));
  const [drawer, setDrawer] = useState(null);
  const [caseId, setCaseId] = useState(null);
  const [sevFilter, setSevFilter] = useState(null);

  const shown = sevFilter ? alerts.filter(a=>a.sev===sevFilter) : alerts;
  const openCount = alerts.filter(a=>a.status!=="closed").length;

  if(caseId) return <div className="content"><CaseDetail c={CASE_BY_ID[caseId]} onBack={()=>setCaseId(null)} openEntity={openEntity} openDossier={openDossier} go={go} /></div>;

  return (
    <div className="content" style={{ display:"flex", flexDirection:"column", overflow:"hidden", height:"100%" }}>
      <div className="row between center" style={{ padding:"14px 20px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
        <div className="row gap-14 center">
          <div className="seg">
            <button className={mode==="alerts"?"on":""} onClick={()=>setMode("alerts")}>Alerts <span className="mono" style={{opacity:.7}}>{openCount}</span></button>
            <button className={mode==="cases"?"on":""} onClick={()=>setMode("cases")}>Cases <span className="mono" style={{opacity:.7}}>{CASES.length}</span></button>
            <button className={mode==="rules"?"on":""} onClick={()=>setMode("rules")}>Rules</button>
            <button className={mode==="evidence"?"on":""} onClick={()=>setMode("evidence")}>Evidence</button>
          </div>
          {mode==="alerts" && <div className="row gap-6 center">
            {Object.entries(SEV_META).map(([k,v])=>(
              <button key={k} className={"chip"+(sevFilter===k?" on":"")} onClick={()=>setSevFilter(sevFilter===k?null:k)}><span style={{width:7,height:7,borderRadius:"50%",background:v.c}}/>{v.label}</button>
            ))}
          </div>}
        </div>
        {mode!=="evidence" && <button className="btn primary"><Icon name="plus"/>New {mode==="alerts"?"rule":mode==="rules"?"rule":"case"}</button>}
      </div>

      {mode==="evidence" ? <EvidenceView openEntity={openEntity} go={go} />
        : mode==="rules" ? <RulesView />
        : mode==="alerts"
        ? <div style={{ flex:1, overflow:"hidden" }}><AlertsBoard alerts={shown} setAlerts={setAlerts} openAlert={setDrawer} /></div>
        : <div style={{ flex:1, overflow:"auto", padding:"22px 20px" }}>
            <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gap:14 }}>
              {CASES.map(c=>(
                <button key={c.id} className="card hover" onClick={()=>setCaseId(c.id)} style={{ padding:18, textAlign:"left", cursor:"pointer" }}>
                  <div className="row between center">
                    <div className="row gap-14 center">
                      <div style={{ width:46,height:46,borderRadius:12,display:"grid",placeItems:"center",background:"var(--bg-2)",color:"var(--accent)" }}><Icon name="bookmark" size={22}/></div>
                      <div>
                        <div className="row gap-8 center"><span style={{ fontSize:16, fontWeight:600 }}>{c.name}</span><MarkingChip level={c.classification} size="sm"/></div>
                        <div className="t-faint" style={{ fontSize:12.5, marginTop:3 }}>{c.summary.slice(0,72)}…</div>
                      </div>
                    </div>
                    <div className="row gap-20 center">
                      <div className="col" style={{ alignItems:"flex-end" }}><span className="eyebrow">Alerts</span><span className="mono" style={{ fontSize:15, color: c.alerts?"var(--alert)":"var(--text)" }}>{c.alerts}</span></div>
                      <div className="row" style={{ marginRight:4 }}>{c.members.map((m,i)=><span key={m} style={{ marginLeft:i?-7:0 }}><Avatar who={m} name={ANALYSTS[m]?.name} size={28}/></span>)}</div>
                      <Badge kind={c.status==="Active"?"accent":""} dot>{c.status}</Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
      }

      {drawer && <AlertDrawer id={drawer} alerts={alerts} setAlerts={setAlerts} onClose={()=>setDrawer(null)} openEntity={openEntity} />}
    </div>
  );
}
