import { useState } from 'react';
import { ROLES, USERS } from '../data/data_admin.js';
import { MarkingChip } from '../components/Security.jsx';
import { RoleCard } from '../components/Access.jsx';
import { Avatar, Badge, Icon, SectionHead, PageHeader } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Admin: users & roles.
   (Source onboarding now lives in SourcesView · SourceWizard.jsx — P2.)
   ============================================================ */


export function AdminView(){
  const { t } = useI18n();
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
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Administration')} title={t('Users & roles')}>
          <button className="btn primary" onClick={()=>setInviting(true)}><Icon name="plus"/>{t('Invite user')}</button>
        </PageHeader>

        {(
          <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:24 }}>
            <div>
              <SectionHead eyebrow={t('Users · {n}', { n: USERS.length })} title={t('Members')} />
              <div className="card" style={{ overflow:"hidden" }}>
                <table className="tbl">
                  <thead><tr><th>{t('User')}</th><th>{t('Role')}</th><th>{t('Clearance')}</th><th>{t('Status')}</th><th>{t('Active')}</th></tr></thead>
                  <tbody>
                    {users.map(u=>(
                      <tr key={u.id}>
                        <td><span className="row gap-10 center"><Avatar who={u.id} size={26}/><span style={{ color:"var(--text)", fontWeight:600 }}>{u.name}</span></span></td>
                        <td>{t(u.role)}</td>
                        <td><MarkingChip level={u.clearance==="TS/SCI"?"SECRET":u.clearance} size="sm"/></td>
                        <td><Badge kind={u.status==="active"?"ok":"alert"} dot>{t(u.status)}</Badge></td>
                        <td className="mono">{t(u.last)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <SectionHead eyebrow={t('Roles · {n}', { n: ROLES.length })} title={t('Roles')} />
              <div className="col gap-10">
                {ROLES.map(r=>(
                  <RoleCard key={r.name} name={r.name} meta={t('{n} members', { n: r.members })} perms={r.perms} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {inviting && (
        <div onClick={()=>setInviting(false)} style={{ position:"fixed", inset:0, zIndex:140, background:"var(--scrim)", backdropFilter:"var(--scrim-blur)", display:"grid", placeItems:"center" }}>
          <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(440px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
            <div className="row between center" style={{ padding:"15px 18px", borderBottom:"1px solid var(--line-soft)" }}>
              <span className="serif" style={{ fontSize:17, whiteSpace:"nowrap" }}>{t('Invite user')}</span>
              <button className="icon-btn" onClick={()=>setInviting(false)} style={{ width:30,height:30 }}><Icon name="x" size={16}/></button>
            </div>
            <div style={{ padding:18 }} className="col gap-14">
              <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>{t('Full name')}</div>
                <input autoFocus value={inv.name} onChange={e=>setInv(d=>({...d,name:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")invite();}} placeholder={t('e.g. Dana Lopez')}
                  style={{ width:"100%", padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13.5, outline:"none" }} /></div>
              <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>{t('Role')}</div>
                <div className="row gap-6 wrap">{ROLES.map(r=><button key={r.name} className={"chip"+(inv.role===r.name?" on":"")} onClick={()=>setInv(d=>({...d,role:r.name}))}>{t(r.name)}</button>)}</div></div>
            </div>
            <div className="row between center" style={{ padding:"13px 18px", borderTop:"1px solid var(--line-soft)" }}>
              <button className="btn ghost" onClick={()=>setInviting(false)}>{t('Cancel')}</button>
              <button className="btn primary" onClick={invite}><Icon name="check"/>{t('Send invite')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
