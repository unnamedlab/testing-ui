import { useEffect, useState } from 'react';
import { CONNECTORS } from '../data/data_ext.js';
import { Icon } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — SourceWizard (source onboarding)
   Owned by the Integrate · Sources surface. Previously lived in
   AdminView; moved here so "connect a data source" has a single
   canonical home (SourcesView). (Consolidation P2.)
   ============================================================ */

export function SourceWizard({ open, onClose }){
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [conn, setConn] = useState(null);
  useEffect(()=>{ if(open){ setStep(0); setConn(null); } }, [open]);
  if(!open) return null;
  const steps = ["Connector","Configure","Map to ontology","Review"];
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:140, background:"var(--scrim)", backdropFilter:"var(--scrim-blur)", display:"grid", placeItems:"center" }}>
      <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(680px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
        <div className="row between center" style={{ padding:"16px 20px", borderBottom:"1px solid var(--line-soft)" }}>
          <span className="serif" style={{ fontSize:18 }}>{t('Connect a data source')}</span>
          <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="x" size={16}/></button>
        </div>
        {/* stepper */}
        <div className="row" style={{ padding:"14px 20px", gap:8, borderBottom:"1px solid var(--line-soft)" }}>
          {steps.map((s,i)=>(
            <div key={s} className="row gap-8 center" style={{ flex:1 }}>
              <span style={{ width:22,height:22,borderRadius:"50%",flex:"none",display:"grid",placeItems:"center",fontSize:11,fontWeight:600,
                background: i<=step?"var(--accent)":"var(--bg-3)", color: i<=step?"var(--accent-text)":"var(--text-faint)" }}>{i<step?<Icon name="check" size={12}/>:i+1}</span>
              <span style={{ fontSize:12, color: i<=step?"var(--text)":"var(--text-faint)", whiteSpace:"nowrap" }}>{t(s)}</span>
              {i<steps.length-1 && <div style={{ flex:1, height:1, background:"var(--line)" }}/>}
            </div>
          ))}
        </div>

        <div style={{ padding:20, minHeight:240 }}>
          {step===0 && <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {CONNECTORS.map(([l,ic])=>(
              <button key={l} onClick={()=>setConn(l)} className="card hover" style={{ padding:14, display:"flex", flexDirection:"column", gap:9, alignItems:"center", cursor:"pointer",
                borderColor: conn===l?"var(--accent)":"var(--line-soft)", boxShadow: conn===l?"0 0 0 1px var(--accent)":"none" }}>
                <span style={{ color:"var(--accent)" }}><Icon name={ic} size={20}/></span>
                <span style={{ fontSize:11.5, textAlign:"center" }}>{l}</span>
              </button>
            ))}
          </div>}
          {step===1 && <div className="col gap-14">
            {[["Connection name","blackfrost_"+(conn||"source").toLowerCase().replace(/[^a-z]/g,"")],["Endpoint / host","ingest.axiom.internal:9092"],["Credentials","vault://axiom/secrets/···"],["Sync cadence","Streaming"]].map(([k,v])=>(
              <div key={k}><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>{t(k)}</div>
                <div style={{ padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, fontSize:13, fontFamily:"var(--font-mono)", color:"var(--text)" }}>{v}</div></div>
            ))}
          </div>}
          {step===2 && <div className="col gap-10">
            <div className="t-dim" style={{ fontSize:13, marginBottom:4 }}>{t('Map incoming fields to ontology object properties:')}</div>
            {[["vessel_name","→ Vessel.name"],["imo_number","→ Vessel.imo"],["lat / lon","→ Vessel.last_position"],["timestamp","→ event.time"]].map(([a,b])=>(
              <div key={a} className="row gap-12 center" style={{ padding:"10px 12px", background:"var(--bg-2)", borderRadius:9 }}>
                <span className="mono" style={{ fontSize:12.5, flex:1 }}>{a}</span>
                <Icon name="arrowRight" size={14} className="t-faint"/>
                <span className="mono t-accent" style={{ fontSize:12.5, flex:1, textAlign:"right" }}>{b}</span>
              </div>
            ))}
          </div>}
          {step===3 && <div className="col gap-12">
            <div className="card" style={{ padding:16 }}>
              <div className="row gap-12 center"><span style={{color:"var(--accent)"}}><Icon name="check" size={22}/></span>
                <div><div style={{ fontSize:14, fontWeight:600 }}>{t('Ready to connect · {conn}', { conn: conn||t('Source') })}</div><div className="t-faint" style={{ fontSize:12, marginTop:2 }}>{t('4 fields mapped · streaming · classification CONFIDENTIAL')}</div></div></div>
            </div>
            <div className="t-faint" style={{ fontSize:12.5, lineHeight:1.5 }}>{t('On confirm, AXIOM provisions the connector, begins ingestion, and runs entity resolution against existing objects. Estimated first sync: ~2 min.')}</div>
          </div>}
        </div>

        <div className="row between center" style={{ padding:"14px 20px", borderTop:"1px solid var(--line-soft)" }}>
          <button className="btn ghost" onClick={()=> step===0?onClose():setStep(step-1)}>{step===0?t('Cancel'):t('Back')}</button>
          <button className="btn primary" disabled={step===0&&!conn} onClick={()=> step<3 ? setStep(step+1) : onClose()}>
            {step<3?<>{t('Continue')} <Icon name="arrowRight" size={15}/></>:<><Icon name="check"/>{t('Connect source')}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
