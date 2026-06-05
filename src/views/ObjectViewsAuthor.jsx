import { useState } from 'react';
import { OBJECT_TYPES, TYPE_BY_ID } from '../data/data.js';
import { Badge, Icon, TypeGlyph } from '../components/ui.jsx';
import { SEED_SCHEMA } from './OntologyAuthor.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Object Views (Ontology › Views)
   Where you design the layout of the Entity 360 per object type:
   which cards appear, in what order, which properties are
   highlighted, and which tabs are enabled. Schema (Author) says
   what an object IS; Views says how it's PRESENTED in the app —
   the in-app twin of Reports (which presents in the deliverable).
   ============================================================ */

// Card palette available to compose an object view.
const CARD_LIBRARY = [
  { id: "summary",   name: "Summary header",      icon: "grid",  desc: "Glyph, name, type, risk pill" },
  { id: "props",     name: "Highlighted properties", icon: "table", desc: "Key fields surfaced at the top" },
  { id: "risk",      name: "Risk & flags",        icon: "flag",  desc: "Risk score, watch status, alerts" },
  { id: "connections", name: "Connections",       icon: "share", desc: "Linked objects preview" },
  { id: "map",       name: "Geospatial",          icon: "globe", desc: "Last position / locations" },
  { id: "transactions", name: "Transactions",     icon: "bars",  desc: "Financial activity table" },
  { id: "timeline",  name: "Activity timeline",   icon: "clock", desc: "Chronological events" },
  { id: "lineage",   name: "Lineage & access",    icon: "shield", desc: "Provenance and handling" },
];
const CARD_BY_ID = Object.fromEntries(CARD_LIBRARY.map(c => [c.id, c]));

// Sensible default layouts per type (the "seed" each view starts from).
const DEFAULT_LAYOUT = {
  vessel:  ["summary", "props", "risk", "map", "connections", "timeline"],
  org:     ["summary", "props", "risk", "connections", "transactions", "lineage"],
  person:  ["summary", "props", "risk", "connections", "timeline"],
  account: ["summary", "props", "transactions", "connections", "risk"],
  port:    ["summary", "props", "map", "connections"],
  txn:     ["summary", "props", "lineage", "connections"],
};
const fallbackLayout = ["summary", "props", "risk", "connections", "timeline", "lineage"];

