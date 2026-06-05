import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — TimeScrubber + useTimeline (regenerado)
   Control temporal compartido por GraphView y MapView.
   El reloj vive en la VENTANA real de la investigación [start, end],
   no en [0, end]: con epoch-ms absolutos, el rango con datos sería un
   ~0.5% del control y arrastrarlo vaciaría el grafo casi al instante.
   Forma preferida: useTimeline(T_START, T_END). La forma de un solo
   argumento se mantiene como legado → [0, arg].
   ============================================================ */
export function useTimeline(tStart, tEnd) {
  const start = tEnd == null ? 0 : tStart;
  const end = tEnd == null ? (tStart || 100) : tEnd;
  const [t, setT] = useState(end);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(null);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now) => {
      const dt = now - last; last = now;
      setT((v) => {
        const nv = v + dt * ((end - start) / 6000); // recorre la ventana en ~6s
        if (nv >= end) { setPlaying(false); return end; }
        return nv;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, start, end]);
  // Pulsar Play estando parado al final reinicia desde el inicio de la ventana,
  // para que el control sea usable (si no, "play" en el extremo no haría nada).
  const togglePlay = useCallback((p) => {
    setPlaying((cur) => {
      const next = typeof p === 'function' ? p(cur) : p;
      if (next) setT((v) => (v >= end ? start : v));
      return next;
    });
  }, [start, end]);
  return [t, setT, playing, togglePlay];
}

export function TimeScrubber({ value, onChange, playing, setPlaying, width, min = 0 }) {
  const { t } = useI18n();
  const maxRef = useRef(min + 1);
  if (value > maxRef.current) maxRef.current = value;
  const max = maxRef.current;
  const span = Math.max(1, max - min);
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 12px", width: width || 560, background: "var(--bg-1)" }}>
      <button className="icon-btn" onClick={() => setPlaying((p) => !p)} title={playing ? t('Pause') : t('Play')}
        style={{ color: playing ? "var(--accent)" : "var(--text-dim)" }}><Icon name="play" /></button>
      <span className="live-dot" style={{ opacity: playing ? 1 : 0.25 }} />
      <input type="range" min={min} max={max} step={span / 200} value={Math.min(Math.max(value, min), max)}
        onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: "var(--accent)" }} />
      <span className="mono t-faint" style={{ fontSize: 11, width: 64, textAlign: "right" }}>
        {Math.round(((value - min) / span) * 100)}%
      </span>
    </div>
  );
}
