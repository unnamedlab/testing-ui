/* AXIOM — data_code.js · fixture de demo regenerado
   Consumido por CodeRepoView (BUILDS, DRIVE, FILES, KW, REPO).
   ids de autor alineados con ANALYSTS de data_ext.js → AR · MC · JD. */
export const KW = {
  python: ["def", "return", "import", "from", "for", "in", "if", "else", "with", "as", "class", "lambda", "None", "True", "False", "and", "or", "not"],
  sql: ["SELECT", "FROM", "WHERE", "JOIN", "ON", "GROUP", "BY", "ORDER", "AS", "WITH", "AND", "OR", "LEFT", "INNER", "HAVING", "LIMIT"],
  yaml: [],
};
export const FILES = [
  {
    id: "er", path: "transforms/entity_resolution.py", lang: "python", builds: "entities_resolved",
    inputs: ["txn_normalized", "registry_raw"], node: "ER pipeline",
    code: "from axiom import ontology, resolve\n\n@transform(output=\"entities_resolved\")\ndef run(txn, registry):\n    candidates = resolve.blocking(txn, registry, keys=[\"name\", \"iban\"])\n    linked = resolve.match(candidates, threshold=0.82)\n    return ontology.upsert(linked, type=\"Organization\")\n",
    commits: [{ msg: "Raise match threshold to 0.82", hash: "a1f9c2", by: "AR", when: "12m" }, { msg: "Add IBAN blocking", hash: "7d3e10", by: "MC", when: "2d" }],
    last: { by: "AR", when: "12m", hash: "a1f9c2" },
  },
  {
    id: "norm", path: "transforms/normalize_txn.py", lang: "python", builds: "txn_normalized",
    inputs: ["txn_raw"], node: "Normalize",
    code: "from axiom import fx\n\n@transform(output=\"txn_normalized\")\ndef run(txn_raw):\n    df = txn_raw.dropna(subset=[\"txn_id\"])\n    df[\"amount_usd\"] = fx.to_usd(df.amount, df.currency)\n    df[\"pattern\"] = classify(df)\n    return df\n",
    commits: [{ msg: "Normalize currency to USD", hash: "44ab90", by: "AR", when: "1d" }],
    last: { by: "AR", when: "1d", hash: "44ab90" },
  },
  {
    id: "ais", path: "transforms/ais_rollup.sql", lang: "sql", builds: "vessel_tracks",
    inputs: ["ais_raw"], node: "AIS rollup",
    code: "SELECT imo, vessel_name,\n       COUNT(*) AS pings,\n       SUM(CASE WHEN gap_min > 60 THEN 1 ELSE 0 END) AS ais_gaps\nFROM ais_raw\nGROUP BY imo, vessel_name\nORDER BY ais_gaps DESC\n",
    commits: [{ msg: "Count gaps > 60min", hash: "9c12fa", by: "JD", when: "5h" }],
    last: { by: "JD", when: "5h", hash: "9c12fa" },
  },
  {
    id: "pipe", path: "pipeline.yml", lang: "yaml", builds: null, inputs: [], node: null,
    code: "version: 1\npipeline: blackfrost\nschedule: \"*/5 * * * *\"\nstages:\n  - normalize_txn\n  - entity_resolution\n  - ais_rollup\n",
    commits: [{ msg: "Cadence to 5 min", hash: "01ffae", by: "AR", when: "2d" }],
    last: { by: "AR", when: "2d", hash: "01ffae" },
  },
];
export const BUILDS = [
  { id: "BLD-512", status: "passing", branch: "migrate-to-vite", commit: "a1f9c2", by: "AR", datasets: 3, dur: "2m 14s", when: "12m" },
  { id: "BLD-511", status: "running", branch: "feat/ubo", commit: "7d3e10", by: "MC", datasets: 1, dur: "—", when: "20m" },
  { id: "BLD-510", status: "failed", branch: "migrate-to-vite", commit: "9c12fa", by: "JD", datasets: 2, dur: "1m 02s", when: "5h" },
  { id: "BLD-509", status: "passing", branch: "main", commit: "44ab90", by: "AR", datasets: 4, dur: "3m 41s", when: "1d" },
];
export const REPO = {
  name: "blackfrost-transforms", branch: "migrate-to-vite", branches: ["main", "migrate-to-vite", "feat/ubo"],
  ahead: 3, build: { status: "passing", commit: "a1f9c2" },
};
export const DRIVE = {
  "/blackfrost": [
    { name: "transforms", kind: "folder", items: 4, mod: "12m", owner: "AR", cls: "SECRET" },
    { name: "datasets", kind: "folder", items: 4, mod: "5m", owner: "AR", cls: "SECRET" },
    { name: "entities_resolved", kind: "dataset", type: "Dataset", rows: "1.3K", mod: "12m", owner: "AR", cls: "SECRET", built: "entity_resolution.py" },
    { name: "risk_scorer.pkl", kind: "file", type: "Model", size: "44 MB", mod: "3d", owner: "MC", cls: "CONFIDENTIAL" },
    { name: "novoross_satellite.png", kind: "file", type: "Image", size: "12 MB", mod: "5h", owner: "JD", cls: "SECRET" },
  ],
  "/blackfrost/datasets": [
    { name: "txn_raw", kind: "dataset", type: "Dataset", rows: "1.2M", mod: "2m", owner: "AR", cls: "SECRET" },
    { name: "txn_normalized", kind: "dataset", type: "Dataset", rows: "8.2K", mod: "5m", owner: "AR", cls: "SECRET", built: "normalize_txn.py" },
    { name: "vessel_tracks", kind: "dataset", type: "Dataset", rows: "640", mod: "18m", owner: "JD", cls: "CONFIDENTIAL", built: "ais_rollup.sql" },
  ],
};
