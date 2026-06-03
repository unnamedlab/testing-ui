import { Icon, Switch } from './ui.jsx';

/* ============================================================
   AXIOM — RulesEngine · motor de reglas único (Cuando → Entonces)
   Componente CONTROLADO: el dueño del estado pasa `rules` y `onToggle`.
   Lo usan RulesView (caso), Actions › Automations (ops) y Health (datos).
   Muestra la línea Cuando→Entonces y, como meta, los disparos (`fired`)
   o el par operativo `runs · needs`.
   ============================================================ */
export function RulesEngine({ rules, onToggle, onNew }) {
  const on = rules.filter((r) => r.on).length;
  return (
    <div className="col" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row between center" style={{ marginBottom: 2 }}>
        <span className="badge accent"><span className="dt" />{on} de {rules.length} activas</span>
        <button className="btn primary sm" onClick={onNew}><Icon name="plus" size={14} />Nueva regla</button>
      </div>
      {rules.map((r) => {
        const meta = r.fired != null ? `${r.fired} disparos` : [r.runs, r.needs].filter(Boolean).join(" · ");
        return (
          <div key={r.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, opacity: r.on ? 1 : 0.6 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", display: "grid", placeItems: "center", background: r.on ? "var(--accent-ghost)" : "var(--bg-2)", color: r.on ? "var(--accent)" : "var(--text-faint)" }}><Icon name="bolt" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: r.when ? 4 : 0 }}>{r.name}</div>
              {r.when && (
                <div className="row gap-8 center wrap" style={{ fontSize: 12.5 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warn)" }}>cuando</span>
                  <span className="t-dim">{r.when}</span>
                  <Icon name="arrowRight" size={13} style={{ color: "var(--text-faint)" }} />
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent)" }}>entonces</span>
                  <span className="t-dim">{r.then}</span>
                </div>
              )}
              {meta && <div className="t-faint mono" style={{ fontSize: 11, marginTop: 6 }}>{meta}</div>}
            </div>
            <Switch on={r.on} onChange={() => onToggle(r.id)} />
          </div>
        );
      })}
    </div>
  );
}
