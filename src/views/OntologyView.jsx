import { useState } from 'react';
import { ENTITIES, LINK_TYPES, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, RiskPill, SectionHead, Stat, TypeGlyph, PageHeader } from '../components/ui.jsx';
import { OBJECT_SCHEMA } from '../data/ontology_schema.js';
import { ObjectIndex } from '../components/ObjectIndex.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Ontology Explorer + Entity 360 + Search (UX-01 i18n)
   ============================================================ */

// Derived from the type counts (was a hardcoded "56,041" that didn't match the
// real sum), so the header total can never drift from OBJECT_TYPES.
const TOTAL_OBJECTS = OBJECT_TYPES.reduce((sum, t) => sum + t.count, 0);

export function OntologyView({ openEntity, go }) {
  const { t: tr } = useI18n();
  const [sel, setSel] = useState("vessel");
  const tp = TYPE_BY_ID[sel];
  const links = LINK_TYPES.filter(l => l.from===sel || l.to===sel);
  const samples = ENTITIES.filter(e => e.type===sel);

  const SCHEMA = OBJECT_SCHEMA;
  const props = SCHEMA[sel] || [];

  return (
    <div className="content" style={{ display:"grid", gridTemplateColumns:"var(--master-w) 1fr" }}>
      {/* type list */}
      <aside style={{ borderRight:"1px solid var(--line-soft)", overflow:"auto", background:"var(--bg-1)" }}>
        <div style={{ padding:"16px 16px 10px" }}>
          <div className="eyebrow">{tr('Object types')}</div>
          <div className="t-faint mono" style={{ fontSize:11, marginTop:4 }}>{tr('{n} types · {total} objects', { n: OBJECT_TYPES.length, total: TOTAL_OBJECTS.toLocaleString() })}</div>
        </div>
        <div style={{ padding:"0 8px 16px" }}>
          {OBJECT_TYPES.map(ot=>(
            <button key={ot.id} onClick={()=>setSel(ot.id)} className={"onto-row tc "+ot.cls+(sel===ot.id?" on":"")}>
              <span className="type-dot" />
              <Icon name={ot.glyph} size={17} style={{ color:"var(--c)" }} />
              <span style={{ flex:1, textAlign:"left", fontSize:13.5, fontWeight:500, color:"var(--text)" }}>{tr(ot.name)}</span>
              <span className="mono t-faint" style={{ fontSize:11 }}>{ot.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
        <style>{`
          .onto-row { display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border:none; background:none;
            border-radius:9px; cursor:pointer; transition:background .12s; }
          .onto-row:hover { background:var(--bg-2); }
          .onto-row.on { background:color-mix(in oklab, var(--c) 14%, var(--bg-2)); box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--c) 30%,transparent); }
        `}</style>
      </aside>

      {/* detail */}
      <div style={{ overflow:"auto", padding:"var(--page-py) var(--page-px) 60px" }}>
        <div style={{ maxWidth: 980 }} className="fade-in" key={sel}>
          <PageHeader variant="hero" glyph={<TypeGlyph type={sel} size={48}/>} eyebrow={tr('Object type')} title={tr(tp.name)} sub={tr(tp.desc)}>
            <button className="btn" onClick={()=>go("resolve")}><Icon name="merge"/>{tr('Resolution queue')}</button>
            <button className="btn"><Icon name="settings"/>{tr('Edit schema')}</button>
            <button className="btn primary" onClick={()=>go("graph")}><Icon name="graph"/>{tr('Explore')}</button>
          </PageHeader>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, margin:"20px 0 28px" }}>
            <Stat label={tr('Objects')} value={tp.count.toLocaleString()} icon={tp.glyph} />
            <Stat label={tr('Link types')} value={links.length} icon="link" />
            <Stat label={tr('Properties')} value={props.length} icon="table" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {/* properties */}
            <div>
              <SectionHead eyebrow={tr('Schema')} title={tr('Properties')} />
              <div className="card" style={{ overflow:"hidden" }}>
                {props.map((p,i)=>(
                  <div key={p[0]} className="row center gap-10" style={{ padding:"11px 14px", borderBottom: i<props.length-1?"1px solid var(--line-soft)":"none" }}>
                    <span className="mono" style={{ fontSize:13, color:"var(--text)", flex:1 }}>{p[0]}</span>
                    <span className="mono t-faint" style={{ fontSize:12 }}>{p[1]}</span>
                    {p[2] && <Badge kind={p[2]==="Link"?"accent":p[2]==="Derived"||p[2]==="ML"?"info":""}>{tr(p[2])}</Badge>}
                  </div>
                ))}
              </div>
            </div>
            {/* links */}
            <div>
              <SectionHead eyebrow={tr('Relationships')} title={tr('Link types')} />
              <div className="col gap-8">
                {links.map(l=>{
                  const other = l.from===sel ? l.to : l.from;
                  const dir = l.from===sel;
                  return (
                    <div key={l.id} className="card" style={{ padding:"12px 14px" }}>
                      <div className="row center gap-8">
                        <span className="tc type-dot" style={{ ["--c"]:"var(--text-dim)" }} />
                        <span className="mono" style={{ fontSize:12.5, color:"var(--accent)" }}>{l.label}</span>
                        <span className="t-faint"><Icon name={dir?"arrowRight":"arrowRight"} size={14} style={{ transform: dir?"none":"rotate(180deg)" }}/></span>
                        <span className={"tc "+TYPE_BY_ID[other].cls+" row gap-6 center"}>
                          <span className="type-dot"/>
                          <span style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{tr(TYPE_BY_ID[other].name)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* sample objects */}
          {samples.length>0 && <>
            <SectionHead eyebrow={tr('Instances · {shown} of {total}', { shown: samples.length, total: tp.count.toLocaleString() })} title={tr('Sample objects')}>
              <button className="btn ghost sm">{tr('Open table view')} <Icon name="table" size={14}/></button>
            </SectionHead>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:12 }}>
              {samples.map(e=>(
                <button key={e.id} className="card hover" onClick={()=>openEntity(e.id)} style={{ padding:14, textAlign:"left", cursor:"pointer" }}>
                  <div className="row between center" style={{ marginBottom:10 }}>
                    <TypeGlyph type={e.type} size={32}/>
                    {e.watch && <Badge kind="alert" dot>{tr('watch')}</Badge>}
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div>
                  <div className="t-faint" style={{ fontSize:12, marginTop:2, marginBottom:10 }}>{e.sub}</div>
                  <RiskPill r={e.risk}/>
                </button>
              ))}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ---- Search results page ----
// Consolidación (clúster B): Search es el índice de objetos compartido (ObjectIndex)
// con una query inicial y en modo lista. Misma vista que Explore/Watchlists.
export function SearchView({ query, openEntity }) {
  const { t: tr } = useI18n();
  return (
    <ObjectIndex
      openEntity={openEntity}
      initialQuery={query || ""}
      initialView="list"
      eyebrow="Search"
      title={query ? <>{tr('Results for')} “{query}”</> : "All objects"}
    />
  );
}
