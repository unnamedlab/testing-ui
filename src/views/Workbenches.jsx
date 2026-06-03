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

/* ============================================================
   AXIOM — Phase 2 fusions ("one engine per capability")
   These wrappers compose existing views under a single module
   with a mode/tab switcher. The underlying views are untouched;
   we only add a header so redundant top-level destinations
   collapse into lenses of one workbench.
   ============================================================ */

function WBBar({ tabs, mode, setMode, hint }) {
  return (
    <div className="wb-bar">
      <div className="seg" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={mode === k}
            className={mode === k ? "on" : ""} onClick={() => setMode(k)}>{label}</button>
        ))}
      </div>
      {hint && <span className="wb-hint">{hint}</span>}
    </div>
  );
}

// Graph absorbs Graph Analysis + Linked analysis — one graph engine, three lenses.
export function GraphWorkbench({ openEntity, go, initialMode }) {
  const [mode, setMode] = useState(initialMode || "graph");
  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["graph", "Graph"], ["analysis", "Analysis"], ["linked", "Linked"]]}
        hint="One graph engine · three lenses" />
      <div className="wb-body">
        {mode === "graph" && <GraphView openEntity={openEntity} focusId={null} />}
        {mode === "analysis" && <GraphAnalysisView openEntity={openEntity} go={go} />}
        {mode === "linked" && <BrushingView openEntity={openEntity} go={go} />}
      </div>
    </div>
  );
}

// Ontology absorbs Explore + gains Author & Views — browse, model, edit schema, design layouts.
export function OntologyWorkbench({ openEntity, go, initialTab }) {
  const [mode, setMode] = useState(initialTab || "browse");
  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["browse", "Browse"], ["model", "Model"], ["author", "Author"], ["views", "Views"]]}
        hint="Browse objects, model the schema, author it, design its views" />
      <div className="wb-body">
        {mode === "browse" && <ExploreView openEntity={openEntity} go={go} />}
        {mode === "model" && <OntologyView openEntity={openEntity} go={go} />}
        {mode === "author" && <OntologyAuthor go={go} />}
        {mode === "views" && <ObjectViewsAuthor />}
      </div>
    </div>
  );
}

// Pipelines absorbs Data Health — build the data, then watch it. Same engineer's bench.
export function PipelinesWorkbench({ go, initialTab }) {
  const [mode, setMode] = useState(initialTab || "build");
  return (
    <div className="wb">
      <WBBar mode={mode} setMode={setMode}
        tabs={[["build", "Pipelines"], ["health", "Data Health"]]}
        hint="Build the data, then watch it" />
      <div className="wb-body">
        {mode === "build" && <PipelineView />}
        {mode === "health" && <HealthView go={go} />}
      </div>
    </div>
  );
}
