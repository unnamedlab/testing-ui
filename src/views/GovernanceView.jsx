import { useState } from 'react';
import { ENTITIES, ENTITY_BY_ID, TYPE_BY_ID } from '../data/data.js';
import { ANALYSTS, CLASS_LEVELS, markingFor } from '../data/data_ext.js';
import { ACTION_TYPES, SEED_ACTIONS } from '../data/data_actions.js';
import { Icon, WBBar, TypeGlyph } from '../components/ui.jsx';
import { AccessControl, MarkingChip } from '../components/Security.jsx';
import { AccessRequests, ACCESS_REQUESTS } from '../components/Access.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Governance & Audit (★ Phase 3 consolidation) — UX-01 i18n
   ============================================================ */

const ACTORS = Object.keys(ANALYSTS || {}).slice(0, 5);
const A = (k) => ANALYSTS?.[k]?.name || k;
const pick = (arr, i) => arr[i % arr.length];

// Synthesized governance feed: actions + access + exports in one ledger.
const AUDIT = [
  ...SEED_ACTIONS.slice(0, 5).map((a) => ({
    kind: "action", ts: a.ts, actor: a.by,
    event: `${ACTION_TYPES[a.type]?.name || a.type}`,
    object: a.target, cls: ACTION_TYPES[a.type]?.cls || "CONFIDENTIAL",
  })),
  { kind: "access", ts: "8m ago",  actor: pick(ACTORS,1), event: "Granted Read · Write", object: ENTITIES[2]?.id, cls: "SECRET" },
  { kind: "export", ts: "23m ago", actor: pick(ACTORS,0), event: "Exported dossier (PDF)", object: ENTITIES[0]?.id, cls: "SECRET" },
  { kind: "access", ts: "1h ago",  actor: pick(ACTORS,2), event: "Access denied — clearance", object: ENTITIES[4]?.id, cls: "SECRET" },
  { kind: "view",   ts: "2h ago",  actor: pick(ACTORS,3), event: "Opened object 360°", object: ENTITIES[1]?.id, cls: "CONFIDENTIAL" },
  { kind: "export", ts: "4h ago",  actor: pick(ACTORS,1), event: "Shared with liaison partner", object: ENTITIES[3]?.id, cls: "SECRET" },
];

const KIND_META = {
  action: { icon: "bolt",   c: "var(--accent)" },
  access: { icon: "shield", c: "var(--warn)" },
  export: { icon: "download", c: "var(--violet)" },
  view:   { icon: "table",  c: "var(--text-dim)" },
};

