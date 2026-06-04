import { useMemo, useState } from 'react';
import { LINK_TYPES, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { ACTION_TYPES } from '../data/data_actions.js';
import { OBJECT_SCHEMA } from '../data/ontology_schema.js';
import { Badge, Icon, TypeGlyph } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Ontology Author (★ Phase 3 authoring)
   Turns the read-only Ontology Explorer into a platform: create
   and edit object types, their properties, link types and the
   action-type schemas bound to them. Edits are local (prototype).
   ============================================================ */

export const SEED_SCHEMA = OBJECT_SCHEMA; // fuente única de esquema (cluster ③)

const PROP_TYPES = ["string", "string[]", "number", "date", "enum", "geo", "boolean", "→ Link"];
const FLAGS = ["", "Primary key", "Indexed", "Derived", "ML", "Link"];

export function OntologyAuthor({ go }) {
  const [sel, setSel] = useState("vessel");
  const [schema, setSchema] = useState(SEED_SCHEMA);
  const [dirty, setDirty] = useState(false);
  const t = TYPE_BY_ID[sel];
  const links = useMemo(()=>LINK_TYPES.filter(l => l.from===sel || l.to===sel), [sel]);
  const boundActions = useMemo(()=>Object.entries(ACTION_TYPES).filter(([,a])=>a.targets.includes(sel)), [sel]);
  const props = schema[sel] || [];

  function setProp(i, key, val) {
    setSchema(s => ({ ...s, [sel]: s[sel].map((p,j)=> j===i ? p.map((c,k)=> k===key ? val : c) : p) }));
    setDirty(true);
  }
  function addProp() { setSchema(s => ({ ...s, [sel]: [...(s[sel]||[]), ["new_property","string",""]] })); setDirty(true); }
  function delProp(i) { setSchema(s => ({ ...s, [sel]: s[sel].filter((_,j)=>j!==i) })); setDirty(true); }

  return (
    <div className="content" style={{ display:"grid", gridTemplateColumns:"248px 1fr", padding:0, overflow:"hidden" }}>
      {/* type list */}
      <aside style={{ borderRight:"1px solid var(--line-soft)", overflow:"auto", background:"var(--bg-1)" }}>
        <div className="row between center" style={{ padding:"15px 14px 10px" }}>
          <div className="eyebrow">Object types</div>
          <button className="icon-btn sm" title="New object type"><Icon name="plus" size={15}/></button>
        </div>
        <div style={{ padding:"0 8px 16px" }}>
          {OBJECT_TYPES.map(ot=>(
            <button key={ot.id} onClick={()=>setSel(ot.id)} className={"auth-row tc "+ot.cls+(sel===ot.id?" on":"")}>
              <span className="type-dot" />
              <Icon name={ot.glyph} size={16} style={{ color:"var(--c)" }} />
              <span style={{ flex:1, textAlign:"left", fontSize:13, fontWeight:500, color:"var(--text)" }}>{ot.name}</span>
              <span className="mono t-faint" style={{ fontSize:10.5 }}>{(schema[ot.id]||[]).length}p</span>
            </button>
          ))}
          <button className="auth-new"><Icon name="plus" size={14}/>New object type</button>
        </div>
        <style>{`
          .auth-row { display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border:none; background:none; border-radius:9px; cursor:pointer; transition:background .12s; }
          .auth-row:hover { background:var(--bg-2); }
          .auth-row.on { background:color-mix(in oklab, var(--c) 14%, var(--bg-2)); box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--c) 30%,transparent); }
          .auth-new { display:flex; align-items:center; gap:8px; width:100%; padding:9px 10px; margin-top:6px; border:1px dashed var(--line-strong); background:none;
            border-radius:9px; cursor:pointer; color:var(--text-faint); font-family:var(--font-ui); font-size:12.5px; font-weight:600; transition:.14s; }
          .auth-new:hover { color:var(--accent); border-color:var(--accent-dim); background:var(--accent-ghost); }
          .auth-cell { background:var(--bg-inset); border:1px solid var(--line-soft); border-radius:7px; color:var(--text); font-family:var(--font-mono);
            font-size:12.5px; padding:6px 9px; outline:none; width:100%; }
          .auth-cell:focus { border-color:var(--accent-dim); }
          select.auth-cell { cursor:pointer; }
        `}</style>
      </aside>

      {/* authoring detail */}
      <div style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
        {/* publish bar */}
        <div className="row between center" style={{ padding:"12px 24px", borderBottom:"1px solid var(--line-soft)", flex:"none", background: dirty?"color-mix(in oklab, var(--warn) 8%, var(--bg-1))":"var(--bg-1)" }}>
          <div className="row gap-12 center">
            <TypeGlyph type={sel} size={34}/>
            <div>
              <div className="row gap-8 center"><span className="serif" style={{ fontSize:18, fontWeight:600 }}>{t.name}</span><Badge kind="">type</Badge></div>
              <div className="t-faint mono" style={{ fontSize:11 }}>{t.count.toLocaleString()} objects · {props.length} properties · {links.length} links</div>
            </div>
          </div>
          <div className="row gap-8 center">
            {dirty && <span className="mono" style={{ fontSize:11, color:"var(--warn)" }}>● unsaved schema changes</span>}
            <button className="btn sm" onClick={()=>{ setSchema(SEED_SCHEMA); setDirty(false); }} disabled={!dirty} style={{ opacity:dirty?1:.5 }}>Revert</button>
            <button className="btn primary sm" onClick={()=>setDirty(false)}><Icon name="check" size={14}/>Publish</button>
          </div>
        </div>

        <div className="content" style={{ padding:"24px 28px 60px" }}>
          <div style={{ maxWidth:"var(--page-narrow)", margin:"0 auto" }} className="fade-in" key={sel}>
            {/* properties editor */}
            <div className="row between center" style={{ marginBottom:12 }}>
              <div className="eyebrow">Schema · properties</div>
              <button className="btn ghost sm" onClick={addProp}><Icon name="plus" size={13}/>Add property</button>
            </div>
            <div className="card" style={{ overflow:"hidden", marginBottom:28 }}>
              <div className="auth-head row" style={{ padding:"9px 14px", borderBottom:"1px solid var(--line)", gap:12 }}>
                <span className="eyebrow" style={{ flex:"1 1 40%" }}>Name</span>
                <span className="eyebrow" style={{ flex:"1 1 28%" }}>Type</span>
                <span className="eyebrow" style={{ flex:"1 1 24%" }}>Constraint</span>
                <span style={{ width:30 }} />
              </div>
              {props.map((p,i)=>(
                <div key={i} className="row center" style={{ padding:"9px 14px", borderBottom: i<props.length-1?"1px solid var(--line-soft)":"none", gap:12 }}>
                  <input className="auth-cell" style={{ flex:"1 1 40%" }} value={p[0]} onChange={e=>setProp(i,0,e.target.value)} />
                  <select className="auth-cell" style={{ flex:"1 1 28%" }} value={p[1]} onChange={e=>setProp(i,1,e.target.value)}>
                    {PROP_TYPES.includes(p[1]) ? null : <option>{p[1]}</option>}
                    {PROP_TYPES.map(pt=><option key={pt}>{pt}</option>)}
                  </select>
                  <select className="auth-cell" style={{ flex:"1 1 24%" }} value={p[2]} onChange={e=>setProp(i,2,e.target.value)}>
                    {FLAGS.map(f=><option key={f} value={f}>{f||"—"}</option>)}
                  </select>
                  <button className="icon-btn sm" title="Delete property" onClick={()=>delProp(i)} style={{ width:30,height:30 }}><Icon name="x" size={14}/></button>
                </div>
              ))}
              {props.length===0 && <div className="t-faint" style={{ padding:"18px", textAlign:"center", fontSize:13 }}>No properties yet — add one.</div>}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {/* link types */}
              <div>
                <div className="row between center" style={{ marginBottom:12 }}>
                  <div className="eyebrow">Link types</div>
                  <button className="btn ghost sm"><Icon name="plus" size={13}/>Link</button>
                </div>
                <div className="col gap-8">
                  {links.map(l=>{
                    const other = l.from===sel ? l.to : l.from; const dir = l.from===sel;
                    return (
                      <div key={l.id} className="card" style={{ padding:"11px 13px" }}>
                        <div className="row center gap-8">
                          <span className="mono" style={{ fontSize:12.5, color:"var(--accent)" }}>{l.label}</span>
                          <span className="t-faint"><Icon name="arrowRight" size={13} style={{ transform: dir?"none":"rotate(180deg)" }}/></span>
                          <span className={"tc "+TYPE_BY_ID[other].cls+" row gap-6 center"}><span className="type-dot"/><span style={{ fontSize:12.5, color:"var(--text)", fontWeight:500 }}>{TYPE_BY_ID[other].name}</span></span>
                        </div>
                      </div>
                    );
                  })}
                  {links.length===0 && <div className="t-faint" style={{ fontSize:12.5, padding:"4px 2px" }}>No links on this type.</div>}
                </div>
              </div>

              {/* bound action types */}
              <div>
                <div className="row between center" style={{ marginBottom:12 }}>
                  <div className="eyebrow">Action schemas</div>
                  <button className="btn ghost sm" onClick={()=>go && go("actions")}>Open Actions <Icon name="arrowRight" size={13}/></button>
                </div>
                <div className="col gap-8">
                  {boundActions.map(([k,a])=>(
                    <div key={k} className="card" style={{ padding:"11px 13px" }}>
                      <div className="row between center">
                        <div className="row gap-9 center">
                          <span style={{ width:28,height:28,borderRadius:8,flex:"none",display:"grid",placeItems:"center", background:`color-mix(in oklab, ${a.color} 16%, var(--bg-2))`, color:a.color }}><Icon name={a.icon} size={15}/></span>
                          <div><div style={{ fontSize:13, fontWeight:600 }}>{a.name}</div><div className="t-faint mono" style={{ fontSize:10.5 }}>{a.params.length} params · {a.approval.length?a.approval.join("+"):"no approval"}</div></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {boundActions.length===0 && <div className="t-faint" style={{ fontSize:12.5, padding:"4px 2px" }}>No action types target this object.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
