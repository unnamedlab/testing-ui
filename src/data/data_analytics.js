/* AXIOM — data_analytics.js · fixture + helpers regenerados
   Consumido por AnalyticsView. */
export const DIMS = {
  pattern: { label: "Patrón",       domain: ["Layering", "Structuring", "AIS gap", "Sanctions", "Normal"] },
  juris:   { label: "Jurisdicción", domain: ["UAE", "Cyprus", "BVI", "Panama", "Russia"] },
  channel: { label: "Canal",        domain: ["SWIFT", "Correspondent", "Trade finance", "Crypto"] },
  month:   { label: "Mes",          domain: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"] },
};
export const MEASURES = { amount: { label: "Importe" }, count: { label: "Registros" } };

const PATS = DIMS.pattern.domain, JUR = DIMS.juris.domain, CHN = DIMS.channel.domain, MON = DIMS.month.domain;
function seeded(n) { let x = Math.sin(n) * 10000; return x - Math.floor(x); }
export const ROWS = Array.from({ length: 160 }, (_, i) => {
  const r = (k) => seeded(i * 7.3 + k);
  const pattern = PATS[Math.floor(r(1) * PATS.length)];
  return {
    id: "TXN-" + (88000 + i),
    amount: Math.round((20000 + r(2) * 4800000) / 1000) * 1000,
    pattern,
    juris: JUR[Math.floor(r(3) * JUR.length)],
    channel: CHN[Math.floor(r(4) * CHN.length)],
    month: MON[Math.floor(r(5) * MON.length)],
    risk: pattern === "Normal" ? Math.floor(r(6) * 45) : 45 + Math.floor(r(6) * 55),
  };
});

export const dimField = (dim) => dim;
export function applyFilters(rows, filters) {
  const keys = Object.keys(filters || {}).filter((k) => filters[k] != null);
  return rows.filter((r) => keys.every((k) => r[dimField(k)] === filters[k]));
}
export function aggBy(rows, dim, measure, agg) {
  const f = dimField(dim);
  return DIMS[dim].domain.map((key) => {
    const sub = rows.filter((r) => r[f] === key);
    const value = measure === "count" ? sub.length
      : agg === "avg" ? (sub.length ? Math.round(sub.reduce((a, r) => a + r.amount, 0) / sub.length) : 0)
        : sub.reduce((a, r) => a + r.amount, 0);
    return { key, value };
  });
}
export function monthly(rows, dim, measure, domain) {
  const f = dimField(dim);
  return (domain || DIMS[dim].domain).map((key) => ({
    key,
    points: MON.map((m) => {
      const sub = rows.filter((r) => r[f] === key && r.month === m);
      return measure === "count" ? sub.length : sub.reduce((a, r) => a + r.amount, 0);
    }),
  }));
}
export function pivotData(rows, rowDim, colDim, measure) {
  const rf = dimField(rowDim), cf = dimField(colDim);
  const rk = DIMS[rowDim].domain, ck = DIMS[colDim].domain;
  const mat = rk.map((rv) => ck.map((cv) => {
    const sub = rows.filter((r) => r[rf] === rv && r[cf] === cv);
    return measure === "count" ? sub.length : sub.reduce((a, r) => a + r.amount, 0);
  }));
  return { rk, ck, mat };
}
export function histo(rows) {
  const b = Array(10).fill(0);
  rows.forEach((r) => { b[Math.min(9, Math.floor((r.risk || 0) / 10))]++; });
  return b;
}
export function fmtNum(v) { return v >= 1000 ? Math.round(v).toLocaleString("es-ES") : String(v); }
export function fmtMoney(v) {
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + Math.round(v);
}
