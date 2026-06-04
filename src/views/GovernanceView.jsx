import { useMemo, useState } from 'react';
import { ENTITIES, ENTITY_BY_ID, TYPE_BY_ID } from '../data/data.js';
import { ANALYSTS, CASES, CLASS_LEVELS } from '../data/data_ext.js';
import { AUDIT_EVENTS, AUDIT_KIND_META } from '../data/data_audit.js';
import { ArtifactExplorer, Icon, Tabs, TypeGlyph } from '../components/ui.jsx';
import { AccessControl, Lineage, MarkingChip } from '../components/Security.jsx';

/* ============================================================
   AXIOM — Governance & Audit (★ Phase 3 consolidation)
   Pulls together what was scattered across project settings,
   Entity 360, Admin and Security.jsx: an audit log, an access
   review queue, classification markings and data lineage.
   ============================================================ */

const A = (k) => ANALYSTS?.[k]?.name || k;

const REQUESTS = [
  { who: "J. Okafor",  role: "Read only", scope: "Case BLACKFROST", reason: "Cross-team liaison review", cls: "SECRET" },
  { who: "L. Marsh",   role: "Read · Write", scope: "Aurora Trading FZE", reason: "Assigned as co-investigator", cls: "SECRET" },
  { who: "Partner — FININT", role: "Read only", scope: "Dossier AXM-BLACKFROST", reason: "Information-sharing agreement", cls: "SECRET" },
];

const TABS = [["audit", "Audit log"], ["access", "Access review"], ["markings", "Markings"], ["lineage", "Lineage"]];

function ClsChip({ c }) {
  const lv = CLASS_LEVELS?.[c];
  const color = lv?.color || "var(--text-faint)";
  return (
    <span className="mono" style={{ fontSize:10, fontWeight:600, letterSpacing:".06em", color,
      padding:"1px 7px", borderRadius:5, background:`color-mix(in oklab, ${color} 15%, transparent)`,
      border:`1px solid color-mix(in oklab, ${color} 38%, transparent)`, whiteSpace:"nowrap" }}>{c}</span>
  );
}

function AuditLog() {
  const [f, setF] = useState("all");
  const rows = f === "all" ? AUDIT_EVENTS : AUDIT_EVENTS.filter(r => r.kind === f);
  const filters = [["all","All"],["action","Actions"],["access","Access"],["export","Exports"],["view","Views"],["system","System"],["auth","Sessions"]];
  return (
    <div style={{ maxWidth:"var(--page)", margin:"0 auto" }} className="fade-in">
      <div className="row between center" style={{ marginBottom:16 }}>
        <div className="row gap-6">{filters.map(([k,l])=>(
          <button key={k} className={"chip"+(f===k?" on":"")} onClick={()=>setF(k)}>{l}</button>
        ))}</div>
        <button className="btn ghost sm"><Icon name="download" size={13}/>Export log</button>
      </div>
      <ArtifactExplorer items={rows} columns={[
        { header:"Event", render:r=>{ const m=AUDIT_KIND_META[r.kind]||{c:"var(--text-dim)",icon:"dots"}; return <span className="row gap-9 center"><span style={{ width:26,height:26,borderRadius:7,flex:"none",display:"grid",placeItems:"center",color:m.c,background:`color-mix(in oklab, ${m.c} 14%, transparent)` }}><Icon name={m.icon} size={14}/></span><span style={{ fontWeight:500 }}>{r.event}</span></span>; } },
        { header:"Actor", dim:true, render:r=>A(r.actor) },
        { header:"Object", render:r=>{ const o=ENTITY_BY_ID[r.object]; return o ? o.name : (r.target || "—"); } },
        { header:"Class", render:r=><ClsChip c={r.cls} /> },
        { header:"When", render:r=><span className="mono t-faint" style={{ whiteSpace:"nowrap" }}>{r.ts}</span> },
      ]} />
    </div>
  );
}

