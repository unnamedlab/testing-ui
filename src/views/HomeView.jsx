import { useEffect, useState } from 'react';
import { BOARDS, ANALYSTS, CURRENT_USER } from '../data/data_ext.js';
import { ACTIVITY, APPS, ENTITIES, SERIES, TRANSACTIONS, TYPE_BY_ID, fmtMoney } from '../data/data.js';
import { PROJECTS } from '../data/data_projects.js';
import { OPEN_ALERTS, ACTIVE_PROJECTS, PLATFORM_HEALTH, OVERVIEW_KPIS, OPERATIONS_BOARD } from '../data/data_overview.js';
import { Badge, Bars, Gauge, Icon, RiskPill, SectionHead, Stat, TypeGlyph, PageHeader, Seg } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Home workspace + Operations dashboard
   ============================================================ */

export function HomeView({ go, openProject }) {
  const { t, lang } = useI18n();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  const loc = lang === 'es' ? 'es-ES' : 'en-US';
  const stamp = new Intl.DateTimeFormat(loc, { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(now)
    + ' · ' + new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(now) + ' UTC';
  const me = ANALYSTS[CURRENT_USER];
  return (
    <div className="content" style={{ padding: "var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }} className="fade-in">
        {/* hero */}
        <PageHeader variant="hero" eyebrow={stamp} title={t('Welcome back, {name}', { name: me.name.split(' ')[0] })}
          sub={<><span className="t-accent">{t('{n} alerts', { n: OPEN_ALERTS })}</span> {t('need triage across {p} active projects.', { p: ACTIVE_PROJECTS })}</>}>
          <button className="btn"><Icon name="download" />{t('Import data')}</button>
          <button className="btn primary"><Icon name="plus" />{t('New project')}</button>
        </PageHeader>

        {/* apps */}
        <SectionHead eyebrow={t('Applications')} title={t('Open a module')} />
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
            <SectionHead eyebrow={t('Projects')} title={t('Your projects')}>
              <button className="btn ghost sm">{t('View all')}</button>
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
                          {p.counts.alerts>0 && <Badge kind="alert" dot>{p.counts.alerts}</Badge>}
                        </div>
                        <div className="t-faint" style={{ fontSize:12.5, marginTop:2 }}>{p.sub} · {p.members.length} {t('members')}</div>
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
            <SectionHead eyebrow={t('Stream')} title={t('Activity')}>
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
              <div className="row between center" style={{ marginBottom:10 }}>
                <div className="eyebrow">{t('Platform health')}</div>
                <button className="btn ghost sm" onClick={()=>go("health")}>{t('Data Health')} <Icon name="arrowRight" size={13}/></button>
              </div>
              <div className="col gap-12">
                {PLATFORM_HEALTH.map(({ label:l, value:v, color:c })=>(
                  <div key={l} className="row gap-10 center">
                    <span style={{ fontSize:12.5, width:120 }} className="t-dim">{t(l)}</span>
                    <div className="meter" style={{ flex:1 }}><i style={{ width:v+"%", background:c }} /></div>
                    <span className="mono t-dim" style={{ fontSize:11, width:30 }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding:16, marginTop:14 }}>
              <div className="row between center" style={{ marginBottom:12 }}>
                <div className="eyebrow">{t('Shared boards')}</div>
                <button className="btn ghost sm">{t('New')}</button>
              </div>
              <div className="col gap-8">
                {BOARDS.map(b=>(
                  <button key={b.id} onClick={()=>go(b.kind==="map"?"map":b.kind==="graph"?"graph":"dashboard")} className="row gap-10 center hov" style={{ padding:"7px 6px", border:"none", borderRadius:8, cursor:"pointer", textAlign:"left" }}>
                    <span style={{ width:28,height:28,borderRadius:8,display:"grid",placeItems:"center",background:"var(--bg-2)",color:"var(--text-dim)",flex:"none" }}><Icon name={b.kind==="map"?"globe":b.kind==="graph"?"graph":"grid"} size={15}/></span>
                    <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.name}</div><div className="t-faint" style={{ fontSize:11 }}>{b.collab} {t('collaborators')} · {b.updated}</div></div>
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
  const { t } = useI18n();
  const [filter, setFilter] = useState(null); // {kind:'pattern'|'entity', value, label}
  const [range, setRange] = useState("7d");
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
    <div className="content" style={{ padding: "var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Analyze')} title={t('Operations')}
          sub={<span className="row gap-8 center" style={{ flexWrap:"wrap" }}><span className="badge accent"><Icon name="bars" size={11}/>{t('Saved board · published from Analytics')}</span><span className="t-faint mono" style={{ fontSize:11 }}>{t('updated {x}', { x: OPERATIONS_BOARD.updated })}</span></span>}>
          {filter && <button className="chip on" onClick={()=>setFilter(null)} style={{ marginRight:4 }}>{t('Filtered:')} {filter.label} <Icon name="plus" size={12} style={{transform:"rotate(45deg)", marginLeft:2}}/></button>}
          <Seg value={range} options={["24h","7d","30d"]} onChange={setRange} />
          <button className="btn" onClick={()=>go("analytics")}><Icon name="bars"/>{t('Edit in Analytics')}</button>
          <button className="btn"><Icon name="download"/>{t('Export')}</button>
        </PageHeader>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:18 }}>
          {OVERVIEW_KPIS.map(k=>(
            <Stat key={k.key} label={t(k.label)} value={k.value} sub={k.sub} trend={k.trend} series={SERIES[k.seriesKey]} color={k.color} icon={k.icon} />
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>
          {/* alert timeline */}
          <div className="card" style={{ padding:18 }}>
            <div className="row between center" style={{ marginBottom:16 }}>
              <div className="eyebrow">{t('Alert volume · last 7 days')}</div>
              <div className="row gap-12">
                {[["Layering","var(--alert)","tri"],["AIS gap","var(--warn)","sq"],["Sanctions","var(--accent)","dot"]].map(([l,c,sh])=>(
                  <button key={l} onClick={()=>setCat(l)} className="row gap-6 center" style={{ fontSize:11.5, border:"none", background:"none", cursor:"pointer", padding:"2px 4px", borderRadius:5, opacity: filter&&filter.kind==="pattern"&&filter.value!==l?0.4:1, outline: filter&&filter.value===l?"1px solid var(--accent)":"none" }}><i style={{ width:9,height:9,background:c,display:"inline-block", borderRadius: sh==="dot"?"50%":sh==="sq"?2:0, clipPath: sh==="tri"?"polygon(50% 0,100% 100%,0 100%)":"none" }}/><span className="t-dim">{t(l)}</span></button>
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
            <div className="eyebrow" style={{ marginBottom:14 }}>{t('Network risk index')}</div>
            <div className="row gap-16 center" style={{ marginBottom:16 }}>
              <Gauge value={84} label="84" sub={t('Critical')} color="var(--alert)" size={104} />
              <div className="col gap-10" style={{ flex:1 }}>
                {[["Financial",78,"var(--accent)"],["Maritime",90,"var(--alert)"],["Corporate",61,"var(--warn)"]].map(([l,v,c])=>(
                  <div key={l}>
                    <div className="row between" style={{ fontSize:12, marginBottom:4 }}><span className="t-dim">{t(l)}</span><span className="mono">{v}</span></div>
                    <div className="meter"><i style={{ width:v+"%", background:c }}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="divider" style={{ margin:"4px 0 14px" }} />
            <div className="eyebrow" style={{ marginBottom:10 }}>{t('Top risk entities')}</div>
            <div className="col gap-2">
              {ENTITIES.filter(e=>e.risk>=80).slice(0,4).map(e=>(
                <button key={e.id} onClick={()=>setEnt(e)} className={"row gap-10 center hov"+(filter&&filter.value===e.id?" is-active":"")} style={{ padding:"7px 6px", border:"none", borderRadius:8, cursor:"pointer", textAlign:"left" }}>
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
            <div className="row gap-10 center"><div className="eyebrow">{t('Flagged transactions')}</div>{filter && <Badge kind="accent">{shownTxns.length} match · {filter.label}</Badge>}</div>
            <button className="btn ghost sm" onClick={()=>go("graph")}>{t('Open in graph')} <Icon name="arrowRight" size={14}/></button>
          </div>
          <table className="tbl">
            <thead><tr><th>ID</th><th>{t('Date')}</th><th>{t('From')}</th><th>{t('To')}</th><th style={{textAlign:"right"}}>{t('Amount')}</th><th>{t('Pattern')}</th><th></th></tr></thead>
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
              {shownTxns.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", padding:"28px 0", color:"var(--text-faint)" }}>{t('No transactions match')} “{filter?.label}”</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
