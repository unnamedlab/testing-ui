import { useState } from 'react';
import { ENTITIES, TYPE_BY_ID } from '../data/data.js';
import { Icon, TypeGlyph, RiskPill } from '../components/ui.jsx';

/* ============================================================
   AXIOM — ResolveView (regenerado)
   Cola de resolución de entidades: pares candidatos a fusionar.
   ============================================================ */
function buildPairs() {
  const pairs = [];
  const byType = {};
  ENTITIES.forEach((e) => { (byType[e.type] = byType[e.type] || []).push(e); });
  Object.values(byType).forEach((list) => {
    for (let i = 0; i + 1 < list.length && pairs.length < 8; i += 2) {
      pairs.push({ id: list[i].id + "~" + list[i + 1].id, a: list[i], b: list[i + 1], conf: 0.7 + ((i * 7) % 28) / 100 });
    }
  });
  return pairs;
}

export function ResolveView() {
  const [pairs, setPairs] = useState(buildPairs);
  function resolve(id) { setPairs((p) => p.filter((x) => x.id !== id)); }
  return (
    <div className="content" style={{ padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }} className="fade-in">
        <div className="eyebrow" style={{ marginBottom: 6 }}>Ontología · resolución de entidades</div>
        <h1 className="serif" style={{ fontSize: 27, fontWeight: 500, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Cola de resolución</h1>
        <div className="t-dim" style={{ fontSize: 14, marginBottom: 22 }}>Pares de objetos que el motor cree que son la misma entidad. Confírmalos o sepáralos.</div>

        <div className="col" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pairs.map((p) => (
            <div key={p.id} className="card" style={{ padding: 16 }}>
              <div className="row between center" style={{ marginBottom: 14 }}>
                <span className="badge accent"><span className="dt" />candidato · {Math.round(p.conf * 100)}%</span>
                <span className="t-faint mono" style={{ fontSize: 11 }}>{TYPE_BY_ID[p.a.type] ? TYPE_BY_ID[p.a.type].name : p.a.type}</span>
              </div>
              <div className="row gap-16 center" style={{ marginBottom: 14 }}>
                <div className="row gap-10 center" style={{ flex: 1, minWidth: 0 }}><TypeGlyph type={p.a.type} size={34} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{p.a.name}</div><div className="t-faint" style={{ fontSize: 12 }}>{p.a.sub}</div></div><RiskPill r={p.a.risk} /></div>
                <span className="t-faint"><Icon name="merge" size={18} /></span>
                <div className="row gap-10 center" style={{ flex: 1, minWidth: 0 }}><TypeGlyph type={p.b.type} size={34} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{p.b.name}</div><div className="t-faint" style={{ fontSize: 12 }}>{p.b.sub}</div></div><RiskPill r={p.b.risk} /></div>
              </div>
              <div className="row gap-8" style={{ justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => resolve(p.id)}><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />Son distintos</button>
                <button className="btn primary" onClick={() => resolve(p.id)}><Icon name="merge" size={14} />Fusionar</button>
              </div>
            </div>
          ))}
          {pairs.length === 0 && <div className="card col center" style={{ padding: "40px 0", gap: 10, color: "var(--text-faint)" }}><Icon name="check" size={24} /><span style={{ fontSize: 13 }}>Cola vacía — nada pendiente de resolución.</span></div>}
        </div>
      </div>
    </div>
  );
}
