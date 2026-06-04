import { useState } from 'react';
import { RULES, RULE_KINDS } from '../data/data_rules.js';
import { Icon, Switch } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Rules (R1: one rules engine, two kinds)
   The SINGLE place rules are defined. Every rule is
   WHEN <condition> THEN <effect>; kind splits them into
   detection (→ alert) and response (→ governed action).
   Reached from Alerts › Rules (initialKind="detection") and
   Actions › Rules (initialKind="response") — same engine.
   ============================================================ */

const FILTERS = [["all", "All"], ["detection", "Detection"], ["response", "Response"]];

function RuleCard({ r, onToggle }) {
  const { t } = useI18n();
  const k = RULE_KINDS[r.kind];
  const gated = r.kind === "response" && r.approval && r.approval !== "no approval";
  return (
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16, opacity: r.on ? 1 : 0.6 }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", display: "grid", placeItems: "center",
        background: r.on ? `color-mix(in oklab, ${k.c} 16%, var(--bg-2))` : "var(--bg-2)", color: r.on ? k.c : "var(--text-faint)" }}>
        <Icon name={k.icon} size={18} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-8 center" style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{t(r.name)}</span>
          <span className="badge" style={{ color: k.c, borderColor: `color-mix(in oklab, ${k.c} 40%, transparent)`, background: `color-mix(in oklab, ${k.c} 12%, transparent)` }}>{t(k.label)}</span>
        </div>
        <div className="row gap-8 center wrap" style={{ fontSize: 12.5 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warn)" }}>{t('when')}</span>
          <span className="t-dim">{t(r.when)}</span>
          <Icon name="arrowRight" size={13} style={{ color: "var(--text-faint)" }} />
          <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: k.c }}>{t('then')}</span>
          <span className="t-dim">{t(r.then)}</span>
        </div>
        <div className="row gap-10 center" style={{ marginTop: 6 }}>
          <span className="t-faint mono" style={{ fontSize: 11 }}>{r.kind === "detection" ? t('{n} fired', { n: r.count }) : t('{n} runs this week', { n: r.count })}</span>
          {gated && <span className="row gap-5 center t-faint" style={{ fontSize: 11 }}><Icon name="shield" size={12} />{t(r.approval)}</span>}
        </div>
      </div>
      <Switch on={r.on} onChange={() => onToggle(r.id)} label={t(r.name)} />
    </div>
  );
}

export function RulesView({ initialKind, onSeeAll }) {
  const { t } = useI18n();
  const [rules, setRules] = useState(RULES);
  const [kind, setKind] = useState(initialKind || "all");
  const shown = kind === "all" ? rules : rules.filter((r) => r.kind === kind);
  const on = shown.filter((r) => r.on).length;
  function toggle(id) { setRules((rs) => rs.map((r) => (r.id === id ? { ...r, on: !r.on } : r))); }

  const groups = kind === "all" ? ["detection", "response"] : [kind];

  return (
    <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 22px 50px" }} className="fade-in">
        {/* type switcher + actions */}
        <div className="row between center" style={{ marginBottom: 10, gap: 14 }}>
          <div className="seg" role="tablist">
            {FILTERS.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{t(l)}</button>
            ))}
          </div>
          <div className="row gap-10 center">
            {onSeeAll && <button className="btn ghost sm" onClick={onSeeAll}>{t('See all rules')}<Icon name="arrowRight" size={13} /></button>}
            <span className="badge accent"><span className="dt" />{t('{on} of {total} active', { on, total: shown.length })}</span>
            <button className="btn primary"><Icon name="plus" size={14} />{t('New rule')}</button>
          </div>
        </div>

        {/* explainer — differentiate the two kinds nítidamente */}
        <p className="t-dim" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 22px", maxWidth: "76ch" }}>
          {t('Every rule is WHEN → THEN.')}{' '}
          <b style={{ color: "var(--warn)" }}>{t('Detection')}</b> {t('rules raise alerts;')}{' '}
          <b style={{ color: "var(--accent)" }}>{t('Response')}</b> {t('rules run governed actions. Both kinds are defined here, in one place.')}
        </p>

        {groups.map((g) => {
          const list = shown.filter((r) => r.kind === g);
          if (!list.length) return null;
          const k = RULE_KINDS[g];
          return (
            <div key={g} style={{ marginBottom: 26 }}>
              {kind === "all" && (
                <div className="row gap-8 center" style={{ marginBottom: 12 }}>
                  <span style={{ color: k.c }}><Icon name={k.icon} size={15} /></span>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t(k.label)}</span>
                  <span className="t-faint mono" style={{ fontSize: 11 }}>· {t(k.blurb)}</span>
                </div>
              )}
              <div className="col" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {list.map((r) => <RuleCard key={r.id} r={r} onToggle={toggle} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
