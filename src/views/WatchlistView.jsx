import { useState } from 'react';
import { SAVED_SEARCHES, WATCHLISTS } from '../data/data_admin.js';
import { OBJECT_TYPES } from '../data/data.js';
import { Badge, Icon, SectionHead, TypeGlyph } from '../components/ui.jsx';
import { Avatar2 } from './CasesView.jsx';

/* ============================================================
   AXIOM — Watchlists & saved searches
   ============================================================ */

export function WatchlistView({ go }){
  const [lists, setLists] = useState(WATCHLISTS);
  const [searches, setSearches] = useState(SAVED_SEARCHES);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name:"", type:"vessel" });
  function toggleAlerts(id){ setSearches(s=>s.map(x=>x.id===id?{...x,alerts:!x.alerts}:x)); }
  function create(){
    const name=draft.name.trim()||"Untitled watchlist";
    setLists(l=>[{ id:"wl"+Date.now(), name, type:draft.type, count:0, fresh:0, owner:"AR", desc:"New watchlist · 0 objects matched yet" }, ...l]);
    setCreating(false); setDraft({ name:"", type:"vessel" });
  }

  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <div className="row between center" style={{ marginBottom:22 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="eyebrow" style={{ marginBottom:6 }}>Monitoring</div>
            <h1 className="serif" style={{ fontSize:28, fontWeight:500, margin:0 }}>Watchlists &amp; saved searches</h1>
          </div>
          <button className="btn primary" onClick={()=>setCreating(true)}><Icon name="plus"/>New watchlist</button>
        </div>

        <SectionHead eyebrow={"Watchlists · "+lists.length} title="Live watchlists" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14, marginBottom:34 }}>
          {lists.map(w=>(
            <button key={w.id} className="card hover" onClick={()=>go("explore")} style={{ padding:16, textAlign:"left", cursor:"pointer" }}>
              <div className="row between center" style={{ marginBottom:12 }}>
                <TypeGlyph type={w.type} size={34}/>
                {w.fresh>0 ? <Badge kind="accent" dot>{w.fresh} new</Badge> : <Badge>watching</Badge>}
              </div>
              <div style={{ fontSize:14.5, fontWeight:600 }}>{w.name}</div>
              <div className="t-faint" style={{ fontSize:12, marginTop:3, marginBottom:12, minHeight:32 }}>{w.desc}</div>
              <div className="row between center">
                <span className="mono" style={{ fontSize:13, color:"var(--text)" }}>{w.count} <span className="t-faint" style={{ fontSize:11 }}>objects</span></span>
                <Avatar2 who={w.owner} size={22}/>
              </div>
            </button>
          ))}
        </div>

        <SectionHead eyebrow={"Saved searches · "+searches.length} title="Saved searches">
          <button className="btn ghost sm" onClick={()=>go("explore")}>Open explorer <Icon name="arrowRight" size={14}/></button>
        </SectionHead>
        <div className="card" style={{ overflow:"hidden" }}>
          {searches.map((s,i)=>(
            <div key={s.id} className="row between center" style={{ padding:"13px 16px", borderBottom: i<searches.length-1?"1px solid var(--line-soft)":"none" }}>
              <div className="row gap-12 center" style={{ minWidth:0 }}>
                <span style={{ color:"var(--accent)" }}><Icon name="search" size={17}/></span>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</div>
                  <div className="t-faint mono" style={{ fontSize:11 }}>{s.results} results · ran {s.lastRun} ago</div>
                </div>
              </div>
              <div className="row gap-14 center">
                <button onClick={()=>toggleAlerts(s.id)} className="row gap-6 center" style={{ border:"none", background:"none", cursor:"pointer" }}>
                  <span style={{ fontSize:11.5, color: s.alerts?"var(--accent)":"var(--text-faint)" }}>Alert on change</span>
                  <span style={{ width:30, height:17, borderRadius:10, background: s.alerts?"var(--accent)":"var(--bg-3)", position:"relative", transition:"background .15s" }}>
                    <span style={{ position:"absolute", top:2, left: s.alerts?15:2, width:13, height:13, borderRadius:"50%", background:"var(--bg-1)", transition:"left .15s" }}/>
                  </span>
                </button>
                <button className="btn ghost sm" onClick={()=>go("explore")}>Run</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {creating && (
        <div onClick={()=>setCreating(false)} style={{ position:"fixed", inset:0, zIndex:140, background:"oklch(0 0 0/0.5)", backdropFilter:"blur(3px)", display:"grid", placeItems:"center" }}>
          <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(440px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
            <div className="row between center" style={{ padding:"15px 18px", borderBottom:"1px solid var(--line-soft)" }}>
              <span className="serif" style={{ fontSize:17, whiteSpace:"nowrap" }}>New watchlist</span>
              <button className="icon-btn" onClick={()=>setCreating(false)} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{transform:"rotate(45deg)"}}/></button>
            </div>
            <div style={{ padding:18 }} className="col gap-14">
              <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Name</div>
                <input autoFocus value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")create();}} placeholder="e.g. Sanctioned-port callers"
                  style={{ width:"100%", padding:"9px 12px", background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:9, color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13.5, outline:"none" }} /></div>
              <div><div className="t-faint" style={{ fontSize:12, marginBottom:5 }}>Object type</div>
                <div className="row gap-6 wrap">{OBJECT_TYPES.slice(0,5).map(ty=><button key={ty.id} className={"chip"+(draft.type===ty.id?" on":"")} onClick={()=>setDraft(d=>({...d,type:ty.id}))}>{ty.name}</button>)}</div></div>
            </div>
            <div className="row between center" style={{ padding:"13px 18px", borderTop:"1px solid var(--line-soft)" }}>
              <button className="btn ghost" onClick={()=>setCreating(false)}>Cancel</button>
              <button className="btn primary" onClick={create}><Icon name="check"/>Create watchlist</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
