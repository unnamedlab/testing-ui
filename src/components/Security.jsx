import { CLASS_LEVELS, CLASSIFICATION, lineageFor, markingFor } from '../data/data_ext.js';
import { Badge, Icon } from './ui.jsx';

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
  const chain = lineageFor(id);
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="row between center" style={{ marginBottom:14 }}>
        <div className="eyebrow">Data lineage</div>
        <Badge kind="accent"><Icon name="check" size={12}/>Verified</Badge>
      </div>
      <div style={{ position:"relative" }}>
        {chain.map((s,i)=>(
          <div key={i} className="row gap-12 center" style={{ position:"relative", paddingBottom: i<chain.length-1?16:0 }}>
            {i<chain.length-1 && <div style={{ position:"absolute", left:17, top:34, height:18, width:2, background:"var(--line)" }}/>}
            <div style={{ width:36, height:36, borderRadius:10, flex:"none", display:"grid", placeItems:"center",
              background: s.stage==="Object"?"var(--accent-ghost)":"var(--bg-2)",
              color: s.stage==="Object"?"var(--accent)":"var(--text-dim)",
              boxShadow: s.stage==="Object"?"inset 0 0 0 1px var(--accent-dim)":"inset 0 0 0 1px var(--line)" }}>
              <Icon name={s.icon} size={17}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>{s.label}</div>
              <div className="t-faint mono" style={{ fontSize:11 }}>{s.stage} · {s.meta}</div>
            </div>
          </div>
        ))}
      </div>
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