// Solicitudes de acceso → ahora en components/Access.jsx (ACCESS_REQUESTS), compartidas
// con la pestaña Access del proyecto. Aquí se muestra la cola global.

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
  const { t } = useI18n();
  const [f, setF] = useState("all");
  const rows = f === "all" ? AUDIT : AUDIT.filter(r => r.kind === f);
  const filters = [["all","All"],["action","Actions"],["access","Access"],["export","Exports"],["view","Views"]];
  return (
    <div style={{ maxWidth:1040, margin:"0 auto" }} className="fade-in">
      <div className="row between center" style={{ marginBottom:16 }}>
        <div className="row gap-6">{filters.map(([k,l])=>(
          <button key={k} className={"chip"+(f===k?" on":"")} onClick={()=>setF(k)}>{t(l)}</button>
        ))}</div>
        <button className="btn ghost sm"><Icon name="download" size={13}/>{t('Export log')}</button>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead><tr><th>{t('Event')}</th><th>{t('Actor')}</th><th>{t('Object')}</th><th>{t('Class')}</th><th>{t('When')}</th></tr></thead>
          <tbody>
            {rows.map((r,i)=>{ const m=KIND_META[r.kind]; const o=ENTITY_BY_ID[r.object]; return (
              <tr key={i}>
                <td><span className="row gap-9 center"><span style={{ width:26,height:26,borderRadius:7,flex:"none",display:"grid",placeItems:"center",color:m.c,background:`color-mix(in oklab, ${m.c} 14%, transparent)` }}><Icon name={m.icon} size={14}/></span><span style={{ fontWeight:500 }}>{t(r.event)}</span></span></td>
                <td className="t-dim">{A(r.actor)}</td>
                <td>{o ? o.name : "—"}</td>
                <td><ClsChip c={r.cls} /></td>
                <td className="mono t-faint" style={{ whiteSpace:"nowrap" }}>{t(r.ts)}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccessReview() {
  const { t } = useI18n();
  const obj = ENTITIES.find(e=>e.risk>=70) || ENTITIES[0];
  return (
    <div style={{ maxWidth:1040, margin:"0 auto", display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }} className="fade-in">
      <AccessRequests requests={ACCESS_REQUESTS} />
      <div>
        <div className="eyebrow" style={{ marginBottom:12 }}>{t('Effective access · {name}', { name: obj?.name })}</div>
        <AccessControl id={obj?.id} />
      </div>
    </div>
  );
}

function Markings() {
  const { t } = useI18n();
  const levels = Object.keys(CLASS_LEVELS);
  const buckets = {};
  // Agrupa por la marca REAL de cada objeto (el mismo markingFor() que usa el
  // chip del 360°) en vez de un round-robin por índice que lo contradecía.
  levels.forEach((lv)=>{ buckets[lv] = ENTITIES.filter((e)=> markingFor(e.id) === lv); });
  return (
    <div style={{ maxWidth:1040, margin:"0 auto" }} className="fade-in">
      <div className="eyebrow" style={{ marginBottom:14 }}>{t('Classification markings · {n} levels', { n: levels.length })}</div>
      <div className="col gap-12">
        {levels.map(lv=>{
          const items = buckets[lv] || [];
          const color = CLASS_LEVELS?.[lv]?.color || "var(--text-faint)";
          return (
            <div key={lv} className="card" style={{ padding:16, borderLeft:`3px solid ${color}` }}>
              <div className="row between center" style={{ marginBottom:items.length?12:0 }}>
                <div className="row gap-10 center"><MarkingChip level={lv} /><span className="t-faint mono" style={{ fontSize:11 }}>{t('{n} objects carry this marking', { n: items.length })}</span></div>
                <button className="btn ghost sm"><Icon name="settings" size={13}/>{t('Edit handling')}</button>
              </div>
              {items.length>0 && <div className="row gap-8 wrap">
                {items.slice(0,7).map(e=>(
                  <span key={e.id} className="row gap-7 center" style={{ padding:"5px 10px", borderRadius:8, background:"var(--bg-2)", border:"1px solid var(--line-soft)" }}>
                    <TypeGlyph type={e.type} size={20} /><span style={{ fontSize:12.5 }}>{e.name}</span>
                  </span>
                ))}
                {items.length>7 && <span className="t-faint mono" style={{ fontSize:11, alignSelf:"center" }}>{t('+{n} more', { n: items.length-7 })}</span>}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineageTab({ openEntity }) {
  const { t } = useI18n();
  // R-3b: lineage is NOT re-hosted here. It lives on the object's 360° profile
  // (the single source). This tab is a launcher into each object's Lineage tab.
  const objs = ENTITIES.filter(e=>e.risk>=60);
  return (
    <div style={{ maxWidth:1040, margin:"0 auto" }} className="fade-in">
      <div style={{ marginBottom:16 }}>
        <div className="eyebrow" style={{ marginBottom:6 }}>{t('Object lineage')}</div>
        <p className="t-dim" style={{ fontSize:13, margin:0, maxWidth:"72ch" }}>
          {t('Lineage and handling live on each object’s 360° profile — the single source. Open an object to inspect its provenance chain and access.')}
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
        {objs.map(e=>(
          <button key={e.id} className="card hover" onClick={()=>openEntity?.(e.id, "lineage")}
            style={{ padding:"14px 16px", textAlign:"left", cursor:"pointer", display:"flex", gap:12, alignItems:"center", border:"1px solid var(--line-soft)", background:"var(--bg-1)" }}>
            <TypeGlyph type={e.type} size={34}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div>
              <div className="t-faint" style={{ fontSize:11.5 }}>{t(TYPE_BY_ID[e.type].name)}</div>
            </div>
            <span className="row gap-6 center t-faint" style={{ fontSize:11.5, flex:"none" }}>{t('Lineage')}<Icon name="arrowRight" size={14}/></span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function GovernanceView({ openEntity }) {
  const [tab, setTab] = useState("audit");
  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column" }}>
      <WBBar mode={tab} setMode={setTab} tabs={TABS} />
      <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
        {tab==="audit" && <AuditLog />}
        {tab==="access" && <AccessReview />}
        {tab==="markings" && <Markings />}
        {tab==="lineage" && <LineageTab openEntity={openEntity} />}
      </div>
    </div>
  );
}
