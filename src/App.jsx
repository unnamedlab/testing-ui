import { useCallback, useEffect, useState } from 'react';
import { Copilot } from './components/Copilot.jsx';
import { CLASSIFICATION } from './data/data_ext.js';
import { ENTITY_BY_ID, NOTIFS } from './data/data.js';
import { DossierModal } from './components/Reports.jsx';
import { ClassificationBanner } from './components/Security.jsx';
import { CommandPalette, NAV, NotifDrawer, Rail, ShortcutsModal, TopBar } from './components/Shell.jsx';
import { TweakRadio, TweakRow, TweakSection, TweakSelect, TweakToggle, TweaksPanel, useTweaks } from './components/TweaksPanel.jsx';
import { AdminView } from './views/AdminView.jsx';
import { CasesView } from './views/CasesView.jsx';
import { EntityView } from './views/EntityView.jsx';
import { DashboardView, HomeView } from './views/HomeView.jsx';
import { MapView } from './views/MapView.jsx';
import { NotebookView } from './views/NotebookView.jsx';
import { SearchView } from './views/OntologyView.jsx';
import { ResolveView } from './views/ResolveView.jsx';
import { WatchlistView } from './views/WatchlistView.jsx';
import { WorkshopView } from './views/WorkshopView.jsx';
// --- Phase 2 fusions: tabbed workbenches composing existing views ---
import { GraphWorkbench, OntologyWorkbench, PipelinesWorkbench } from './views/Workbenches.jsx';
// --- Routes restored for NAV destinations that had no router entry ---
import { ProjectsView } from './views/ProjectsView.jsx';
import { ActionsView } from './views/ActionsView.jsx';
import { ModelsView } from './views/ModelsView.jsx';
import { AnalyticsView } from './views/AnalyticsView.jsx';
import { ReasonView } from './views/ReasonView.jsx';
import { CodeRepoView } from './views/CodeRepoView.jsx';
// --- Phase 3 authoring modules (★ net-new, born from existing seeds) ---
import { ReportsView } from './views/ReportsView.jsx';
import { GovernanceView } from './views/GovernanceView.jsx';
import { SourcesView } from './views/SourcesView.jsx';

/* ============================================================
   AXIOM — App root: router, tweaks, mount
   ============================================================ */

export const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accentH": 195,
  "density": "regular",
  "uiFont": "Space Grotesk",
  "glow": true
}/*EDITMODE-END*/;

export const ACCENTS = [
  { name: "Cyan",   h: 195, sw: "oklch(0.78 0.135 195)" },
  { name: "Teal",   h: 165, sw: "oklch(0.78 0.135 165)" },
  { name: "Amber",  h: 80,  sw: "oklch(0.80 0.135 80)" },
  { name: "Violet", h: 300, sw: "oklch(0.74 0.135 300)" },
  { name: "Blue",   h: 255, sw: "oklch(0.72 0.135 255)" },
];
export const UI_FONTS = ["Space Grotesk", "IBM Plex Sans", "Archivo"];

// Every view id the router knows how to render. Used to guarantee that no NAV
// destination ever falls through to a blank canvas.
export const ROUTED = new Set([
  "home", "explore", "ontology", "resolve", "graph", "map", "pipeline",
  "notebook", "cases", "watchlist", "dashboard", "workshop", "projects",
  "actions", "health", "models", "graph2", "analytics", "reason",
  "brushing", "evidence", "code", "admin", "entity", "search",
  "reports", "govern", "sources",
]);

// Phase 2: merged sub-destinations highlight their parent module in the rail.
const RAIL_PARENT = {
  entity: "graph",
  graph2: "graph", brushing: "graph",
  explore: "ontology",
  health: "pipeline",
  cases: "projects", evidence: "projects",
};

// Fallback shown if a destination is ever opened without a matching route.
function EmptyRoute({ view, go }) {
  const item = NAV.find(n => n.view === view);
  return (
    <div className="content" style={{ display:"grid", placeItems:"center", padding:40 }}>
      <div className="panel" style={{ maxWidth:420, padding:32, textAlign:"center" }}>
        <div className="eyebrow" style={{ marginBottom:10 }}>Módulo no disponible</div>
        <div className="serif" style={{ fontSize:22, fontWeight:500, marginBottom:8 }}>{item?.label || view}</div>
        <p className="t-dim" style={{ fontSize:14, margin:"0 0 20px" }}>Esta vista aún no está conectada. Vuelve al espacio de trabajo mientras la habilitamos.</p>
        <button className="btn primary" onClick={()=>go("home")}>Ir al Workspace</button>
      </div>
    </div>
  );
}

