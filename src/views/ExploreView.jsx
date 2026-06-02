import { useMemo, useState } from 'react';
import { EXPLORER_ROWS } from '../data/data_ext.js';
import { OBJECT_TYPES, TYPE_BY_ID, riskBand } from '../data/data.js';
import { Badge, Icon, Skeleton, TypeGlyph, useLoad } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Object Explorer (faceted search over objects)
   ============================================================ */

export function Histogram({ buckets, max }) {
  return (
    <div className="row" style={{ alignItems:"flex-end", gap:2, height:34, marginBottom:8 }}>
      {buckets.map((b,i)=>(
        <div key={i} title={b.label+": "+b.n} style={{ flex:1, height: Math.max(2,(b.n/max)*34), borderRadius:2,
          background: i>=8 ? "var(--alert)" : i>=5 ? "var(--warn)" : "var(--accent)", opacity:0.85 }}/>
      ))}
    </div>
  );
}

export function FacetGroup({ title, children, count }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom:"1px solid var(--line-soft)", padding:"12px 0" }}>
      <button onClick={()=>setOpen(o=>!o)} className="row between center" style={{ width:"100%", border:"none", background:"none", cursor:"pointer", padding:0 }}>
        <span className="eyebrow">{title}{count!=null && <span className="t-faint" style={{ marginLeft:6 }}>· {count}</span>}</span>
        <span className="t-faint" style={{ transform: open?"rotate(180deg)":"none", transition:"transform .15s" }}><Icon name="chevDown" size={15}/></span>
      </button>
      {open && <div style={{ marginTop:10 }}>{children}</div>}
    </div>
  );
}

export function CheckRow({ on, onClick, color, label, n }) {
  return (
    <button onClick={onClick} className="row between center" style={{ width:"100%", border:"none", background:"none", cursor:"pointer", padding:"5px 2px" }}>
      <span className="row gap-8 center">
        <span style={{ width:15, height:15, borderRadius:4, border:"1.5px solid "+(on?"var(--accent)":"var(--line-strong)"),
          background: on?"var(--accent)":"transparent", display:"grid", placeItems:"center", color:"var(--accent-text)" }}>
          {on && <Icon name="check" size={11}/>}
        </span>
        {color && <span style={{ width:8,height:8,borderRadius:2,background:color }}/>}
        <span style={{ fontSize:12.5, color: on?"var(--text)":"var(--text-dim)" }}>{label}</span>
      </span>
      <span className="mono t-faint" style={{ fontSize:11 }}>{n}</span>
    </button>
  );
}

