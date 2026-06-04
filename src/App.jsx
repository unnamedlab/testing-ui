import { useCallback, useEffect, useRef, useState } from 'react';
import { Copilot } from './components/Copilot.jsx';
import { ALERTS, CLASSIFICATION } from './data/data_ext.js';
import { ENTITY_BY_ID, NOTIFS } from './data/data.js';
import { ACTIVE_PROJECT } from './data/data_projects.js';
import { DossierModal } from './components/Reports.jsx';
import { ClassificationBanner } from './components/Security.jsx';
import { CommandPalette, NAV, NotifDrawer, Rail, ShortcutsModal, TopBar } from './components/Shell.jsx';
import { TweakRadio, TweakRow, TweakSection, TweakSelect, TweakToggle, TweaksPanel, useTweaks } from './components/TweaksPanel.jsx';
import { useI18n, LANGS } from './i18n.jsx';
import { AdminView } from './views/AdminView.jsx';
import { CasesWorkbench } from './views/CasesWorkbench.jsx';
import { EntityView } from './views/EntityView.jsx';
import { DashboardView, HomeView } from './views/HomeView.jsx';
import { MapView } from './views/MapView.jsx';
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
import { RulesView } from './views/RulesView.jsx';
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

// Single routing table — THE source of truth for what each view id renders.
// Each entry is (ctx) => element. Anything NOT in this table falls through to
// <EmptyRoute>, so the fallback is genuinely reachable, and the route list can
// never drift from what actually renders (BUG-2).
const ROUTES = {
  home:      (c) => <HomeView go={c.go} openEntity={c.openEntity} openProject={c.openProject} />,
  // Explore = browse objects/instances · Ontology = the schema/model.
  explore:   (c) => <OntologyWorkbench openEntity={c.openEntity} go={c.go} initialTab="browse" />,
  ontology:  (c) => <OntologyWorkbench openEntity={c.openEntity} go={c.go} initialTab="model" />,
  resolve:   () => <ResolveView />,
  graph:     (c) => <GraphWorkbench openEntity={c.openEntity} go={c.go} initialMode="graph" />,
  map:       (c) => <MapView openEntity={c.openEntity} />,
  pipeline:  (c) => <PipelinesWorkbench go={c.go} initialTab="build" />,
  cases:     (c) => <CasesWorkbench openEntity={c.openEntity} go={c.go} openDossier={c.openDossier} openProject={c.openProject} />,
  watchlist: (c) => <WatchlistView go={c.go} openEntity={c.openEntity} />,
  dashboard: (c) => <DashboardView openEntity={c.openEntity} go={c.go} />,
  workshop:  (c) => <WorkshopView go={c.go} />,
  // Phase 2: merged sub-destinations open their parent workbench in the right mode.
  graph2:    (c) => <GraphWorkbench openEntity={c.openEntity} go={c.go} initialMode="analysis" />,
  brushing:  (c) => <GraphWorkbench openEntity={c.openEntity} go={c.go} initialMode="linked" />,
  health:    (c) => <PipelinesWorkbench go={c.go} initialTab="health" />,
  evidence:  (c) => <CasesWorkbench openEntity={c.openEntity} go={c.go} openDossier={c.openDossier} openProject={c.openProject} initialMode="evidence" />,
  // Restored NAV destinations.
  projects:  (c) => <ProjectsView projectId={c.projectId} openProject={c.openProject} go={c.go} openEntity={c.openEntity} openDossier={c.openDossier} />,
  actions:   (c) => <ActionsView go={c.go} openEntity={c.openEntity} />,
  models:    (c) => <ModelsView go={c.go} />,
  analytics: (c) => <AnalyticsView openEntity={c.openEntity} go={c.go} />,
  reason:    (c) => <ReasonView go={c.go} />,
  code:      (c) => <CodeRepoView go={c.go} />,
  // R-1: single “Rules” home — the whole engine (all kinds). The contextual
  // entries (Alerts › Rules, Actions › Rules) still open it pre-filtered.
  rules:     () => <RulesView initialKind="all" />,
  // Phase 3 authoring modules.
  reports:   (c) => <ReportsView openEntity={c.openEntity} go={c.go} />,
  govern:    (c) => <GovernanceView openEntity={c.openEntity} />,
  sources:   () => <SourcesView />,
  admin:     () => <AdminView />,
  entity:    (c) => <EntityView id={c.entityId} backView={c.entityOrigin} openEntity={c.openEntity} go={c.go} openDossier={() => c.openEntityDossier(c.entityId)} initialTab={c.entityTab} />,
  search:    (c) => <SearchView query={c.query} openEntity={c.openEntity} />,
};

