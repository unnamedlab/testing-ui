/* AXIOM — data_health.js · fixture de demo regenerado
   Consumido por HealthView (CHK, DATASETS, DSTATUS, INCIDENTS, SEV). */
export const DSTATUS = {
  healthy:  { kind: "ok",     label: "healthy" },
  degraded: { kind: "warn",   label: "degraded" },
  building: { kind: "accent", label: "building" },
  failed:   { kind: "alert",  label: "failed" },
};
export const CHK = {
  pass: { c: "var(--ok)",    ic: "check" },
  warn: { c: "var(--warn)",  ic: "flag" },
  fail: { c: "var(--alert)", ic: "alertTri" },
  skip: { c: "var(--text-faint)", ic: "clock" },
};
export const SEV = {
  critical: { kind: "alert", label: "Critical" },
  high:     { kind: "warn",  label: "High" },
  medium:   { kind: "info",  label: "Medium" },
};
const sp = (s) => Array.from({ length: 14 }, (_, i) => 30 + Math.round(40 * Math.abs(Math.sin(s + i * 0.5))));
export const DATASETS = [
  { id: "ds-raw", name: "txn_raw", layer: "raw", status: "healthy", last: "2m", sla: "5m", slaOk: true, rows: "1.2M", pipeline: "swift_ingest", spark: sp(1), pass: 6, total: 6, drift: false,
    checks: [["no_nulls(txn_id)", "pass"], ["unique(txn_id)", "pass"], ["freshness < 5m", "pass"], ["row_count > 0", "pass"], ["schema_match", "pass"], ["amount >= 0", "pass"]] },
  { id: "ds-clean", name: "txn_normalized", layer: "clean", status: "healthy", last: "5m", sla: "15m", slaOk: true, rows: "8.2K", pipeline: "normalize_txn", spark: sp(2), pass: 14, total: 14, drift: false,
    checks: [["currency in ISO", "pass"], ["fx_rate present", "pass"], ["dedup", "pass"], ["pattern enum", "pass"]] },
  { id: "ds-ent", name: "entities_resolved", layer: "ontology", status: "building", last: "—", sla: "30m", slaOk: true, rows: "1.3K", pipeline: "entity_resolution", spark: sp(3), pass: 9, total: 11, drift: true,
    checks: [["match_rate > 0.8", "pass"], ["no_orphans", "warn"], ["schema_contract", "fail"], ["dedup_entities", "skip"]] },
  { id: "ds-ais", name: "vessel_tracks", layer: "clean", status: "degraded", last: "18m", sla: "10m", slaOk: false, rows: "640", pipeline: "ais_rollup", spark: sp(4), pass: 7, total: 10, drift: false,
    checks: [["gap_detection", "pass"], ["coord_bounds", "warn"], ["freshness < 10m", "fail"]] },
];
export const INCIDENTS = [
  { id: "INC-204", sev: "critical", title: "Schema drift in entities_resolved", ds: "entities_resolved", detail: "Column 'beneficial_owner' changed type; contract broken.", when: "12m" },
  { id: "INC-203", sev: "high", title: "vessel_tracks out of SLA", ds: "vessel_tracks", detail: "Freshness 18m > SLA 10m. Upstream AIS delayed.", when: "18m" },
  { id: "INC-198", sev: "medium", title: "Null spike in txn_raw", ds: "txn_raw", detail: "Auto-resolved after connector retry.", when: "3h" },
];