function AccessReview() {
  const [reqs, setReqs] = useState(REQUESTS);
  const obj = ENTITIES.find(e=>e.risk>=70) || ENTITIES[0];
  function resolve(i){ setReqs(rs=>rs.filter((_,j)=>j!==i)); }
  return (
    <div style={{ maxWidth:"var(--page)", margin:"0 auto", display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }} className="fade-in">
      <div>
        <div className="eyebrow" style={{ marginBottom:12 }}>Pending access requests · {reqs.length}</div>
        <div className="col gap-10">
          {reqs.map((r,i)=>(
            <div key={i} className="card" style={{ padding:16 }}>
              <div className="row between center" style={{ marginBottom:10 }}>
                <div className="row gap-10 center">
                  <span style={{ width:34,height:34,borderRadius:9,background:"var(--bg-2)",display:"grid",placeItems:"center",color:"var(--text-dim)",fontSize:12,fontWeight:600 }}>{r.who.split(" ").map(w=>w[0]).slice(0,2).join("")}</span>
                  <div><div style={{ fontSize:14, fontWeight:600 }}>{r.who}</div><div className="t-faint" style={{ fontSize:12 }}>requests <b style={{ color:"var(--text-dim)" }}>{r.role}</b> · {r.scope}</div></div>
                </div>
                <ClsChip c={r.cls} />
              </div>
              <div className="t-dim" style={{ fontSize:12.5, marginBottom:12, paddingLeft:2 }}>“{r.reason}”</div>
              <div className="row gap-8">
                <button className="btn primary sm" onClick={()=>resolve(i)}><Icon name="check" size={13}/>Grant</button>
                <button className="btn sm" onClick={()=>resolve(i)}>Deny</button>
              </div>
            </div>
          ))}
          {reqs.length===0 && <div className="card col center" style={{ padding:"30px 0", gap:8, color:"var(--text-faint)" }}><Icon name="check" size={22}/><span style={{ fontSize:13 }}>No pending requests</span></div>}
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom:12 }}>Effective access · {obj?.name}</div>
        <AccessControl id={obj?.id} />
      </div>
    </div>
  );
}

function Markings() {
  const levels = Object.keys(CLASS_LEVELS || { SECRET:1, CONFIDENTIAL:1, UNCLASSIFIED:1 });
  // distribute sample objects across levels for a management overview
  const buckets = {};
  levels.forEach((lv,idx)=>{ buckets[lv] = ENTITIES.filter((_,i)=>i%levels.length===idx); });
  return (
    <div style={{ maxWidth:"var(--page)", margin:"0 auto" }} className="fade-in">
      <div className="eyebrow" style={{ marginBottom:14 }}>Classification markings · {levels.length} levels</div>
      <div className="col gap-12">
        {levels.map(lv=>{
          const items = buckets[lv] || [];
          const color = CLASS_LEVELS?.[lv]?.color || "var(--text-faint)";
          return (
            <div key={lv} className="card" style={{ padding:16, borderLeft:`3px solid ${color}` }}>
              <div className="row between center" style={{ marginBottom:items.length?12:0 }}>
                <div className="row gap-10 center"><MarkingChip level={lv} /><span className="t-faint mono" style={{ fontSize:11 }}>{items.length} objects carry this marking</span></div>
                <button className="btn ghost sm"><Icon name="settings" size={13}/>Edit handling</button>
              </div>
              {items.length>0 && <div className="row gap-8 wrap">
                {items.slice(0,7).map(e=>(
                  <span key={e.id} className="row gap-7 center" style={{ padding:"5px 10px", borderRadius:8, background:"var(--bg-2)", border:"1px solid var(--line-soft)" }}>
                    <TypeGlyph type={e.type} size={20} /><span style={{ fontSize:12.5 }}>{e.name}</span>
                  </span>
                ))}
                {items.length>7 && <span className="t-faint mono" style={{ fontSize:11, alignSelf:"center" }}>+{items.length-7} more</span>}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineageTab() {
  const objs = ENTITIES.filter(e=>e.risk>=60).slice(0,5);
  const [sel, setSel] = useState(objs[0]?.id);
  return (
    <div style={{ maxWidth:"var(--page)", margin:"0 auto", display:"grid", gridTemplateColumns:"240px 1fr", gap:24 }} className="fade-in">
      <div>
        <div className="eyebrow" style={{ marginBottom:12 }}>Select object</div>
        <div className="col gap-6">
          {objs.map(e=>(
            <button key={e.id} onClick={()=>setSel(e.id)} className="card hover" style={{ padding:"10px 12px", textAlign:"left", cursor:"pointer", display:"flex", gap:10, alignItems:"center",
              borderColor: sel===e.id?"var(--accent-dim)":"var(--line-soft)", background: sel===e.id?"var(--accent-ghost)":"var(--bg-1)" }}>
              <TypeGlyph type={e.type} size={28}/>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div><div className="t-faint" style={{ fontSize:11 }}>{TYPE_BY_ID[e.type].name}</div></div>
            </button>
          ))}
        </div>
      </div>
      <div><div className="eyebrow" style={{ marginBottom:12 }}>Provenance chain</div><Lineage id={sel} /></div>
    </div>
  );
}

export function GovernanceView() {
  const [tab, setTab] = useState("audit");
  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"0 28px", background:"var(--bg-1)", flex:"none", borderBottom:"1px solid var(--line-soft)" }}>
        <Tabs variant="flush"
          items={TABS.map(([k,l])=>({ label:l }))}
          value={TABS.findIndex(([k])=>k===tab)}
          onChange={i=>setTab(TABS[i][0])} />
      </div>
      <div className="content" style={{ padding:"22px 28px 60px" }}>
        {tab==="audit" && <AuditLog />}
        {tab==="access" && <AccessReview />}
        {tab==="markings" && <Markings />}
        {tab==="lineage" && <LineageTab />}
      </div>
    </div>
  );
}
