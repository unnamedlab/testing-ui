import { useState } from 'react';
import { ALERT_RULES, GEOFENCES } from '../data/data_admin.js';
import { OBJECT_TYPES, SERIES } from '../data/data.js';
import { Badge, Bars, Icon, SectionHead } from '../components/ui.jsx';
import { SEV_META } from './CasesView.jsx';

/* ============================================================
   AXIOM — Alert rules + geofencing
   ============================================================ */

export function RuleBuilder({ open, onClose }){
  const [sev, setSev] = useState("high");
  if(!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:140, background:"oklch(0 0 0/0.5)", backdropFilter:"blur(3px)", display:"grid", placeItems:"center" }}>
      <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(560px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
        <div className="row between center" style={{ padding:"16px 20px", borderBottom:"1px solid var(--line-soft)" }}>
          <span className="serif" style={{ fontSize:18 }}>New alert rule</span>
          <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{transform:"rotate(45deg)"}}/></button>
        </div>
        <div style={{ padding:20 }} className="col gap-16">
          <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Rule name</div>
            <div style={{ padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, fontSize:13.5, color:"var(--text)" }}>Untitled rule</div></div>
          <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>When an object of type</div>
            <div className="row gap-6 wrap">{OBJECT_TYPES.slice(0,5).map(t=><span key={t.id} className={"chip"+(t.id==="vessel"?" on":"")}>{t.name}</span>)}</div></div>
          <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Condition</div>
            <div className="row gap-8 center">
              <div style={{ flex:1, padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, fontSize:13, fontFamily:"var(--font-mono)", color:"var(--text)" }}>ais_gap_hours</div>
              <div style={{ padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, fontSize:13, fontFamily:"var(--font-mono)", color:"var(--accent)" }}>{">"}</div>
              <div style={{ width:80, padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, fontSize:13, fontFamily:"var(--font-mono)", color:"var(--text)" }}>4</div>
            </div>
          </div>
          <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Inside geofence</div>
            <div className="row gap-6 wrap">{GEOFENCES.map(g=><span key={g.id} className={"chip"+(g.id==="g1"?" on":"")}><Icon name="globe" size={13}/>{g.name}</span>)}</div></div>
          <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Severity</div>
            <div className="row gap-6">{Object.entries(SEV_META).map(([k,v])=><button key={k} onClick={()=>setSev(k)} className={"chip"+(sev===k?" on":"")}><span style={{width:7,height:7,borderRadius:"50%",background:v.c}}/>{v.label}</button>)}</div></div>
        </div>
        <div className="row between center" style={{ padding:"14px 20px", borderTop:"1px solid var(--line-soft)" }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onClose}><Icon name="check"/>Create rule</button>
        </div>
      </div>
    </div>
  );
}

export function RulesView(){
  const [rules, setRules] = useState(ALERT_RULES);
  const [builder, setBuilder] = useState(false);
  function toggle(id){ setRules(rs=>rs.map(r=>r.id===id?{...r,enabled:!r.enabled}:r)); }

  return (
    <div style={{ flex:1, overflow:"auto", padding:"22px 24px 60px" }}>
      <div style={{ maxWidth:1040, margin:"0 auto", display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:24 }} className="fade-in">
        <div>
          <SectionHead eyebrow={"Detection rules · "+rules.filter(r=>r.enabled).length+" active"} title="Alert rules">
            <button className="btn primary sm" onClick={()=>setBuilder(true)}><Icon name="plus" size={14}/>New rule</button>
          </SectionHead>
          <div className="col gap-10">
            {rules.map(r=>(
              <div key={r.id} className="card" style={{ padding:14, opacity: r.enabled?1:0.6 }}>
                <div className="row between center" style={{ marginBottom:8 }}>
                  <div className="row gap-8 center">
                    <span style={{ width:8,height:8,borderRadius:2,background:SEV_META[r.sev].c }}/>
                    <span style={{ fontSize:14, fontWeight:600 }}>{r.name}</span>
                    <Badge>{r.type}</Badge>
                  </div>
                  <button onClick={()=>toggle(r.id)} style={{ border:"none", background:"none", cursor:"pointer" }}>
                    <span style={{ width:32, height:18, borderRadius:10, background: r.enabled?"var(--accent)":"var(--bg-3)", position:"relative", display:"block", transition:"background .15s" }}>
                      <span style={{ position:"absolute", top:2, left: r.enabled?16:2, width:14, height:14, borderRadius:"50%", background:"var(--bg-1)", transition:"left .15s" }}/>
                    </span>
                  </button>
                </div>
                <div className="mono t-dim" style={{ fontSize:12, background:"var(--bg-inset)", borderRadius:7, padding:"7px 10px", marginBottom:8 }}>IF {r.cond}</div>
                <div className="row between center">
                  <span className="t-faint" style={{ fontSize:11.5 }}>Scope: {r.scope}</span>
                  <span className="mono" style={{ fontSize:11.5, color: r.triggers? "var(--alert)":"var(--text-faint)" }}>{r.triggers} triggers · 7d</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col gap-16">
          <div className="card" style={{ padding:16 }}>
            <div className="eyebrow" style={{ marginBottom:12 }}>Geofences</div>
            <div style={{ position:"relative", height:170, borderRadius:10, overflow:"hidden", background:"var(--bg-inset)", marginBottom:12 }} className="dotgrid-bg">
              <svg width="100%" height="100%" viewBox="0 0 300 170">
                <g fill="var(--bg-2)" stroke="var(--line)"><path d="M0,0 H150 Q140,40 110,52 Q60,66 0,60 Z"/><path d="M300,170 H120 Q150,120 200,118 Q260,120 300,90 Z"/></g>
                {GEOFENCES.map((g)=>(
                  <g key={g.id}>
                    <circle cx={g.x*3} cy={g.y*1.7} r={g.r*0.6} fill={`var(--${g.sev}-ghost)`} stroke={`var(--${g.sev})`} strokeWidth="1.5" strokeDasharray="4 4"/>
                    <circle cx={g.x*3} cy={g.y*1.7} r="3" fill={`var(--${g.sev})`}/>
                  </g>
                ))}
              </svg>
            </div>
            <div className="col gap-8">
              {GEOFENCES.map(g=>(
                <div key={g.id} className="row between center">
                  <span className="row gap-8 center"><span style={{ width:8,height:8,borderRadius:2,background:`var(--${g.sev})` }}/><span style={{ fontSize:12.5 }}>{g.name}</span></span>
                  <span className="mono t-faint" style={{ fontSize:11 }}>{g.vessels} vessels</span>
                </div>
              ))}
            </div>
            <button className="btn sm" style={{ width:"100%", marginTop:12 }}><Icon name="plus" size={14}/>Draw geofence</button>
          </div>
          <div className="card" style={{ padding:16 }}>
            <div className="eyebrow" style={{ marginBottom:10 }}>Rule firing · 7d</div>
            <Bars data={SERIES.alerts} w={250} h={70} color="var(--alert)"/>
          </div>
        </div>
      </div>
      <RuleBuilder open={builder} onClose={()=>setBuilder(false)} />
    </div>
  );
}