export function ObjectViewsAuthor() {
  const { t: tr } = useI18n();
  const [sel, setSel] = useState("vessel");
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUT);
  const [dirty, setDirty] = useState(false);
  const t = TYPE_BY_ID[sel];
  const layout = layouts[sel] || fallbackLayout;
  const props = SEED_SCHEMA[sel] || [];
  const [highlight, setHighlight] = useState({});
  const hi = highlight[sel] || props.slice(0, 3).map(p => p[0]);

  function setLayout(next) { setLayouts(l => ({ ...l, [sel]: next })); setDirty(true); }
  function toggleCard(id) {
    layout.includes(id) ? setLayout(layout.filter(c => c !== id)) : setLayout([...layout, id]);
  }
  function move(id, dir) {
    const i = layout.indexOf(id); const j = i + dir;
    if (i < 0 || j < 0 || j >= layout.length) return;
    const next = [...layout]; [next[i], next[j]] = [next[j], next[i]]; setLayout(next);
  }
  function toggleHi(name) {
    setHighlight(h => { const cur = h[sel] || hi; const nx = cur.includes(name) ? cur.filter(x => x !== name) : [...cur, name]; setDirty(true); return { ...h, [sel]: nx }; });
  }

  return (
    <div className="content" style={{ display: "grid", gridTemplateColumns: "var(--master-w) 1fr 320px", padding: 0, overflow: "hidden" }}>
      {/* type list */}
      <aside style={{ borderRight: "1px solid var(--line-soft)", overflow: "auto", background: "var(--bg-1)" }}>
        <div style={{ padding: "15px 14px 10px" }}><div className="eyebrow">{tr('Object types')}</div></div>
        <div style={{ padding: "0 8px 16px" }}>
          {OBJECT_TYPES.map(ot => (
            <button key={ot.id} onClick={() => setSel(ot.id)} className={"ov-row tc " + ot.cls + (sel === ot.id ? " on" : "")}>
              <span className="type-dot" />
              <Icon name={ot.glyph} size={16} style={{ color: "var(--c)" }} />
              <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{tr(ot.name)}</span>
              <span className="mono t-faint" style={{ fontSize: 10 }}>{(layouts[ot.id] || fallbackLayout).length}</span>
            </button>
          ))}
        </div>
        <style>{`
          .ov-row { display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border:none; background:none; border-radius:9px; cursor:pointer; transition:background .12s; }
          .ov-row:hover { background:var(--bg-2); }
          .ov-row.on { background:color-mix(in oklab, var(--c) 14%, var(--bg-2)); box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--c) 30%,transparent); }
        `}</style>
      </aside>

      {/* composition */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div className="row between center" style={{ padding: "12px 22px", borderBottom: "1px solid var(--line-soft)", flex: "none", background: dirty ? "color-mix(in oklab, var(--warn) 8%, var(--bg-1))" : "var(--bg-1)" }}>
          <div className="row gap-12 center">
            <TypeGlyph type={sel} size={32} />
            <div><div className="row gap-8 center"><span className="serif" style={{ fontSize: 17, fontWeight: 600 }}>{tr('{name} view', { name: tr(t.name) })}</span><Badge kind="">{tr('{n} cards', { n: layout.length })}</Badge></div>
              <div className="t-faint mono" style={{ fontSize: 11 }}>{tr('Entity 360 layout')}</div></div>
          </div>
          <div className="row gap-8 center">
            {dirty && <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>● {tr('unsaved')}</span>}
            <button className="btn sm" onClick={() => { setLayouts(DEFAULT_LAYOUT); setHighlight({}); setDirty(false); }} disabled={!dirty} style={{ opacity: dirty ? 1 : .5 }}>{tr('Reset')}</button>
            <button className="btn primary sm" onClick={() => setDirty(false)}><Icon name="check" size={14} />{tr('Publish view')}</button>
          </div>
        </div>

        <div className="content" style={{ padding: "20px 24px 50px" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }} className="fade-in" key={sel}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{tr('Cards in this view · drag order with ▲▼')}</div>
            <div className="col gap-8" style={{ marginBottom: 24 }}>
              {layout.map((id, i) => {
                const c = CARD_BY_ID[id]; if (!c) return null;
                return (
                  <div key={id} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, flex: "none", display: "grid", placeItems: "center", background: "var(--accent-ghost)", color: "var(--accent)" }}><Icon name={c.icon} size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{tr(c.name)}</div>
                      <div className="t-faint" style={{ fontSize: 11.5 }}>{tr(c.desc)}</div>
                    </div>
                    {id === "props" && <span className="badge accent" style={{ fontSize: 9.5 }}>{tr('{n} fields', { n: hi.length })}</span>}
                    <div className="row gap-2">
                      <button className="icon-btn sm" onClick={() => move(id, -1)} disabled={i === 0} style={{ width: 26, height: 26, opacity: i === 0 ? .4 : 1 }}><Icon name="chevron" size={14} style={{ transform: "rotate(-90deg)" }} /></button>
                      <button className="icon-btn sm" onClick={() => move(id, 1)} disabled={i === layout.length - 1} style={{ width: 26, height: 26, opacity: i === layout.length - 1 ? .4 : 1 }}><Icon name="chevron" size={14} style={{ transform: "rotate(90deg)" }} /></button>
                      <button className="icon-btn sm" onClick={() => toggleCard(id)} style={{ width: 26, height: 26 }} title={tr('Remove')}><Icon name="x" size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="eyebrow" style={{ marginBottom: 10 }}>{tr('Add a card')}</div>
            <div className="row gap-8 wrap" style={{ marginBottom: 26 }}>
              {CARD_LIBRARY.filter(c => !layout.includes(c.id)).map(c => (
                <button key={c.id} className="chip" onClick={() => toggleCard(c.id)}><Icon name={c.icon} size={13} />{tr(c.name)}</button>
              ))}
              {CARD_LIBRARY.every(c => layout.includes(c.id)) && <span className="t-faint" style={{ fontSize: 12.5 }}>{tr('All cards in use.')}</span>}
            </div>

            {/* highlighted properties picker */}
            <div className="eyebrow" style={{ marginBottom: 10 }}>{tr('Highlighted properties')}</div>
            <div className="row gap-8 wrap">
              {props.map(p => (
                <button key={p[0]} className={"chip" + (hi.includes(p[0]) ? " on" : "")} onClick={() => toggleHi(p[0])}>
                  <span className="mono" style={{ fontSize: 11.5 }}>{p[0]}</span>
                </button>
              ))}
              {props.length === 0 && <span className="t-faint" style={{ fontSize: 12.5 }}>{tr('No schema properties — define them in Author.')}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* live preview */}
      <aside style={{ borderLeft: "1px solid var(--line-soft)", background: "var(--bg-inset)", overflow: "auto", padding: "16px 16px 40px" }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>{tr('Preview · Entity 360')}</div>
        <div className="card" style={{ overflow: "hidden", background: "var(--bg-1)" }}>
          {layout.map((id, i) => {
            const c = CARD_BY_ID[id]; if (!c) return null;
            if (id === "summary") return (
              <div key={id} style={{ padding: 14, borderBottom: "1px solid var(--line-soft)" }}>
                <div className="row gap-10 center"><TypeGlyph type={sel} size={36} />
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{tr('{name} · sample', { name: tr(t.name) })}</div><div className="t-faint" style={{ fontSize: 11 }}>{tr(t.name)}</div></div></div>
              </div>
            );
            if (id === "props") return (
              <div key={id} style={{ padding: 14, borderBottom: "1px solid var(--line-soft)" }}>
                <div className="eyebrow" style={{ marginBottom: 8, fontSize: 9.5 }}>{tr('Highlighted')}</div>
                <div className="col gap-2">
                  {hi.map(name => (
                    <div key={name} className="row between" style={{ padding: "3px 0" }}><span className="mono t-faint" style={{ fontSize: 11 }}>{name}</span><span className="mono" style={{ fontSize: 11, color: "var(--text)" }}>—</span></div>
                  ))}
                </div>
              </div>
            );
            return (
              <div key={id} style={{ padding: "11px 14px", borderBottom: i < layout.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
                <div className="row gap-8 center"><span style={{ color: "var(--accent)" }}><Icon name={c.icon} size={14} /></span><span style={{ fontSize: 12.5, fontWeight: 600 }}>{tr(c.name)}</span></div>
                <div style={{ height: 26, marginTop: 8, borderRadius: 6, background: "var(--bg-2)", border: "1px dashed var(--line)" }} />
              </div>
            );
          })}
        </div>
        <div className="t-faint mono" style={{ fontSize: 10, marginTop: 12, lineHeight: 1.6 }}>{tr('This is what an analyst sees when they open a {name} in Entity 360.', { name: tr(t.name) })}</div>
      </aside>
    </div>
  );
}
