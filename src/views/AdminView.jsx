import { useEffect, useState } from 'react';
import { ROLES, USERS } from '../data/data_admin.js';
import { ANALYSTS, CONNECTORS } from '../data/data_ext.js';
import { MarkingChip } from '../components/Security.jsx';
import { Avatar, Badge, Icon, PageHeader, SectionHead } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Admin: data sources, onboarding wizard, audit log
   ============================================================ */

export function SourceWizard({ open, onClose }){
  const [step, setStep] = useState(0);
  const [conn, setConn] = useState(null);
  useEffect(()=>{ if(open){ setStep(0); setConn(null); } }, [open]);
  if(!open) return null;
  const steps = ["Connector","Configure","Map to ontology","Review"];
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:140, background:"var(--scrim)", backdropFilter:"var(--scrim-blur)", display:"grid", placeItems:"center" }}>
      <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(680px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
        <div className="row between center" style={{ padding:"16px 20px", borderBottom:"1px solid var(--line-soft)" }}>
          <span className="serif" style={{ fontSize:18 }}>Connect a data source</span>
          <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{transform:"rotate(45deg)"}}/></button>
        </div>
        {/* stepper */}
        <div className="row" style={{ padding:"14px 20px", gap:8, borderBottom:"1px solid var(--line-soft)" }}>
          {steps.map((s,i)=>(
            <div key={s} className="row gap-8 center" style={{ flex:1 }}>
              <span style={{ width:22,height:22,borderRadius:"50%",flex:"none",display:"grid",placeItems:"center",fontSize:11,fontWeight:600,
                background: i<=step?"var(--accent)":"var(--bg-3)", color: i<=step?"var(--accent-text)":"var(--text-faint)" }}>{i<step?<Icon name="check" size={12}/>:i+1}</span>
              <span style={{ fontSize:12, color: i<=step?"var(--text)":"var(--text-faint)", whiteSpace:"nowrap" }}>{s}</span>
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
              <div key={k}><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>{k}</div>
                <div style={{ padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, fontSize:13, fontFamily:"var(--font-mono)", color:"var(--text)" }}>{v}</div></div>
            ))}
          </div>}
          {step===2 && <div className="col gap-10">
            <div className="t-dim" style={{ fontSize:13, marginBottom:4 }}>Map incoming fields to ontology object properties:</div>
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
                <div><div style={{ fontSize:14, fontWeight:600 }}>Ready to connect · {conn||"Source"}</div><div className="t-faint" style={{ fontSize:12, marginTop:2 }}>4 fields mapped · streaming · classification CONFIDENTIAL</div></div></div>
            </div>
            <div className="t-faint" style={{ fontSize:12.5, lineHeight:1.5 }}>On confirm, AXIOM provisions the connector, begins ingestion, and runs entity resolution against existing objects. Estimated first sync: ~2 min.</div>
          </div>}
        </div>

        <div className="row between center" style={{ padding:"14px 20px", borderTop:"1px solid var(--line-soft)" }}>
          <button className="btn ghost" onClick={()=> step===0?onClose():setStep(step-1)}>{step===0?"Cancel":"Back"}</button>
          <button className="btn primary" disabled={step===0&&!conn} onClick={()=> step<3 ? setStep(step+1) : onClose()}>
            {step<3?<>Continue <Icon name="arrowRight" size={15}/></>:<><Icon name="check"/>Connect source</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminView(){
  const [users, setUsers] = useState(USERS);
  const [inviting, setInviting] = useState(false);
  const [inv, setInv] = useState({ name:"", role:"Analyst" });
  function invite(){
    const name=inv.name.trim()||"New Member";
    const id=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    setUsers(u=>[{ id, name, role:inv.role, clearance:"CONFIDENTIAL", status:"active", last:"invited" }, ...u]);
    setInviting(false); setInv({ name:"", role:"Analyst" });
  }
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow="Administration" title="Users & roles" sub="Usuarios, roles y permisos. El registro de auditoría vive ahora en Governance.">
          <button className="btn primary" onClick={()=>setInviting(true)}><Icon name="plus"/>Invite user</button>
        </PageHeader>

        <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:24 }}>
            <div>
              <SectionHead eyebrow={"Users · "+USERS.length} title="Members" />
              <div className="card" style={{ overflow:"hidden" }}>
                <table className="tbl">
                  <thead><tr><th>User</th><th>Role</th><th>Clearance</th><th>Status</th><th>Active</th></tr></thead>
                  <tbody>
                    {users.map(u=>(
                      <tr key={u.id}>
                        <td><span className="row gap-10 center"><Avatar who={u.id} name={ANALYSTS[u.id]?.name} size={26}/><span style={{ color:"var(--text)", fontWeight:600 }}>{u.name}</span></span></td>
                        <td>{u.role}</td>
                        <td><MarkingChip level={u.clearance==="TS/SCI"?"SECRET":u.clearance} size="sm"/></td>
                        <td><Badge kind={u.status==="active"?"ok":"alert"} dot>{u.status}</Badge></td>
                        <td className="mono">{u.last}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <SectionHead eyebrow={"Roles · "+ROLES.length} title="Roles" />
              <div className="col gap-10">
                {ROLES.map(r=>(
                  <div key={r.name} className="card" style={{ padding:14 }}>
                    <div className="row between center" style={{ marginBottom:9 }}>
                      <span style={{ fontSize:13.5, fontWeight:600 }}>{r.name}</span>
                      <span className="t-faint mono" style={{ fontSize:11 }}>{r.members} member{r.members!==1?"s":""}</span>
                    </div>
                    <div className="row gap-6 wrap">
                      {r.perms.map(p=><span key={p} className="badge" style={{ fontSize:9.5 }}>{p}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
      {inviting && (
        <div onClick={()=>setInviting(false)} style={{ position:"fixed", inset:0, zIndex:140, background:"var(--scrim)", backdropFilter:"var(--scrim-blur)", display:"grid", placeItems:"center" }}>
          <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(440px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
            <div className="row between center" style={{ padding:"15px 18px", borderBottom:"1px solid var(--line-soft)" }}>
              <span className="serif" style={{ fontSize:17, whiteSpace:"nowrap" }}>Invite user</span>
              <button className="icon-btn" onClick={()=>setInviting(false)} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{transform:"rotate(45deg)"}}/></button>
            </div>
            <div style={{ padding:18 }} className="col gap-14">
              <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Full name</div>
                <input autoFocus value={inv.name} onChange={e=>setInv(d=>({...d,name:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")invite();}} placeholder="e.g. Dana Lopez"
                  style={{ width:"100%", padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13.5, outline:"none" }} /></div>
              <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Role</div>
                <div className="row gap-6 wrap">{ROLES.map(r=><button key={r.name} className={"chip"+(inv.role===r.name?" on":"")} onClick={()=>setInv(d=>({...d,role:r.name}))}>{r.name}</button>)}</div></div>
            </div>
            <div className="row between center" style={{ padding:"13px 18px", borderTop:"1px solid var(--line-soft)" }}>
              <button className="btn ghost" onClick={()=>setInviting(false)}>Cancel</button>
              <button className="btn primary" onClick={invite}><Icon name="check"/>Send invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
