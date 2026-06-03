import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ENTITIES, NOTIFS, TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, RiskPill, TypeGlyph } from './ui.jsx';

/* ============================================================
   AXIOM — App shell (rail, topbar, command palette, notifs)
   ============================================================ */

/* Phase 1 — navigation grouped by capability (resolves H-01).
   The case/workspace is no longer a rail section; it lives in the
   TopBar context switcher. Views are unchanged — this is pure IA. */
export const NAV_GROUPS = [
  { id: "explore", label: "Explore & Model", items: [
    { view: "ontology", icon: "share", label: "Ontology" },
    { view: "resolve", icon: "merge", label: "Entity Resolution" },
  ]},
  { id: "analyze", label: "Analyze", items: [
    { view: "graph", icon: "graph", label: "Graph" },
    { view: "map", icon: "globe", label: "Geospatial" },
    { view: "dashboard", icon: "layers", label: "Operations" },
    { view: "analytics", icon: "bars", label: "Analytics" },
    { view: "notebook", icon: "note", label: "Notebook" },
  ]},
  { id: "act", label: "Decide & Act", items: [
    { view: "projects", icon: "folder", label: "Workspaces" },
    { view: "actions", icon: "bolt", label: "Actions" },
    { view: "reason", icon: "cpu", label: "Reason" },
    { view: "reports", icon: "doc", label: "Reports" },
    { view: "workshop", icon: "blocks", label: "Workshop" },
    { view: "watchlist", icon: "bookmark", label: "Watchlists" },
  ]},
  { id: "integrate", label: "Integrate", items: [
    { view: "sources", icon: "database", label: "Sources" },
    { view: "pipeline", icon: "pipeline", label: "Pipelines" },
    { view: "code", icon: "code", label: "Code" },
    { view: "models", icon: "model", label: "Models" },
  ]},
  { id: "govern", label: "Govern", items: [
    { view: "govern", icon: "shield", label: "Governance & Audit" },
  ]},
];

// Flat list for the command palette & router fallback. Includes the sub-destinations
// that Phase 2 folded into a parent module (explore, graph2, brushing, evidence, health):
// they no longer sit in the rail, but stay searchable and open their parent in the right mode.
export const NAV = [
  { view: "home", icon: "grid", label: "Workspace" },
  ...NAV_GROUPS.flatMap(g => g.items),
  { view: "cases", icon: "bell", label: "Alerts & Cases" },
  { view: "explore", icon: "table", label: "Explore" },
  { view: "graph2", icon: "route", label: "Graph Analysis" },
  { view: "brushing", icon: "focus", label: "Linked analysis" },
  { view: "evidence", icon: "doc", label: "Evidence" },
  { view: "health", icon: "pulse", label: "Data Health" },
  { view: "admin", icon: "settings", label: "Administración" },
];

// The active case shown in the context switcher (single source of truth).
export const ACTIVE_CASE = "BLACKFROST";

export const PALETTE_ACTIONS = [
  { id:"new-case", label:"New investigation", icon:"plus" },
  { id:"dossier", label:"Generate case dossier", icon:"doc" },
  { id:"copilot", label:"Ask the Copilot", icon:"sparkles" },
  { id:"connect", label:"Connect a data source", icon:"download" },
  { id:"theme", label:"Toggle light / dark theme", icon:"moon" },
  { id:"shortcuts", label:"Show keyboard shortcuts", icon:"settings" },
];

