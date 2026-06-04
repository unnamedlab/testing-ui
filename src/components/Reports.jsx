import { ANALYSTS, CASES, CASE_BY_ID, CLASSIFICATION, CLASS_LEVELS } from '../data/data_ext.js';
import { ENTITIES, TYPE_BY_ID } from '../data/data.js';
import { Badge, ICONS, Icon } from './ui.jsx';

/* ============================================================
   AXIOM — Dossier / report generator (printable)
   ============================================================ */

export function DossierModal({ open, onClose, caseId }){
  if(!open) return null;
  const c = CASE_BY_ID[caseId] || CASES[0];
  // F-13: classification bar uses the level's print ink so the dossier matches the
  // on-screen banner hue (SECRET→red, CONFIDENTIAL→amber) instead of a fixed orange.
  const ink = CLASS_LEVELS[c.classification]?.ink || "#b54708";
  const keyEnts = ENTITIES.filter(e=>e.risk>=70).slice(0,6);
  const today = "02 June 2026";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:140, background:"var(--scrim)", backdropFilter:"var(--scrim-blur)", display:"flex", flexDirection:"column" }}>
      {/* toolbar (not printed) */}
      <div className="no-print row between center" style={{ padding:"12px 20px", background:"var(--bg-1)", borderBottom:"1px solid var(--line)" }}>
        <div className="row gap-10 center"><Icon name="doc" size={18}/><span className="serif" style={{ fontSize:16 }}>Dossier · {c.name}</span><Badge kind="accent"><Icon name="sparkles" size={11}/>AI-assembled</Badge></div>
        <div className="row gap-8">
          <button className="btn" onClick={()=>window.print()}><Icon name="download"/>Export PDF</button>
          <button className="btn ghost" onClick={onClose}><Icon name="x" size={16}/>Close</button>
        </div>
      </div>

      {/* document */}
      <div style={{ flex:1, overflow:"auto", padding:"28px 20px", display:"flex", justifyContent:"center" }}>
        <div className="dossier" style={{ width:"100%", maxWidth:"var(--page-read)", background:"#fff", color:"#16181d", borderRadius:6, boxShadow:"var(--shadow-3)", overflow:"hidden" }}>
          {/* class banner */}
          <div style={{ background:ink, color:"#fff", textAlign:"center", padding:"5px", fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".18em", fontWeight:600 }}>
            {c.classification}{' // '}{CLASSIFICATION.compartment}{' // '}{CLASSIFICATION.caveat}
          </div>

          <div style={{ padding:"40px 52px 52px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"2px solid #16181d", paddingBottom:18, marginBottom:26 }}>
              <div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".14em", color:"#6b7280", marginBottom:8 }}>AXIOM · INTELLIGENCE BRIEF</div>
                <div className="serif" style={{ fontSize:30, fontWeight:600, letterSpacing:"-0.01em", lineHeight:1.1 }}>{c.name}</div>
                <div style={{ fontSize:13, color:"#4b5563", marginTop:8 }}>Prepared {today} · Lead: {ANALYSTS[c.lead].name} · Ref AXM-{c.id.toUpperCase()}-0612</div>
              </div>
              <div style={{ width:46,height:46,borderRadius:12,background:"#0b3b4a",display:"grid",placeItems:"center",color:"#22d3a5" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:ICONS.axiom}}/>
              </div>
            </div>

            <Section h="1 · Executive summary">
              <p style={dpara}>{c.summary} Network risk is assessed at <b>84/100 (Critical)</b>. Confidence: <b>High</b>. {c.alerts} alerts remain open, of which 3 are critical and pending escalation to the financial-intelligence liaison.</p>
            </Section>

            <Section h="2 · Key entities of interest">
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
                <thead><tr>{["Object","Type","Role","Risk"].map(h=><th key={h} style={dth}>{h}</th>)}</tr></thead>
                <tbody>
                  {keyEnts.map(e=>(
                    <tr key={e.id}>
                      <td style={dtd}><b>{e.name}</b></td>
                      <td style={dtd}>{TYPE_BY_ID[e.type].name}</td>
                      <td style={dtd}>{e.sub}</td>
                      <td style={{...dtd, textAlign:"right", fontWeight:600, color: e.risk>=80?"#b42318":"#b54708"}}>{e.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section h="3 · Financial findings">
              <p style={dpara}>Three layering chains moved <b>$20.4M</b> between Aurora Trading FZE and Helios Maritime over 30 days, structured across 3–5 hops to obscure origin. The largest single transfer (TXN-88241, $4.82M) routed through correspondent accounts at two jurisdictions within 48 hours — a pattern consistent with deliberate trade-finance laundering.</p>
            </Section>

            <Section h="4 · Maritime findings">
              <p style={dpara}>MV Blackfrost (IMO 9583217) recorded <b>14 AIS gaps</b> in 90 days, the longest coinciding with a port call at Novorossiysk (RUNVS), a sanctioned terminal. Flag changed Panama → Cook Islands during the period; classification society suspended. Behaviour is indicative of cargo-origin concealment.</p>
            </Section>

            <Section h="5 · Assessment & recommendations">
              <ul style={{ ...dpara, paddingLeft:18, margin:0 }}>
                <li style={{ marginBottom:7 }}>File a Suspicious Transaction Report for the Aurora→Helios chain.</li>
                <li style={{ marginBottom:7 }}>Request beneficial-ownership records for Northwind Holdings (BVI).</li>
                <li style={{ marginBottom:7 }}>Add MV Blackfrost and operator to the maritime watchlist; share with partner.</li>
              </ul>
            </Section>

            <div style={{ marginTop:30, paddingTop:16, borderTop:"1px solid #e5e7eb", fontSize:11, color:"#9ca3af", fontFamily:"var(--font-mono)" }}>
              Generated by AXIOM · sources: AIS Vessel Feed, SWIFT MT103, Corporate Registry, OFAC/EU lists · lineage verified.
            </div>
          </div>

          <div style={{ background:ink, color:"#fff", textAlign:"center", padding:"5px", fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".18em", fontWeight:600 }}>
            {c.classification}{' // '}{CLASSIFICATION.compartment}{' // '}{CLASSIFICATION.caveat}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .dossier, .dossier * { visibility: visible !important; }
          .dossier { position: absolute !important; left:0; top:0; width:100% !important; max-width:none !important; box-shadow:none !important; border-radius:0 !important; }
          .no-print { display:none !important; }
        }
      `}</style>
    </div>
  );
}

export const dpara = { fontSize:13.5, lineHeight:1.65, color:"#374151", margin:0 };
export const dth = { textAlign:"left", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:".08em", textTransform:"uppercase", color:"#6b7280", padding:"6px 8px", borderBottom:"1.5px solid #16181d" };
export const dtd = { padding:"8px", borderBottom:"1px solid #e5e7eb", color:"#374151" };

export function Section({ h, children }){
  return (
    <div style={{ marginBottom:24 }}>
      <div className="serif" style={{ fontSize:17, fontWeight:600, marginBottom:10, color:"#16181d" }}>{h}</div>
      {children}
    </div>
  );
}
