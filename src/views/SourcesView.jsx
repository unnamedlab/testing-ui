import { useMemo, useState } from 'react';
import { CONNECTORS, SOURCES } from '../data/data_ext.js';
import { Icon, PageHeader, Stat, StatusBadge, statusColor } from '../components/ui.jsx';
import { SourceWizard } from './AdminView.jsx';

/* ============================================================
   AXIOM — Sources (Integrate · data ingestion)
   The "connect & sync" step that precedes Pipelines. This is
   INGEST health — is the connector live and the upstream fresh?
   Transform health (did the job run, is the output dataset
   fresh & passing checks) lives in Pipelines › Data Health.
   ============================================================ */

export function SourcesView() {
  const [sources] = useState(SOURCES);
  const [wizard, setWizard] = useState(false);
  const [q, setQ] = useState("");

  const stats = useMemo(() => {
    const healthy = sources.filter(s => s.status === "healthy").length;
    const streaming = sources.filter(s => /stream/i.test(s.cadence || "")).length;
    return { total: sources.length, healthy, streaming, batch: sources.length - streaming };
  }, [sources]);

  const shown = q ? sources.filter(s => (s.name + s.vendor).toLowerCase().includes(q.toLowerCase())) : sources;

  return (
    <div className="content" style={{ padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: "var(--page)", margin: "0 auto" }} className="fade-in">
        {/* header */}
        <PageHeader eyebrow="Data integration · Sources" title="Sources">
          <button className="btn primary" onClick={() => setWizard(true)}><Icon name="plus" />Add source</button>
        </PageHeader>
        <p className="t-dim" style={{ fontSize: 14, margin: "0 0 22px", maxWidth: "74ch" }}>
          The ingestion layer — connect upstream systems and keep them in sync.
          <span className="t-faint"> Ingest health answers “is the connector live and the source fresh?”. Transform health lives in </span>Pipelines › Data Health.
        </p>

        {/* summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[["Connectors", stats.total, "database"], ["Healthy", stats.healthy + "/" + stats.total, "check"],
            ["Streaming", stats.streaming, "bolt"], ["Batch", stats.batch, "clock"]].map(([k, v, ic]) => (
            <Stat key={k} label={k} value={v} icon={ic} />
          ))}
        </div>

        {/* connector flow legend */}
        <div className="row gap-8 center" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          <span className="eyebrow">Connect</span>
          <span className="t-faint"><Icon name="arrowRight" size={13} /></span>
          <span className="badge accent"><span className="dt" />Sources</span>
          <span className="t-faint"><Icon name="arrowRight" size={13} /></span>
          <span className="badge">Pipelines</span>
          <span className="t-faint"><Icon name="arrowRight" size={13} /></span>
          <span className="badge">Code</span>
          <span className="t-faint"><Icon name="arrowRight" size={13} /></span>
          <span className="badge">Models</span>
        </div>

        {/* source cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 14 }}>
          {shown.map(s => (
            <div key={s.id} className="card" style={{ padding: 16 }}>
              <div className="row between center" style={{ marginBottom: 12 }}>
                <div className="row gap-10 center">
                  <div style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--bg-2)", color: "var(--accent)" }}><Icon name={s.icon} size={19} /></div>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div><div className="t-faint" style={{ fontSize: 11.5 }}>{s.vendor} · {s.proto}</div></div>
                </div>
                <StatusBadge status={s.status === "healthy" ? "connected" : s.status} />
              </div>

              {/* ingest framing: connector → upstream */}
              <div className="row gap-8 center" style={{ marginBottom: 12, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>
                <span style={{ color: statusColor(s.status === "healthy" ? "connected" : s.status) }}>● connector</span>
                <Icon name="arrowRight" size={12} />
                <span>upstream · fresh {s.fresh}</span>
              </div>

              <div className="row between" style={{ marginBottom: 12 }}>
                {[["Records", s.records], ["Cadence", s.cadence], ["Freshness", s.fresh]].map(([k, v]) => (
                  <div key={k}><div className="t-faint" style={{ fontSize: 10.5 }}>{k}</div><div className="mono" style={{ fontSize: 12.5, color: "var(--text)" }}>{v}</div></div>
                ))}
              </div>
              <div className="row gap-8 center">
                <span className="t-faint" style={{ fontSize: 11, width: 72 }}>ingest health</span>
                <div className="meter" style={{ flex: 1 }}><i style={{ width: s.health + "%", background: s.health >= 90 ? "var(--ok)" : "var(--warn)" }} /></div>
                <span className="mono t-dim" style={{ fontSize: 11 }}>{s.health}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SourceWizard open={wizard} onClose={() => setWizard(false)} />
    </div>
  );
}