export function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState("home");
  const [entityId, setEntityId] = useState(null);
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [dossier, setDossier] = useState(null); // caseId or null
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // apply tweaks → DOM
  useEffect(()=>{
    const r = document.documentElement;
    r.setAttribute("data-theme", t.theme);
    r.setAttribute("data-density", t.density);
    r.setAttribute("data-glow", t.glow ? "on" : "off");
    r.style.setProperty("--accent-h", t.accentH);
    r.style.setProperty("--font-ui", `"${t.uiFont}", system-ui, sans-serif`);
  }, [t.theme, t.density, t.accentH, t.uiFont, t.glow]);

  // cmd+k / cmd+j (copilot)
  useEffect(()=>{
    function onKey(e){
      if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="k"){ e.preventDefault(); setPaletteOpen(o=>!o); }
      if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="j"){ e.preventDefault(); setCopilotOpen(o=>!o); }
      if(e.key==="?" && !/input|textarea/i.test(document.activeElement?.tagName||"")){ e.preventDefault(); setShortcutsOpen(o=>!o); }
      if(e.key==="Escape"){ setPaletteOpen(false); setNotifOpen(false); setShortcutsOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback((v)=>{ setView(v); setNotifOpen(false); }, []);
  const openEntity = useCallback((id)=>{ setEntityId(id); setView("entity"); }, []);
  const runSearch = useCallback((q)=>{ setQuery(q); setView("search"); }, []);

  const runAction = useCallback((id)=>{
    if(id==="new-case") go("cases");
    else if(id==="dossier") setDossier("blackfrost");
    else if(id==="copilot") setCopilotOpen(true);
    else if(id==="connect") go("admin");
    else if(id==="theme") setTweak("theme", t.theme==="dark"?"light":"dark");
    else if(id==="shortcuts") setShortcutsOpen(true);
  }, [go, t.theme, setTweak]);

  const leaf = view==="entity" && entityId ? ENTITY_BY_ID[entityId]?.name : null;

  return (
    <div className="app">
      <Rail view={RAIL_PARENT[view] || view} go={go} />
      <div className="main">
        <ClassificationBanner level={CLASSIFICATION.level} />
        <TopBar view={view} leaf={leaf} go={go}
          openSearch={()=>setPaletteOpen(true)}
          theme={t.theme} setTheme={(th)=>setTweak("theme",th)}
          openNotifs={()=>setNotifOpen(o=>!o)} notifCount={NOTIFS.length}
          openCopilot={()=>setCopilotOpen(true)} />

        {view==="home" && <HomeView go={go} openEntity={openEntity} openProject={()=>go("projects")} />}
        {/* Explore = navegar objetos/instancias (tab browse) · Ontology = el modelo/esquema (tab model).
            Antes ambos abrían 'browse' → destinos idénticos. Ahora cada uno abre su pestaña natural. */}
        {view==="explore" && <OntologyWorkbench openEntity={openEntity} go={go} initialTab="browse" />}
        {view==="ontology" && <OntologyWorkbench openEntity={openEntity} go={go} initialTab="model" />}
        {view==="resolve" && <ResolveView />}
        {view==="graph" && <GraphWorkbench openEntity={openEntity} go={go} initialMode="graph" />}
        {view==="map" && <MapView openEntity={openEntity} />}
        {view==="pipeline" && <PipelinesWorkbench go={go} initialTab="build" />}
        {view==="notebook" && <NotebookView go={go} />}
        {view==="cases" && <CasesView openEntity={openEntity} go={go} openDossier={()=>setDossier("blackfrost")} />}
        {view==="watchlist" && <WatchlistView go={go} openEntity={openEntity} />}
        {view==="dashboard" && <DashboardView openEntity={openEntity} go={go} />}
        {view==="workshop" && <WorkshopView go={go} />}

        {/* Phase 2: merged sub-destinations open their parent workbench in the right mode */}
        {view==="graph2" && <GraphWorkbench openEntity={openEntity} go={go} initialMode="analysis" />}
        {view==="brushing" && <GraphWorkbench openEntity={openEntity} go={go} initialMode="linked" />}
        {view==="health" && <PipelinesWorkbench go={go} initialTab="health" />}
        {view==="evidence" && <CasesView openEntity={openEntity} go={go} openDossier={()=>setDossier("blackfrost")} initialMode="evidence" />}

        {/* Routes restored so every NAV destination renders its module */}
        {view==="projects" && <ProjectsView go={go} openEntity={openEntity} />}
        {view==="actions" && <ActionsView go={go} openEntity={openEntity} />}
        {view==="models" && <ModelsView go={go} />}
        {view==="analytics" && <AnalyticsView openEntity={openEntity} go={go} />}
        {view==="reason" && <ReasonView go={go} />}
        {view==="code" && <CodeRepoView go={go} />}

        {/* Phase 3 authoring modules */}
        {view==="reports" && <ReportsView openEntity={openEntity} go={go} />}
        {view==="govern" && <GovernanceView />}
        {view==="sources" && <SourcesView />}

        {view==="admin" && <AdminView />}
        {view==="entity" && <EntityView id={entityId} openEntity={openEntity} go={go} openDossier={()=>setDossier("blackfrost")} />}
        {view==="search" && <SearchView query={query} openEntity={openEntity} />}

        {/* Defensive: no NAV destination should ever render a blank canvas */}
        {!ROUTED.has(view) && <EmptyRoute view={view} go={go} />}
      </div>

      <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)} go={go} openEntity={openEntity} runSearch={runSearch} runAction={runAction} />
      <NotifDrawer open={notifOpen} onClose={()=>setNotifOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={()=>setShortcutsOpen(false)} />
      <Copilot open={copilotOpen} onClose={()=>setCopilotOpen(false)} go={go} openEntity={openEntity} />
      <DossierModal open={!!dossier} caseId={dossier} onClose={()=>setDossier(null)} />

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={t.theme} options={["dark","light"]} onChange={v=>setTweak("theme",v)} />
        <TweakRow label="Accent">
          <div style={{ display:"flex", gap:7 }}>
            {ACCENTS.map(a=>(
              <button key={a.h} title={a.name} onClick={()=>setTweak("accentH",a.h)}
                style={{ width:26, height:26, borderRadius:8, background:a.sw, cursor:"pointer",
                  border: t.accentH===a.h ? "2px solid var(--text)" : "2px solid transparent",
                  boxShadow: t.accentH===a.h ? "0 0 0 2px var(--bg-1) inset" : "none" }}/>
            ))}
          </div>
        </TweakRow>
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact","regular","comfy"]} onChange={v=>setTweak("density",v)} />
        <TweakSelect label="UI font" value={t.uiFont} options={UI_FONTS} onChange={v=>setTweak("uiFont",v)} />
        <TweakToggle label="Neon glow" value={t.glow} onChange={v=>setTweak("glow",v)} />
      </TweaksPanel>
    </div>
  );
}
