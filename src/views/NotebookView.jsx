import { useState } from 'react';
import { Icon } from '../components/ui.jsx';

/* ============================================================
   AXIOM — NotebookView (regenerado)
   Notebook de análisis: celdas markdown + código (demo).
   ============================================================ */
const CELLS = [
  { type: "md", text: "## Caso BLACKFROST — análisis de layering\nObjetivo: cuantificar el volumen movido entre Aurora y Helios y trazar la cadena." },
  { type: "code", lang: "python", code: "txns = ontology.query(\"Txn\").filter(pattern=\"Layering\")\nchains = layering_chains(txns, max_hops=5)\nchains.summary()", out: "3 cadenas · $20.4M · 3–5 saltos" },
  { type: "md", text: "La mayor transferencia circula por dos jurisdicciones en 48h." },
  { type: "code", lang: "python", code: "top = chains.sort(\"amount\").head(1)\ntop.path()", out: "Aurora USD → Helios EUR → Northwind CHF  ($4.82M)" },
];
export function NotebookView() {
  const [ran, setRan] = useState({});
  return (
    <div className="content" style={{ padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }} className="fade-in">
        <div className="row between center" style={{ marginBottom: 20 }}>
          <div><div className="eyebrow" style={{ marginBottom: 6 }}>Análisis · Notebook</div><h1 className="serif" style={{ fontSize: 27, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>BLACKFROST · layering.ipynb</h1></div>
          <div className="row gap-8"><button className="btn"><Icon name="plus" size={14} />Celda</button><button className="btn primary" onClick={() => setRan(Object.fromEntries(CELLS.map((_, i) => [i, true])))}><Icon name="play" size={14} />Ejecutar todo</button></div>
        </div>
        <div className="col" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CELLS.map((c, i) => c.type === "md" ? (
            <div key={i} style={{ padding: "4px 2px" }}>
              {c.text.split("\n").map((ln, j) => ln.startsWith("## ")
                ? <div key={j} className="serif" style={{ fontSize: 19, fontWeight: 600, margin: "6px 0" }}>{ln.slice(3)}</div>
                : <p key={j} className="t-dim" style={{ fontSize: 14, lineHeight: 1.6, margin: "4px 0" }}>{ln}</p>)}
            </div>
          ) : (
            <div key={i} className="card" style={{ overflow: "hidden" }}>
              <div className="row between center" style={{ padding: "8px 12px", borderBottom: "1px solid var(--line-soft)", background: "var(--bg-inset)" }}>
                <span className="mono t-faint" style={{ fontSize: 11 }}>{c.lang}</span>
                <button className="icon-btn" style={{ width: 26, height: 26, color: ran[i] ? "var(--ok)" : "var(--text-dim)" }} onClick={() => setRan((r) => ({ ...r, [i]: true }))}><Icon name={ran[i] ? "check" : "play"} size={14} /></button>
              </div>
              <pre className="mono" style={{ margin: 0, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.7, color: "var(--text-dim)", whiteSpace: "pre-wrap" }}>{c.code}</pre>
              {ran[i] && <div className="mono" style={{ padding: "10px 14px", borderTop: "1px solid var(--line-soft)", fontSize: 12.5, color: "var(--accent-2)", background: "var(--bg-inset)" }}>→ {c.out}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
