import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — TimeScrubber + useTimeline (regenerado)
   Control temporal compartido por GraphView y MapView.
   ============================================================ */
export function useTimeline(tEnd) {
  const end = tEnd || 100;
  const [t, setT] = useState(end);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(null);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now) => {
      const dt = now - last; last = now;
      setT((v) => {
        const nv = v + dt * (end / 6000); // recorre el rango en ~6s
        if (nv >= end) { setPlaying(false); return end; }
        return nv;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, end]);
  return [t, setT, playing, setPlaying];
}

export function TimeScrubber({ value, onChange, playing, setPlaying, width }) {
  const { t } = useI18n();
  const maxRef = useRef(1);
  if (value > maxRef.current) maxRef.current = value;
  const max = maxRef.current || 1;
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 12px", width: width || 560, background: "var(--bg-1)" }}>
      <button className="icon-btn" onClick={() => setPlaying((p) => !p)} title={playing ? t('Pause') : t('Play')}
        style={{ color: playing ? "var(--accent)" : "var(--text-dim)" }}><Icon name="play" /></button>
      <span className="live-dot" style={{ opacity: playing ? 1 : 0.25 }} />
      <input type="range" min="0" max={max} step={max / 200} value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: "var(--accent)" }} />
      <span className="mono t-faint" style={{ fontSize: 11, width: 64, textAlign: "right" }}>
        {Math.round((value / max) * 100)}%
      </span>
    </div>
  );
}
