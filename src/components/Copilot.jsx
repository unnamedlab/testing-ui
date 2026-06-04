import { useEffect, useRef, useState } from 'react';
import { ENTITY_BY_ID } from '../data/data.js';
import { Icon, RiskPill, TypeGlyph } from './ui.jsx';
import { complete, isModelAvailable } from '../services/claude.js';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — AI Copilot (natural-language query, AIP-style)
   Uses the claude service (services/claude.js) when a model
   provider is available; scripted structured results for
   recognized investigative queries.
   ============================================================ */

export const COPILOT_SUGGESTIONS = [
  "Vessels that called Novorossiysk and moved >$1M",
  "Who ultimately controls Helios Maritime?",
  "Summarize the BLACKFROST network risk",
  "Show all layering transactions this month",
];

// scripted structured results for recognized intents
export function matchIntent(q){
  const s = q.toLowerCase();
  if(/novoross|>?\$?1m|vessel.*million|million.*vessel/.test(s) && /vessel|ship|novoross|million|1m/.test(s)){
    return {
      text: "Found **1 vessel** that called Novorossiysk (RUNVS) and is linked to transactions over $1M. MV Blackfrost made 2 calls and is operationally tied to wires totaling $20.4M through Helios Maritime.",
      entities: ["v-blackfrost","f-novoross","a-helios-eur","o-helios"],
      actions: [["graph","Open as link chart","graph"],["map","Show on map","globe"]],
    };
  }
  if(/control|owner|ubo|who.*helios|behind/.test(s)){
    return {
      text: "**Viktor Sørensen** ultimately controls Helios Maritime Ltd through a 2-layer chain: Sørensen → Northwind Holdings (BVI) → Helios Maritime (Cyprus). Both entities were formed by the same agent, Castor Corp Services.",
      entities: ["p-sorenson","o-northwind","o-helios","o-castor"],
      actions: [["graph","Trace ownership in graph","graph"]],
    };
  }
  if(/layer|launder|structuring|this month|transactions/.test(s)){
    return {
      text: "**3 layering chains** detected in the last 30 days, moving $20.4M between Aurora Trading and Helios Maritime across 3–5 hops. The largest single chain is TXN-88241 ($4.82M, 3 hops).",
      entities: ["a-aurora-usd","a-helios-eur","o-aurora"],
      actions: [["dashboard","View flagged transactions","layers"]],
    };
  }
  if(/summar|risk|overview|brief/.test(s)){
    return {
      text: "**BLACKFROST network risk: 84 / Critical.** A Cyprus–UAE shell structure (Helios, Aurora, Northwind) operates 2 vessels engaged in suspected sanctions evasion. Maritime risk (90) is driven by AIS gaps near sanctioned ports; financial risk (78) by layered trade-finance flows. 12 alerts open, 3 critical.",
      entities: ["p-sorenson","o-helios","v-blackfrost","a-aurora-usd"],
      actions: [["dashboard","Open operations dashboard","layers"],["graph","Open link chart","graph"]],
    };
  }
  return null;
}

export function ResultCard({ res, openEntity, go }){
  const { t } = useI18n();
  return (
    <div className="card" style={{ padding:14, marginTop:10, background:"var(--bg-2)" }}>
      {res.entities && (
        <>
          <div className="eyebrow" style={{ marginBottom:8 }}>{t('Matched objects')} · {res.entities.length}</div>
          <div className="col gap-2" style={{ marginBottom:12 }}>
            {res.entities.map(id=>{ const e=ENTITY_BY_ID[id]; if(!e) return null; return (
              <button key={id} onClick={()=>openEntity(id)} className="row gap-10 center hov" style={{ padding:"6px", border:"none", borderRadius:8, cursor:"pointer", textAlign:"left" }}>
                <TypeGlyph type={e.type} size={26}/>
                <span style={{ flex:1, minWidth:0, fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.name}</span>
                <RiskPill r={e.risk}/>
              </button>
            );})}
          </div>
        </>
      )}
      <div className="row gap-8 wrap">
        {res.actions?.map(([v,label,ic])=>(
          <button key={v} className="btn sm" onClick={()=>go(v)}><Icon name={ic} size={14}/>{t(label)}</button>
        ))}
      </div>
    </div>
  );
}

export function mdToHtml(t){
  return t.replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/\*\*(.+?)\*\*/g,"<b style='color:var(--text)'>$1</b>")
    .replace(/\n/g,"<br/>");
}

