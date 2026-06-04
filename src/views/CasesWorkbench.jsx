import { useRef, useState } from 'react';
import { ALERTS, ALERT_STATUSES, ANALYSTS } from '../data/data_ext.js';
import { PROJECT_BY_ID } from '../data/data_projects.js';
import { ENTITY_BY_ID, TYPE_BY_ID } from '../data/data.js';
import { Avatar, Badge, Icon, RiskPill, TypeGlyph, WBBar } from '../components/ui.jsx';
import { RulesView } from './RulesView.jsx';
import { EvidenceView } from './EvidenceView.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — CasesWorkbench (R-1)
   Lente OPERATIVA sobre el objeto `project`: Alerts · Rules · Evidence.
   El listado y el detalle de casos/investigaciones viven en Workspaces
   (ProjectsView · ProjectDetail) — un único contenedor, un único detalle.
   Cada alerta enlaza a su investigación vía `openProject(a.case)`.
   Routed para los destinos `cases` y `evidence` (initialMode).
   ============================================================ */

export const SEV_META = {
  critical:{ c:"var(--alert)", label:"Critical" },
  high:    { c:"var(--warn)",  label:"High" },
  medium:  { c:"var(--info)",  label:"Medium" },
  low:     { c:"var(--text-faint)", label:"Low" },
};

export function AlertCard({ a, onClick, dragStart }){
  const { t } = useI18n();
  const sev = SEV_META[a.sev]; const ent = ENTITY_BY_ID[a.entity];
  return (
    <div draggable onDragStart={dragStart} onClick={onClick} className="card hover" style={{ padding:12, cursor:"pointer", borderLeft:`3px solid ${sev.c}` }}>
      <div className="row between center" style={{ marginBottom:8 }}>
        <span className="row gap-6 center"><span style={{ width:7,height:7,borderRadius:"50%",background:sev.c }}/><span className="mono t-faint" style={{ fontSize:10.5 }}>{a.id}</span></span>
        {a.sla!=null && a.status!=="closed" && <span className="mono" style={{ fontSize:10.5, color: a.sla<=2?"var(--alert)":a.sla<=12?"var(--warn)":"var(--text-faint)" }}>{a.sla===0?t('SLA breached'):t('{h}h SLA',{h:a.sla})}</span>}
      </div>
      <div style={{ fontSize:13, fontWeight:600, lineHeight:1.35, marginBottom:10 }}>{t(a.title)}</div>
      <div className="row between center">
        <span className="row gap-6 center">{ent && <TypeGlyph type={ent.type} size={22}/>}<span className="t-faint" style={{ fontSize:11 }}>{t(a.conf)}</span></span>
        <Avatar who={a.assignee} size={22}/>
      </div>
    </div>
  );
}

