import { useState } from 'react';
import { BOARDS } from '../data/data_ext.js';
import { ACTIVITY, APPS, ENTITIES, PROJECTS, SERIES, TRANSACTIONS, TYPE_BY_ID, fmtMoney } from '../data/data.js';
import { Badge, Bars, Gauge, Icon, RiskPill, SectionHead, Stat, TypeGlyph } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Home workspace + Operations dashboard
   ============================================================ */

export function HomeView({ go, openProject }) {
  return (
    <div className="content" style={{ padding: "28px 32px 60px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }} className="fade-in">
        {/* hero */}
        <div className="row between" style={{ alignItems:"flex-end", marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Tuesday · 02 Jun 2026 · 09:14 UTC</div>
            <h1 className="serif" style={{ fontSize: 38, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>
              Welcome back, Ana
            </h1>
            <div className="t-dim" style={{ fontSize: 15, marginTop: 6 }}>
              <span className="t-accent">12 alerts</span> need triage across 4 active investigations.
            </div>
          </div>
          <div className="row gap-8">
            <button className="btn"><Icon name="download" />Import data</button>
            <button className="btn primary"><Icon name="plus" />New investigation</button>
          </div>
        </div>

        {/* apps */}
        <SectionHead eyebrow="Applications" title="Open a module" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 36 }}>
          {APPS.map(a=>(
            <button key={a.id} className="card hover" onClick={()=>go(a.view)} style={{
              padding: 18, textAlign:"left", cursor:"pointer", display:"flex", flexDirection:"column", gap:14, background:"var(--bg-1)",
            }}>
              <div style={{ width:42, height:42, borderRadius:12, display:"grid", placeItems:"center",
                background:`color-mix(in oklab, ${a.color} 16%, var(--bg-2))`, color:a.color,
                boxShadow:`inset 0 0 0 1px color-mix(in oklab, ${a.color} 30%, transparent)` }}>
                <Icon name={a.icon} size={22}/>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:600 }}>{a.name}</div>
                <div className="t-faint" style={{ fontSize:12.5, marginTop:3 }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.55fr 1fr", gap: 24 }}>
          {/* projects */}
          <div>
            <SectionHead eyebrow="Investigations" title="Your projects">
              <button className="btn ghost sm">View all</button>
            </SectionHead>
            <div className="col gap-10">
              {PROJECTS.map(p=>(
                <button key={p.id} className="card hover" onClick={()=>openProject(p.id)} style={{ padding:16, textAlign:"left", cursor:"pointer" }}>
                  <div className="row between center">
                    <div className="row gap-12 center">
                      <div style={{ width:40, height:40, borderRadius:11, display:"grid", placeItems:"center",
                        background:"var(--bg-2)", color:"var(--text-dim)", position:"relative" }}>
                        <Icon name={p.pinned?"pin":"bookmark"} size={18}/>
                      </div>
                      <div>
                        <div className="row gap-8 center">
                          <span style={{ fontSize:15, fontWeight:600 }}>{p.name}</span>
                          {p.alerts>0 && <Badge kind="alert" dot>{p.alerts}</Badge>}
                        </div>
                        <div className="t-faint" style={{ fontSize:12.5, marginTop:2 }}>{p.sub} · {p.members} members</div>
                      </div>
                    </div>
                    <div className="col" style={{ alignItems:"flex-end", gap:7, minWidth:120 }}>
                      <span className="t-faint mono" style={{ fontSize:11 }}>{p.updated}</span>
                      <div className="row gap-8 center" style={{ width:120 }}>
                        <div className="meter" style={{ flex:1 }}><i style={{ width:p.progress+"%" }} /></div>
                        <span className="mono t-dim" style={{ fontSize:11 }}>{p.progress}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* activity */}
          <div>
            <SectionHead eyebrow="Stream" title="Activity">
              <span className="live-dot" />
            </SectionHead>
            <div className="panel" style={{ padding: "6px 0" }}>
              {ACTIVITY.map((a,i)=>(
                <div key={i} className="row gap-10" style={{ padding:"11px 16px", borderBottom: i<ACTIVITY.length-1?"1px solid var(--line-soft)":"none" }}>
                  <span style={{ marginTop:2, color: a.kind==="alert"?"var(--alert)":a.kind==="system"?"var(--accent)":"var(--text-faint)" }}>
                    <Icon name={a.kind==="alert"?"alertTri":a.kind==="system"?"sparkles":"user"} size={16}/>
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13 }}><b style={{ fontWeight:600 }}>{a.who}</b> <span className="t-dim">{a.what}</span></div>
                  </div>
                  <span className="t-faint mono" style={{ fontSize:11 }}>{a.when}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:16, marginTop:14 }}>
              <div className="eyebrow" style={{ marginBottom:10 }}>Platform health</div>
              <div className="col gap-12">
                {[["Ingestion",92,"var(--ok)"],["Entity resolution",88,"var(--accent)"],["Alert latency",74,"var(--warn)"]].map(([l,v,c])=>(
                  <div key={l} className="row gap-10 center">
                    <span style={{ fontSize:12.5, width:120 }} className="t-dim">{l}</span>
                    <div className="meter" style={{ flex:1 }}><i style={{ width:v+"%", background:c }} /></div>
                    <span className="mono t-dim" style={{ fontSize:11, width:30 }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding:16, marginTop:14 }}>
              <div className="row between center" style={{ marginBottom:12 }}>
                <div className="eyebrow">Shared boards</div>
                <button className="btn ghost sm">New</button>
              </div>
              <div className="col gap-8">
                {BOARDS.map(b=>(
                  <button key={b.id} onClick={()=>go(b.kind==="map"?"map":b.kind==="graph"?"graph":"dashboard")} className="row gap-10 center" style={{ padding:"7px 6px", border:"none", background:"none", borderRadius:8, cursor:"pointer", textAlign:"left" }}
                    onMouseEnter={ev=>ev.currentTarget.style.background="var(--bg-2)"} onMouseLeave={ev=>ev.currentTarget.style.background="none"}>
                    <span style={{ width:28,height:28,borderRadius:8,display:"grid",placeItems:"center",background:"var(--bg-2)",color:"var(--text-dim)",flex:"none" }}><Icon name={b.kind==="map"?"globe":b.kind==="graph"?"graph":"grid"} size={15}/></span>
                    <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.name}</div><div className="t-faint" style={{ fontSize:11 }}>{b.collab} collaborators · {b.updated}</div></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Operations dashboard ----
export function DashboardView({ go }) {
  const [filter, setFilter] = useState(null); // {kind:'pattern'|'entity', value, label}
  const PATTERN_MAP = { "Layering":["layering","layer"], "AIS gap":["ais"], "Sanctions":["sanction"] };
  const shownTxns = TRANSACTIONS.filter(t=>{
    if(!filter) return true;
    if(filter.kind==="pattern"){ const keys=PATTERN_MAP[filter.value]||[]; return keys.some(k=>(t.note||"").toLowerCase().includes(k)); }
    if(filter.kind==="entity"){ const n=filter.label.toLowerCase(); return (t.from||"").toLowerCase().includes(n.split(" ")[0]) || (t.to||"").toLowerCase().includes(n.split(" ")[0]); }
    return true;
  });
  function setCat(value){ setFilter(f=> f&&f.kind==="pattern"&&f.value===value ? null : {kind:"pattern", value, label:value}); }
  function setEnt(e){ setFilter(f=> f&&f.kind==="entity"&&f.value===e.id ? null : {kind:"entity", value:e.id, label:e.name}); }
  return (
    <div className="content" style={{ padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }} className="fade-in">
        <SectionHead eyebrow="Case BLACKFROST · live" title="Operations overview">
          {filter && <button className="chip on" onClick={()=>setFilter(null)} style={{ marginRight:4 }}>Filtered: {filter.label} <Icon name="plus" size={12} style={{transform:"rotate(45deg)", marginLeft:2}}/></button>}
          <div className="seg">
            <button>24h</button><button className="on">7d</button><button>30d</button>
          </div>
          <button className="btn"><Icon name="download"/>Export</button>
        </SectionHead>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:18 }}>
          <Stat label="Open alerts" value="12" sub="▲ 4 vs prev" trend="down" series={SERIES.alerts} color="var(--alert)" icon="alertTri" />
          <Stat label="Flagged txns (7d)" value="$58.7M" sub="▲ 18%" trend="up" series={SERIES.txns} color="var(--accent)" icon="swap" />
          <Stat label="Objects ingested" value="56.3K" sub="▲ 12.4K today" trend="up" series={SERIES.ingest} color="var(--ok)" icon="box" />
          <Stat label="Resolution rate" value="88%" sub="▲ 3.1%" trend="up" series={SERIES.resolve} color="var(--info)" icon="merge" />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>
          {/* alert timeline */}
          <div className="card" style={{ padding:18 }}>
            <div className="row between center" style={{ marginBottom:16 }}>
              <div className="eyebrow">Alert volume · last 7 days</div>
              <div className="row gap-12">
                {[["Layering","var(--alert)"],["AIS gap","var(--warn)"],["Sanctions","var(--accent)"]].map(([l,c])=>(
                  <button key={l} onClick={()=>setCat(l)} className="row gap-6 center" style={{ fontSize:11.5, border:"none", background:"none", cursor:"pointer", padding:"2px 4px", borderRadius:5, opacity: filter&&filter.kind==="pattern"&&filter.value!==l?0.4:1, outline: filter&&filter.value===l?"1px solid var(--accent)":"none" }}><i style={{ width:8,height:8,borderRadius:2,background:c,display:"inline-block" }}/><span className="t-dim">{l}</span></button>
                ))}
              </div>
            </div>
            <Bars data={SERIES.alerts} w={680} h={120} color="var(--alert)" />
            <div className="row between" style={{ marginTop:8 }}>
              {["Wed","Thu","Fri","Sat","Sun","Mon","Tue"].map(d=><span key={d} className="mono t-faint" style={{ fontSize:10.5 }}>{d}</span>)}
            </div>
          </div>

          {/* risk gauge + breakdown */}
          <div className="card" style={{ padding:18, display:"flex", flexDirection:"column" }}>
            <div className="eyebrow" style={{ marginBottom:14 }}>Network risk index</div>
            <div className="row gap-16 center" style={{ marginBottom:16 }}>
              <Gauge value={84} label="84" sub="Critical" color="var(--alert)" size={104} />
              <div className="col gap-10" style={{ flex:1 }}>
                {[["Financial",78,"var(--accent)"],["Maritime",90,"var(--alert)"],["Corporate",61,"var(--warn)"]].map(([l,v,c])=>(
                  <div key={l}>
                    <div className="row between" style={{ fontSize:12, marginBottom:4 }}><span className="t-dim">{l}</span><span className="mono">{v}</span></div>
                    <div className="meter"><i style={{ width:v+"%", background:c }}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="divider" style={{ margin:"4px 0 14px" }} />
            <div className="eyebrow" style={{ marginBottom:10 }}>Top risk entities</div>
            <div className="col gap-2">
              {ENTITIES.filter(e=>e.risk>=80).slice(0,4).map(e=>(
                <button key={e.id} onClick={()=>setEnt(e)} className="row gap-10 center" style={{ padding:"7px 6px", border:"none", background: filter&&filter.value===e.id?"var(--accent-ghost)":"none", borderRadius:8, cursor:"pointer", textAlign:"left" }}
                  onMouseEnter={ev=>{ if(!(filter&&filter.value===e.id)) ev.currentTarget.style.background="var(--bg-2)"; }} onMouseLeave={ev=>{ if(!(filter&&filter.value===e.id)) ev.currentTarget.style.background="none"; }}>
                  <TypeGlyph type={e.type} size={28}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div>
                    <div className="t-faint" style={{ fontSize:11.5 }}>{TYPE_BY_ID[e.type].name}</div>
                  </div>
                  <RiskPill r={e.risk}/>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* transactions table */}
        <div className="card" style={{ overflow:"hidden" }}>
          <div className="row between center" style={{ padding:"14px 18px", borderBottom:"1px solid var(--line-soft)" }}>
            <div className="row gap-10 center"><div className="eyebrow">Flagged transactions</div>{filter && <Badge kind="accent">{shownTxns.length} match · {filter.label}</Badge>}</div>
            <button className="btn ghost sm" onClick={()=>go("graph")}>Open in graph <Icon name="arrowRight" size={14}/></button>
          </div>
          <table className="tbl">
            <thead><tr><th>ID</th><th>Date</th><th>From</th><th>To</th><th style={{textAlign:"right"}}>Amount</th><th>Pattern</th><th></th></tr></thead>
            <tbody>
              {shownTxns.map(t=>(
                <tr key={t.id}>
                  <td className="mono" style={{ color:"var(--text)" }}>{t.id}</td>
                  <td className="mono">{t.date}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td className="mono" style={{ textAlign:"right", color:"var(--text)", fontWeight:600 }}>{fmtMoney(t.amount,t.ccy)}</td>
                  <td><Badge kind={t.flag==="ok"?"ok":t.flag}>{t.note}</Badge></td>
                  <td style={{ textAlign:"right", color:"var(--text-faint)" }}><Icon name="chevron" size={15}/></td>
                </tr>
              ))}
              {shownTxns.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", padding:"28px 0", color:"var(--text-faint)" }}>No transactions match “{filter?.label}”</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
