import { useEffect, useRef, useState } from 'react';
import { DAY, TIME_EVENTS, T_END, T_START, dstr } from '../data/data_ext.js';
import { Icon } from './ui.jsx';

/* ============================================================
   AXIOM — Time scrubber (temporal analysis)
   ============================================================ */

export function TimeScrubber({ value, onChange, playing, setPlaying, width }) {
  const trackRef = useRef(null);
  const span = T_END - T_START;
  const pct = ((value - T_START) / span) * 100;

  // playback
  useEffect(()=>{
    if(!playing) return;
    const iv = setInterval(()=>{
      onChange(v => {
        const next = v + DAY*2;
        if (next >= T_END) { setPlaying(false); return T_END; }
        return next;
      });
    }, 120);
    return ()=>clearInterval(iv);
  }, [playing]);

  function seek(clientX){
    const r = trackRef.current.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left)/r.width));
    onChange(T_START + p*span);
  }
  function onDown(e){
    seek(e.clientX);
    const mv = ev=>seek(ev.clientX);
    const up = ()=>{ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); };
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up);
  }

  return (
    <div className="panel" style={{ width: width||620, padding:"10px 14px 12px", boxShadow:"var(--shadow-2)" }}>
      <div className="row gap-12 center" style={{ marginBottom:8 }}>
        <button className="btn primary sm" style={{ width:32, padding:0 }} onClick={()=>setPlaying(p=>!p)}>
          <Icon name={playing?"check":"play"} size={15} style={playing?{}:{transform:"translateX(1px)"}}/>
        </button>
        <div className="col" style={{ lineHeight:1.2 }}>
          <span className="mono" style={{ fontSize:14, fontWeight:600 }}>{dstr(value)}</span>
          <span className="eyebrow" style={{ marginTop:1 }}>Temporal cursor</span>
        </div>
        <div className="grow" />
        <button className="chip" onClick={()=>{ onChange(T_END); setPlaying(false); }}>Now</button>
        <span className="t-faint mono" style={{ fontSize:10.5 }}>{dstr(T_START)} → {dstr(T_END)}</span>
      </div>
      <div ref={trackRef} onPointerDown={onDown} style={{ position:"relative", height:30, cursor:"pointer", userSelect:"none" }}>
        {/* base line */}
        <div style={{ position:"absolute", left:0, right:0, top:14, height:4, borderRadius:4, background:"var(--bg-3)" }}/>
        {/* filled */}
        <div style={{ position:"absolute", left:0, width:pct+"%", top:14, height:4, borderRadius:4, background:"var(--accent)" }}/>
        {/* event ticks */}
        {TIME_EVENTS.map((ev,i)=>{
          const ep = (ev.d*DAY/span)*100;
          return <div key={i} title={ev.label} style={{ position:"absolute", left:ep+"%", top:9,
            width:2, height:14, background:`var(--${ev.sev==="alert"?"alert":ev.sev==="warn"?"warn":"info"})`, borderRadius:2,
            transform:"translateX(-1px)" }}/>;
        })}
        {/* handle */}
        <div style={{ position:"absolute", left:pct+"%", top:8, width:16, height:16, borderRadius:"50%",
          background:"var(--accent)", border:"3px solid var(--bg-1)", transform:"translateX(-8px)",
          boxShadow:"0 0 10px -1px var(--accent)" }}/>
      </div>
    </div>
  );
}

// hook: returns [t, setT, playing, setPlaying]
export function useTimeline(initial){
  const [t, setT] = useState(initial ?? T_END);
  const [playing, setPlaying] = useState(false);
  return [t, setT, playing, setPlaying];
}
