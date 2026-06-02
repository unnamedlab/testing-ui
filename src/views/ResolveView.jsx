import { useState } from 'react';
import { TYPE_BY_ID } from '../data/data.js';
import { Badge, Gauge, Icon, TypeGlyph } from '../components/ui.jsx';

/* ============================================================
   AXIOM — Entity Resolution review queue
   ============================================================ */

export const ER_CANDIDATES = [
  { id:"er1", type:"person", score:95, a:{name:"Viktor Sørensen", src:"Corp. Registry"}, b:{name:"V. Sorensen «Frost»", src:"SIGINT metadata"},
    rows:[["Full name","Viktor Sørensen","V. Sorensen",false],["Date of birth","1971-03-14","1971-03-14",true],["Nationality","Norway, Cyprus","Norway",false],["Passport","NOR ····417","NOR ····417",true],["Known alias","—","«Frost»",false]] },
  { id:"er2", type:"org", score:92, a:{name:"Helios Maritime Ltd", src:"Corp. Registry"}, b:{name:"Helios Maritime Limited", src:"Customs Manifests"},
    rows:[["Legal name","Helios Maritime Ltd","Helios Maritime Limited",false],["Jurisdiction","Cyprus","Cyprus",true],["Reg. number","HE·····4471","HE·····4471",true],["Incorporated","2016-05-12","2016-05",true]] },
  { id:"er3", type:"org", score:88, a:{name:"Aurora Trading FZE", src:"Corp. Registry"}, b:{name:"Aurora Trading F.Z.E.", src:"SWIFT MT103"},
    rows:[["Legal name","Aurora Trading FZE","Aurora Trading F.Z.E.",false],["Jurisdiction","UAE","UAE",true],["Director","E. Marchetti","Elena Marchetti",false],["Account","AE·····9920","AE·····9920",true]] },
  { id:"er4", type:"vessel", score:84, a:{name:"MV Blackfrost", src:"AIS Vessel Feed"}, b:{name:"MV Black Frost", src:"Customs Manifests"},
    rows:[["Name","MV Blackfrost","MV Black Frost",false],["IMO","9583217","9583217",true],["Flag","Cook Is.","Panama",false],["DWT","74,200","74,200",true]] },
  { id:"er5", type:"person", score:71, a:{name:"Yusuf Haddad", src:"OSINT"}, b:{name:"Yousef Haddad", src:"SIGINT metadata"},
    rows:[["Full name","Yusuf Haddad","Yousef Haddad",false],["Nationality","Lebanon","Lebanon",true],["Role","Money services","Financial facilitator",false],["Phone","—","+961 ··· 4471",false]] },
];

