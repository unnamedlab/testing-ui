import { useState } from 'react';
import { GraphView } from './GraphView.jsx';
import { GraphAnalysisView } from './GraphAnalysisView.jsx';
import { BrushingView } from './BrushingView.jsx';
import { ExploreView } from './ExploreView.jsx';
import { OntologyView } from './OntologyView.jsx';
import { PipelineView } from './PipelineView.jsx';
import { HealthView } from './HealthView.jsx';
import { OntologyAuthor } from './OntologyAuthor.jsx';
import { ObjectViewsAuthor } from './ObjectViewsAuthor.jsx';
import { SourcesView } from './SourcesView.jsx';
import { CodeRepoView } from './CodeRepoView.jsx';
import { ModelsView } from './ModelsView.jsx';

/* ============================================================
   AXIOM — Phase 2 fusions ("one engine per capability")
   These wrappers compose existing views under a single module
   with a mode/tab switcher. The underlying views are untouched;
   we only add a header so redundant top-level destinations
   collapse into lenses of one workbench.
   ============================================================ */

function WBBar({ tabs, mode, setMode, hint, children }) {
  return (
    <div className="wb-bar">
      <div className="seg" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={mode === k}
            className={mode === k ? "on" : ""} onClick={() => setMode(k)}>{label}</button>
        ))}
      </div>
      {hint && <span className="wb-hint">{hint}</span>}
      {children && <div style={{ marginLeft: "auto" }}>{children}</div>}
    </div>
  );
}

// Graph absorbs Graph Analysis + Linked analysis — one graph engine, three lenses.
export function GraphWorkbench({ openEntity, go, initialMode }) {
  const [mode, setMode] = useState(initialMode || "graph");
  const [selId, setSelId] = useState(null); // cluster ②: selección compartida entre las tres lentes
  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["graph", "Graph"], ["analysis", "Analysis"], ["linked", "Linked"]]}
        hint="One graph engine · three lenses · selección compartida" />
      <div className="wb-body">
        {mode === "graph" && <GraphView openEntity={openEntity} focusId={selId} onSelect={setSelId} />}
        {mode === "analysis" && <GraphAnalysisView selId={selId} onSelect={setSelId} />}
        {mode === "linked" && <BrushingView selId={selId} onSelect={setSelId} />}
      </div>
    </div>
  );
}

// Ontology absorbs Explore + gains Author & Views — browse, model/author the schema, design layouts.
// Cluster ③: Model y Author son una sola pestaña "Model" con toggle Ver/Editar (ya comparten
// la fuente única de esquema ontology_schema.js), en vez de dos destinos idénticos.
export function OntologyWorkbench({ openEntity, go, initialTab }) {
  const [mode, setMode] = useState(initialTab === "author" ? "model" : (initialTab || "browse"));
  const [edit, setEdit] = useState(initialTab === "author");
  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["browse", "Browse"], ["model", "Model"], ["views", "Views"]]}
        hint="Browse objects, model & author the schema, design its views">
        {mode === "model" && (
          <div className="seg">
            <button className={!edit ? "on" : ""} onClick={() => setEdit(false)}>Ver</button>
            <button className={edit ? "on" : ""} onClick={() => setEdit(true)}>Editar</button>
          </div>
        )}
      </WBBar>
      <div className="wb-body">
        {mode === "browse" && <ExploreView openEntity={openEntity} go={go} />}
        {mode === "model" && (edit ? <OntologyAuthor go={go} /> : <OntologyView openEntity={openEntity} go={go} />)}
        {mode === "views" && <ObjectViewsAuthor />}
      </div>
    </div>
  );
}

// Integrate (cluster ⑰): un único banco de datos continuo —
// Sources → Pipelines → Code → Models → Health, como lentes de un mismo flujo.
// Antes eran 5 destinos sueltos del rail; ahora cada uno abre este workbench en su
// pestaña y puedes recorrer el pipeline de datos sin volver al rail.
export function DataWorkbench({ go, openEntity, initialTab }) {
  const [mode, setMode] = useState(initialTab || "sources");
  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["sources", "Sources"], ["build", "Pipelines"], ["code", "Code"], ["models", "Models"], ["health", "Data Health"]]}
        hint="Sources → Pipelines → Code → Models → Health" />
      <div className="wb-body">
        {mode === "sources" && <SourcesView />}
        {mode === "build" && <PipelineView />}
        {mode === "code" && <CodeRepoView go={go} />}
        {mode === "models" && <ModelsView go={go} />}
        {mode === "health" && <HealthView go={go} />}
      </div>
    </div>
  );
}

// Back-compat: Pipelines+Health seguían siendo un sub-banco; ahora es el mismo
// DataWorkbench (abre en "build" / "health").
export const PipelinesWorkbench = DataWorkbench;
