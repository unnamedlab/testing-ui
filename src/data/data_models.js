/* AXIOM — data_models.js · demo fixture (UX-01: English source).
   Consumed by ModelsView (MODELS, OBJECTIVES, VST). */
export const VST = {
  champion: { kind: "accent", label: "champion" },
  staging:  { kind: "warn",   label: "staging" },
  archived: { kind: "",       label: "archived" },
  failed:   { kind: "alert",  label: "failed" },
};
const spark = (s) => Array.from({ length: 12 }, (_, i) => 40 + Math.round(30 * Math.abs(Math.sin(s + i * 0.6))));
export const MODELS = [
  {
    id: "risk", name: "risk_scorer", type: "GBM · classif.", status: "deployed", obj: "Account risk",
    owner: "M. Cho", m1: { n: "AUC", v: "0.94" }, m2: { n: "Precision", v: "0.89" },
    deploy: { fn: "score_account(account)", endpoint: "/fn/risk/v3", live: true, calls: "1.2M", p95: "42ms", spark: spark(1) },
    versions: [
      { v: "v3", st: "champion", a: "AUC 0.94", b: "Prec 0.89", by: "MC", when: "3d" },
      { v: "v2", st: "archived", a: "AUC 0.91", b: "Prec 0.86", by: "MC", when: "21d" },
      { v: "v1", st: "archived", a: "AUC 0.88", b: "Prec 0.83", by: "DV", when: "60d" },
    ],
    inputs: ["txn_normalized", "entities_resolved"], usedBy: ["Alert triage", "Rules"],
  },
  {
    id: "ais", name: "ais_anomaly", type: "Isolation forest", status: "deployed", obj: "AIS anomaly",
    owner: "J. Okafor", m1: { n: "Recall", v: "0.91" }, m2: { n: "FPR", v: "0.04" },
    deploy: { fn: "score_track(vessel)", endpoint: "/fn/ais/v2", live: true, calls: "640K", p95: "31ms", spark: spark(2) },
    versions: [
      { v: "v2", st: "champion", a: "Recall 0.91", b: "FPR 0.04", by: "JO", when: "8d" },
      { v: "v1", st: "archived", a: "Recall 0.84", b: "FPR 0.07", by: "JO", when: "40d" },
    ],
    inputs: ["vessel_tracks"], usedBy: ["Maritime analyst"],
  },
  {
    id: "ubo", name: "ubo_linker", type: "GNN · link", status: "staging", obj: "UBO resolution",
    owner: "A. Reyes", m1: { n: "F1", v: "0.79" }, m2: { n: "Coverage", v: "0.71" },
    deploy: { fn: "link_ubo(org)", endpoint: "/fn/ubo/v1", live: false, calls: "—", p95: "—", spark: spark(3) },
    versions: [
      { v: "v1", st: "staging", a: "F1 0.79", b: "Cov 0.71", by: "AR", when: "1d" },
      { v: "v0", st: "archived", a: "F1 0.62", b: "Cov 0.55", by: "AR", when: "12d" },
    ],
    inputs: ["entities_resolved"], usedBy: ["UBO resolution"],
  },
];
export const OBJECTIVES = [
  { name: "Account risk", model: "risk_scorer", type: "Classification", status: "deployed", metric: { n: "AUC", v: "0.94" }, champion: "v3", candidates: 5, datasets: ["txn_normalized", "entities_resolved"] },
  { name: "Maritime anomaly", model: "ais_anomaly", type: "Detection", status: "deployed", metric: { n: "Recall", v: "0.91" }, champion: "v2", candidates: 3, datasets: ["vessel_tracks"] },
  { name: "UBO resolution", model: "ubo_linker", type: "Link", status: "staging", metric: { n: "F1", v: "0.79" }, champion: "v1", candidates: 4, datasets: ["entities_resolved"] },
];
