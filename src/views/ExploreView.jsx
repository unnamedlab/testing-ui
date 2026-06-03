import { useMemo, useState } from 'react';
import { ENTITIES, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { Icon, RiskPill, TypeGlyph, ListSkeleton, useLoad } from '../components/ui.jsx';

/* ============================================================
   AXIOM — ExploreView (regenerado)
   Explorador tabular de objetos de la ontología. Es la pestaña
   "Browse" del OntologyWorkbench.
   ============================================================ */
export function ExploreView({ openEntity }) {
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const loading = useLoad(400);
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ENTITIES.filter((e) =>
      (type === "all" || e.type === type) &&
      (!term || e.name.toLowerCase().includes(term) || (e.sub || "").toLowerCase().includes(term)));
  }, [type, q]);

  return (
    <div className="content" style={{ padding: "22px 26px 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }} className="fade-in">
        <div className="row between center" style={{ marginBottom: 16, gap: 14, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 5 }}>Ontología · objetos</div>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Explorador de objetos</h1>
          </div>
          <div className="search" style={{ maxWidth: 320 }}>
            <Icon name="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar objetos…" />
          </div>
        </div>

        <div className="row gap-6 wrap" style={{ marginBottom: 16 }}>
          <button className={"chip" + (type === "all" ? " on" : "")} onClick={() => setType("all")}>Todos · {ENTITIES.length}</button>
          {OBJECT_TYPES.map((t) => {
            const n = ENTITIES.filter((e) => e.type === t.id).length;
            if (!n) return null;
            return <button key={t.id} className={"chip" + (type === t.id ? " on" : "")} onClick={() => setType(t.id)}>
              <span className={"tc " + t.cls + " type-dot"} style={{ width: 8, height: 8 }} />{t.name} · {n}</button>;
          })}
        </div>

        {loading ? <ListSkeleton rows={7} /> : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead><tr><th>Objeto</th><th>Tipo</th><th>Detalle</th><th style={{ textAlign: "right" }}>Riesgo</th><th></th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} onClick={() => openEntity && openEntity(e.id)}>
                    <td><span className="row gap-10 center"><TypeGlyph type={e.type} size={28} /><span style={{ color: "var(--text)", fontWeight: 600 }}>{e.name}</span>{e.watch && <span style={{ color: "var(--alert)" }}><Icon name="bookmark" size={13} /></span>}</span></td>
                    <td>{TYPE_BY_ID[e.type] ? TYPE_BY_ID[e.type].name : e.type}</td>
                    <td className="t-dim">{e.sub}</td>
                    <td style={{ textAlign: "right" }}><RiskPill r={e.risk} /></td>
                    <td style={{ textAlign: "right", color: "var(--text-faint)" }}><Icon name="chevron" size={15} /></td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "26px 0", color: "var(--text-faint)" }}>Sin objetos que coincidan.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
