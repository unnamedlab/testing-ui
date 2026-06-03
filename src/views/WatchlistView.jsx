import { useState } from 'react';
import { ENTITIES, TYPE_BY_ID } from '../data/data.js';
import { Icon, TypeGlyph, RiskPill } from '../components/ui.jsx';

/* ============================================================
   AXIOM — WatchlistView (regenerado)
   Listas de vigilancia: objetos marcados watch + listas temáticas.
   ============================================================ */
const LISTS = [
  { id: "maritime", name: "Watch marítima", desc: "Buques y operadores bajo seguimiento", icon: "ship" },
  { id: "financial", name: "Watch financiera", desc: "Cuentas y entidades con flujos marcados", icon: "card" },
  { id: "sanctions", name: "Exposición a sanciones", desc: "Coincidencias OFAC/UE", icon: "shield" },
];
export function WatchlistView({ openEntity }) {
  const [list, setList] = useState("maritime");
  const watched = ENTITIES.filter((e) => e.watch || e.risk >= 80);
  const shown = list === "maritime" ? watched.filter((e) => ["vessel", "port", "org"].includes(e.type))
    : list === "financial" ? watched.filter((e) => ["account", "org", "txn"].includes(e.type))
    : watched.filter((e) => e.risk >= 80);
  return (
    <div className="content" style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}>
      <aside style={{ borderRight: "1px solid var(--line-soft)", background: "var(--bg-1)", overflow: "auto", padding: "16px 10px" }}>
        <div className="eyebrow" style={{ padding: "0 6px 10px" }}>Watchlists</div>
        {LISTS.map((l) => (
          <button key={l.id} onClick={() => setList(l.id)} className="row gap-10 center" style={{ width: "100%", textAlign: "left", border: "none", borderRadius: 9, padding: 10, marginBottom: 2, cursor: "pointer", background: list === l.id ? "var(--accent-ghost)" : "none", boxShadow: list === l.id ? "inset 0 0 0 1px var(--accent-dim)" : "none" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--bg-2)", color: list === l.id ? "var(--accent)" : "var(--text-dim)" }}><Icon name={l.icon} size={16} /></span>
            <span style={{ flex: 1, minWidth: 0 }}><span style={{ fontSize: 13, fontWeight: 600, display: "block", color: list === l.id ? "var(--text)" : "var(--text-dim)" }}>{l.name}</span><span className="t-faint" style={{ fontSize: 11 }}>{l.desc}</span></span>
          </button>
        ))}
      </aside>
      <div style={{ overflow: "auto", padding: "24px 28px 60px" }}>
        <div style={{ maxWidth: 980 }} className="fade-in">
          <div className="eyebrow" style={{ marginBottom: 6 }}>{LISTS.find((l) => l.id === list).name}</div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, margin: "0 0 18px", letterSpacing: "-0.02em" }}>{shown.length} objetos vigilados</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {shown.map((e) => (
              <button key={e.id} className="card hover" onClick={() => openEntity && openEntity(e.id)} style={{ padding: 14, textAlign: "left", cursor: "pointer" }}>
                <div className="row between center" style={{ marginBottom: 10 }}><TypeGlyph type={e.type} size={32} /><RiskPill r={e.risk} /></div>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                <div className="t-faint" style={{ fontSize: 12, marginTop: 2 }}>{TYPE_BY_ID[e.type] ? TYPE_BY_ID[e.type].name : e.type} · {e.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
