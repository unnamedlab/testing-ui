import { useMemo, useState } from 'react';
import { EDGES, ENTITIES, OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, RiskPill, TypeGlyph, ListSkeleton, useLoad, PageHeader } from './ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — ObjectIndex (consolidación · clúster B)
   UN solo índice de objetos sobre la ontología. Explore, Search y
   Watchlists son ahora la MISMA vista con distinto contexto:
     • Explore    → índice en modo tabla
     • Search     → índice con query inicial (modo lista)
     • Watchlists → índice con una "vista guardada" (preset) aplicada
   Filtros ortogonales: vista guardada (preset) · tipo · texto · tabla/lista.
   Reemplaza ExploreView, SearchView y WatchlistView (4 pantallas → 1).
   ============================================================ */

// Vistas guardadas = filtros con nombre. Las antiguas "watchlists" son presets.
export const SAVED_VIEWS = [
  { id: "all",       name: "All objects",        icon: "table",    filter: () => true },
  { id: "watch",     name: "On watch",           icon: "bookmark", filter: (e) => e.watch || e.risk >= 80 },
  { id: "maritime",  name: "Maritime watch",     icon: "ship",     filter: (e) => (e.watch || e.risk >= 80) && ["vessel", "port", "org"].includes(e.type) },
  { id: "financial", name: "Financial watch",    icon: "card",     filter: (e) => (e.watch || e.risk >= 80) && ["account", "org", "txn"].includes(e.type) },
  { id: "sanctions", name: "Sanctions exposure", icon: "shield",   filter: (e) => e.risk >= 80 },
];

export function ObjectIndex({ openEntity, initialQuery = "", initialView = "table", initialPreset = "all", eyebrow, title, sub, showPresets = true }) {
  const { t } = useI18n();
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState("all");
  const [preset, setPreset] = useState(initialPreset);
  const [view, setView] = useState(initialView); // "table" | "list"
  const loading = useLoad(400);

  const pv = SAVED_VIEWS.find((p) => p.id === preset) || SAVED_VIEWS[0];
  const inPreset = useMemo(() => ENTITIES.filter((e) => pv.filter(e)), [pv]);
  const term = q.trim().toLowerCase();
  const shown = useMemo(() => inPreset.filter((e) =>
    (type === "all" || e.type === type) &&
    (!term || e.name.toLowerCase().includes(term) || (e.sub || "").toLowerCase().includes(term) ||
      (TYPE_BY_ID[e.type] && TYPE_BY_ID[e.type].name.toLowerCase().includes(term)))
  ), [inPreset, type, term]);
  const typeCounts = useMemo(() => { const c = {}; inPreset.forEach((e) => { c[e.type] = (c[e.type] || 0) + 1; }); return c; }, [inPreset]);

  return (
    <div className="content" style={{ padding: "var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }} className="fade-in">
        <PageHeader eyebrow={eyebrow ? t(eyebrow) : undefined}
          title={typeof title === "string" ? t(title) : title}
          sub={sub ? t(sub) : undefined}>
          <div className="search" style={{ maxWidth: 300 }}>
            <Icon name="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Filter objects…')} />
          </div>
          <div className="seg" role="tablist" aria-label={t('View')}>
            <button role="tab" aria-selected={view === "table"} className={view === "table" ? "on" : ""} onClick={() => setView("table")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="table" size={14} />{t('Table')}
            </button>
            <button role="tab" aria-selected={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="layers" size={14} />{t('List')}
            </button>
          </div>
        </PageHeader>

        {/* saved views (presets) — las antiguas watchlists viven aquí */}
        {showPresets && (
          <div className="row gap-6 wrap" style={{ marginBottom: 12 }}>
            {SAVED_VIEWS.map((p) => (
              <button key={p.id} className={"chip" + (preset === p.id ? " on" : "")} onClick={() => { setPreset(p.id); setType("all"); }}>
                <Icon name={p.icon} size={13} />{t(p.name)}
              </button>
            ))}
          </div>
        )}

        {/* type chips — recomputados dentro de la vista guardada activa */}
        <div className="row gap-6 wrap" style={{ marginBottom: 16 }}>
          <button className={"chip" + (type === "all" ? " on" : "")} onClick={() => setType("all")}>{t('All')} · {inPreset.length}</button>
          {OBJECT_TYPES.map((ot) => {
            const n = typeCounts[ot.id]; if (!n) return null;
            return <button key={ot.id} className={"chip" + (type === ot.id ? " on" : "")} onClick={() => setType(ot.id)}>
              <span className={"tc " + ot.cls + " type-dot"} style={{ width: 8, height: 8 }} />{t(ot.name)} · {n}</button>;
          })}
        </div>

        {loading ? <ListSkeleton rows={7} /> : view === "table" ? (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="tbl">
              <thead><tr><th>{t('Object')}</th><th>{t('Type')}</th><th>{t('Detail')}</th><th style={{ textAlign: "right" }}>{t('Risk')}</th><th></th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} tabIndex={0} role="button" aria-label={e.name}
                    onClick={() => openEntity && openEntity(e.id)}
                    onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openEntity && openEntity(e.id); } }}>
                    <td><span className="row gap-10 center"><TypeGlyph type={e.type} size={28} /><span style={{ color: "var(--text)", fontWeight: 600 }}>{e.name}</span>{e.watch && <span style={{ color: "var(--alert)" }}><Icon name="bookmark" size={13} /></span>}</span></td>
                    <td>{TYPE_BY_ID[e.type] ? t(TYPE_BY_ID[e.type].name) : e.type}</td>
                    <td className="t-dim">{e.sub}</td>
                    <td style={{ textAlign: "right" }}><RiskPill r={e.risk} /></td>
                    <td style={{ textAlign: "right", color: "var(--text-faint)" }}><Icon name="chevron" size={15} /></td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "26px 0", color: "var(--text-faint)" }}>{t('No matching objects.')}</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="col gap-8">
            {shown.map((e) => (
              <button key={e.id} className="card hover" onClick={() => openEntity && openEntity(e.id)} style={{ padding: 14, textAlign: "left", cursor: "pointer" }}>
                <div className="row gap-14 center">
                  <TypeGlyph type={e.type} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row gap-8 center">
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{e.name}</span>
                      {e.watch && <Badge kind="alert" dot>{t('watchlist')}</Badge>}
                    </div>
                    <div className="t-dim" style={{ fontSize: 13, marginTop: 2 }}>{TYPE_BY_ID[e.type] ? t(TYPE_BY_ID[e.type].name) : e.type} · {e.sub}</div>
                  </div>
                  <div className="row gap-16 center">
                    <div className="col" style={{ alignItems: "flex-end" }}>
                      <span className="eyebrow">{t('Connections')}</span>
                      <span className="mono" style={{ fontSize: 15 }}>{EDGES.filter((ed) => ed.s === e.id || ed.t === e.id).length}</span>
                    </div>
                    <RiskPill r={e.risk} />
                    <span className="t-faint"><Icon name="arrowRight" size={16} /></span>
                  </div>
                </div>
              </button>
            ))}
            {shown.length === 0 && <div className="t-faint" style={{ padding: "26px", textAlign: "center", fontSize: 13 }}>{t('No matching objects.')}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