export function Rail({ view, go }) {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem("axiom.rail") === "expanded"; } catch { return false; }
  });
  function toggle() {
    setExpanded(e => {
      const next = !e;
      try { localStorage.setItem("axiom.rail", next ? "expanded" : "collapsed"); } catch {}
      return next;
    });
  }
  return (
    <nav className={"rail" + (expanded ? " expanded" : "")} aria-label="Primary">
      <button type="button" className="rail-logo" onClick={()=>go("home")} aria-label="AXIOM — Workspace home">
        <span className="rail-logo-mk"><Icon name="axiom" /></span>
        <span className="rail-wordmark" aria-hidden="true">AXIOM</span>
      </button>

      <div className="rail-scroll">
        {NAV_GROUPS.map(g => (
          <div className="rail-group" key={g.id} role="group" aria-label={g.label}>
            <div className="rail-group-h">
              <span className="rail-group-label">{g.label}</span>
              <span className="rail-group-line" aria-hidden="true"></span>
            </div>
            {g.items.map(n => (
              <button key={n.view} type="button"
                className={"rail-btn" + (view===n.view ? " active":"")}
                aria-label={n.label} aria-current={view===n.view ? "page" : undefined}
                onClick={()=>go(n.view)}>
                <Icon name={n.icon} />
                <span className="rail-text">{n.label}</span>
                <span className="tip" aria-hidden="true">{n.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <button type="button"
        className={"rail-btn rail-pinned" + (view==="admin"?" active":"")}
        aria-label="Administración" aria-current={view==="admin" ? "page" : undefined}
        onClick={()=>go("admin")}>
        <Icon name="settings" />
        <span className="rail-text">Administración</span>
        <span className="tip" aria-hidden="true">Administración</span>
      </button>

      <button type="button" className="rail-toggle" onClick={toggle}
        aria-label={expanded ? "Collapse navigation" : "Expand navigation"} aria-pressed={expanded}>
        <Icon name="chevron" />
        <span className="rail-text">Collapse</span>
      </button>
    </nav>
  );
}

export const CRUMBS = {
  projects: ["Workspaces"],
  home: ["Workspace"],
  explore: ["Object Explorer"],
  ontology: ["Ontology Explorer"],
  resolve: ["Ontology", "Entity Resolution"],
  graph: ["Graph"],
  map: ["Geospatial"],
  pipeline: ["Data Integration", "Pipeline Builder"],
  sources: ["Data Integration", "Sources"],
  notebook: ["Analysis", "Notebook"],
  watchlist: ["Watchlists"],
  cases: ["Alerts & Cases"],
  dashboard: ["Operations"],
  workshop: ["Workshop"],
  actions: ["Operations", "Actions"],
  health: ["Data Integration", "Data Health"],
  models: ["Machine Learning", "Models"],
  graph2: ["Graph analysis"],
  analytics: ["Analysis", "Flagged transactions"],
  reason: ["Reason", "Agent Studio"],
  brushing: ["Linked analysis"],
  evidence: ["Evidence"],
  code: ["Data Integration", "Repositories"],
  admin: ["Administration"],
  reports: ["Reports"],
  govern: ["Governance & Audit"],
  entity: ["Graph"],
  search: ["Search"],
};

// ---- Context switcher: the active case/workspace lives here, not in the rail ----
function ContextSwitcher({ go }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e){ if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e){ if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div className="ctx" ref={ref}>
      <button type="button" className="ctx-btn" onClick={()=>setOpen(o=>!o)}
        aria-expanded={open} aria-haspopup="menu" aria-label={"Active context: Case " + ACTIVE_CASE}>
        <span className="ctx-dot" aria-hidden="true"></span>
        <span className="ctx-meta">
          <span className="ctx-kind">Case</span>
          <span className="ctx-name">{ACTIVE_CASE}</span>
        </span>
        <Icon name="chevron" size={13} />
      </button>
      {open && (
        <div className="ctx-menu panel" role="menu">
          <div className="ctx-sec">Active case</div>
          <button type="button" className="ctx-item active" role="menuitem" onClick={()=>{ setOpen(false); go("dashboard"); }}>
            <span className="ctx-dot" aria-hidden="true"></span>
            <span className="ctx-item-name">Case {ACTIVE_CASE}</span>
            <span className="ctx-pill">lead</span>
          </button>
          <button type="button" className="ctx-item" role="menuitem" onClick={()=>{ setOpen(false); go("cases"); }}>
            <span className="ctx-dot amber" aria-hidden="true"></span>
            <span className="ctx-item-name">Case NIGHTJAR</span>
          </button>
          <div className="ctx-divider" aria-hidden="true"></div>
          <button type="button" className="ctx-item" role="menuitem" onClick={()=>{ setOpen(false); go("cases"); }}>
            <Icon name="bell" size={15}/><span className="ctx-item-name">All alerts &amp; cases</span>
          </button>
          <button type="button" className="ctx-item" role="menuitem" onClick={()=>{ setOpen(false); go("projects"); }}>
            <Icon name="folder" size={15}/><span className="ctx-item-name">All workspaces…</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar({ view, origin, leaf, go, openSearch, theme, setTheme, openNotifs, notifCount, openCopilot }) {
  // F-09: for the entity 360 the trail comes from where it was opened (origin).
  // F-04: el caso activo vive SÓLO en el conmutador de contexto — nunca en el breadcrumb.
  const crumbs = (view === "entity" ? CRUMBS[origin] : CRUMBS[view]) || ["Workspace"];
  return (
    <header className="topbar">
      <ContextSwitcher go={go} />
      <div className="vdivider" style={{ height:22, margin:"0 12px 0 2px" }} />
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
      position:"fixed", inset:0, zIndex:200, background:"var(--scrim)",
      backdropFilter:"var(--scrim-blur)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:"12vh",
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
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"var(--scrim)", backdropFilter:"var(--scrim-blur)", display:"grid", placeItems:"center" }}>
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
