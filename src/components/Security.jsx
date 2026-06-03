import { CLASS_LEVELS, CLASSIFICATION, lineageFor, markingFor } from '../data/data_ext.js';
import { Badge, Icon, Lineage as LineageChain } from './ui.jsx';

/* ============================================================
   AXIOM — Security: classification banner, markings,
   data lineage, access control
   ============================================================ */

export function ClassificationBanner({ level }) {
  const lv = CLASS_LEVELS[level] || CLASS_LEVELS.CONFIDENTIAL;
  return (
    <div style={{
      height: 22, flex:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      background: `color-mix(in oklab, ${lv.color} 18%, var(--bg-inset))`,
      borderBottom: `1px solid color-mix(in oklab, ${lv.color} 45%, transparent)`,
      position:"relative",
    }}>
      <span style={{ color:lv.color, display:"grid", placeItems:"center" }}><Icon name="shield" size={12}/></span>
      <span className="mono" style={{ fontSize:10.5, letterSpacing:".18em", fontWeight:600, color:lv.color }}>
        {level}{' // '}{CLASSIFICATION.compartment}{' // '}{CLASSIFICATION.caveat}
      </span>
      <span className="mono" style={{ position:"absolute", right:14, fontSize:10, color:"var(--text-faint)", letterSpacing:".08em" }}>
        CLEARANCE: TS/SCI · A. REYES
      </span>
    </div>
  );
}

export function MarkingChip({ id, level, size }) {
  const m = level || markingFor(id); const lv = CLASS_LEVELS[m];
  return (
    <span title={"Classification: "+m} style={{
      display:"inline-flex", alignItems:"center", gap:4, fontFamily:"var(--font-mono)",
      fontSize: size==="sm"?9.5:10.5, fontWeight:600, letterSpacing:".08em",
      padding:"1px 6px", borderRadius:5, color:lv.color,
      background:`color-mix(in oklab, ${lv.color} 16%, transparent)`,
      border:`1px solid color-mix(in oklab, ${lv.color} 40%, transparent)`,
    }}>
      <span style={{ width:6,height:6,borderRadius:1,background:lv.color }}/>{m}
    </span>
  );
}

export function Lineage({ id }) {
  // Cabecera + tarjeta propias; el dibujo de la cadena lo hace la primitiva
  // única de ui.jsx (antes este componente reimplementaba los pasos a mano).
  const chain = lineageFor(id).map((s) => ({ stage: s.stage, label: s.label, meta: s.meta, glyph: s.icon }));
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="row between center" style={{ marginBottom:14 }}>
        <div className="eyebrow">Data lineage</div>
        <Badge kind="accent"><Icon name="check" size={12}/>Verified</Badge>
      </div>
      <LineageChain chain={chain} />
    </div>
  );
}

export function AccessControl({ id, level }) {
  const m = level || markingFor(id);
  const roles = [
    ["Investigations team","Read · Write","var(--ok)"],
    ["Compliance","Read only","var(--text-dim)"],
    ["Liaison partners","No access","var(--alert)"],
  ];
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="row between center" style={{ marginBottom:12 }}>
        <div className="eyebrow">Access control</div>
        <MarkingChip id={id} />
      </div>
      <div className="col gap-2">
        {roles.map(([r,acc,c])=>(
          <div key={r} className="row between center" style={{ padding:"8px 0", borderBottom:"1px solid var(--line-soft)" }}>
            <span style={{ fontSize:12.5 }} className="t-dim">{r}</span>
            <span className="mono" style={{ fontSize:11.5, color:c }}>{acc}</span>
          </div>
        ))}
      </div>
      <div className="row gap-8 center" style={{ marginTop:12, padding:"8px 10px", borderRadius:8, background:"var(--bg-2)" }}>
        <span className="t-faint"><Icon name="shield" size={14}/></span>
        <span className="t-faint" style={{ fontSize:11.5 }}>Handling: {m}{' // '}{CLASSIFICATION.caveat}. Access is logged.</span>
      </div>
    </div>
  );
}
