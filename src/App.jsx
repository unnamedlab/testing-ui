import { useCallback, useEffect, useState } from 'react';
import { Copilot } from './components/Copilot.jsx';
import { CLASSIFICATION } from './data/data_ext.js';
import { ENTITY_BY_ID, NOTIFS } from './data/data.js';
import { DossierModal } from './components/Reports.jsx';
import { ClassificationBanner } from './components/Security.jsx';
import { CommandPalette, NotifDrawer, Rail, ShortcutsModal, TopBar } from './components/Shell.jsx';
import { TweakRadio, TweakRow, TweakSection, TweakSelect, TweakToggle, TweaksPanel, useTweaks } from './components/TweaksPanel.jsx';
import { AdminView } from './views/AdminView.jsx';
import { CasesView } from './views/CasesView.jsx';
import { EntityView } from './views/EntityView.jsx';
import { ExploreView } from './views/ExploreView.jsx';
import { GraphView } from './views/GraphView.jsx';
import { DashboardView, HomeView } from './views/HomeView.jsx';
import { MapView } from './views/MapView.jsx';
import { NotebookView } from './views/NotebookView.jsx';
import { OntologyView, SearchView } from './views/OntologyView.jsx';
import { PipelineView } from './views/PipelineView.jsx';
import { ResolveView } from './views/ResolveView.jsx';
import { WatchlistView } from './views/WatchlistView.jsx';
import { WorkshopView } from './views/WorkshopView.jsx';

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
      <Rail view={view==="entity"?"graph":view} go={go} />
      <div className="main">
        <ClassificationBanner level={CLASSIFICATION.level} />
        <TopBar view={view} leaf={leaf} go={go}
          openSearch={()=>setPaletteOpen(true)}
          theme={t.theme} setTheme={(th)=>setTweak("theme",th)}
          openNotifs={()=>setNotifOpen(o=>!o)} notifCount={NOTIFS.length}
          openCopilot={()=>setCopilotOpen(true)} />

        {view==="home" && <HomeView go={go} openEntity={openEntity} openProject={()=>go("cases")} />}
        {view==="explore" && <ExploreView openEntity={openEntity} go={go} />}
        {view==="ontology" && <OntologyView openEntity={openEntity} go={go} />}
        {view==="resolve" && <ResolveView />}
        {view==="graph" && <GraphView openEntity={openEntity} focusId={null} />}
        {view==="map" && <MapView openEntity={openEntity} />}
        {view==="pipeline" && <PipelineView />}
        {view==="notebook" && <NotebookView go={go} />}
        {view==="cases" && <CasesView openEntity={openEntity} go={go} openDossier={()=>setDossier("blackfrost")} />}
        {view==="watchlist" && <WatchlistView go={go} openEntity={openEntity} />}
        {view==="dashboard" && <DashboardView openEntity={openEntity} go={go} />}
        {view==="workshop" && <WorkshopView go={go} />}
        {view==="admin" && <AdminView />}
        {view==="entity" && <EntityView id={entityId} openEntity={openEntity} go={go} openDossier={()=>setDossier("blackfrost")} />}
        {view==="search" && <SearchView query={query} openEntity={openEntity} />}
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
