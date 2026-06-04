import { useState } from 'react';
import { DIMS, MEASURES, ROWS, aggBy, applyFilters, dimField, fmtMoney, fmtNum, histo, monthly, pivotData } from '../data/data_analytics.js';
import { Icon, PageHeader, Seg } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Analytics (Quiver / Contour)
   Real charting + no-code analysis board + cross-filter.
   ============================================================ */
const PAL = ["var(--accent)","var(--violet)","var(--warn)","var(--ok)","var(--info)","var(--alert)"];
function colorFor(dim, key){ const i=DIMS[dim].domain.indexOf(key); return PAL[(i<0?0:i)%PAL.length]; }
function fmt(v, money){ return money ? fmtMoney(v) : fmtNum(v); }

function VBars({ rows, dim, money, onPick, filters }){
  const max = Math.max(...rows.map(r=>r.value), 1); const active = filters[dim];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:210, paddingTop:18 }}>
      {rows.map(r=>{ const on=active===r.key; const dim2=active&&!on;
        return (
          <div key={r.key} onClick={()=>onPick(dim, r.key)} style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer", opacity:dim2?0.4:1, transition:"opacity .15s" }}>
            <span className="mono" style={{ fontSize:11, color:"var(--text-dim)" }}>{fmt(r.value, money)}</span>
            <div style={{ width:"100%", maxWidth:54, height:`${(r.value/max)*150}px`, minHeight:3, borderRadius:"6px 6px 2px 2px", background:colorFor(dim,r.key), boxShadow: on?`0 0 0 2px var(--bg-1), 0 0 0 4px ${colorFor(dim,r.key)}`:"none", transition:"height .3s cubic-bezier(.2,.7,.2,1)" }}/>
            <span style={{ fontSize:11, color:on?"var(--text)":"var(--text-dim)", fontWeight:on?600:400, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>{r.key}</span>
          </div>
        );
      })}
    </div>
  );
}
function MultiLine({ series, dim, area }){
  const W=560,H=200,P=8; const max=Math.max(1,...series.flatMap(s=>s.points));
  const x=i=>P + i/(DIMS.month.domain.length-1)*(W-2*P); const y=v=>H-P - (v/max)*(H-2*P);
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }} preserveAspectRatio="none" height="200">
        {[0.25,0.5,0.75,1].map(g=><line key={g} x1={P} x2={W-P} y1={y(max*g)} y2={y(max*g)} stroke="var(--line-soft)" strokeWidth="1"/>)}
        {series.map(s=>{ const d=s.points.map((v,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)).join(" "); const c=colorFor(dim,s.key);
          return <g key={s.key}>{area && <path d={d+` L ${x(s.points.length-1)} ${H-P} L ${x(0)} ${H-P} Z`} fill={c} opacity="0.12"/>}<path d={d} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>{s.points.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="2.6" fill={c}/>)}</g>;
        })}
      </svg>
      <div className="row between" style={{ marginTop:6, padding:"0 8px" }}>{DIMS.month.domain.map(m=><span key={m} className="mono t-faint" style={{ fontSize:10.5 }}>{m}</span>)}</div>
      <div className="row gap-12 wrap" style={{ marginTop:10 }}>{series.map(s=><span key={s.key} className="row gap-6 center" style={{ fontSize:11.5 }}><i style={{ width:9,height:9,borderRadius:2,background:colorFor(dim,s.key) }}/><span className="t-dim">{s.key}</span></span>)}</div>
    </div>
  );
}
function Donut({ rows, dim, money, onPick, filters }){
  const total=rows.reduce((a,r)=>a+r.value,0)||1; const R=58, C=2*Math.PI*R; let acc=0; const active=filters[dim];
  return (
    <div className="row gap-18 center" style={{ paddingTop:6 }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ flex:"none" }}>
        <g transform="rotate(-90 75 75)">
          {rows.map(r=>{ const f=r.value/total; const dash=f*C; const off=-acc*C; acc+=f; const on=active===r.key;
            return <circle key={r.key} cx="75" cy="75" r={R} fill="none" stroke={colorFor(dim,r.key)} strokeWidth={on?22:16} strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={off} opacity={active&&!on?0.4:1} onClick={()=>onPick(dim,r.key)} style={{ cursor:"pointer", transition:"stroke-width .15s, opacity .15s" }}/>;
          })}
        </g>
        <text x="75" y="71" textAnchor="middle" className="mono" fontSize="17" fontWeight="600" fill="var(--text)">{fmt(total,money)}</text>
        <text x="75" y="87" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" letterSpacing="1.5" fill="var(--text-faint)">TOTAL</text>
      </svg>
      <div className="col gap-2" style={{ flex:1, minWidth:0 }}>
        {rows.map(r=>{ const on=active===r.key; return (
          <button key={r.key} onClick={()=>onPick(dim,r.key)} className="row between center" style={{ border:"none", background:on?"var(--bg-2)":"none", borderRadius:7, padding:"5px 8px", cursor:"pointer", opacity:active&&!on?0.5:1 }}>
            <span className="row gap-8 center"><i style={{ width:9,height:9,borderRadius:2,background:colorFor(dim,r.key) }}/><span style={{ fontSize:12, color:"var(--text-dim)" }}>{r.key}</span></span>
            <span className="mono" style={{ fontSize:11.5, color:"var(--text)" }}>{fmt(r.value,money)}</span>
          </button>
        );})}
      </div>
    </div>
  );
}
function Histo({ buckets }){
  const max=Math.max(1,...buckets);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:130 }}>
        {buckets.map((v,i)=>{ const c=i>=8?"var(--alert)":i>=6?"var(--warn)":i>=4?"var(--info)":"var(--accent)"; return <div key={i} title={`${i*10}–${i*10+9}: ${v}`} style={{ flex:1, height:`${(v/max)*100}%`, minHeight:2, borderRadius:"3px 3px 0 0", background:c, opacity:0.9 }}/>; })}
      </div>
      <div className="row between" style={{ marginTop:6 }}>{["0","","20","","40","","60","","80","99"].map((l,i)=><span key={i} className="mono t-faint" style={{ fontSize:10 }}>{l}</span>)}</div>
    </div>
  );
}
function Pivot({ rowDim, colDim, money, rows }){
  const { t } = useI18n();
  const max=Math.max(1,...rows.mat.flat());
  return (
    <div style={{ overflow:"auto" }}>
      <table className="tbl" style={{ fontSize:12 }}>
        <thead><tr><th style={{ position:"sticky", left:0 }}>{t(DIMS[rowDim].label)} ╲ {t(DIMS[colDim].label)}</th>{rows.ck.map(c=><th key={c} style={{ textAlign:"right" }}>{t(c)}</th>)}</tr></thead>
        <tbody>
          {rows.rk.map((r,ri)=>(
            <tr key={r}><td style={{ color:"var(--text)", fontWeight:600 }}>{r}</td>
              {rows.mat[ri].map((v,ci)=>(<td key={ci} className="mono" style={{ textAlign:"right", color: v?"var(--text)":"var(--text-faint)", background: v?`color-mix(in oklab, var(--accent) ${Math.round((v/max)*30)}%, transparent)`:"transparent" }}>{v?fmt(v,money):"·"}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Card({ title, sub, children }){
  return <div className="card" style={{ padding:18 }}>
    <div className="row between center" style={{ marginBottom:14 }}><div><div className="eyebrow">{title}</div>{sub && <div className="t-faint" style={{ fontSize:11.5, marginTop:3 }}>{sub}</div>}</div></div>
    {children}
  </div>;
}
function Steps({ dim, measure, agg, type, colDim, filters, go }){
  const { t } = useI18n();
  const fk = Object.keys(filters).filter(k=>filters[k]!=null);
  const step = (ic,label,val,c)=>(
    <div className="row gap-10" style={{ padding:"11px 0", borderBottom:"1px solid var(--line-soft)", alignItems:"flex-start" }}>
      <span style={{ width:26,height:26,borderRadius:8,flex:"none",display:"grid",placeItems:"center",color:c||"var(--accent)",background:`color-mix(in oklab, ${c||"var(--accent)"} 14%, transparent)` }}><Icon name={ic} size={14}/></span>
      <div style={{ flex:1, minWidth:0 }}><div className="t-faint" style={{ fontSize:10, letterSpacing:".1em", textTransform:"uppercase" }}>{label}</div><div style={{ fontSize:12.5, color:"var(--text)", marginTop:2 }}>{val}</div></div>
    </div>
  );
  return (
    <aside style={{ width:226, flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto", padding:"16px 16px 30px" }}>
      <div className="eyebrow" style={{ marginBottom:6 }}>{t('Analysis')}</div>
      <div className="t-faint" style={{ fontSize:11.5, marginBottom:8 }}>{t('No-code recipe · re-runs live')}</div>
      {step("database",t('Source'),t('transactions · {n} rows', { n: ROWS.length }),"var(--info)")}
      {step("filter",t('Filter'), fk.length? fk.map(k=>`${t(DIMS[k].label)} = ${t(filters[k])}`).join(" · ") : t('no filters'),"var(--warn)")}
      {step("share",t('Group by'), t(DIMS[dim].label) + (type==="pivot"?" × "+t(DIMS[colDim].label):""),"var(--violet)")}
      {step("bars",t('Aggregate'), (agg==="avg"?"avg":"sum")+"("+t(MEASURES[measure].label).toLowerCase()+")","var(--ok)")}
      {step(type==="line"||type==="area"?"line":type==="donut"?"donut":type==="pivot"?"pivot":"bars",t('Visualize'), t(type.charAt(0).toUpperCase()+type.slice(1)),"var(--accent)")}
      <button className="btn sm" style={{ width:"100%", marginTop:16 }}><Icon name="plus" size={13}/>{t('Add step')}</button>
      <button className="btn primary sm" style={{ width:"100%", marginTop:8 }} onClick={()=>go && go("dashboard")}><Icon name="layers" size={13}/>{t('Publish to dashboard')}</button>
    </aside>
  );
}

export function AnalyticsView({ go }){
  const { t } = useI18n();
  const [dim,setDim] = useState("pattern");
  const [measure,setMeasure] = useState("amount");
  const [agg,setAgg] = useState("sum");
  const [type,setType] = useState("bar");
  const [colDim,setColDim] = useState("juris");
  const [filters,setFilters] = useState({});
  const money = measure==="amount";
  function pick(d,k){ setFilters(f=>({ ...f, [d]: f[d]===k?null:k })); }
  const rows = applyFilters(ROWS, filters);
  const primary = aggBy(rows, dim, measure, agg);
  const series = monthly(rows, dim, measure, DIMS[dim].domain);
  const pv = pivotData(rows, dim, colDim, measure);
  const totalAmt = rows.reduce((a,r)=>a+r.amount,0);
  const flagged = rows.filter(r=>r.pattern!=="Normal").length;
  const avgRisk = rows.length? Math.round(rows.reduce((a,r)=>a+r.risk,0)/rows.length):0;
  const fk = Object.keys(filters).filter(k=>filters[k]!=null);

  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <Steps dim={dim} measure={measure} agg={agg} type={type} colDim={colDim} filters={filters} go={go}/>
      <div style={{ flex:1, overflow:"auto", padding:"22px 26px 50px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
          <PageHeader eyebrow={t('Analyze')} title={t('Analytics')} sub={t('Flagged transactions')}>
            <button className="btn"><Icon name="download"/>{t('Export')}</button>
            <button className="btn primary"><Icon name="plus"/>{t('Add chart')}</button>
          </PageHeader>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
            {[["Total volume", fmtMoney(totalAmt), "bars"],["Records", fmtNum(rows.length), "table"],["Flagged", rows.length?Math.round(flagged/rows.length*100)+"%":"0%", "filter"],["Avg risk", avgRisk, "bell"]].map(([l,v,ic])=>(
              <div key={l} className="card" style={{ padding:16 }}>
                <div className="row between center"><div className="eyebrow">{t(l)}</div><span className="t-faint"><Icon name={ic} size={15}/></span></div>
                <div className="mono" style={{ fontSize:24, fontWeight:600, marginTop:8, letterSpacing:"-0.02em" }}>{v}</div>
              </div>
            ))}
          </div>
          {fk.length>0 && (
            <div className="row gap-8 center wrap" style={{ marginBottom:16, padding:"10px 12px", background:"var(--accent-ghost)", border:"1px solid var(--accent-dim)", borderRadius:10 }}>
              <span className="t-accent row gap-6 center" style={{ fontSize:12, fontWeight:600 }}><Icon name="filter" size={14}/>{t('Cross-filter')}</span>
              {fk.map(k=><span key={k} className="chip on" onClick={()=>pick(k,filters[k])} style={{ cursor:"pointer" }}>{t(DIMS[k].label)}: {t(filters[k])} <Icon name="x" size={11} style={{ marginLeft:2 }}/></span>)}
              <button className="btn ghost sm" onClick={()=>setFilters({})} style={{ marginLeft:"auto" }}>{t('Clear all')}</button>
            </div>
          )}
          <div className="card" style={{ padding:"12px 16px", marginBottom:16, display:"flex", gap:18, flexWrap:"wrap", alignItems:"center" }}>
            <div className="row gap-8 center"><span className="t-faint" style={{ fontSize:11.5 }}>{t('Group')}</span><Seg value={dim} onChange={setDim} options={Object.keys(DIMS).filter(d=>d!=="month").map(d=>({v:d,l:t(DIMS[d].label)}))}/></div>
            <div className="row gap-8 center"><span className="t-faint" style={{ fontSize:11.5 }}>{t('Measure')}</span><Seg value={measure} onChange={v=>{setMeasure(v); if(v==="count")setAgg("sum");}} options={[{v:"amount",l:t('Amount')},{v:"count",l:t('Records')}]}/></div>
            {money && <div className="row gap-8 center"><span className="t-faint" style={{ fontSize:11.5 }}>{t('Agg')}</span><Seg value={agg} onChange={setAgg} options={[{v:"sum",l:t('Sum')},{v:"avg",l:t('Avg')}]}/></div>}
            <div className="row gap-8 center" style={{ marginLeft:"auto" }}><span className="t-faint" style={{ fontSize:11.5 }}>{t('Chart')}</span><Seg value={type} onChange={setType} options={[{v:"bar",ic:"bars"},{v:"line",ic:"line"},{v:"area",ic:"area"},{v:"donut",ic:"donut"},{v:"pivot",ic:"pivot"}]}/></div>
            {type==="pivot" && <div className="row gap-8 center"><span className="t-faint" style={{ fontSize:11.5 }}>{t('Columns')}</span><Seg value={colDim} onChange={setColDim} options={Object.keys(DIMS).filter(d=>d!==dim&&d!=="month").map(d=>({v:d,l:t(DIMS[d].label)}))}/></div>}
          </div>
          <Card title={t('{agg} {measure} by {dim}', { agg: agg==="avg"?t('Average'):t('Total'), measure: t(MEASURES[measure].label).toLowerCase(), dim: t(DIMS[dim].label).toLowerCase() })} sub={(type==="bar"||type==="donut")?t('click a segment to cross-filter the whole board'):(type==="pivot"?t(DIMS[dim].label)+" × "+t(DIMS[colDim].label):t('monthly trend by {dim}', { dim: t(DIMS[dim].label).toLowerCase() }))}>
            {type==="bar" && <VBars rows={primary} dim={dim} money={money} onPick={pick} filters={filters}/>}
            {(type==="line"||type==="area") && <MultiLine series={series} dim={dim} area={type==="area"}/>}
            {type==="donut" && <Donut rows={primary} dim={dim} money={money} onPick={pick} filters={filters}/>}
            {type==="pivot" && <Pivot rowDim={dim} colDim={colDim} money={money} rows={pv}/>}
          </Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
            <Card title={t('Volume by jurisdiction')} sub={t('linked · click to filter')}><Donut rows={aggBy(rows,"juris","amount","sum")} dim="juris" money onPick={pick} filters={filters}/></Card>
            <Card title={t('Risk distribution')} sub={t('all records in view')}><Histo buckets={histo(rows)}/></Card>
          </div>
          <div style={{ marginTop:16 }}><Card title={t('Volume over time')} sub={t('multi-series by pattern')}><MultiLine series={monthly(rows,"pattern","amount",DIMS.pattern.domain)} dim="pattern" area/></Card></div>
        </div>
      </div>
    </div>
  );
}