export function Copilot({ open, onClose, go, openEntity }){
  const { t } = useI18n();
  const [msgs, setMsgs] = useState([
    { role:"ai", text:"I'm your AXIOM analyst copilot. Ask about entities, money flows, vessels or the network — I'll query the ontology and link results back to the graph." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, busy]);

  async function send(text){
    const q = (text ?? input).trim(); if(!q || busy) return;
    setInput(""); setMsgs(m=>[...m,{role:"user",text:q}]); setBusy(true);
    const intent = matchIntent(q);
    if(intent){
      setTimeout(()=>{ setMsgs(m=>[...m,{role:"ai", text:intent.text, result:intent}]); setBusy(false); }, 650);
      return;
    }
    // free-form → real model if available
    try{
      if(isModelAvailable()){
        const prompt = "You are AXIOM, an intelligence-analysis copilot working a sanctions-evasion case named BLACKFROST (entities: Viktor Sørensen, Helios Maritime, Aurora Trading, Northwind Holdings, MV Blackfrost, ports Novorossiysk/Limassol/Jebel Ali). Answer the analyst concisely (max 90 words), in an investigative tone. Question: "+q;
        const out = await complete(prompt);
        setMsgs(m=>[...m,{role:"ai", text: out || "No response."}]); setBusy(false);
      } else {
        setTimeout(()=>{ setMsgs(m=>[...m,{role:"ai", text:"I can run that against the ontology in a live deployment. For this demo, try one of the suggested investigative queries below."}]); setBusy(false); }, 500);
      }
    }catch{
      setMsgs(m=>[...m,{role:"ai", text:"Query service unavailable in this preview. Try a suggested query."}]); setBusy(false);
    }
  }

  if(!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:130, background:"var(--scrim-soft)", backdropFilter:"var(--scrim-blur)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", top:0, right:0, bottom:0, width:420, background:"var(--bg-1)",
        borderLeft:"1px solid var(--line)", boxShadow:"var(--shadow-3)", display:"flex", flexDirection:"column", animation:"slideIn .26s both" }}>
        <div className="row between center" style={{ padding:"14px 18px", borderBottom:"1px solid var(--line-soft)" }}>
          <div className="row gap-10 center">
            <div style={{ width:32,height:32,borderRadius:9,display:"grid",placeItems:"center",background:"linear-gradient(150deg,var(--accent),var(--accent-2))",color:"var(--accent-text)" }}><Icon name="sparkles" size={18}/></div>
            <div><div style={{ fontSize:14, fontWeight:600 }}>Copilot</div><div className="t-faint" style={{ fontSize:11 }}>{t('AIP · ontology-aware')}</div></div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width:30,height:30 }}><Icon name="plus" size={16} style={{ transform:"rotate(45deg)" }}/></button>
        </div>

        <div ref={scrollRef} style={{ flex:1, overflow:"auto", padding:18 }}>
          {msgs.map((m,i)=>(
            <div key={i} style={{ marginBottom:16, display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth: m.role==="user"?"82%":"100%" }}>
                <div style={{ padding: m.role==="user"?"9px 13px":"0", borderRadius:12,
                  background: m.role==="user"?"var(--accent)":"transparent", color: m.role==="user"?"var(--accent-text)":"var(--text)",
                  fontSize:13.5, lineHeight:1.55 }}
                  dangerouslySetInnerHTML={{ __html: m.role==="user"? m.text : mdToHtml(t(m.text)) }} />
                {m.result && <ResultCard res={m.result} openEntity={(id)=>{onClose();openEntity(id);}} go={(v)=>{onClose();go(v);}} />}
              </div>
            </div>
          ))}
          {busy && <div className="row gap-6 center t-faint" style={{ fontSize:13 }}><span className="live-dot" style={{ background:"var(--accent)" }}/>{t('Querying ontology…')}</div>}
        </div>

        <div style={{ padding:"0 16px 10px" }}>
          <div className="row gap-6 wrap" style={{ marginBottom:10 }}>
            {COPILOT_SUGGESTIONS.map(s=><button key={s} className="chip" style={{ fontSize:11.5, height:24 }} onClick={()=>send(s)}>{t(s)}</button>)}
          </div>
          <div className="row gap-8 center" style={{ background:"var(--bg-inset)", border:"1px solid var(--line)", borderRadius:11, padding:"6px 6px 6px 12px" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}}
              placeholder={t('Ask the ontology…')} style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontFamily:"var(--font-ui)", fontSize:13.5 }} />
            <button className="btn primary sm" style={{ width:34, padding:0 }} onClick={()=>send()} disabled={busy}><Icon name="arrowRight" size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
