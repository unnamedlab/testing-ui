import { useState } from 'react';
import { Icon } from '../components/ui.jsx';
import { RuleCard } from '../components/Rules.jsx';
import { rulesByScope } from '../data/data_rules.js';

/* ============================================================
   AXIOM — RulesView
   Reglas de alerta del caso (pestaña "Rules" de CasesView).
   Cluster ⑪: usa el motor de reglas único (data_rules · scope 'case')
   y la tarjeta compartida <RuleCard>.
   ============================================================ */

export function RulesView() {
  const [rules, setRules] = useState(() => rulesByScope("case"));
  const on = rules.filter((r) => r.on).length;
  function toggle(id) { setRules((rs) => rs.map((r) => (r.id === id ? { ...r, on: !r.on } : r))); }
  return (
    <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 22px 50px" }} className="fade-in">
        <div className="row between center" style={{ marginBottom: 18 }}>
          <div className="row gap-10 center"><span className="badge accent"><span className="dt" />{on} de {rules.length} activas</span></div>
          <button className="btn primary"><Icon name="plus" size={14} />Nueva regla</button>
        </div>
        <div className="col" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rules.map((r) => <RuleCard key={r.id} rule={r} onToggle={toggle} />)}
        </div>
      </div>
    </div>
  );
}