export function ResolveView(){
  const [queue, setQueue] = useState(ER_CANDIDATES);
  const [idx, setIdx] = useState(0);
  const [resolved, setResolved] = useState({ merged:0, rejected:0 });
  const c = queue[idx];

  function decide(kind){
    setResolved(r=>({ ...r, [kind==="merge"?"merged":"rejected"]: r[kind==="merge"?"merged":"rejected"]+1 }));
    setQueue(q=>{ const n=q.filter((_,i)=>i!==idx); return n; });
    setIdx(i=> Math.min(i, queue.length-2<0?0:queue.length-2));
  }

  return (
    <div className="content" style={{ display:"grid", gridTemplateColumns:"300px 1fr", overflow:"hidden", height:"100%" }}>
      {/* queue */}
      <aside style={{ borderRight:"1px solid var(--line-soft)", background:"var(--bg-1)", overflow:"auto" }}>
        <div style={{ padding:"16px 16px 10px" }}>
          <div className="eyebrow">Resolution queue</div>
          <div className="row gap-8 center" style={{ marginTop:8 }}>
            <Badge kind="accent">{queue.length} pending</Badge>
            <span className="t-faint mono" style={{ fontSize:11 }}>{resolved.merged} merged · {resolved.rejected} rejected</span>
          </div>
        </div>
        <div style={{ padding:"0 8px 16px" }}>
          {queue.map((q,i)=>(
            <button key={q.id} onClick={()=>setIdx(i)} className="row gap-10 center" style={{ width:"100%", border:"none", textAlign:"left", cursor:"pointer",
              background: i===idx?"var(--accent-ghost)":"none", borderRadius:9, padding:"10px", boxShadow: i===idx?"inset 0 0 0 1px var(--accent-dim)":"none" }}>
              <TypeGlyph type={q.type} size={30}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{q.a.name}</div>
                <div className="t-faint" style={{ fontSize:11 }}>{q.rows.length} attributes</div>
              </div>
              <span className={"badge "+(q.score>=90?"ok":q.score>=80?"warn":"alert")} style={{ minWidth:40, justifyContent:"center" }}>{q.score}%</span>
            </button>
          ))}
          {queue.length===0 && <div className="col center" style={{ padding:"40px 0", gap:10, color:"var(--text-faint)" }}><Icon name="check" size={24}/><span style={{ fontSize:13 }}>Queue cleared</span></div>}
        </div>
      </aside>

      {/* comparison */}
      <div style={{ overflow:"auto", padding:"24px 28px 60px" }}>
        {c ? (
          <div style={{ maxWidth:820, margin:"0 auto" }} className="fade-in" key={c.id}>
            <div className="row between center" style={{ marginBottom:8 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="eyebrow" style={{ marginBottom:6 }}>Candidate match · {TYPE_BY_ID[c.type].name}</div>
                <h1 className="serif" style={{ fontSize:26, fontWeight:500, margin:0 }}>Are these the same {c.type}?</h1>
              </div>
              <div className="col" style={{ alignItems:"flex-end" }}>
                <Gauge value={c.score} label={c.score+"%"} sub="match" size={84} color={c.score>=90?"var(--ok)":c.score>=80?"var(--warn)":"var(--alert)"} />
              </div>
            </div>

            <div className="card" style={{ overflow:"hidden", marginTop:14 }}>
              <div className="row" style={{ borderBottom:"1px solid var(--line)" }}>
                {[c.a,c.b].map((rec,k)=>(
                  <div key={k} style={{ flex:1, padding:"14px 16px", borderLeft: k?"1px solid var(--line)":"none" }}>
                    <div className="row gap-10 center"><TypeGlyph type={c.type} size={34}/>
                      <div style={{ minWidth:0 }}><div style={{ fontSize:14, fontWeight:600 }}>{rec.name}</div><div className="t-faint mono" style={{ fontSize:11 }}>via {rec.src}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              {c.rows.map((row,i)=>(
                <div key={i} className="row" style={{ borderBottom: i<c.rows.length-1?"1px solid var(--line-soft)":"none", background: row[3]?"transparent":"var(--warn-ghost)" }}>
                  <div style={{ width:130, flex:"none", padding:"11px 16px" }} className="t-faint mono"><span style={{ fontSize:11 }}>{row[0]}</span></div>
                  <div style={{ flex:1, padding:"11px 16px", fontSize:13, color:"var(--text)" }}>{row[1]}</div>
                  <div style={{ flex:1, padding:"11px 16px", fontSize:13, color:"var(--text)", borderLeft:"1px solid var(--line-soft)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>{row[2]}</span>
                    <span style={{ color: row[3]?"var(--ok)":"var(--warn)" }}><Icon name={row[3]?"check":"alertTri"} size={15}/></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="row gap-10" style={{ marginTop:18, justifyContent:"flex-end" }}>
              <button className="btn" onClick={()=>setIdx(i=>(i+1)%Math.max(1,queue.length))}><Icon name="arrowRight"/>Skip</button>
              <button className="btn" onClick={()=>decide("reject")}><Icon name="plus" size={16} style={{transform:"rotate(45deg)"}}/>Not a match</button>
              <button className="btn primary" onClick={()=>decide("merge")}><Icon name="merge"/>Merge objects</button>
            </div>
          </div>
        ) : (
          <div className="col center" style={{ height:"100%", gap:14, color:"var(--text-faint)" }}>
            <div style={{ width:64,height:64,borderRadius:16,display:"grid",placeItems:"center",background:"var(--ok-ghost)",color:"var(--ok)" }}><Icon name="check" size={30}/></div>
            <div className="serif" style={{ fontSize:22, color:"var(--text)" }}>Queue cleared</div>
            <div style={{ fontSize:13.5 }}>{resolved.merged} objects merged · {resolved.rejected} kept separate.</div>
          </div>
        )}
      </div>
    </div>
  );
}
