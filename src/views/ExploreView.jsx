import { useMemo, useState } from 'react';
import { ENTITIES, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { Icon, ListSkeleton, ObjectList, useLoad } from '../components/ui.jsx';

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
            <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Explorador de objetos</h1>
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
          <ObjectList variant="table" items={shown} openEntity={openEntity} />
        )}
      </div>
    </div>
  );
}
