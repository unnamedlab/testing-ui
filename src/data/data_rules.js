/* AXIOM — data_rules.js
   ============================================================
   SINGLE SOURCE OF TRUTH for "rules" (resolves audit finding R1).

   Before, two parallel rule engines existed and overlapped:
     • RulesView.SEED        (Alerts › Rules)      → raised ALERTS
     • data_actions.AUTO_RULES (Actions › Automations) → ran ACTIONS
   …and AUTO_RULES was ALSO rendered a second time inside the
   Action center, so the same list appeared twice.

   Now every rule shares ONE mental model — WHEN <condition>
   THEN <effect> — split into two KINDS:
     • detection → raises an alert        (kind: "detection")
     • response  → runs a governed action (kind: "response")

   Alerts › Rules and Actions › Rules both open the one engine
   (views/RulesView.jsx), pre-filtered to the relevant kind.
   ============================================================ */

export const RULE_KINDS = {
  detection: { label: "Detection", blurb: "Raises an alert", icon: "bell", c: "var(--warn)" },
  response:  { label: "Response",  blurb: "Runs a governed action", icon: "bolt", c: "var(--accent)" },
};

export const RULES = [
  // ---- detection · raise alerts (was RulesView.SEED) ----
  { id: "d1", kind: "detection", name: "High-value layering",          when: "Chain > $1M in ≤ 5 hops",            then: "Create critical alert",        on: true,  count: 38 },
  { id: "d2", kind: "detection", name: "AIS gap near sanctioned port", when: "Signal loss < 50nm from OFAC port",  then: "Create alert + flag vessel",   on: true,  count: 12 },
  { id: "d3", kind: "detection", name: "Structuring",                  when: "≥ 6 sub-threshold transfers in 24h", then: "Create medium alert",          on: true,  count: 21 },
  { id: "d4", kind: "detection", name: "Flag change",                  when: "Vessel re-flags in < 90 days",       then: "Notify analyst",               on: false, count: 4 },
  { id: "d5", kind: "detection", name: "Sanctions match",              when: "Object matches OFAC/EU list",        then: "Create critical alert + block", on: true,  count: 7 },
  // ---- response · run actions (was data_actions.AUTO_RULES) ----
  { id: "r1", kind: "response", name: "Auto-add vessels with AIS gap > 6h to watchlist", when: "Vessel AIS gap > 6h",  then: "Add to watchlist",     on: true,  count: 14, approval: "no approval" },
  { id: "r2", kind: "response", name: "Freeze on confirmed OFAC match",                  when: "Confirmed OFAC match", then: "Freeze account",       on: false, count: 0,  approval: "Reviewer approval" },
  { id: "r3", kind: "response", name: "Open project on any Critical alert",        when: "Any Critical alert",   then: "Open project",   on: true,  count: 3,  approval: "no approval" },
];

// Convenience selector used by the Action center summary.
export const RULES_BY_KIND = (k) => RULES.filter((r) => r.kind === k);
