import { useState } from 'react';
import { EDGES, ENTITIES, LINK_TYPES, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, RiskPill, SectionHead, Stat, TypeGlyph } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Ontology Explorer + Entity 360 + Search
   ============================================================ */

export function OntologyView({ openEntity, go }) {
  const [sel, setSel] = useState("vessel");
  const t = TYPE_BY_ID[sel];
  const links = LINK_TYPES.filter(l => l.from===sel || l.to===sel);
  const samples = ENTITIES.filter(e => e.type===sel);

  // properties per type (illustrative schema)
  const SCHEMA = {
    person: [["full_name","string","Indexed"],["dob","date",""],["nationality","string[]",""],["risk_score","number","Derived"],["aliases","string[]",""]],
    org: [["legal_name","string","Indexed"],["incorporated","date",""],["jurisdiction","string",""],["beneficial_owner","→ Person","Link"],["status","enum",""]],
    vessel: [["imo","string","Primary key"],["name","string","Indexed"],["flag","string",""],["dwt","number",""],["ais_gaps","number","Derived"],["operator","→ Organization","Link"]],
    port: [["locode","string","Primary key"],["name","string",""],["country","string",""],["sanctions_exposure","enum","Derived"]],
    account: [["iban","string","Primary key"],["currency","enum",""],["holder","→ Organization","Link"],["volume_90d","number","Derived"]],
    txn: [["txn_id","string","Primary key"],["amount","number",""],["currency","enum",""],["from_account","→ Account","Link"],["to_account","→ Account","Link"],["pattern","enum","ML"]],
    shipment: [["bl_number","string","Primary key"],["commodity","string",""],["origin","→ Facility","Link"],["destination","→ Facility","Link"]],
    device: [["imei","string","Primary key"],["owner","→ Person","Link"],["last_seen","geo",""]],
  };
  const props = SCHEMA[sel] || [];

  return (
    <div className="content" style={{ display:"grid", gridTemplateColumns:"260px 1fr" }}>
      {/* type list */}
      <aside style={{ borderRight:"1px solid var(--line-soft)", overflow:"auto", background:"var(--bg-1)" }}>
        <div style={{ padding:"16px 16px 10px" }}>
          <div className="eyebrow">Object types</div>
          <div className="t-faint mono" style={{ fontSize:11, marginTop:4 }}>{OBJECT_TYPES.length} types · 56,041 objects</div>
        </div>
        <div style={{ padding:"0 8px 16px" }}>
          {OBJECT_TYPES.map(ot=>(
            <button key={ot.id} onClick={()=>setSel(ot.id)} className={"onto-row tc "+ot.cls+(sel===ot.id?" on":"")}>
              <span className="type-dot" />
              <Icon name={ot.glyph} size={17} style={{ color:"var(--c)" }} />
              <span style={{ flex:1, textAlign:"left", fontSize:13.5, fontWeight:500, color:"var(--text)" }}>{ot.name}</span>
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
      <div style={{ overflow:"auto", padding:"24px 28px 60px" }}>
        <div style={{ maxWidth: 980 }} className="fade-in" key={sel}>
          <div className="row gap-16 center" style={{ marginBottom:6 }}>
            <TypeGlyph type={sel} size={48}/>
            <div>
              <div className="eyebrow">Object type</div>
              <h1 className="serif" style={{ fontSize:30, fontWeight:500, margin:"2px 0", letterSpacing:"-0.01em" }}>{t.name}</h1>
            </div>
            <div className="grow" />
            <button className="btn" onClick={()=>go("resolve")}><Icon name="merge"/>Resolution queue</button>
            <button className="btn"><Icon name="settings"/>Edit schema</button>
            <button className="btn primary" onClick={()=>go("graph")}><Icon name="graph"/>Explore</button>
          </div>
          <p className="t-dim" style={{ fontSize:14.5, maxWidth:640, lineHeight:1.55 }}>{t.desc}</p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, margin:"20px 0 28px" }}>
            <Stat label="Objects" value={t.count.toLocaleString()} icon={t.glyph} />
            <Stat label="Link types" value={links.length} icon="link" />
            <Stat label="Properties" value={props.length} icon="table" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {/* properties */}
            <div>
              <SectionHead eyebrow="Schema" title="Properties" />
              <div className="card" style={{ overflow:"hidden" }}>
                {props.map((p,i)=>(
                  <div key={p[0]} className="row center gap-10" style={{ padding:"11px 14px", borderBottom: i<props.length-1?"1px solid var(--line-soft)":"none" }}>
                    <span className="mono" style={{ fontSize:13, color:"var(--text)", flex:1 }}>{p[0]}</span>
                    <span className="mono t-faint" style={{ fontSize:12 }}>{p[1]}</span>
                    {p[2] && <Badge kind={p[2]==="Link"?"accent":p[2]==="Derived"||p[2]==="ML"?"info":""}>{p[2]}</Badge>}
                  </div>
                ))}
              </div>
            </div>
            {/* links */}
            <div>
              <SectionHead eyebrow="Relationships" title="Link types" />
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
                          <span style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{TYPE_BY_ID[other].name}</span>
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
            <SectionHead eyebrow={"Instances · "+samples.length+" of "+t.count.toLocaleString()} title="Sample objects">
              <button className="btn ghost sm">Open table view <Icon name="table" size={14}/></button>
            </SectionHead>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:12 }}>
              {samples.map(e=>(
                <button key={e.id} className="card hover" onClick={()=>openEntity(e.id)} style={{ padding:14, textAlign:"left", cursor:"pointer" }}>
                  <div className="row between center" style={{ marginBottom:10 }}>
                    <TypeGlyph type={e.type} size={32}/>
                    {e.watch && <Badge kind="alert" dot>watch</Badge>}
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
export function SearchView({ query, openEntity }) {
  const term = (query||"").trim().toLowerCase();
  const res = ENTITIES.filter(e => !term || e.name.toLowerCase().includes(term) || e.sub.toLowerCase().includes(term) || TYPE_BY_ID[e.type].name.toLowerCase().includes(term));
  const [typeFilter, setTypeFilter] = useState("all");
  const shown = typeFilter==="all" ? res : res.filter(e=>e.type===typeFilter);
  const counts = {};
  res.forEach(e=>counts[e.type]=(counts[e.type]||0)+1);

  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <div className="eyebrow" style={{ marginBottom:6 }}>Search</div>
        <h1 className="serif" style={{ fontSize:26, fontWeight:500, margin:"0 0 4px" }}>
          {query ? <>Results for “{query}”</> : "All objects"}
        </h1>
        <div className="t-faint" style={{ fontSize:13, marginBottom:18 }}>{res.length} objects across the ontology</div>

        <div className="row gap-8 wrap" style={{ marginBottom:18 }}>
          <button className={"chip"+(typeFilter==="all"?" on":"")} onClick={()=>setTypeFilter("all")}>All · {res.length}</button>
          {OBJECT_TYPES.filter(t=>counts[t.id]).map(t=>(
            <button key={t.id} className={"chip"+(typeFilter===t.id?" on":"")} onClick={()=>setTypeFilter(t.id)}>
              <span className={"tc "+t.cls+" type-dot"} style={{ width:8,height:8 }}/>{t.name} · {counts[t.id]}
            </button>
          ))}
        </div>

        <div className="col gap-8">
          {shown.map(e=>(
            <button key={e.id} className="card hover" onClick={()=>openEntity(e.id)} style={{ padding:14, textAlign:"left", cursor:"pointer" }}>
              <div className="row gap-14 center">
                <TypeGlyph type={e.type} size={40}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="row gap-8 center">
                    <span style={{ fontSize:15, fontWeight:600 }}>{e.name}</span>
                    {e.watch && <Badge kind="alert" dot>watchlist</Badge>}
                  </div>
                  <div className="t-dim" style={{ fontSize:13, marginTop:2 }}>{TYPE_BY_ID[e.type].name} · {e.sub}</div>
                </div>
                <div className="row gap-16 center">
                  <div className="col" style={{ alignItems:"flex-end" }}>
                    <span className="eyebrow">Connections</span>
                    <span className="mono" style={{ fontSize:15 }}>{EDGES.filter(ed=>ed.s===e.id||ed.t===e.id).length}</span>
                  </div>
                  <RiskPill r={e.risk}/>
                  <span className="t-faint"><Icon name="arrowRight" size={16}/></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
