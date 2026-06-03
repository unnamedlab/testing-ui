import { Icon, PageHeader } from '../components/ui.jsx';

/* ============================================================
   AXIOM — PipelineView (regenerado)
   Constructor de pipeline: grafo de etapas raw → clean → ontología.
   Es la pestaña "Pipelines" (build) del PipelinesWorkbench.
   ============================================================ */
const STAGES = [
  { id: "ingest", name: "swift_ingest", layer: "Conector", out: "txn_raw", status: "healthy", icon: "download" },
  { id: "norm", name: "normalize_txn", layer: "Transform · py", out: "txn_normalized", status: "healthy", icon: "func" },
  { id: "er", name: "entity_resolution", layer: "Transform · py", out: "entities_resolved", status: "building", icon: "merge" },
  { id: "ais", name: "ais_rollup", layer: "Transform · sql", out: "vessel_tracks", status: "degraded", icon: "globe" },
  { id: "onto", name: "publish_ontology", layer: "Sink", out: "Ontology", status: "healthy", icon: "share" },
];
const ST = { healthy: { c: "var(--ok)", l: "ok" }, building: { c: "var(--accent)", l: "building" }, degraded: { c: "var(--warn)", l: "degraded" } };
export function PipelineView() {
  return (
    <div className="content" style={{ padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }} className="fade-in">
        <PageHeader eyebrow="Data Integration · pipeline" title="Pipeline · blackfrost">
          <button className="btn"><Icon name="history" size={15} />Historial</button>
          <button className="btn primary"><Icon name="play" size={15} />Ejecutar</button>
        </PageHeader>
        <div className="card grid-bg" style={{ padding: "28px 22px", overflowX: "auto" }}>
          <div className="row" style={{ gap: 0, alignItems: "stretch", minWidth: "min-content" }}>
            {STAGES.map((s, i) => (
              <div key={s.id} className="row" style={{ alignItems: "center" }}>
                <div className="panel" style={{ width: 190, padding: 14, background: "var(--bg-1)" }}>
                  <div className="row between center" style={{ marginBottom: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--bg-2)", color: ST[s.status].c }}><Icon name={s.icon} size={16} /></span>
                    <span className="badge" style={{ color: ST[s.status].c, borderColor: "transparent" }}><span className="dt" style={{ background: ST[s.status].c }} />{ST[s.status].l}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{s.name}</div>
                  <div className="t-faint" style={{ fontSize: 11, marginTop: 2 }}>{s.layer}</div>
                  <div className="row gap-6 center" style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}><Icon name="layers" size={12} />{s.out}</div>
                </div>
                {i < STAGES.length - 1 && <span style={{ color: "var(--line-strong)", padding: "0 6px" }}><Icon name="arrowRight" size={18} /></span>}
              </div>
            ))}
          </div>
        </div>
        <div className="t-faint mono" style={{ fontSize: 11, marginTop: 12 }}>5 etapas · cadencia */5 min · última ejecución hace 5m</div>
      </div>
    </div>
  );
}
