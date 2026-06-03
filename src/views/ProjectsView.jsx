import { useState } from 'react';
import { ARTIFACTS, ACCESS_MATRIX, PROJ_ACTIVITY, PROJ_ROLES, PROJECTS } from '../data/data_projects.js';
import { ALERTS, ANALYSTS } from '../data/data_ext.js';
import { ENTITY_BY_ID } from '../data/data.js';
import { Avatar, Badge, Icon, Stat, Tabs, TypeGlyph } from '../components/ui.jsx';
import { ArtifactList, ArtifactRow, fileIcon as artFileIcon } from '../components/ArtifactExplorer.jsx';
import { MarkingChip } from '../components/Security.jsx';

/* ============================================================
   AXIOM — Workspaces (contenedor único · cluster ④)
   El workspace ES el contenedor: permisos + hogar de artefactos
   Y la investigación (alertas) del caso. Sustituye al antiguo
   contenedor duplicado "Case" (CaseDetail) — BLACKFROST ya solo
   existe una vez, como workspace.
   ============================================================ */

// severidad de alerta (local, para la pestaña Alerts del workspace)
const WS_SEV = {
  critical:{ c:"var(--alert)", label:"Critical", badge:"alert" },
  high:    { c:"var(--warn)",  label:"High",     badge:"warn" },
  medium:  { c:"var(--info)",  label:"Medium",   badge:"info" },
  low:     { c:"var(--text-faint)", label:"Low",  badge:"" },
};

