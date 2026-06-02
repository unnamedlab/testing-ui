import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ENTITIES, NOTIFS, TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, RiskPill, TypeGlyph } from './ui.jsx';

/* ============================================================
   AXIOM — App shell (rail, topbar, command palette, notifs)
   ============================================================ */

export const NAV = [
  { view: "home", icon: "grid", label: "Workspace" },
  { view: "explore", icon: "table", label: "Explore" },
  { view: "ontology", icon: "share", label: "Ontology" },
  { view: "resolve", icon: "merge", label: "Entity Resolution" },
  { view: "graph", icon: "graph", label: "Graph" },
  { view: "map", icon: "globe", label: "Geospatial" },
  { view: "pipeline", icon: "pipeline", label: "Pipelines" },
  { view: "notebook", icon: "note", label: "Notebook" },
  { view: "cases", icon: "bell", label: "Alerts & Cases" },
  { view: "watchlist", icon: "bookmark", label: "Watchlists" },
  { view: "dashboard", icon: "layers", label: "Operations" },
  { view: "workshop", icon: "blocks", label: "Workshop" },
];

export const PALETTE_ACTIONS = [
  { id:"new-case", label:"New investigation", icon:"plus" },
  { id:"dossier", label:"Generate case dossier", icon:"doc" },
  { id:"copilot", label:"Ask the Copilot", icon:"sparkles" },
  { id:"connect", label:"Connect a data source", icon:"download" },
  { id:"theme", label:"Toggle light / dark theme", icon:"moon" },
  { id:"shortcuts", label:"Show keyboard shortcuts", icon:"settings" },
];

export function Rail({ view, go }) {
  return (
    <nav className="rail">
      <div className="rail-logo" onClick={()=>go("home")} title="AXIOM">
        <Icon name="axiom" />
      </div>
      <div className="rail-scroll">
        {NAV.map(n => (
          <button key={n.view} className={"rail-btn" + (view===n.view ? " active":"")} onClick={()=>go(n.view)}>
            <Icon name={n.icon} />
            <span className="tip">{n.label}</span>
          </button>
        ))}
      </div>
      <button className={"rail-btn" + (view==="admin"?" active":"")} onClick={()=>go("admin")}><Icon name="settings" /><span className="tip">Admin · Sources</span></button>
      <button className="rail-btn"><Icon name="history" /><span className="tip">History</span></button>
    </nav>
  );
}

export const CRUMBS = {
  home: ["Workspace"],
  explore: ["Object Explorer"],
  ontology: ["Ontology Explorer"],
  resolve: ["Ontology", "Entity Resolution"],
  graph: ["Case BLACKFROST", "Graph"],
  map: ["Case BLACKFROST", "Geospatial"],
  pipeline: ["Data Integration", "Pipeline Builder"],
  notebook: ["Analysis", "Notebook"],
  watchlist: ["Watchlists"],
  cases: ["Alerts & Cases"],
  dashboard: ["Case BLACKFROST", "Operations"],
  workshop: ["Workshop"],
  admin: ["Administration"],
  entity: ["Case BLACKFROST", "Graph"],
  search: ["Search"],
};

export function TopBar({ view, leaf, openSearch, theme, setTheme, openNotifs, notifCount, openCopilot }) {
  const crumbs = CRUMBS[view] || ["Workspace"];
  return (
    <header className="topbar">
      <div className="crumbs">
        {crumbs.map((c,i)=>(
          <React.Fragment key={i}>
            {i>0 && <span className="sep"><Icon name="chevron" size={13}/></span>}
            <span className={i===0?"c-mod":"c-leaf"}>{c}</span>
          </React.Fragment>
        ))}
        {leaf && <><span className="sep"><Icon name="chevron" size={13}/></span><span className="c-leaf">{leaf}</span></>}
      </div>

      <div className="search" onClick={openSearch}>
        <Icon name="search" size={16}/>
        <span style={{ flex:1, fontSize:13 }}>Search objects, links & data…</span>
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-right">
        <button className="btn sm" onClick={openCopilot} style={{ gap:6, background:"var(--accent-ghost)", borderColor:"var(--accent-dim)", color:"var(--accent)" }}>
          <Icon name="sparkles" size={15}/>Copilot
        </button>
        <button className="icon-btn" onClick={()=>setTheme(theme==="dark"?"light":"dark")} title="Toggle theme">
          <Icon name={theme==="dark"?"sun":"moon"} />
        </button>
        <button className={"icon-btn" + (notifCount?" dot-badge":"")} onClick={openNotifs} title="Alerts">
          <Icon name="bell" />
        </button>
        <div className="vdivider" style={{ height:22, margin:"0 4px" }} />
        <div className="avatar" title="Ana Reyes · Lead Analyst">AR</div>
      </div>
    </header>
  );
}

