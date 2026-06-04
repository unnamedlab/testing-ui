import { useState } from 'react';
import { rulesByContext } from '../data/data_rules.js';
import { RulesEngine } from '../components/RulesEngine.jsx';

/* ============================================================
   AXIOM — RulesView · reglas de alerta del CASO
   Pestaña "Rules" de CasesView. Es el motor único (RulesEngine)
   filtrado al contexto "case"; ops vive en Actions › Automations
   y datos en Health, todos sobre data_rules.js.
   ============================================================ */
export function RulesView() {
  const [rules, setRules] = useState(() => rulesByContext("case"));
  const toggle = (id) => setRules((rs) => rs.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  return (
    <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
      <div style={{ maxWidth: "var(--page)", margin: "0 auto", padding: "22px 22px 50px" }} className="fade-in">
        <RulesEngine rules={rules} onToggle={toggle} />
      </div>
    </div>
  );
}
