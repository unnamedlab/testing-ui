import { useState } from 'react';
import { ACCESS_MATRIX, PROJ_ROLES, PROJECTS } from '../data/data_projects.js';
import { ANALYSTS } from '../data/data_ext.js';
import { Avatar, Badge, Icon, Switch, Tabs, PageHeader } from '../components/ui.jsx';
import { MarkingChip } from '../components/Security.jsx';
import { AccessMatrix, RoleCard, AccessRequests, ACCESS_REQUESTS } from '../components/Access.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Projects (UX-01 i18n)
   The project is the container: permissions + home of artifacts.
   ============================================================ */

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
function StatTile({ label, value, icon, color }){
  return <div className="card" style={{ padding:16 }}>
    <div className="row between center"><div className="eyebrow">{label}</div><span className="t-faint"><Icon name={icon} size={16}/></span></div>
    <div className="mono" style={{ fontSize:26, fontWeight:600, marginTop:10, color:color||"var(--text)" }}>{value}</div>
  </div>;
}

/* ---------------- list ---------------- */
function ProjectCard({ p, onOpen }){
  const { t } = useI18n();
  const arts = (p.artifacts||[]).length;
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
            <span className="t-faint" style={{ fontSize:11 }}>{t(l)}</span></div>
        ))}
      </div>
      <div className="divider"/>
      <div className="row between center">
        <Stack members={p.members} size={26}/>
        <div className="row gap-10 center">
          {p.scheduled ? <Badge kind="accent" dot>{t('scheduled')}</Badge> : <Badge kind={p.status==="Active"?"accent":""} dot>{t(p.status)}</Badge>}
          <span className="t-faint mono" style={{ fontSize:11 }}>{p.updated}</span>
        </div>
      </div>
    </button>
  );
}
function List({ onOpen }){
  const { t } = useI18n();
  const [filter,setFilter] = useState("all");
  const mine = ["blackfrost","aiswatch"];
  const shown = PROJECTS.filter(p=>{
    if(filter==="all") return true;
    if(filter==="mine") return mine.includes(p.id);
    if(filter==="active") return p.status==="Active";
    return p.cls===filter;
  });
  return (
    <div className="content" style={{ padding:"var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }} className="fade-in">
        <PageHeader variant="hero" eyebrow={t('Projects')} title={t('Your projects')}
          sub={<>{t('{n} projects · ', { n: PROJECTS.length })}<span className="t-accent">{t('2 you lead')}</span>{t(' · permissions and artifacts scoped per project.')}</>}>
          <button className="btn"><Icon name="download" />{t('Import')}</button>
          <button className="btn primary"><Icon name="plus" />{t('New project')}</button>
        </PageHeader>
        <div className="row between center" style={{ marginBottom:18, gap:14 }}>
          <div className="row gap-6 wrap center">
            {[["all","All"],["active","Active"],["mine","I lead"],["SECRET","Secret"],["CONFIDENTIAL","Confidential"],["UNCLASS","Unclass"]].map(([k,l])=>(
              <button key={k} className={"chip"+(filter===k?" on":"")} onClick={()=>setFilter(k)}>{t(l)}</button>
            ))}
          </div>
          <span className="t-faint mono" style={{ fontSize:12 }}>{t('{n} shown', { n: shown.length })}</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(330px, 1fr))", gap:16 }}>
          {shown.map(p=><ProjectCard key={p.id} p={p} onOpen={onOpen}/>)}
        </div>
      </div>
    </div>
  );
}

/* ---------------- detail ---------------- */
const TABS = [["overview","Overview"],["artifacts","Artifacts"],["files","Files"],["members","Members & roles"],["access","Access"],["activity","Activity"]];

function ArtifactCard({ a }){
  const { t } = useI18n();
  return (
    <div className="card hover" style={{ padding:14, cursor:"pointer" }}>
      <div className="row gap-12 center" style={{ marginBottom:10 }}>
        <KindGlyph kind={a.kind} name={a.name} size={36}/>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</div>
          <div className="t-faint" style={{ fontSize:11, marginTop:2 }}>{t((KIND[a.kind]||{}).label)}</div>
        </div>
        <span className="t-faint"><Icon name="dots" size={15}/></span>
      </div>
      <div className="t-dim" style={{ fontSize:12, marginBottom:12 }}>{a.meta}</div>
      <div className="row between center"><Avatar who={a.owner} size={22}/><span className="t-faint mono" style={{ fontSize:11 }}>{a.updated}</span></div>
    </div>
  );
}
function Overview({ p }){
  const { t } = useI18n();
  const arts = p.artifacts||[];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
      <div className="col gap-16">
        <div className="card" style={{ padding:18 }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>{t('Summary')}</div>
          <p style={{ fontSize:14, lineHeight:1.6, margin:0 }} className="t-dim">{t(p.summary)}</p>
        </div>
        <div className="card" style={{ padding:18 }}>
          <div className="eyebrow" style={{ marginBottom:12 }}>{t('Project tasks')}</div>
          <div className="col gap-2">
            {p.tasks.map(([txt,st],i)=>(
              <div key={i} className="row gap-10 center" style={{ padding:"9px 0", borderBottom: i<p.tasks.length-1?"1px solid var(--line-soft)":"none" }}>
                <span style={{ width:18,height:18,borderRadius:6,display:"grid",placeItems:"center",flex:"none",
                  border: st==="done"?"none":"1.5px solid var(--line-strong)", background: st==="done"?"var(--ok)":st==="doing"?"var(--warn-ghost)":"transparent", color:"var(--bg)" }}>
                  {st==="done"&&<Icon name="check" size={12}/>}{st==="doing"&&<span style={{width:6,height:6,borderRadius:"50%",background:"var(--warn)"}}/>}
                </span>
                <span style={{ fontSize:13.5, flex:1, textDecoration: st==="done"?"line-through":"none", color: st==="done"?"var(--text-faint)":"var(--text)" }}>{t(txt)}</span>
                <span className="t-faint mono" style={{ fontSize:10.5 }}>{t(st)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col gap-16">
        <div className="card" style={{ padding:18 }}>
          <div className="row between center" style={{ marginBottom:12 }}><div className="eyebrow">{t('Team')} · {p.members.length}</div><button className="btn ghost sm">{t('Manage')}</button></div>
          <div className="col gap-10">
            {p.members.map(m=>(
              <div key={m} className="row gap-10 center"><Avatar who={m} size={30}/>
                <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600 }}>{ANALYSTS[m].name}</div>
                  <div className="t-faint" style={{ fontSize:11.5 }}>{t(ANALYSTS[m].role)}{m===p.lead?" · "+t('Lead'):""}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:18 }}>
          <div className="eyebrow" style={{ marginBottom:12 }}>{t('Recent artifacts')}</div>
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
          <div className="row between center" style={{ marginBottom:10 }}><div className="eyebrow">{t('Classification')}</div><MarkingChip level={p.cls} /></div>
          <div className="row gap-8 center" style={{ padding:"8px 10px", borderRadius:8, background:"var(--bg-2)" }}>
            <span className="t-faint"><Icon name="lock" size={14}/></span>
            <span className="t-faint" style={{ fontSize:11.5 }}>{t('Handling: {cls} // NEED-TO-KNOW. Access is logged.', { cls: p.cls })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function Artifacts({ p }){
  const { t } = useI18n();
  const arts = p.artifacts||[];
  const kinds = ["all", ...Array.from(new Set(arts.map(a=>a.kind)))];
  const [k,setK] = useState("all");
  const shown = k==="all" ? arts : arts.filter(a=>a.kind===k);
  return (
    <div>
      <div className="row between center" style={{ marginBottom:16, gap:12 }}>
        <div className="row gap-6 wrap center">
          {kinds.map(kk=>(
            <button key={kk} className={"chip"+(k===kk?" on":"")} onClick={()=>setK(kk)}>
              {kk==="all" ? t('All') : t((KIND[kk]||{}).label)}{kk!=="all" && <span className="t-faint" style={{ marginLeft:4 }}>{arts.filter(a=>a.kind===kk).length}</span>}
            </button>
          ))}
        </div>
        <button className="btn primary sm"><Icon name="plus" size={14}/>{t('New artifact')}</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))", gap:14 }}>
        {shown.map((a,i)=><ArtifactCard key={i} a={a}/>)}
      </div>
    </div>
  );
}
function Files({ p }){
  const { t } = useI18n();
  const files = (p.artifacts||[]).filter(a=>a.kind==="file");
  return (
    <div style={{ maxWidth:920 }}>
      <div style={{ border:"1.5px dashed var(--line-strong)", borderRadius:12, padding:"22px", textAlign:"center", marginBottom:18,
        backgroundImage:"repeating-linear-gradient(45deg, var(--bg-1) 0 10px, transparent 10px 20px)" }}>
        <div style={{ width:42,height:42,borderRadius:11,display:"grid",placeItems:"center",margin:"0 auto 10px",background:"var(--bg-2)",color:"var(--accent)" }}><Icon name="download" size={20}/></div>
        <div style={{ fontSize:14, fontWeight:600 }}>{t('Drop evidence to ingest')}</div>
        <div className="t-faint" style={{ fontSize:12.5, marginTop:4 }}>{t('PDF, image, CSV or transcript — entities are extracted and linked into the ontology.')}</div>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        {files.map((f,i)=>(
          <div key={i} className="row gap-14 center" style={{ padding:"13px 16px", borderBottom: i<files.length-1?"1px solid var(--line-soft)":"none", cursor:"pointer" }}>
            <KindGlyph kind="file" name={f.name} size={34}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.name}</div>
              <div className="t-faint mono" style={{ fontSize:11, marginTop:2 }}>{f.meta}</div>
            </div>
            {f.cls && <MarkingChip level={f.cls} size="sm"/>}
            <Avatar who={f.owner} size={22}/>
            <span className="t-faint mono" style={{ fontSize:11, width:30, textAlign:"right" }}>{f.updated}</span>
          </div>
        ))}
        {files.length===0 && <div className="t-faint" style={{ padding:"28px", textAlign:"center", fontSize:13 }}>{t('No evidence files yet.')}</div>}
      </div>
    </div>
  );
}
function Members({ p }){
  const { t } = useI18n();
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:24 }}>
      <div>
        <div className="row between center" style={{ marginBottom:14 }}><div className="eyebrow">{t('Members')} · {p.members.length}</div><button className="btn primary sm"><Icon name="plus" size={14}/>{t('Invite')}</button></div>
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>{t('User')}</th><th>{t('Project role')}</th><th>{t('Access')}</th></tr></thead>
            <tbody>
              {p.members.map(m=>(
                <tr key={m}>
                  <td><span className="row gap-10 center"><Avatar who={m} size={26}/><span style={{ color:"var(--text)", fontWeight:600 }}>{ANALYSTS[m].name}</span></span></td>
                  <td>{t(ANALYSTS[m].role)}{m===p.lead && <span className="t-accent" style={{ marginLeft:6, fontSize:11 }}>· {t('Lead')}</span>}</td>
                  <td><Badge kind="ok" dot>{t('active')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom:14 }}>{t('Roles in this project')}</div>
        <div className="col gap-10">
          {PROJ_ROLES.map(r=>(
            <RoleCard key={r.name} name={r.name} meta={t('{n} in project', { n: p.members.filter(m=>ANALYSTS[m].role===r.name).length })} scope={r.scope} />
          ))}
        </div>
      </div>
    </div>
  );
}
function Access({ p }){
  const { t } = useI18n();
  const [justify, setJustify] = useState(true); // UX-5/F-06: Switch accesible en vez de span falso
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom:14 }}>{t('Permission matrix')}</div>
        <AccessMatrix caps={ACCESS_MATRIX.caps} rows={ACCESS_MATRIX.rows} />
        <div style={{ marginTop:24 }}>
          <AccessRequests requests={ACCESS_REQUESTS.filter(r=>r.proj===p.id)} />
        </div>
      </div>
      <div className="col gap-16">
        <div className="card" style={{ padding:16 }}>
          <div className="row between center" style={{ marginBottom:12 }}><div className="eyebrow">{t('Classification')}</div><MarkingChip level={p.cls} /></div>
          <div className="col gap-2">
            {[["Compartment","AXIOM-INT"],["Caveat","NEED-TO-KNOW"],["Marking inherits to","all artifacts"]].map(([k,v])=>(
              <div key={k} className="row between" style={{ padding:"8px 0", borderBottom:"1px solid var(--line-soft)" }}>
                <span className="t-faint" style={{ fontSize:12.5 }}>{t(k)}</span><span className="mono" style={{ fontSize:12, color:"var(--text)" }}>{k==="Marking inherits to"?t(v):v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:16 }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>{t('Purpose-based access')}</div>
          <div className="row between center" style={{ marginBottom:10 }}>
            <span className="t-dim" style={{ fontSize:12.5 }}>{t('Require justification on access')}</span>
            <Switch on={justify} onChange={setJustify} label={t('Require justification on access')} />
          </div>
          <div className="row gap-8 center" style={{ padding:"8px 10px", borderRadius:8, background:"var(--bg-2)" }}>
            <span className="t-faint"><Icon name="shield" size={14}/></span>
            <span className="t-faint" style={{ fontSize:11.5 }}>{t('Every object opened is logged with actor, time and stated purpose.')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function Activity({ p }){
  const { t } = useI18n();
  const feed = p.activity || [[p.lead,"updated the project","1h","user"],["SYS","scheduled run completed","3h","system"]];
  return (
    <div className="card" style={{ padding:"6px 0", maxWidth:760 }}>
      {feed.map((a,i)=>(
        <div key={i} className="row gap-12 center" style={{ padding:"12px 18px", borderBottom: i<feed.length-1?"1px solid var(--line-soft)":"none" }}>
          {a[3]==="system" ? <span style={{ color:"var(--accent)" }}><Icon name="sparkles" size={16}/></span>
            : a[3]==="alert" ? <span style={{ color:"var(--alert)" }}><Icon name="alertTri" size={16}/></span>
            : <Avatar who={a[0]} size={26}/>}
          <div style={{ flex:1, minWidth:0, fontSize:13 }}>
            <b style={{ fontWeight:600 }}>{a[0]==="SYS"?t('System'):(ANALYSTS[a[0]]?.name||a[0])}</b> <span className="t-dim">{t(a[1])}</span>
          </div>
          <span className="t-faint mono" style={{ fontSize:11 }}>{a[2]}</span>
        </div>
      ))}
    </div>
  );
}
function Detail({ p, onBack, go, openDossier }){
  const { t } = useI18n();
  const [tab,setTab] = useState("overview");
  const arts = (p.artifacts||[]).length;
  return (
    <div className="content" style={{ overflow:"auto" }}>
      <div style={{ background:"var(--bg-1)", borderBottom:"1px solid var(--line-soft)", padding:"20px 28px 0" }}>
        <div style={{ maxWidth:1180, margin:"0 auto" }}>
          <button className="btn ghost sm" onClick={onBack} style={{ marginBottom:14, paddingLeft:6 }}>
            <Icon name="arrowRight" size={15} style={{ transform:"rotate(180deg)" }}/>{t('All projects')}
          </button>
          <div className="row between" style={{ alignItems:"flex-start", gap:20 }}>
            <div className="row gap-16" style={{ alignItems:"flex-start", minWidth:0 }}>
              <div style={{ width:52,height:52,borderRadius:14,display:"grid",placeItems:"center",flex:"none",
                background:"color-mix(in oklab, var(--accent) 16%, var(--bg-2))", color:"var(--accent)", boxShadow:"inset 0 0 0 1px var(--accent-dim)" }}><Icon name="folder" size={26}/></div>
              <div style={{ minWidth:0 }}>
                <div className="row gap-10 center" style={{ marginBottom:5 }}>
                  <MarkingChip level={p.cls} />
                  {p.scheduled ? <Badge kind="accent" dot>{t('scheduled')}</Badge> : <Badge kind="accent" dot>{t(p.status)}</Badge>}
                  <span className="t-faint mono" style={{ fontSize:11 }}>{t('opened {d}',{d:p.opened})}</span>
                </div>
                <h1 className="h-hero">{p.name}</h1>
                <div className="t-dim" style={{ fontSize:14, marginTop:3 }}>{p.sub}</div>
              </div>
            </div>
            <div className="row gap-8" style={{ flex:"none" }}>
              <button className="btn"><Icon name="settings"/>{t('Settings')}</button>
              <button className="btn" onClick={()=>go && go("cases")}><Icon name="bell"/>{t('Alerts')}</button>
              <button className="btn primary" onClick={()=>openDossier && openDossier(p.id)}><Icon name="doc"/>{t('Generate dossier')}</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, margin:"20px 0 4px" }}>
            <StatTile label={t('Linked objects')} value={p.counts.objects.toLocaleString()} icon="share"/>
            <StatTile label={t('Open alerts')} value={p.counts.alerts} icon="alertTri" color={p.counts.alerts?"var(--alert)":"var(--text)"}/>
            <StatTile label={t('Team')} value={p.members.length} icon="user"/>
            <StatTile label={t('Artifacts')} value={arts} icon="layers"/>
          </div>
          <div style={{ marginTop:14 }}>
            <Tabs items={TABS.map(([k,l])=>({label: t(l) + (k==="artifacts"?` · ${arts}`:"")}))} value={TABS.findIndex(([k])=>k===tab)} onChange={i=>setTab(TABS[i][0])} />
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"var(--page-py) var(--page-px) 60px" }} className="fade-in" key={tab}>
        {tab==="overview" && <Overview p={p}/>}
        {tab==="artifacts" && <Artifacts p={p}/>}
        {tab==="files" && <Files p={p}/>}
        {tab==="members" && <Members p={p}/>}
        {tab==="access" && <Access p={p}/>}
        {tab==="activity" && <Activity p={p}/>}
      </div>
    </div>
  );
}

export function ProjectsView({ projectId, openProject, go, openDossier }){
  // R-1: vista controlada por App. `project` es el único contenedor y este es su
  // único detalle (lo comparten Home, la paleta y la lente de alertas).
  const p = projectId ? PROJECTS.find(x=>x.id===projectId) : null;
  return p ? <Detail p={p} onBack={()=>openProject(null)} go={go} openDossier={openDossier} />
           : <List onOpen={openProject}/>;
}
