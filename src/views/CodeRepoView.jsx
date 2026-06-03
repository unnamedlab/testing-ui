import React, { useState } from 'react';
import { BUILDS, DRIVE, FILES, KW, REPO } from '../data/data_code.js';
import { ANALYSTS } from '../data/data_ext.js';
import { Avatar, Badge, Icon, Tabs } from '../components/ui.jsx';
import { ArtifactList, ArtifactRow, artifactIcon, artifactColor } from '../components/ArtifactExplorer.jsx';
import { MarkingChip } from '../components/Security.jsx';

/* ============================================================
   AXIOM — Code repository + Drive
   ============================================================ */
const BUILD = { passing:{kind:"ok",label:"passing",icon:"check"}, running:{kind:"accent",label:"running",icon:"play"}, failed:{kind:"alert",label:"failed",icon:"x"} };
function nm(id){ return (ANALYSTS[id]?.name||id).split(" ")[0]; }

function hlLine(line, lang){
  const kw = new Set(KW[lang]||[]);
  const cmt = lang==="sql" ? "--" : (lang==="python"||lang==="yaml") ? "#" : null;
  const res=[]; let i=0; const n=line.length; const push=(t,c)=>{ if(t) res.push({t,c}); };
  while(i<n){
    const ch=line[i];
    if(cmt && line.startsWith(cmt,i)){ push(line.slice(i),"var(--text-faint)"); break; }
    if(ch==='"'||ch==="'"){ let j=i+1; while(j<n && line[j]!==ch){ if(line[j]==="\\") j++; j++; } j=Math.min(n,j+1); push(line.slice(i,j),"var(--ok)"); i=j; continue; }
    if(ch==="@"){ let j=i+1; while(j<n && /\w/.test(line[j])) j++; push(line.slice(i,j),"var(--violet)"); i=j; continue; }
    if(/[0-9]/.test(ch)){ let j=i; while(j<n && /[0-9_.]/.test(line[j])) j++; push(line.slice(i,j),"var(--warn)"); i=j; continue; }
    if(/[A-Za-z_]/.test(ch)){ let j=i; while(j<n && /\w/.test(line[j])) j++; const w=line.slice(i,j); push(w, kw.has(lang==="sql"?w.toUpperCase():w)?"var(--accent-2)":null); i=j; continue; }
    let j=i; while(j<n && !/[\w"'@0-9]/.test(line[j]) && !(cmt&&line.startsWith(cmt,j))) j++; if(j===i) j=i+1; push(line.slice(i,j),null); i=j;
  }
  return res;
}
function Code({ file }){
  const lines = file.code.split("\n");
  return (
    <div style={{ fontFamily:"var(--font-mono)", fontSize:12.5, lineHeight:1.7, overflow:"auto", height:"100%" }}>
      {lines.map((ln,i)=>(
        <div key={i} style={{ display:"flex" }}>
          <span style={{ width:42, flex:"none", textAlign:"right", paddingRight:14, color:"var(--text-faint)", userSelect:"none", opacity:.6 }}>{i+1}</span>
          <span style={{ whiteSpace:"pre", color:"var(--text-dim)" }}>{hlLine(ln,file.lang).map((s,j)=><span key={j} style={s.c?{color:s.c}:null}>{s.t}</span>)}{ln==="" ? " " : ""}</span>
        </div>
      ))}
    </div>
  );
}
function fileIcon(f){ return f.lang==="python"||f.lang==="sql" ? "code" : "doc"; }
function fileColor(f){ return f.lang==="python"?"var(--info)":f.lang==="sql"?"var(--violet)":f.lang==="yaml"?"var(--warn)":"var(--text-dim)"; }
function Tree({ selId, onSel }){
  const tx = FILES.filter(f=>f.path.startsWith("transforms/"));
  const root = FILES.filter(f=>!f.path.startsWith("transforms/"));
  const Row = ({ f, indent }) => (
    <button onClick={()=>onSel(f.id)} className="row gap-8 center" style={{ width:"100%", border:"none", background:selId===f.id?"var(--accent-ghost)":"none", borderRadius:7, padding:"6px 8px", paddingLeft:indent, cursor:"pointer", textAlign:"left" }}>
      <span style={{ color:fileColor(f) }}><Icon name={fileIcon(f)} size={15}/></span>
      <span style={{ fontSize:12.5, flex:1, color:selId===f.id?"var(--text)":"var(--text-dim)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.path.split("/").pop()}</span>
    </button>
  );
  return (
    <div style={{ padding:"6px" }}>
      <div className="row gap-8 center" style={{ padding:"6px 8px", color:"var(--text-dim)" }}><Icon name="folderOpen" size={15} style={{ color:"var(--accent)" }}/><span style={{ fontSize:12.5, fontWeight:600 }}>transforms</span></div>
      {tx.map(f=><Row key={f.id} f={f} indent={24}/>)}
      {root.map(f=><Row key={f.id} f={f} indent={8}/>)}
    </div>
  );
}
function Inspector({ file }){
  return (
    <aside style={{ width:300, flex:"none", borderLeft:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
      <div style={{ padding:16 }}>
        {file.builds ? <>
          <div className="eyebrow" style={{ marginBottom:8 }}>Builds dataset</div>
          <div className="card" style={{ padding:"10px 12px", marginBottom:14, background:"var(--bg-2)" }}><div className="row gap-8 center"><span style={{ color:"var(--ok)" }}><Icon name="layers" size={16}/></span><span className="mono" style={{ fontSize:12, color:"var(--text)" }}>{file.builds}</span></div></div>
          <div className="eyebrow" style={{ marginBottom:8 }}>Inputs</div>
          <div className="col gap-6" style={{ marginBottom:14 }}>{file.inputs.map(i=><div key={i} className="row gap-8 center"><span className="t-faint"><Icon name="layers" size={14}/></span><span className="mono" style={{ fontSize:11.5, color:"var(--text-dim)" }}>{i}</span></div>)}</div>
          <div className="card" style={{ padding:"10px 12px", marginBottom:16, background:"var(--accent-ghost)", border:"1px solid var(--accent-dim)" }}><div className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="pipeline" size={15}/></span><div><div className="t-faint" style={{ fontSize:10 }}>Powers pipeline node</div><div style={{ fontSize:12.5, fontWeight:600, color:"var(--accent)" }}>{file.node}</div></div></div></div>
        </> : <div className="t-faint" style={{ fontSize:12.5, marginBottom:14 }}>Registry / docs file — not a build target.</div>}
        <div className="eyebrow" style={{ marginBottom:10 }}>Version history</div>
        <div style={{ position:"relative", paddingLeft:16 }}>
          <div style={{ position:"absolute", left:4, top:6, bottom:8, width:2, background:"var(--line)" }}/>
          {file.commits.map((c,i)=>(
            <div key={i} style={{ position:"relative", paddingBottom:16 }}>
              <span style={{ position:"absolute", left:-16, top:3, width:10, height:10, borderRadius:"50%", background: i===0?"var(--accent)":"var(--bg-3)", border:"2px solid var(--bg-1)", boxShadow: i===0?"0 0 8px -1px var(--accent)":"none" }}/>
              <div style={{ fontSize:12.5, color:"var(--text)", lineHeight:1.4 }}>{c.msg}</div>
              <div className="row gap-8 center" style={{ marginTop:4 }}><span className="mono" style={{ fontSize:10.5, color:"var(--accent-2)" }}>{c.hash}</span><Avatar who={c.by} size={16}/><span className="t-faint" style={{ fontSize:10.5 }}>{c.when}</span></div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
function CodeTab(){
  const [selId,setSelId] = useState("er");
  const file = FILES.find(f=>f.id===selId);
  return (
    <div className="content" style={{ display:"flex", padding:0, overflow:"hidden" }}>
      <aside style={{ width:240, flex:"none", borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
        <div className="row between center" style={{ padding:"12px 14px 8px" }}><div className="eyebrow">Files</div><button className="btn ghost sm" style={{ width:26, padding:0 }}><Icon name="plus" size={15}/></button></div>
        <Tree selId={selId} onSel={setSelId}/>
      </aside>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div className="row between center" style={{ padding:"0 16px", borderBottom:"1px solid var(--line-soft)", flex:"none", height:40 }}>
          <div className="row gap-8 center" style={{ height:"100%", borderBottom:"2px solid var(--accent)", padding:"0 4px" }}><span style={{ color:fileColor(file) }}><Icon name={fileIcon(file)} size={14}/></span><span style={{ fontSize:12.5, fontWeight:600 }}>{file.path.split("/").pop()}</span></div>
          <div className="row gap-8 center"><span className="t-faint mono" style={{ fontSize:11 }}>{file.lang}</span><button className="btn sm"><Icon name="download" size={13}/>Raw</button></div>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:"16px 14px", background:"var(--bg-inset)" }}><Code file={file}/></div>
        <div className="row between center" style={{ padding:"8px 16px", borderTop:"1px solid var(--line-soft)", flex:"none", background:"var(--bg-1)" }}>
          <span className="row gap-8 center"><Avatar who={file.last.by} size={18}/><span className="t-faint" style={{ fontSize:11.5 }}>last edit {file.last.when} · <span className="mono">{file.last.hash}</span></span></span>
          <span className="t-faint mono" style={{ fontSize:11 }}>{file.code.split("\n").length} lines</span>
        </div>
      </div>
      <Inspector file={file}/>
    </div>
  );
}
function HistoryTab(){
  const seen=new Set(); const log=[];
  FILES.forEach(f=>f.commits.forEach(c=>{ if(!seen.has(c.hash)){ seen.add(c.hash); log.push({...c, file:f.path.split("/").pop()}); } }));
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }} className="fade-in">
        <div className="eyebrow" style={{ marginBottom:6 }}>Repository · history</div>
        <h1 className="serif" style={{ fontSize:26, fontWeight:500, margin:"0 0 18px", letterSpacing:"-0.02em" }}>Commits on <span className="mono" style={{ fontSize:18 }}>main</span></h1>
        <div className="card" style={{ overflow:"hidden" }}>
          {log.map((c,i)=>(
            <div key={i} className="row gap-12 center" style={{ padding:"13px 16px", borderBottom: i<log.length-1?"1px solid var(--line-soft)":"none" }}>
              <span style={{ color:"var(--accent-2)" }}><Icon name="commit" size={17}/></span>
              <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.msg}</div><div className="t-faint" style={{ fontSize:11, marginTop:2 }}>{ANALYSTS[c.by]?.name||c.by} · {c.file}</div></div>
              <span className="mono" style={{ fontSize:11, color:"var(--accent-2)" }}>{c.hash}</span>
              <span className="t-faint mono" style={{ fontSize:11, width:54, textAlign:"right" }}>{c.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function BuildsTab(){
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:980, margin:"0 auto" }} className="fade-in">
        <div className="eyebrow" style={{ marginBottom:6 }}>Repository · CI</div>
        <h1 className="serif" style={{ fontSize:26, fontWeight:500, margin:"0 0 18px", letterSpacing:"-0.02em" }}>Builds &amp; checks</h1>
        <div className="card" style={{ overflow:"hidden" }}>
          <table className="tbl">
            <thead><tr><th>Build</th><th>Status</th><th>Branch</th><th>Commit</th><th>By</th><th>Datasets</th><th>Duration</th><th>When</th></tr></thead>
            <tbody>
              {BUILDS.map(b=>{ const m=BUILD[b.status]; return (
                <tr key={b.id}>
                  <td className="mono" style={{ color:"var(--text)" }}>{b.id}</td>
                  <td><Badge kind={m.kind} dot>{m.label}</Badge></td>
                  <td><span className="row gap-6 center"><Icon name="branch" size={13} style={{ color:"var(--text-faint)" }}/>{b.branch}</span></td>
                  <td className="mono" style={{ color:"var(--accent-2)" }}>{b.commit}</td>
                  <td><span className="row gap-7 center"><Avatar who={b.by} size={20}/>{nm(b.by)}</span></td>
                  <td className="mono">{b.datasets}</td><td className="mono">{b.dur}</td><td className="mono t-faint">{b.when}</td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function DriveTab(){
  const [path,setPath] = useState("/blackfrost");
  const entries = DRIVE[path] || [];
  const segs = path.split("/").filter(Boolean);
  function go(idx){ setPath("/"+segs.slice(0,idx+1).join("/")); }
  function open(e){ if(e.kind==="folder") setPath(path+"/"+e.name); }
  return (
    <div className="content" style={{ padding:"24px 28px 60px" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }} className="fade-in">
        <div className="row between center" style={{ marginBottom:16 }}>
          <div className="row gap-8 center">
            <span style={{ color:"var(--accent)" }}><Icon name="hdd" size={18}/></span>
            <div className="crumbs" style={{ fontSize:15 }}>
              <span className="c-mod" style={{ cursor:"pointer" }} onClick={()=>setPath("/blackfrost")}>Drive</span>
              {segs.map((s,i)=>(<React.Fragment key={i}><span className="sep"><Icon name="chevron" size={12}/></span><span className="c-leaf" style={{ cursor:"pointer", color:i===segs.length-1?"var(--text)":"var(--text-dim)" }} onClick={()=>go(i)}>{s}</span></React.Fragment>))}
            </div>
          </div>
          <div className="row gap-8"><button className="btn"><Icon name="download"/>Upload</button><button className="btn primary"><Icon name="plus"/>New dataset</button></div>
        </div>
        <ArtifactList count={entries.length} empty="Empty folder.">
          {entries.map((e,i)=>{
            const meta = [ e.kind==="folder"?`${e.items} items`:e.type, e.rows||e.size, e.mod ].filter(Boolean).join(" · ");
            return (
              <ArtifactRow key={i} icon={artifactIcon(e)} color={artifactColor(e)} name={e.name} meta={meta}
                onClick={()=>open(e)}
                badge={e.built && <span className="t-faint row gap-4 center" style={{ fontSize:10.5 }}><Icon name="code" size={11}/>{e.built}</span>}
                trailing={<>{e.owner && <span className="row gap-7 center t-dim" style={{ fontSize:12 }}><Avatar who={e.owner} size={20}/>{nm(e.owner)}</span>}{e.cls && <MarkingChip level={e.cls} size="sm"/>}{e.kind==="folder" && <span className="t-faint"><Icon name="chevron" size={15}/></span>}</>} />
            );
          })}
        </ArtifactList>
      </div>
    </div>
  );
}

export function CodeRepoView(){
  const [tab,setTab] = useState("code");
  const [bopen,setBopen] = useState(false);
  const [branch,setBranch] = useState(REPO.branch);
  const m=BUILD[REPO.build.status];
  return (
    <>
      <div style={{ flex:"none", background:"var(--bg-1)", borderBottom:"1px solid var(--line-soft)" }}>
        <div className="row between center" style={{ padding:"12px 28px 0" }}>
          <div className="row gap-12 center">
            <div className="row gap-8 center"><span style={{ color:"var(--accent)" }}><Icon name="code" size={18}/></span><span className="serif" style={{ fontSize:18 }}>{REPO.name}</span></div>
            <div style={{ position:"relative" }}>
              <button className="chip" onClick={()=>setBopen(o=>!o)}><Icon name="branch" size={13}/>{branch}<Icon name="chevDown" size={12}/></button>
              {bopen && <div className="panel" style={{ position:"absolute", top:"110%", left:0, zIndex:30, padding:6, minWidth:200, boxShadow:"var(--shadow-3)" }}>
                {REPO.branches.map(b=><button key={b} className="row gap-8 center" onClick={()=>{setBranch(b);setBopen(false);}} style={{ width:"100%", border:"none", background: b===branch?"var(--accent-ghost)":"none", borderRadius:7, padding:"8px 10px", cursor:"pointer", textAlign:"left", color:"var(--text)", fontSize:12.5 }}><Icon name="branch" size={13} style={{ color:"var(--text-faint)" }}/>{b}{b===branch&&<span style={{ marginLeft:"auto", color:"var(--accent)" }}><Icon name="check" size={13}/></span>}</button>)}
              </div>}
            </div>
            <Badge kind={m.kind} dot>build {m.label}</Badge>
            <span className="t-faint mono" style={{ fontSize:11 }}>{REPO.ahead} ahead · {REPO.build.commit}</span>
          </div>
          <div className="row gap-8"><button className="btn sm"><Icon name="commit" size={14}/>Commit</button><button className="btn sm"><Icon name="branch" size={14}/>Open PR</button><button className="btn primary sm"><Icon name="play" size={14}/>Build</button></div>
        </div>
        <div className="row gap-2" style={{ padding:"10px 28px 0" }}>
          {(()=>{ const T=[["code","Code"],["history","History"],["builds","Builds"],["drive","Drive"]];
            return <Tabs items={T.map(([,l])=>({ label:l }))} value={T.findIndex(([k])=>k===tab)} onChange={i=>setTab(T[i][0])} />; })()}
        </div>
      </div>
      {tab==="code" && <CodeTab/>}
      {tab==="history" && <HistoryTab/>}
      {tab==="builds" && <BuildsTab/>}
      {tab==="drive" && <DriveTab/>}
    </>
  );
}
