/* AXIOM — data_models.js · fixture de demo regenerado
   Consumido por ModelsView (MODELS, OBJECTIVES).
   El estado de versión/modelo (champion/staging/archived/deployed) usa ahora el
   registro STATUS único de components/ui.jsx. */
const spark = (s) => Array.from({ length: 12 }, (_, i) => 40 + Math.round(30 * Math.abs(Math.sin(s + i * 0.6))));
export const MODELS = [
  {
    id: "risk", name: "risk_scorer", type: "GBM · clasif.", status: "deployed", obj: "Riesgo de cuenta",
    owner: "M. Cho", m1: { n: "AUC", v: "0.94" }, m2: { n: "Precisión", v: "0.89" },
    deploy: { fn: "score_account(account)", endpoint: "/fn/risk/v3", live: true, calls: "1.2M", p95: "42ms", spark: spark(1) },
    versions: [
      { v: "v3", st: "champion", a: "AUC 0.94", b: "Prec 0.89", by: "MC", when: "3d" },
      { v: "v2", st: "archived", a: "AUC 0.91", b: "Prec 0.86", by: "MC", when: "21d" },
      { v: "v1", st: "archived", a: "AUC 0.88", b: "Prec 0.83", by: "DV", when: "60d" },
    ],
    inputs: ["txn_normalized", "entities_resolved"], usedBy: ["Triage de alertas", "Reglas"],
  },
  {
    id: "ais", name: "ais_anomaly", type: "Isolation forest", status: "deployed", obj: "Anomalía AIS",
    owner: "J. Okafor", m1: { n: "Recall", v: "0.91" }, m2: { n: "FPR", v: "0.04" },
    deploy: { fn: "score_track(vessel)", endpoint: "/fn/ais/v2", live: true, calls: "640K", p95: "31ms", spark: spark(2) },
    versions: [
      { v: "v2", st: "champion", a: "Recall 0.91", b: "FPR 0.04", by: "JO", when: "8d" },
      { v: "v1", st: "archived", a: "Recall 0.84", b: "FPR 0.07", by: "JO", when: "40d" },
    ],
    inputs: ["vessel_tracks"], usedBy: ["Analista marítimo"],
  },
  {
    id: "ubo", name: "ubo_linker", type: "GNN · enlace", status: "staging", obj: "Resolución UBO",
    owner: "A. Reyes", m1: { n: "F1", v: "0.79" }, m2: { n: "Cobertura", v: "0.71" },
    deploy: { fn: "link_ubo(org)", endpoint: "/fn/ubo/v1", live: false, calls: "—", p95: "—", spark: spark(3) },
    versions: [
      { v: "v1", st: "staging", a: "F1 0.79", b: "Cob 0.71", by: "AR", when: "1d" },
      { v: "v0", st: "archived", a: "F1 0.62", b: "Cob 0.55", by: "AR", when: "12d" },
    ],
    inputs: ["entities_resolved"], usedBy: ["Resolución de UBO"],
  },
];
export const OBJECTIVES = [
  { name: "Riesgo de cuenta", model: "risk_scorer", type: "Clasificación", status: "deployed", metric: { n: "AUC", v: "0.94" }, champion: "v3", candidates: 5, datasets: ["txn_normalized", "entities_resolved"] },
  { name: "Anomalía marítima", model: "ais_anomaly", type: "Detección", status: "deployed", metric: { n: "Recall", v: "0.91" }, champion: "v2", candidates: 3, datasets: ["vessel_tracks"] },
  { name: "Resolución UBO", model: "ubo_linker", type: "Enlace", status: "staging", metric: { n: "F1", v: "0.79" }, champion: "v1", candidates: 4, datasets: ["entities_resolved"] },
];