export function ExploreView({ openEntity, go }) {
  const loading = useLoad(700);
  const [types, setTypes] = useState(new Set());
  const [juris, setJuris] = useState(new Set());
  const [riskMin, setRiskMin] = useState(0);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(new Set());
  const [sort, setSort] = useState({ k:"risk", dir:-1 });

  const filtered = useMemo(()=>{
    let rows = EXPLORER_ROWS.filter(r=>{
      if(types.size && !types.has(r.type)) return false;
      if(juris.size && !juris.has(r.juris)) return false;
      if(r.risk < riskMin) return false;
      if(q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    rows = [...rows].sort((a,b)=>{
      const av=a[sort.k], bv=b[sort.k];
      if(typeof av==="number") return (av-bv)*sort.dir;
      return String(av).localeCompare(String(bv))*sort.dir;
    });
    return rows;
  }, [types, juris, riskMin, q, sort]);

  // facet counts reactive to the OTHER active filters
  const passRisk = r => r.risk>=riskMin;
  const passQ = r => !q || r.name.toLowerCase().includes(q.toLowerCase());
  const typeCounts = {}; EXPLORER_ROWS.forEach(r=>{ if((juris.size?juris.has(r.juris):true)&&passRisk(r)&&passQ(r)) typeCounts[r.type]=(typeCounts[r.type]||0)+1; });
  const jurisCounts = {}; EXPLORER_ROWS.forEach(r=>{ if((types.size?types.has(r.type):true)&&passRisk(r)&&passQ(r)) jurisCounts[r.juris]=(jurisCounts[r.juris]||0)+1; });
  const riskBuckets = Array.from({length:10}).map((_,i)=>({ label:i*10+"-"+(i*10+9), n: EXPLORER_ROWS.filter(r=>r.risk>=i*10&&r.risk<i*10+10).length }));
  const maxBucket = Math.max(...riskBuckets.map(b=>b.n));

  function toggle(setFn, set, v){ const n=new Set(set); n.has(v)?n.delete(v):n.add(v); setFn(n); }
  function toggleSel(id){ const n=new Set(sel); n.has(id)?n.delete(id):n.add(id); setSel(n); }
  function sortBy(k){ setSort(s=> s.k===k ? {k,dir:-s.dir} : {k,dir:-1}); }
  function exportCsv(){
    const chosen = filtered.filter(r=>sel.has(r.id));
    const rows = (chosen.length?chosen:filtered);
    const head = ["name","type","risk","jurisdiction","status","links"];
    const csv = [head.join(",")].concat(rows.map(r=>[r.name,r.type,r.risk,r.juris,r.status,r.conns].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","))).join("\n");
    const blob = new Blob([csv], {type:"text/csv"}); const url = URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="axiom-objects.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="content" style={{ display:"grid", gridTemplateColumns:"262px 1fr", overflow:"hidden", height:"100%" }}>
      {/* facets */}
      <aside style={{ borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", padding:"4px 16px 24px" }}>
        <div style={{ padding:"16px 0 6px" }}><div className="eyebrow">Filters</div></div>
        <FacetGroup title="Risk score">
          <Histogram buckets={riskBuckets} max={maxBucket} />
          <div className="row gap-10 center">
            <input type="range" min="0" max="90" step="10" value={riskMin} onChange={e=>setRiskMin(+e.target.value)}
              style={{ flex:1, accentColor:"var(--accent)" }}/>
            <span className="mono" style={{ fontSize:12, width:48 }}>≥ {riskMin}</span>
          </div>
        </FacetGroup>
        <FacetGroup title="Object type" count={Object.keys(typeCounts).length}>
          {OBJECT_TYPES.filter(t=>typeCounts[t.id]).map(t=>(
            <CheckRow key={t.id} on={types.has(t.id)} onClick={()=>toggle(setTypes,types,t.id)}
              color={`var(--${t.cls.replace("tc-","")==="port"?"warn":t.cls})`} label={t.name} n={typeCounts[t.id]} />
          ))}
        </FacetGroup>
        <FacetGroup title="Jurisdiction" count={Object.keys(jurisCounts).length}>
          <div className="facet-scroll" style={{ maxHeight:200, overflowY:"auto", overflowX:"hidden", paddingRight:8 }}>
            {Object.entries(jurisCounts).sort((a,b)=>b[1]-a[1]).map(([j,n])=>(
              <CheckRow key={j} on={juris.has(j)} onClick={()=>toggle(setJuris,juris,j)} label={j} n={n} />
            ))}
          </div>
        </FacetGroup>
      </aside>

      {/* results */}
      <div style={{ display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
        <div className="row between center" style={{ padding:"14px 20px", borderBottom:"1px solid var(--line-soft)", gap:14 }}>
          <div className="search" style={{ maxWidth:340, margin:0, flex:1 }}>
            <Icon name="search" size={15}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Filter by name…" />
          </div>
          <div className="row gap-10 center">
            <span className="t-dim mono" style={{ fontSize:12.5 }}><b className="t-accent" style={{ fontWeight:600 }}>{filtered.length.toLocaleString()}</b> of {EXPLORER_ROWS.length} objects</span>
            <div className="seg"><button className="on"><Icon name="table" size={14}/></button><button onClick={()=>go("graph")}><Icon name="graph" size={14}/></button></div>
          </div>
        </div>

        <div style={{ flex:1, overflow:"auto", minHeight:0 }}>
          {loading ? (
            <div style={{ padding:"6px 20px" }}>
              {Array.from({length:11}).map((_,i)=>(
                <div key={i} className="row gap-12 center" style={{ padding:"11px 0", borderBottom:"1px solid var(--line-soft)" }}>
                  <Skeleton w={15} h={15} r={4}/><Skeleton w={24} h={24} r={6}/>
                  <Skeleton w={`${30+(i*7)%34}%`} h={13}/><div className="grow"/>
                  <Skeleton w={70} h={13}/><Skeleton w={34} h={18} r={9}/><Skeleton w={60} h={13}/>
                </div>
              ))}
            </div>
          ) : (<>
          <table className="tbl" style={{ tableLayout:"fixed" }}>
            <colgroup>
              <col style={{ width:"38px" }}/><col/><col style={{ width:"116px" }}/><col style={{ width:"66px" }}/>
              <col style={{ width:"116px" }}/><col style={{ width:"100px" }}/><col style={{ width:"66px" }}/>
            </colgroup>
            <thead>
              <tr>
                <th style={{ width:36 }}></th>
                {[["name","Object"],["type","Type"],["risk","Risk"],["juris","Jurisdiction"],["status","Status"],["conns","Links"]].map(([k,l])=>(
                  <th key={k} onClick={()=>sortBy(k)} style={{ cursor:"pointer", textAlign: k==="risk"||k==="conns"?"right":"left" }}>
                    {l}{sort.k===k && <span className="t-accent"> {sort.dir<0?"↓":"↑"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0,60).map(r=>(
                <tr key={r.id} onClick={()=>r.real?openEntity(r.id):toggleSel(r.id)}>
                  <td onClick={e=>{e.stopPropagation();toggleSel(r.id);}} style={{ width:36 }}>
                    <span style={{ width:15, height:15, borderRadius:4, border:"1.5px solid "+(sel.has(r.id)?"var(--accent)":"var(--line-strong)"),
                      background: sel.has(r.id)?"var(--accent)":"transparent", display:"grid", placeItems:"center", color:"var(--accent-text)" }}>
                      {sel.has(r.id) && <Icon name="check" size={11}/>}
                    </span>
                  </td>
                  <td style={{ color:"var(--text)", overflow:"hidden" }}>
                    <span className="row gap-8 center" style={{ minWidth:0 }}>
                      <TypeGlyph type={r.type} size={24}/>
                      <span style={{ fontWeight: r.real?600:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name}</span>
                      {r.real && <span className="t-faint" style={{ flex:"none" }}><Icon name="link" size={12}/></span>}
                    </span>
                  </td>
                  <td><span className={"tc "+TYPE_BY_ID[r.type].cls} style={{ color:"var(--c)", fontSize:12 }}>{TYPE_BY_ID[r.type].name}</span></td>
                  <td style={{ textAlign:"right" }}><span className={"badge "+riskBand(r.risk)} style={{ minWidth:34, justifyContent:"center" }}>{r.risk}</span></td>
                  <td>{r.juris}</td>
                  <td><span style={{ fontSize:12, color: r.status==="Flagged"?"var(--alert)":r.status==="Dormant"||r.status==="Dissolved"?"var(--text-faint)":"var(--text-dim)" }}>{r.status}</span></td>
                  <td className="mono" style={{ textAlign:"right" }}>{r.conns}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && (
            <div className="col center" style={{ padding:"60px 0", gap:12, color:"var(--text-faint)" }}>
              <div style={{ width:54,height:54,borderRadius:14,display:"grid",placeItems:"center",background:"var(--bg-2)" }}><Icon name="search" size={24}/></div>
              <div className="serif" style={{ fontSize:18, color:"var(--text)" }}>No objects match these filters</div>
              <div style={{ fontSize:13 }}>Try widening the risk range or clearing a facet.</div>
              <button className="btn sm" onClick={()=>{ setTypes(new Set()); setJuris(new Set()); setRiskMin(0); setQ(""); }} style={{ marginTop:4 }}>Clear all filters</button>
            </div>
          )}
          </>) }
        </div>

        {/* selection action bar */}
        {sel.size>0 && (
          <div className="row between center rise" style={{ padding:"12px 20px", borderTop:"1px solid var(--line)", background:"var(--bg-2)" }}>
            <span className="row gap-10 center">
              <Badge kind="accent">{sel.size} selected</Badge>
              <button className="btn ghost sm" onClick={()=>setSel(new Set())}>Clear</button>
            </span>
            <div className="row gap-8">
              <button className="btn sm" onClick={exportCsv}><Icon name="download" size={14}/>Export CSV</button>
              <button className="btn sm"><Icon name="bookmark" size={14}/>Add to watchlist</button>
              <button className="btn sm" onClick={()=>go("graph")}><Icon name="graph" size={14}/>Open in graph</button>
              <button className="btn primary sm" onClick={()=>go("cases")}><Icon name="plus" size={14}/>Add to case</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
