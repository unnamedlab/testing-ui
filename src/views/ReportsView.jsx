import { useMemo, useState } from 'react';
import { ENTITIES, ENTITY_BY_ID, TYPE_BY_ID } from '../data/data.js';
import { CASES, CASE_BY_ID, ANALYSTS } from '../data/data_ext.js';
import { Badge, Icon, RiskPill, SectionHead, TypeGlyph } from '../components/ui.jsx';
import { MarkingChip } from '../components/Security.jsx';
import { DossierModal } from '../components/Reports.jsx';

/* ============================================================
   AXIOM — Reports (★ Phase 3 authoring)
   Promotes the printable DossierModal seed into a first-class
   module: a block editor that embeds LIVE ontology objects,
   charts and findings, then exports to the existing dossier PDF.
   ============================================================ */

const keyEnts = ENTITIES.filter(e => e.risk >= 70).slice(0, 6);

// Seeded reports — drafts an analyst would already have on the case.
const SEED_REPORTS = [
  {
    id: "rep-blackfrost", title: "BLACKFROST — Intelligence Brief", caseId: "blackfrost",
    status: "Draft", updated: "12m ago", author: "AR",
    blocks: [
      { type: "h", text: "1 · Executive summary" },
      { type: "p", text: "Coordinated trade-finance laundering across the Aurora–Helios network. Network risk assessed at 84/100 (Critical). Confidence: High. Three critical alerts remain open and pending escalation." },
      { type: "objects", label: "Key entities of interest", ids: keyEnts.map(e => e.id) },
      { type: "h", text: "2 · Financial findings" },
      { type: "p", text: "Three layering chains moved $20.4M between Aurora Trading FZE and Helios Maritime over 30 days, structured across 3–5 hops to obscure origin. Largest transfer TXN-88241 ($4.82M) routed through two jurisdictions within 48 hours." },
      { type: "chart", label: "Layering volume · 30 days", kind: "bars" },
      { type: "h", text: "3 · Assessment & recommendations" },
      { type: "findings", items: [
        "File a Suspicious Transaction Report for the Aurora→Helios chain.",
        "Request beneficial-ownership records for Northwind Holdings (BVI).",
        "Add MV Blackfrost and operator to the maritime watchlist; share with partner.",
      ]},
    ],
  },
  { id: "rep-nightjar", title: "NIGHTJAR — Weekly status", caseId: "blackfrost", status: "In review", updated: "1d ago", author: "MC", blocks: [] },
  { id: "rep-sanctions", title: "Sanctions exposure — Q2 rollup", caseId: "blackfrost", status: "Published", updated: "3d ago", author: "AR", blocks: [] },
];

function StatusDot({ s }) {
  const c = s === "Published" ? "var(--ok)" : s === "In review" ? "var(--warn)" : "var(--text-faint)";
  return <span className="mono" style={{ fontSize:11, color:c, display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:7,height:7,borderRadius:"50%",background:c }} />{s}</span>;
}

// ---- editor blocks ----
function MiniBars() {
  const vals = [38, 62, 30, 81, 54, 72, 44, 90, 60];
  return (
    <div className="card" style={{ padding:"16px 18px" }}>
      <div className="row between center" style={{ marginBottom:14 }}><div className="eyebrow">Layering volume · 30 days</div><Badge kind="accent"><Icon name="sparkles" size={11}/>live</Badge></div>
      <div className="row" style={{ alignItems:"flex-end", gap:7, height:96 }}>
        {vals.map((v,i)=>(
          <div key={i} style={{ flex:1, height:`${v}%`, borderRadius:"4px 4px 0 0",
            background:`linear-gradient(180deg, var(--accent), color-mix(in oklab, var(--accent) 40%, transparent))` }} />
        ))}
      </div>
    </div>
  );
}

function ObjectStrip({ ids, openEntity }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10 }}>
      {ids.map(id => {
        const e = ENTITY_BY_ID[id]; if (!e) return null;
        return (
          <button key={id} className="card hover" onClick={()=>openEntity(id)}
            style={{ padding:"11px 13px", textAlign:"left", cursor:"pointer", display:"flex", gap:11, alignItems:"center" }}>
            <TypeGlyph type={e.type} size={34} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</div>
              <div className="t-faint" style={{ fontSize:11.5 }}>{TYPE_BY_ID[e.type].name}</div>
            </div>
            <RiskPill r={e.risk} />
          </button>
        );
      })}
    </div>
  );
}

