import { useState } from 'react';
import { ENTITIES, TYPE_BY_ID } from '../data/data.js';
import { Icon, TypeGlyph, RiskPill, PageHeader, EmptyState } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — ResolveView
   Entity-resolution queue: candidate pairs to merge.
   (UX-01: fully i18n'd.)
   ============================================================ */
function buildPairs() {
  const pairs = [];
  const byType = {};
  ENTITIES.forEach((e) => { (byType[e.type] = byType[e.type] || []).push(e); });
  Object.values(byType).forEach((list) => {
    for (let i = 0; i + 1 < list.length && pairs.length < 8; i += 2) {
      pairs.push({ id: list[i].id + "~" + list[i + 1].id, a: list[i], b: list[i + 1], conf: 0.7 + ((i * 7) % 28) / 100 });
    }
  });
  return pairs;
}

export function ResolveView() {
  const { t } = useI18n();
  const [pairs, setPairs] = useState(buildPairs);
  function resolve(id) { setPairs((p) => p.filter((x) => x.id !== id)); }
  return (
    <div className="content" style={{ padding: "var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Explore & Model')} title={t('Entity Resolution')}
          sub={t('Object pairs the engine believes are the same entity. Confirm or split them.')} />

        <div className="col" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pairs.map((p) => (
            <div key={p.id} className="card" style={{ padding: 16 }}>
              <div className="row between center" style={{ marginBottom: 14 }}>
                <span className="badge accent"><span className="dt" />{t('candidate')} · {Math.round(p.conf * 100)}%</span>
                <span className="t-faint mono" style={{ fontSize: 11 }}>{TYPE_BY_ID[p.a.type] ? t(TYPE_BY_ID[p.a.type].name) : p.a.type}</span>
              </div>
              <div className="row gap-16 center" style={{ marginBottom: 14 }}>
                <div className="row gap-10 center" style={{ flex: 1, minWidth: 0 }}><TypeGlyph type={p.a.type} size={34} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{p.a.name}</div><div className="t-faint" style={{ fontSize: 12 }}>{p.a.sub}</div></div><RiskPill r={p.a.risk} /></div>
                <span className="t-faint"><Icon name="merge" size={18} /></span>
                <div className="row gap-10 center" style={{ flex: 1, minWidth: 0 }}><TypeGlyph type={p.b.type} size={34} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{p.b.name}</div><div className="t-faint" style={{ fontSize: 12 }}>{p.b.sub}</div></div><RiskPill r={p.b.risk} /></div>
              </div>
              <div className="row gap-8" style={{ justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => resolve(p.id)}><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />{t('Not the same')}</button>
                <button className="btn primary" onClick={() => resolve(p.id)}><Icon name="merge" size={14} />{t('Merge')}</button>
              </div>
            </div>
          ))}
          {pairs.length === 0 && <EmptyState title={t('Queue empty — nothing pending resolution.')} />}
        </div>
      </div>
    </div>
  );
}