// Derived from ROUTES so it can never drift from what's actually rendered.
export const ROUTED = new Set(Object.keys(ROUTES));

// Phase 2: merged sub-destinations highlight their parent module in the rail.
const RAIL_PARENT = {
  entity: "graph",
  graph2: "graph", brushing: "graph",
  explore: "ontology",
  health: "pipeline",
  evidence: "cases",
};

// Fallback shown if a destination is ever opened without a matching route.
function EmptyRoute({ view, go }) {
  const { t } = useI18n();
  const item = NAV.find(n => n.view === view);
  return (
    <div className="content" style={{ display:"grid", placeItems:"center", padding:40 }}>
      <div className="panel" style={{ maxWidth:420, padding:32, textAlign:"center" }}>
        <div className="eyebrow" style={{ marginBottom:10 }}>{t('Module unavailable')}</div>
        <div className="serif" style={{ fontSize:22, fontWeight:500, marginBottom:8 }}>{t(item?.label || view)}</div>
        <p className="t-dim" style={{ fontSize:14, margin:"0 0 20px" }}>{t("This view isn't wired up yet. Head back to the workspace while we enable it.")}</p>
        <button className="btn primary" onClick={()=>go("home")}>{t('Go to Home')}</button>
      </div>
    </div>
  );
}