const KIND = {
  chart:    { ic:"graph",    c:"var(--violet)", label:"Link chart" },
  dashboard:{ ic:"layers",   c:"var(--info)",   label:"Dashboard" },
  board:    { ic:"grid",     c:"var(--accent)", label:"Board" },
  notebook: { ic:"note",     c:"var(--info)",   label:"Notebook" },
  search:   { ic:"search",   c:"var(--accent)", label:"Saved search" },
  pipeline: { ic:"pipeline", c:"var(--ok)",     label:"Pipeline" },
  watchlist:{ ic:"bookmark", c:"var(--accent)", label:"Watchlist" },
  app:      { ic:"blocks",   c:"var(--violet)", label:"Workshop app" },
  report:   { ic:"doc",      c:"var(--warn)",   label:"Dossier" },
  file:     { ic:"file",     c:"var(--text-dim)", label:"File" },
};
function fileIcon(name){
  const n=(name||"").toLowerCase();
  if(n.endsWith(".pdf")) return "doc";
  if(n.endsWith(".csv")||n.endsWith(".xlsx")) return "table";
  if(/\.(jpg|jpeg|png|gif|webp)$/.test(n)) return "image";
  return "file";
}
function KindGlyph({ kind, name, size }){
  const k = KIND[kind]||KIND.file; const s=size||38;
  const ic = kind==="file" ? fileIcon(name) : k.ic;
  return <div style={{ width:s,height:s,borderRadius:Math.round(s*0.28),flex:"none",display:"grid",placeItems:"center",
    background:`color-mix(in oklab, ${k.c} 16%, var(--bg-2))`, color:k.c,
    boxShadow:`inset 0 0 0 1px color-mix(in oklab, ${k.c} 32%, transparent)` }}>
    <Icon name={ic} size={Math.round(s*0.5)}/>
  </div>;
}
function Stack({ members, size }){
  const s=size||26;
  return <span className="row" style={{ paddingLeft:6 }}>
    {members.slice(0,5).map((m,i)=><span key={m} style={{ marginLeft:-6, position:"relative", zIndex:10-i, boxShadow:"0 0 0 2px var(--bg-1)", borderRadius:Math.round(s*0.28) }}><Avatar who={m} size={s}/></span>)}
    {members.length>5 && <span style={{ marginLeft:-6, width:s,height:s,borderRadius:Math.round(s*0.28),display:"grid",placeItems:"center",
      fontSize:s*0.36,fontWeight:600,background:"var(--bg-3)",color:"var(--text-dim)",boxShadow:"0 0 0 2px var(--bg-1)" }}>+{members.length-5}</span>}
  </span>;
}
/* ---------------- list ---------------- */
function ProjectCard({ p, onOpen }){
  const arts = (ARTIFACTS[p.id]||[]).length;
  return (
    <button className="card hover" onClick={()=>onOpen(p.id)} style={{ padding:18, textAlign:"left", cursor:"pointer", display:"flex", flexDirection:"column", gap:14 }}>
      <div className="row between" style={{ alignItems:"flex-start" }}>
        <div className="row gap-12 center" style={{ minWidth:0 }}>
          <div style={{ width:42,height:42,borderRadius:12,display:"grid",placeItems:"center",flex:"none",
            background:"color-mix(in oklab, var(--accent) 16%, var(--bg-2))", color:"var(--accent)", boxShadow:"inset 0 0 0 1px var(--accent-dim)" }}><Icon name="folder" size={21}/></div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:15.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
            <div className="t-faint" style={{ fontSize:12.5, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.sub}</div>
          </div>
        </div>
        <MarkingChip level={p.cls} />
      </div>
      <div className="row gap-16 wrap" style={{ paddingTop:2 }}>
        {[["objects",p.counts.objects.toLocaleString(),"share"],["alerts",p.counts.alerts,"alertTri"],["artifacts",arts,"layers"],["sources",p.counts.sources,"download"]].map(([l,v,ic])=>(
          <div key={l} className="row gap-6 center"><span className="t-faint"><Icon name={ic} size={14}/></span>
            <span className="mono" style={{ fontSize:13, color: l==="alerts"&&v>0?"var(--alert)":"var(--text)" }}>{v}</span>
            <span className="t-faint" style={{ fontSize:11 }}>{l}</span></div>
        ))}
      </div>
      <div className="divider"/>
      <div className="row between center">
        <Stack members={p.members} size={26}/>
        <div className="row gap-10 center">
          {p.scheduled ? <Badge kind="accent" dot>scheduled</Badge> : <Badge kind={p.status==="Active"?"accent":""} dot>{p.status}</Badge>}
          <span className="t-faint mono" style={{ fontSize:11 }}>{p.updated}</span>
        </div>
      </div>
    </button>
  );
}
function List({ onOpen }){
  const [filter,setFilter] = useState("all");
  const mine = ["blackfrost","aiswatch"];
  const shown = PROJECTS.filter(p=>{
    if(filter==="all") return true;
    if(filter==="mine") return mine.includes(p.id);
    if(filter==="active") return p.status==="Active";
    return p.cls===filter;
  });
  return (
    <div className="content" style={{ padding:"28px 32px 60px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }} className="fade-in">
        <div className="row between" style={{ alignItems:"flex-end", marginBottom:24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:8 }}>Workspaces</div>
            <h1 className="serif" style={{ fontSize:34, fontWeight:500, margin:0, letterSpacing:"-0.02em" }}>Projects</h1>
            <div className="t-dim" style={{ fontSize:14.5, marginTop:6 }}>{PROJECTS.length} workspaces · <span className="t-accent">2 you lead</span> · permissions and artifacts scoped per project.</div>
          </div>
          <div className="row gap-8">
            <button className="btn"><Icon name="download" />Import</button>
            <button className="btn primary"><Icon name="plus" />New project</button>
          </div>
        </div>
        <div className="row between center" style={{ marginBottom:18, gap:14 }}>
          <div className="row gap-6 wrap center">
            {[["all","All"],["active","Active"],["mine","I lead"],["SECRET","Secret"],["CONFIDENTIAL","Confidential"],["UNCLASS","Unclass"]].map(([k,l])=>(
              <button key={k} className={"chip"+(filter===k?" on":"")} onClick={()=>setFilter(k)}>{l}</button>
            ))}
          </div>
          <span className="t-faint mono" style={{ fontSize:12 }}>{shown.length} shown</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(330px, 1fr))", gap:16 }}>
          {shown.map(p=><ProjectCard key={p.id} p={p} onOpen={onOpen}/>)}
        </div>
      </div>
    </div>
  );
}

/* ---------------- detail ---------------- */
const TABS = [["overview","Overview"],["alerts","Alerts"],["artifacts","Artifacts"],["files","Files"],["members","Members & roles"],["access","Access"],["activity","Activity"]];

// Cluster ④: la investigación del caso vive ahora dentro del workspace. Las alertas
// se filtran por su campo `case`, que coincide con el id del workspace.
function AlertsTab({ p, openEntity, go }){
  const list = ALERTS.filter(a=>a.case===p.id);
  if(!list.length) return <div className="t-faint" style={{ fontSize:13, padding:"22px 2px" }}>No alerts on this workspace.</div>;
  return (
    <div className="col gap-14" style={{ maxWidth:1000 }}>
      <div className="row between center">
        <div className="eyebrow">Investigation alerts · {list.length}</div>
        <button className="btn ghost sm" onClick={()=>go && go("cases")}>Open triage board <Icon name="arrowRight" size={13}/></button>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        <table className="tbl">
          <thead><tr><th>Alert</th><th>Type</th><th>Severity</th><th>Subject</th><th>Status</th><th>SLA</th></tr></thead>
          <tbody>
            {list.map(a=>{ const ent=ENTITY_BY_ID[a.entity]; const sev=WS_SEV[a.sev]||WS_SEV.low; return (
              <tr key={a.id} onClick={()=>ent&&openEntity&&openEntity(a.entity)} style={{ cursor: ent?"pointer":"default" }}>
                <td><span className="row gap-8 center"><span style={{ width:7,height:7,borderRadius:"50%",background:sev.c,flex:"none" }}/><span className="mono" style={{ color:"var(--text)" }}>{a.id}</span></span><div className="t-dim" style={{ fontSize:12, marginTop:3 }}>{a.title}</div></td>
                <td className="t-dim">{a.type}</td>
                <td><Badge kind={sev.badge}>{sev.label}</Badge></td>
                <td>{ent ? <span className="row gap-8 center"><TypeGlyph type={ent.type} size={22}/><span style={{ fontSize:12.5 }}>{ent.name}</span></span> : "—"}</td>
                <td className="t-dim" style={{ textTransform:"capitalize" }}>{a.status}</td>
                <td className="mono t-faint">{a.sla!=null?(a.sla===0?"breached":a.sla+"h"):"—"}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArtifactCard({ a }){
  return (
    <div className="card hover" style={{ padding:14, cursor:"pointer" }}>
      <div className="row gap-12 center" style={{ marginBottom:10 }}>
        <KindGlyph kind={a.kind} name={a.name} size={36}/>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</div>
          <div className="t-faint" style={{ fontSize:11, marginTop:2 }}>{(KIND[a.kind]||{}).label}</div>
        </div>
        <span className="t-faint"><Icon name="dots" size={15}/></span>
      </div>
      <div className="t-dim" style={{ fontSize:12, marginBottom:12 }}>{a.meta}</div>
      <div className="row between center"><Avatar who={a.owner} size={22}/><span className="t-faint mono" style={{ fontSize:11 }}>{a.updated}</span></div>
    </div>
  );
}
function Overview({ p }){
  const arts = ARTIFACTS[p.id]||[];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
      <div className="col gap-16">
        <div className="card" style={{ padding:18 }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Summary</div>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">{p.summary}</p>
        </div>
        <div className="card" style={{ padding:18 }}>
          <div className="eyebrow" style={{ marginBottom:12 }}>Investigation tasks</div>
          <div className="col gap-2">
            {p.tasks.map(([txt,st],i)=>(
              <div key={i} className="row gap-10 center" style={{ padding:"9px 0", borderBottom: i<p.tasks.length-1?"1px solid var(--line-soft)":"none" }}>
                <span style={{ width:18,height:18,borderRadius:6,display:"grid",placeItems:"center",flex:"none",
                  border: st==="done"?"none":"1.5px solid var(--line-strong)", background: st==="done"?"var(--ok)":st==="doing"?"var(--warn-ghost)":"transparent", color:"var(--bg)" }}>
                  {st==="done"&&<Icon name="check" size={12}/>}{st==="doing"&&<span style={{width:6,height:6,borderRadius:"50%",background:"var(--warn)"}}/>}
                </span>
                <span style={{ fontSize:13.5, flex:1, textDecoration: st==="done"?"line-through":"none", color: st==="done"?"var(--text-faint)":"var(--text)" }}>{txt}</span>
                <span className="t-faint mono" style={{ fontSize:10.5 }}>{st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col gap-16">
        <div className="card" style={{ padding:18 }}>
          <div className="row between center" style={{ marginBottom:12 }}><div className="eyebrow">Team · {p.members.length}</div><button className="btn ghost sm">Manage</button></div>
          <div className="col gap-10">
            {p.members.map(m=>(
              <div key={m} className="row gap-10 center"><Avatar who={m} size={30}/>
                <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600 }}>{ANALYSTS[m].name}</div>
                  <div className="t-faint" style={{ fontSize:11.5 }}>{ANALYSTS[m].role}{m===p.lead?" · Lead":""}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:18 }}>
          <div className="eyebrow" style={{ marginBottom:12 }}>Recent artifacts</div>
          <div className="col gap-2">
            {arts.slice(0,4).map((a,i)=>(
              <div key={i} className="row gap-10 center" style={{ padding:"6px 0" }}>
                <KindGlyph kind={a.kind} name={a.name} size={28}/>
                <span style={{ fontSize:12.5, flex:1, minWidth:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:600 }}>{a.name}</span>
                <span className="t-faint mono" style={{ fontSize:10.5 }}>{a.updated}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:16 }}>
          <div className="row between center" style={{ marginBottom:10 }}><div className="eyebrow">Classification</div><MarkingChip level={p.cls} /></div>
          <div className="row gap-8 center" style={{ padding:"8px 10px", borderRadius:8, background:"var(--bg-2)" }}>
            <span className="t-faint"><Icon name="lock" size={14}/></span>
            <span className="t-faint" style={{ fontSize:11.5 }}>Handling: {p.cls} // NEED-TO-KNOW. Access is logged.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function Artifacts({ p }){
  const arts = ARTIFACTS[p.id]||[];
  const kinds = ["all", ...Array.from(new Set(arts.map(a=>a.kind)))];
  const [k,setK] = useState("all");
  const shown = k==="all" ? arts : arts.filter(a=>a.kind===k);
  return (
    <div>
      <div className="row between center" style={{ marginBottom:16, gap:12 }}>
        <div className="row gap-6 wrap center">
          {kinds.map(kk=>(
            <button key={kk} className={"chip"+(k===kk?" on":"")} onClick={()=>setK(kk)}>
              {kk==="all" ? "All" : (KIND[kk]||{}).label}{kk!=="all" && <span className="t-faint" style={{ marginLeft:4 }}>{arts.filter(a=>a.kind===kk).length}</span>}
            </button>
          ))}
        </div>
        <button className="btn primary sm"><Icon name="plus" size={14}/>New artifact</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:14 }}>
        {shown.map((a,i)=><ArtifactCard key={i} a={a}/>)}
      </div>
    </div>
  );
}
function Files({ p }){
  const files = (ARTIFACTS[p.id]||[]).filter(a=>a.kind==="file");
  return (
    <div style={{ maxWidth:920 }}>
      <div style={{ border:"1.5px dashed var(--line-strong)", borderRadius:12, padding:"22px", textAlign:"center", marginBottom:18,
        backgroundImage:"repeating-linear-gradient(45deg, var(--bg-1) 0 10px, transparent 10px 20px)" }}>
        <div style={{ width:42,height:42,borderRadius:11,display:"grid",placeItems:"center",margin:"0 auto 10px",background:"var(--bg-2)",color:"var(--accent)" }}><Icon name="download" size={20}/></div>
        <div style={{ fontSize:14, fontWeight:600 }}>Drop evidence to ingest</div>
        <div className="t-faint" style={{ fontSize:12.5, marginTop:4 }}>PDF, image, CSV or transcript — entities are extracted and linked into the ontology.</div>
      </div>
      <ArtifactList count={files.length} empty="No evidence files yet.">
        {files.map((f,i)=>(
          <ArtifactRow key={i} icon={artFileIcon(f.name)} color="var(--text-dim)" name={f.name} meta={f.meta}
            trailing={<>{f.cls && <MarkingChip level={f.cls} size="sm"/>}<Avatar who={f.owner} size={22}/><span className="t-faint mono" style={{ fontSize:11, width:30, textAlign:"right" }}>{f.updated}</span></>} />
        ))}
      </ArtifactList>
    </div>
  );
}
function Members({ p }){
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:24 }}>
      <div>
        <div className="row between center" style={{ marginBottom:14 }}><div className="eyebrow">Members · {p.members.length}</div><button className="btn primary sm"><Icon name="plus" size={14}/>Invite</button></div>
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>User</th><th>Project role</th><th>Access</th></tr></thead>
            <tbody>
              {p.members.map(m=>(
                <tr key={m}>
                  <td><span className="row gap-10 center"><Avatar who={m} size={26}/><span style={{ color:"var(--text)", fontWeight:600 }}>{ANALYSTS[m].name}</span></span></td>
                  <td>{ANALYSTS[m].role}{m===p.lead && <span className="t-accent" style={{ marginLeft:6, fontSize:11 }}>· Lead</span>}</td>
                  <td><Badge kind="ok" dot>active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom:14 }}>Roles in this workspace</div>
        <div className="col gap-10">
          {PROJ_ROLES.map(r=>(
            <div key={r.name} className="card" style={{ padding:14 }}>
              <div className="row between center" style={{ marginBottom:6 }}>
                <span style={{ fontSize:13.5, fontWeight:600 }}>{r.name}</span>
                <span className="t-faint mono" style={{ fontSize:11 }}>{p.members.filter(m=>ANALYSTS[m].role===r.name).length} in project</span>
              </div>
              <div className="t-dim" style={{ fontSize:12.5 }}>{r.scope}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Access({ p }){
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom:14 }}>Permission matrix</div>
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>Role</th>{ACCESS_MATRIX.caps.map(c=><th key={c} style={{ textAlign:"center" }}>{c}</th>)}</tr></thead>
            <tbody>
              {ACCESS_MATRIX.rows.map(([role,caps])=>(
                <tr key={role}>
                  <td style={{ color:"var(--text)", fontWeight:600 }}>{role}</td>
                  {caps.map((on,i)=>(
                    <td key={i} style={{ textAlign:"center" }}>
                      {on ? <span style={{ color:"var(--ok)", display:"inline-grid", placeItems:"center" }}><Icon name="check" size={15}/></span>
                          : <span style={{ color:"var(--text-faint)", fontFamily:"var(--font-mono)" }}>·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="col gap-16">
        <div className="card" style={{ padding:16 }}>
          <div className="row between center" style={{ marginBottom:12 }}><div className="eyebrow">Classification</div><MarkingChip level={p.cls} /></div>
          <div className="col gap-2">
            {[["Compartment","AXIOM-INT"],["Caveat","NEED-TO-KNOW"],["Marking inherits to","all artifacts"]].map(([k,v])=>(
              <div key={k} className="row between" style={{ padding:"8px 0", borderBottom:"1px solid var(--line-soft)" }}>
                <span className="t-faint" style={{ fontSize:12.5 }}>{k}</span><span className="mono" style={{ fontSize:12, color:"var(--text)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:16 }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Purpose-based access</div>
          <div className="row between center" style={{ marginBottom:10 }}>
            <span className="t-dim" style={{ fontSize:12.5 }}>Require justification on access</span>
            <span style={{ width:34,height:19,borderRadius:19,background:"var(--accent)",position:"relative",flex:"none" }}><span style={{ position:"absolute",top:2,left:17,width:15,height:15,borderRadius:"50%",background:"var(--bg-1)" }}/></span>
          </div>
          <div className="row gap-8 center" style={{ padding:"8px 10px", borderRadius:8, background:"var(--bg-2)" }}>
            <span className="t-faint"><Icon name="shield" size={14}/></span>
            <span className="t-faint" style={{ fontSize:11.5 }}>Every object opened is logged with actor, time and stated purpose.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function Activity({ p }){
  const feed = PROJ_ACTIVITY[p.id] || [[p.lead,"updated the workspace","1h","user"],["SYS","scheduled run completed","3h","system"]];
  return (
    <div className="card" style={{ padding:"6px 0", maxWidth:760 }}>
      {feed.map((a,i)=>(
        <div key={i} className="row gap-12 center" style={{ padding:"12px 18px", borderBottom: i<feed.length-1?"1px solid var(--line-soft)":"none" }}>
          {a[3]==="system" ? <span style={{ color:"var(--accent)" }}><Icon name="sparkles" size={16}/></span>
            : a[3]==="alert" ? <span style={{ color:"var(--alert)" }}><Icon name="alertTri" size={16}/></span>
            : <Avatar who={a[0]} size={26}/>}
          <div style={{ flex:1, minWidth:0, fontSize:13 }}>
            <b style={{ fontWeight:600 }}>{a[0]==="SYS"?"System":(ANALYSTS[a[0]]?.name||a[0])}</b> <span className="t-dim">{a[1]}</span>
          </div>
          <span className="t-faint mono" style={{ fontSize:11 }}>{a[2]}</span>
        </div>
      ))}
    </div>
  );
}
function Detail({ p, onBack, openEntity, go }){
  const [tab,setTab] = useState("overview");
  const arts = (ARTIFACTS[p.id]||[]).length;
  return (
    <div className="content" style={{ overflow:"auto" }}>
      <div style={{ background:"var(--bg-1)", borderBottom:"1px solid var(--line-soft)", padding:"20px 28px 0" }}>
        <div style={{ maxWidth:1180, margin:"0 auto" }}>
          <button className="btn ghost sm" onClick={onBack} style={{ marginBottom:14, paddingLeft:6 }}>
            <Icon name="arrowRight" size={15} style={{ transform:"rotate(180deg)" }}/>All workspaces
          </button>
          <div className="row between" style={{ alignItems:"flex-start", gap:20 }}>
            <div className="row gap-16" style={{ alignItems:"flex-start", minWidth:0 }}>
              <div style={{ width:52,height:52,borderRadius:14,display:"grid",placeItems:"center",flex:"none",
                background:"color-mix(in oklab, var(--accent) 16%, var(--bg-2))", color:"var(--accent)", boxShadow:"inset 0 0 0 1px var(--accent-dim)" }}><Icon name="folder" size={26}/></div>
              <div style={{ minWidth:0 }}>
                <div className="row gap-10 center" style={{ marginBottom:5 }}>
                  <MarkingChip level={p.cls} />
                  {p.scheduled ? <Badge kind="accent" dot>scheduled</Badge> : <Badge kind="accent" dot>{p.status}</Badge>}
                  <span className="t-faint mono" style={{ fontSize:11 }}>opened {p.opened}</span>
                </div>
                <h1 className="serif" style={{ fontSize:30, fontWeight:500, margin:0, letterSpacing:"-0.02em" }}>{p.name}</h1>
                <div className="t-dim" style={{ fontSize:14, marginTop:3 }}>{p.sub}</div>
              </div>
            </div>
            <div className="row gap-8" style={{ flex:"none" }}>
              <button className="btn"><Icon name="settings"/>Settings</button>
              <button className="btn"><Icon name="user"/>Share</button>
              <button className="btn primary"><Icon name="doc"/>Generate dossier</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, margin:"20px 0 4px" }}>
            <Stat label="Linked objects" value={p.counts.objects.toLocaleString()} icon="share"/>
            <Stat label="Open alerts" value={p.counts.alerts} icon="alertTri" valueColor={p.counts.alerts?"var(--alert)":"var(--text)"}/>
            <Stat label="Team" value={p.members.length} icon="user"/>
            <Stat label="Artifacts" value={arts} icon="layers"/>
          </div>
          <div className="row gap-2" style={{ marginTop:14 }}>
            <Tabs items={TABS.map(([k,l])=>({ label:l, badge: k==="artifacts"?arts : k==="alerts"?(p.counts.alerts||undefined) : undefined }))}
              value={TABS.findIndex(([k])=>k===tab)} onChange={i=>setTab(TABS[i][0])} />
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"24px 28px 60px" }} className="fade-in" key={tab}>
        {tab==="overview" && <Overview p={p}/>}
        {tab==="alerts" && <AlertsTab p={p} openEntity={openEntity} go={go}/>}
        {tab==="artifacts" && <Artifacts p={p}/>}
        {tab==="files" && <Files p={p}/>}
        {tab==="members" && <Members p={p}/>}
        {tab==="access" && <Access p={p}/>}
        {tab==="activity" && <Activity p={p}/>}
      </div>
    </div>
  );
}

export function ProjectsView({ openEntity, go }){
  const [selId,setSelId] = useState(null);
  const p = selId ? PROJECTS.find(x=>x.id===selId) : null;
  return p ? <Detail p={p} onBack={()=>setSelId(null)} openEntity={openEntity} go={go}/> : <List onOpen={setSelId}/>;
}