// ---- Command palette / global search ----
export function CommandPalette({ open, onClose, go, openEntity, runSearch, runAction }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(()=>{ if(open){ setQ(""); setTimeout(()=>inputRef.current?.focus(), 40); } }, [open]);

  const results = useMemo(()=>{
    const term = q.trim().toLowerCase();
    const ent = ENTITIES.filter(e => !term || e.name.toLowerCase().includes(term) || e.sub.toLowerCase().includes(term));
    const nav = NAV.filter(n => !term || n.label.toLowerCase().includes(term));
    const acts = PALETTE_ACTIONS.filter(a => !term || a.label.toLowerCase().includes(term));
    return { ent: ent.slice(0,6), nav, acts };
  }, [q]);

  function submit(){ const term=q.trim(); if(term){ onClose(); runSearch(term); } }

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:200, background:"oklch(0 0 0 / 0.5)",
      backdropFilter:"blur(3px)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:"12vh",
    }}>
      <div onClick={e=>e.stopPropagation()} className="panel rise" style={{
        width:"min(640px, 92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden",
        border:"1px solid var(--line)",
      }}>
        <div className="row center gap-10" style={{ padding:"14px 16px", borderBottom:"1px solid var(--line-soft)" }}>
          <span className="t-accent"><Icon name="search" size={19}/></span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") submit(); }}
            placeholder="Search the ontology…"
            style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:16 }} />
          <span className="kbd" style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-faint)", border:"1px solid var(--line)", borderRadius:5, padding:"2px 7px" }}>ESC</span>
        </div>
        <div style={{ maxHeight:"52vh", overflow:"auto", padding:"8px" }}>
          {q.trim() && (
            <button className="cmd-row" onClick={submit}>
              <span style={{ width:30, display:"grid", placeItems:"center", color:"var(--accent)" }}><Icon name="search" size={18}/></span>
              <div style={{ textAlign:"left", flex:1, fontSize:14 }}>See all results for “<b style={{fontWeight:600}}>{q.trim()}</b>”</div>
              <span className="kbd" style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-faint)", border:"1px solid var(--line)", borderRadius:5, padding:"1px 6px" }}>↵</span>
            </button>
          )}
          <div className="eyebrow" style={{ padding:"8px 10px 4px" }}>Objects · {results.ent.length}</div>
          {results.ent.map(e=>(
            <button key={e.id} className="cmd-row" onClick={()=>{ onClose(); openEntity(e.id); }}>
              <TypeGlyph type={e.type} size={30} />
              <div style={{ textAlign:"left", flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div>
                <div className="t-faint" style={{ fontSize:12 }}>{TYPE_BY_ID[e.type].name} · {e.sub}</div>
              </div>
              <RiskPill r={e.risk} />
            </button>
          ))}
          {results.ent.length===0 && <div className="t-faint" style={{ padding:"10px", fontSize:13 }}>No objects match “{q}”.</div>}
          {results.acts.length>0 && <>
            <div className="eyebrow" style={{ padding:"12px 10px 4px" }}>Actions</div>
            {results.acts.map(a=>(
              <button key={a.id} className="cmd-row" onClick={()=>{ onClose(); runAction(a.id); }}>
                <span style={{ width:30, display:"grid", placeItems:"center", color:"var(--accent)" }}><Icon name={a.icon} size={18}/></span>
                <div style={{ textAlign:"left", flex:1, fontSize:14 }}>{a.label}</div>
                <span className="t-faint"><Icon name="arrowRight" size={15}/></span>
              </button>
            ))}
          </>}
          <div className="eyebrow" style={{ padding:"12px 10px 4px" }}>Go to</div>
          {results.nav.map(n=>(
            <button key={n.view} className="cmd-row" onClick={()=>{ onClose(); go(n.view); }}>
              <span style={{ width:30, display:"grid", placeItems:"center", color:"var(--text-dim)" }}><Icon name={n.icon} size={18}/></span>
              <div style={{ textAlign:"left", flex:1, fontSize:14 }}>{n.label}</div>
              <span className="t-faint"><Icon name="arrowRight" size={15}/></span>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .cmd-row { display:flex; align-items:center; gap:11px; width:100%; padding:9px 10px; border:none; background:none;
          border-radius:9px; cursor:pointer; color:var(--text); transition:background .1s; }
        .cmd-row:hover { background:var(--accent-ghost); }
      `}</style>
    </div>
  );
}

// ---- Notifications drawer ----
export function NotifDrawer({ open, onClose }) {
  const [items, setItems] = useState(NOTIFS);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:150 }}>
      <div onClick={e=>e.stopPropagation()} className="panel" style={{
        position:"absolute", top:"calc(var(--topbar) + 8px)", right:14, width:340, background:"var(--bg-1)",
        boxShadow:"var(--shadow-3)", border:"1px solid var(--line)", overflow:"hidden",
        animation:"rise .25s cubic-bezier(.2,.7,.2,1) both",
      }}>
        <div className="row between center" style={{ padding:"13px 15px", borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row gap-8 center"><span className="serif" style={{ fontSize:16 }}>Alerts</span>{items.filter(n=>n.sev==="alert").length>0 && <Badge kind="alert">{items.filter(n=>n.sev==="alert").length} critical</Badge>}</div>
          <button className="btn ghost sm" onClick={()=>setItems([])}>Mark read</button>
        </div>
        <div style={{ maxHeight:"60vh", overflow:"auto" }}>
          {items.length===0 && <div className="col center" style={{ padding:"34px 0", gap:8, color:"var(--text-faint)" }}><Icon name="check" size={22}/><span style={{ fontSize:13 }}>All caught up</span></div>}
          {items.map((n,i)=>(
            <div key={i} onClick={()=>setItems(its=>its.filter((_,j)=>j!==i))} className="row gap-10" style={{ padding:"12px 15px", borderBottom:"1px solid var(--line-soft)", cursor:"pointer" }}>
              <span style={{ color:`var(--${n.sev==="ok"?"ok":n.sev})`, marginTop:1 }}>
                <Icon name={n.sev==="alert"?"alertTri":n.sev==="warn"?"flag":"check"} size={17}/>
              </span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:600 }}>{n.title}</div>
                <div className="t-dim" style={{ fontSize:12.5, marginTop:2 }}>{n.body}</div>
              </div>
              <span className="t-faint mono" style={{ fontSize:11 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShortcutsModal({ open, onClose }) {
  if (!open) return null;
  const groups = [
    ["Navigation", [["⌘ K","Search & command palette"],["⌘ J","Open Copilot"],["?","Keyboard shortcuts"],["Esc","Close overlay"]]],
    ["Graph", [["Drag","Pan canvas / move node"],["Scroll","Zoom"],["2× click","Open 360° / expand"],["Click","Select node"]]],
    ["Actions", [["G then C","New investigation"],["E","Export dossier"],["T","Toggle theme"]]],
  ];
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"oklch(0 0 0 / 0.5)", backdropFilter:"blur(3px)", display:"grid", placeItems:"center" }}>
      <div onClick={e=>e.stopPropagation()} className="panel rise" style={{ width:"min(560px,92vw)", background:"var(--bg-1)", boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
        <div className="row between center" style={{ padding:"15px 20px", borderBottom:"1px solid var(--line-soft)" }}>
          <span className="serif" style={{ fontSize:18, whiteSpace:"nowrap" }}>Keyboard shortcuts</span>
          <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{transform:"rotate(45deg)"}}/></button>
        </div>
        <div style={{ padding:"8px 20px 20px" }}>
          {groups.map(([g,rows])=>(
            <div key={g} style={{ marginTop:14 }}>
              <div className="eyebrow" style={{ marginBottom:8 }}>{g}</div>
              {rows.map(([k,d])=>(
                <div key={k} className="row between center" style={{ padding:"6px 0" }}>
                  <span style={{ fontSize:13 }} className="t-dim">{d}</span>
                  <span className="kbd mono" style={{ fontSize:11.5, color:"var(--text)", border:"1px solid var(--line)", borderRadius:5, padding:"2px 8px", background:"var(--bg-inset)" }}>{k}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