export function App() {
  const { t: tr, lang, setLang } = useI18n();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useState("home");
  const [entityId, setEntityId] = useState(null);
  const [entityTab, setEntityTab] = useState(null); // R-3b: deep-link the 360 to a tab (e.g. lineage)
  const [projectId, setProjectId] = useState(null); // R-1: project = único contenedor; un solo detalle
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [dossier, setDossier] = useState(null); // caseId or null
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // C-2: remember which view an object was opened from, so the Entity 360
  // breadcrumb reads "Search › Name", "Graph › Name", etc. (F-09).
  const [entityOrigin, setEntityOrigin] = useState("home");
  const viewRef = useRef(view);
  viewRef.current = view;

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

  // C-3 (clúster C): Notebook se pliega en Reports. Cualquier go("notebook") redirige.
  const go = useCallback((v)=>{ if(v==="notebook") v="reports"; if(v==="projects") setProjectId(null); setView(v); setNotifOpen(false); }, []);
  const openEntity = useCallback((id, tab=null)=>{ if(viewRef.current !== "entity") setEntityOrigin(viewRef.current); setEntityId(id); setEntityTab(tab); setView("entity"); }, []);
  const runSearch = useCallback((q)=>{ setQuery(q); setView("search"); }, []);
  // R-1: abrir el detalle de un proyecto desde cualquier sitio (Home, alertas, paleta).
  // id===null vuelve al listado de Workspaces. Es la ÚNICA página de detalle de proyecto.
  const openProject = useCallback((id)=>{ setProjectId(id); setView("projects"); setNotifOpen(false); }, []);
  // Fix dossier (crítico): el caso por defecto es el PROYECTO ACTIVO, no uno hardcodeado.
  const openDossier = useCallback((id)=>{ setDossier(typeof id === "string" ? id : ACTIVE_PROJECT); }, []);
  // El dossier de una entidad usa el caso de su alerta; si no tiene, el proyecto activo.
  const openEntityDossier = useCallback((eid)=>{
    const alert = ALERTS.find(a => a.entity === eid);
    setDossier(alert?.case || ACTIVE_PROJECT);
  }, []);

  const runAction = useCallback((id)=>{
    if(id==="new-case") openProject(null);
    else if(id==="dossier") setDossier(ACTIVE_PROJECT);
    else if(id==="copilot") setCopilotOpen(true);
    else if(id==="connect") go("sources");
    else if(id==="theme") setTweak("theme", t.theme==="dark"?"light":"dark");
    else if(id==="shortcuts") setShortcutsOpen(true);
  }, [go, openProject, t.theme, setTweak]);

  const leaf = view==="entity" && entityId ? ENTITY_BY_ID[entityId]?.name : null;

  return (
    <div className="app">
      <Rail view={RAIL_PARENT[view] || view} go={go} />
      <div className="main">
        <ClassificationBanner level={CLASSIFICATION.level} />
        <TopBar view={view} origin={entityOrigin} leaf={leaf} go={go}
          openSearch={()=>setPaletteOpen(true)}
          theme={t.theme} setTheme={(th)=>setTweak("theme",th)}
          openNotifs={()=>setNotifOpen(o=>!o)} notifCount={NOTIFS.length}
          openCopilot={()=>setCopilotOpen(true)} />

        {/* Single dispatch from the ROUTES table; anything unrouted renders
            <EmptyRoute>, so the fallback is genuinely reachable (BUG-2). */}
        {(ROUTES[view] || (() => <EmptyRoute view={view} go={go} />))({
          go, openEntity, openProject, openDossier, openEntityDossier,
          projectId, entityId, entityOrigin, entityTab, query,
        })}
      </div>

      <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)} go={go} openEntity={openEntity} runSearch={runSearch} runAction={runAction} />
      <NotifDrawer open={notifOpen} onClose={()=>setNotifOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={()=>setShortcutsOpen(false)} />
      <Copilot open={copilotOpen} onClose={()=>setCopilotOpen(false)} go={go} openEntity={openEntity} />
      <DossierModal open={!!dossier} caseId={dossier} onClose={()=>setDossier(null)} />

      {/* Tweaks */}
      <TweaksPanel>
        <TweakRow label={tr('Language')}>
          <div style={{ display:"flex", gap:7 }}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)}
                style={{ height:28, padding:"0 12px", borderRadius:8, cursor:"pointer",
                  fontFamily:"var(--font-ui)", fontSize:12.5, fontWeight:600,
                  background: lang===l.code ? "var(--accent)" : "var(--bg-2)",
                  color: lang===l.code ? "var(--accent-text)" : "var(--text-dim)",
                  border: "1px solid " + (lang===l.code ? "transparent" : "var(--line)") }}>{l.label}</button>
            ))}
          </div>
        </TweakRow>
        <TweakSection label={tr('Theme')} />
        <TweakRadio label={tr('Mode')} value={t.theme} options={["dark","light"]} onChange={v=>setTweak("theme",v)} />
        <TweakRow label={tr('Accent')}>
          <div style={{ display:"flex", gap:7 }}>
            {ACCENTS.map(a=>(
              <button key={a.h} title={a.name} onClick={()=>setTweak("accentH",a.h)}
                style={{ width:26, height:26, borderRadius:8, background:a.sw, cursor:"pointer",
                  border: t.accentH===a.h ? "2px solid var(--text)" : "2px solid transparent",
                  boxShadow: t.accentH===a.h ? "0 0 0 2px var(--bg-1) inset" : "none" }}/>
            ))}
          </div>
        </TweakRow>
        <TweakSection label={tr('Layout')} />
        <TweakRadio label={tr('Density')} value={t.density} options={["compact","regular","comfy"]} onChange={v=>setTweak("density",v)} />
        <TweakSelect label={tr('UI font')} value={t.uiFont} options={UI_FONTS} onChange={v=>setTweak("uiFont",v)} />
        <TweakToggle label={tr('Neon glow')} value={t.glow} onChange={v=>setTweak("glow",v)} />
      </TweaksPanel>
    </div>
  );
}