export function AlertsBoard({ alerts, setAlerts, openAlert }){
  const { t } = useI18n();
  const dragId = useRef(null);
  function onDrop(status){ const id=dragId.current; if(id) setAlerts(as=>as.map(a=>a.id===id?{...a,status}:a)); dragId.current=null; }
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${ALERT_STATUSES.length},minmax(218px,1fr))`, gap:14, padding:"18px 20px", overflowX:"auto", height:"100%", alignItems:"start" }}>
      {ALERT_STATUSES.map(st=>{
        const list = alerts.filter(a=>a.status===st.id);
        return (
          <div key={st.id} onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(st.id)} style={{ minWidth:0 }}>
            <div className="row between center" style={{ marginBottom:10, padding:"0 2px" }}>
              <span className="row gap-8 center"><span style={{ width:8,height:8,borderRadius:2,background:st.color }}/><span style={{ fontSize:13, fontWeight:600 }}>{t(st.label)}</span></span>
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

export function AlertDrawer({ id, alerts, setAlerts, onClose, openEntity, openProject }){
  const { t } = useI18n();
  const a = alerts.find(x=>x.id===id); if(!a) return null;
  const sev = SEV_META[a.sev]; const ent = ENTITY_BY_ID[a.entity];
  const proj = a.case ? PROJECT_BY_ID[a.case] : null;
  function set(patch){ setAlerts(as=>as.map(x=>x.id===id?{...x,...patch}:x)); }
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:120, background:"var(--scrim-soft)", backdropFilter:"var(--scrim-blur)" }}>
      <div onClick={e=>e.stopPropagation()} className="panel" style={{ position:"absolute", top:0, right:0, bottom:0, width:380, background:"var(--bg-1)",
        borderRadius:0, borderLeft:"1px solid var(--line)", boxShadow:"var(--shadow-3)", overflow:"auto", animation:"slideIn .25s both" }}>
        <div style={{ padding:18, borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row between center">
            <span className="row gap-8 center"><span style={{ width:9,height:9,borderRadius:"50%",background:sev.c }}/><span className="mono t-faint" style={{ fontSize:12 }}>{a.id}</span><Badge kind={a.sev==="critical"?"alert":a.sev==="high"?"warn":"info"}>{t(sev.label)}</Badge></span>
            <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="x" size={16}/></button>
          </div>
          <h2 className="h-section" style={{ margin:"12px 0 6px" }}>{t(a.title)}</h2>
          <div className="t-dim" style={{ fontSize:13 }}>{t(a.type)} · {t(a.conf)} · {t('{x} ago',{x:a.created})}</div>
        </div>
        <div style={{ padding:18 }}>
          {ent && <button onClick={()=>openEntity(a.entity)} className="card hover" style={{ padding:12, width:"100%", textAlign:"left", cursor:"pointer", marginBottom:18 }}>
            <div className="eyebrow" style={{ marginBottom:8 }}>{t('Subject')}</div>
            <div className="row gap-10 center"><TypeGlyph type={ent.type} size={34}/>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ent.name}</div><div className="t-faint" style={{ fontSize:11.5 }}>{t(TYPE_BY_ID[ent.type].name)}</div></div>
              <RiskPill r={ent.risk}/>
            </div>
          </button>}

          {proj && openProject && <button onClick={()=>{ onClose(); openProject(a.case); }} className="card hover" style={{ padding:"10px 12px", width:"100%", textAlign:"left", cursor:"pointer", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ width:30,height:30,borderRadius:8,display:"grid",placeItems:"center",background:"var(--bg-2)",color:"var(--accent)",flex:"none" }}><Icon name="folder" size={16}/></span>
            <div style={{ flex:1, minWidth:0 }}><div className="eyebrow" style={{ marginBottom:2 }}>{t('Project')}</div><div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t(proj.name)}</div></div>
            <Icon name="arrowRight" size={15} style={{ color:"var(--text-faint)" }}/>
          </button>}

          <div className="eyebrow" style={{ marginBottom:8 }}>{t('Status')}</div>
          <div className="row gap-6 wrap" style={{ marginBottom:18 }}>
            {ALERT_STATUSES.map(s=>(
              <button key={s.id} onClick={()=>set({status:s.id})} className={"chip"+(a.status===s.id?" on":"")}>{t(s.label)}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom:8 }}>{t('Assignee')}</div>
          <div className="row gap-6 wrap" style={{ marginBottom:18 }}>
            {Object.keys(ANALYSTS).filter(k=>k!=="null").map(k=>(
              <button key={k} onClick={()=>set({assignee:k})} className={"chip"+(a.assignee===k?" on":"")}><Avatar who={k} size={18}/>{ANALYSTS[k].name.split(" ")[0]}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom:10 }}>{t('Triage notes')}</div>
          <textarea placeholder={t('Add your assessment…')} style={{ width:"100%", minHeight:70, background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13, padding:10, resize:"vertical", outline:"none" }} />
        </div>
        <div className="row gap-8" style={{ padding:18, borderTop:"1px solid var(--line-soft)", position:"sticky", bottom:0, background:"var(--bg-1)" }}>
          <button className="btn" style={{ flex:1 }} onClick={()=>set({status:"escalated"})}><Icon name="flag"/>{t('Escalate')}</button>
          <button className="btn primary" style={{ flex:1 }} onClick={()=>{ set({status:"closed"}); onClose(); }}><Icon name="check"/>{t('Resolve')}</button>
        </div>
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(34px)}to{transform:none}}`}</style>
    </div>
  );
}

export function CasesWorkbench({ openEntity, go, openProject, initialMode }){
  const { t } = useI18n();
  // R-1: el LISTADO y el DETALLE de "casos" ahora viven en Workspaces (un único objeto
  // `project`, una sola página de detalle). Este workbench es solo la lente OPERATIVA:
  // alertas · reglas · evidencia. La pestaña "cases" antigua redirige a "alerts".
  const [mode, setMode] = useState(initialMode === "cases" ? "alerts" : (initialMode || "alerts")); // alerts | rules | evidence
  const [alerts, setAlerts] = useState(()=>ALERTS.map(a=>({...a})));
  const [drawer, setDrawer] = useState(null);
  const [sevFilter, setSevFilter] = useState(null);

  const shown = sevFilter ? alerts.filter(a=>a.sev===sevFilter) : alerts;
  const openCount = alerts.filter(a=>a.status!=="closed").length;

  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["alerts", "Alerts"], ["rules", "Rules"], ["evidence", "Evidence"]]}
        counts={{ alerts: openCount }}
        controls={mode==="alerts" && <div className="row gap-6 center">
          {Object.entries(SEV_META).map(([k,v])=>(
            <button key={k} className={"chip"+(sevFilter===k?" on":"")} onClick={()=>setSevFilter(sevFilter===k?null:k)}><span style={{width:7,height:7,borderRadius:"50%",background:v.c}}/>{t(v.label)}</button>
          ))}
        </div>}
        actions={mode==="alerts"
          ? <button className="btn primary"><Icon name="plus"/>{t('New alert')}</button>
          : mode==="rules" ? <button className="btn primary"><Icon name="plus"/>{t('New rule')}</button> : null} />

      <div className="wb-body">
      {mode==="evidence" ? <EvidenceView openEntity={openEntity} go={go} />
        : mode==="rules" ? <RulesView initialKind="detection" onSeeAll={()=>go && go("rules")} />
        : <div style={{ flex:1, overflow:"hidden" }}><AlertsBoard alerts={shown} setAlerts={setAlerts} openAlert={setDrawer} /></div>
      }
      </div>

      {drawer && <AlertDrawer id={drawer} alerts={alerts} setAlerts={setAlerts} onClose={()=>setDrawer(null)} openEntity={openEntity} openProject={openProject} />}
    </div>
  );
}