function Block({ b, openEntity, onChange, onRemove }) {
  const wrap = (inner, insertLabel) => (
    <div className="rep-block">
      <div className="rep-block-rail">
        <button className="icon-btn sm" title="Remove block" onClick={onRemove}><Icon name="plus" size={13} style={{ transform:"rotate(45deg)" }} /></button>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        {insertLabel && <div className="eyebrow" style={{ marginBottom:8 }}>{insertLabel}</div>}
        {inner}
      </div>
    </div>
  );
  if (b.type === "h") return wrap(
    <div className="serif" contentEditable suppressContentEditableWarning
      onBlur={e=>onChange({ ...b, text:e.currentTarget.textContent })}
      style={{ fontSize:21, fontWeight:600, letterSpacing:"-0.01em", outline:"none" }}>{b.text}</div>
  );
  if (b.type === "p") return wrap(
    <div contentEditable suppressContentEditableWarning
      onBlur={e=>onChange({ ...b, text:e.currentTarget.textContent })}
      style={{ fontSize:14.5, lineHeight:1.65, color:"var(--text-dim)", outline:"none" }}>{b.text}</div>
  );
  if (b.type === "objects") return wrap(<ObjectStrip ids={b.ids} openEntity={openEntity} />, b.label || "Embedded objects");
  if (b.type === "chart") return wrap(<MiniBars />);
  if (b.type === "findings") return wrap(
    <ul style={{ margin:0, paddingLeft:18, fontSize:14.5, lineHeight:1.7, color:"var(--text-dim)" }}>
      {b.items.map((it,i)=><li key={i}>{it}</li>)}
    </ul>, "Recommendations"
  );
  return null;
}

const INSERTS = [
  ["h", "Heading", "table"],
  ["p", "Paragraph", "note"],
  ["objects", "Live objects", "share"],
  ["chart", "Chart", "bars"],
  ["findings", "Findings list", "check"],
];

