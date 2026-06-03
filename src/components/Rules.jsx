import { Icon, Switch } from './ui.jsx';

/* ============================================================
   AXIOM — Rules (cluster ⑪) · tarjeta de regla compartida
   Un único componente Cuando→Entonces para RulesView (alertas)
   y Automations (acciones). Muestra when/then si existen y la
   metadata de ejecución (disparos / runs / aprobación).
   ============================================================ */
export function RuleCard({ rule, onToggle }) {
  const meta = [
    rule.fired != null ? `${rule.fired} disparos` : null,
    rule.runs || null,
    rule.needs || null,
  ].filter(Boolean).join(" · ");
  return (
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, opacity: rule.on ? 1 : 0.6 }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", display: "grid", placeItems: "center",
        background: rule.on ? "var(--accent-ghost)" : "var(--bg-2)", color: rule.on ? "var(--accent)" : "var(--text-faint)" }}>
        <Icon name="bolt" size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>{rule.name}</div>
        {(rule.when || rule.then) && (
          <div className="row gap-8 center wrap" style={{ fontSize: 12.5 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warn)" }}>cuando</span>
            <span className="t-dim">{rule.when}</span>
            <Icon name="arrowRight" size={13} style={{ color: "var(--text-faint)" }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent)" }}>entonces</span>
            <span className="t-dim">{rule.then}</span>
          </div>
        )}
        {meta && <div className="t-faint mono" style={{ fontSize: 11, marginTop: 6 }}>{meta}</div>}
      </div>
      <Switch on={rule.on} onChange={() => onToggle(rule.id)} />
    </div>
  );
}