function Editor({ report, openEntity, onExport }) {
  const c = CASE_BY_ID[report.caseId] || CASES[0];
  const [blocks, setBlocks] = useState(report.blocks.length ? report.blocks : [
    { type:"h", text:"1 · Summary" }, { type:"p", text:"Start writing, or insert a block below." },
  ]);
  const [title, setTitle] = useState(report.title);
  const [insertOpen, setInsertOpen] = useState(false);

  function add(type) {
    const tmpl = {
      h: { type:"h", text:"New heading" },
      p: { type:"p", text:"New paragraph." },
      objects: { type:"objects", label:"Embedded objects", ids: keyEnts.slice(0,3).map(e=>e.id) },
      chart: { type:"chart" },
      findings: { type:"findings", items:["First recommendation."] },
    }[type];
    setBlocks(bs => [...bs, tmpl]); setInsertOpen(false);
  }

  return (
    <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", minHeight:0 }}>
      {/* editor toolbar */}
      <div className="row between center" style={{ padding:"12px 22px", borderBottom:"1px solid var(--line-soft)", flex:"none" }}>
        <div className="row gap-12 center" style={{ minWidth:0 }}>
          <input value={title} onChange={e=>setTitle(e.target.value)}
            style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-serif)", fontSize:19, fontWeight:600, minWidth:0, width:"min(46ch, 52vw)" }} />
          <MarkingChip level={c.classification} />
          <span className="t-faint mono" style={{ fontSize:11 }}>inherits {c.name}</span>
        </div>
        <div className="row gap-8 center">
          <span className="t-faint mono" style={{ fontSize:11 }}>Autosaved</span>
          <button className="btn sm"><Icon name="user" size={14}/>Share</button>
          <button className="btn primary sm" onClick={onExport}><Icon name="download" size={14}/>Export PDF</button>
        </div>
      </div>

      {/* document */}
      <div className="content" style={{ padding:"28px 0 70px" }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"0 28px" }} className="fade-in">
          <div className="row gap-10 center" style={{ marginBottom:6 }}>
            <Badge kind="accent"><Icon name="sparkles" size={11}/>AI-assembled draft</Badge>
            <StatusDot s={report.status} />
          </div>
          <div className="t-faint mono" style={{ fontSize:11, marginBottom:22 }}>Lead {ANALYSTS[c.lead]?.name || "—"} · Ref AXM-{(report.caseId||"case").toUpperCase()}-0612 · {report.updated}</div>

          <div className="col" style={{ gap:4 }}>
            {blocks.map((b,i)=>(
              <Block key={i} b={b} openEntity={openEntity}
                onChange={nb=>setBlocks(bs=>bs.map((x,j)=>j===i?nb:x))}
                onRemove={()=>setBlocks(bs=>bs.filter((_,j)=>j!==i))} />
            ))}
          </div>

          {/* insert affordance */}
          <div style={{ position:"relative", marginTop:14 }}>
            <button className="rep-insert" onClick={()=>setInsertOpen(o=>!o)}>
              <Icon name="plus" size={15} />Insert block
            </button>
            {insertOpen && (
              <div className="panel" style={{ position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:20, padding:7, width:220, boxShadow:"var(--shadow-3)" }}>
                {INSERTS.map(([k,label,icon])=>(
                  <button key={k} className="rep-insert-row" onClick={()=>add(k)}>
                    <span style={{ width:26, display:"grid", placeItems:"center", color:"var(--accent)" }}><Icon name={icon} size={16}/></span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsView({ openEntity, go }) {
  const [reports] = useState(SEED_REPORTS);
  const [selId, setSelId] = useState(SEED_REPORTS[0].id);
  const [dossier, setDossier] = useState(false);
  const sel = useMemo(()=>reports.find(r=>r.id===selId), [reports, selId]);

  return (
    <div className="content" style={{ display:"grid", gridTemplateColumns:"288px 1fr", padding:0, overflow:"hidden" }}>
      {/* report list */}
      <aside style={{ borderRight:"1px solid var(--line-soft)", overflow:"auto", background:"var(--bg-1)", display:"flex", flexDirection:"column" }}>
        <div className="row between center" style={{ padding:"16px 16px 12px" }}>
          <div><div className="eyebrow">Reports</div><div className="t-faint mono" style={{ fontSize:11, marginTop:4 }}>{reports.length} on this case</div></div>
          <button className="btn primary sm"><Icon name="plus" size={14}/>New</button>
        </div>
        <div style={{ padding:"0 10px 16px", display:"flex", flexDirection:"column", gap:6 }}>
          {reports.map(r=>(
            <button key={r.id} onClick={()=>setSelId(r.id)}
              className={"rep-card"+(selId===r.id?" on":"")}>
              <div className="row between center" style={{ marginBottom:7 }}>
                <Icon name="doc" size={15} style={{ color:"var(--accent)" }} />
                <StatusDot s={r.status} />
              </div>
              <div style={{ fontSize:13.5, fontWeight:600, lineHeight:1.3 }}>{r.title}</div>
              <div className="t-faint mono" style={{ fontSize:10.5, marginTop:6 }}>{r.updated} · {ANALYSTS[r.author]?.name?.split(" ")[0] || r.author}</div>
            </button>
          ))}
        </div>
      </aside>

      {sel && <Editor report={sel} openEntity={openEntity} onExport={()=>setDossier(true)} />}

      <DossierModal open={dossier} caseId={sel?.caseId} onClose={()=>setDossier(false)} />

      <style>{`
        .rep-card { text-align:left; border:1px solid var(--line-soft); background:var(--bg-inset); border-radius:11px; padding:13px 14px; cursor:pointer; transition:border-color .14s, background .14s; }
        .rep-card:hover { border-color:var(--line-strong); }
        .rep-card.on { border-color:var(--accent-dim); background:var(--accent-ghost); }
        .rep-block { display:flex; gap:10px; padding:10px 0; }
        .rep-block-rail { width:26px; flex:none; opacity:0; transition:opacity .12s; }
        .rep-block:hover .rep-block-rail { opacity:1; }
        .icon-btn.sm { width:26px; height:26px; }
        .rep-insert { display:inline-flex; align-items:center; gap:8px; padding:8px 13px; border-radius:9px; border:1px dashed var(--line-strong);
          background:none; color:var(--text-faint); font-family:var(--font-ui); font-size:13px; font-weight:600; cursor:pointer; transition:.14s; }
        .rep-insert:hover { color:var(--accent); border-color:var(--accent-dim); background:var(--accent-ghost); }
        .rep-insert-row { display:flex; align-items:center; gap:6px; width:100%; padding:8px 8px; border:none; background:none; border-radius:8px;
          color:var(--text); font-family:var(--font-ui); font-size:13.5px; cursor:pointer; text-align:left; }
        .rep-insert-row:hover { background:var(--accent-ghost); }
      `}</style>
    </div>
  );
}
