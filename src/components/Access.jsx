import { useState } from 'react';
import { Icon, EmptyState } from './ui.jsx';
import { MarkingChip } from './Security.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — Access primitives (consolidación · clúster F)
   UNA sola implementación de la UI de acceso/permisos/roles,
   parametrizada por alcance. Reemplaza las copias casi idénticas
   que vivían en ProjectsView (Access/Members), AdminView (Roles)
   y GovernanceView (Access review).
     · AccessMatrix    — matriz de capacidades (roles × permisos)
     · RoleCard        — tarjeta de rol (scope o badges de permisos)
     · AccessRequests  — cola de solicitudes de acceso (grant/deny)
   ============================================================ */

// Solicitudes de acceso (antes inline en GovernanceView). `proj` permite
// filtrarlas por proyecto para la pestaña Access del workspace.
export const ACCESS_REQUESTS = [
  { who: "J. Okafor",        role: "Read only",    scope: "Case BLACKFROST",        reason: "Cross-team liaison review",        cls: "SECRET", proj: "blackfrost" },
  { who: "L. Marsh",         role: "Read · Write", scope: "Aurora Trading FZE",      reason: "Assigned as co-investigator",      cls: "SECRET", proj: "blackfrost" },
  { who: "Partner — FININT", role: "Read only",    scope: "Dossier AXM-BLACKFROST", reason: "Information-sharing agreement",     cls: "SECRET", proj: "blackfrost" },
];

// ---- AccessMatrix: roles × capacidades (✓ / ·) ----
export function AccessMatrix({ caps, rows }) {
  const { t } = useI18n();
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <table className="tbl">
        <thead><tr><th>{t('Role')}</th>{caps.map(c => <th key={c} style={{ textAlign: "center" }}>{t(c)}</th>)}</tr></thead>
        <tbody>
          {rows.map(([role, cs]) => (
            <tr key={role}>
              <td style={{ color: "var(--text)", fontWeight: 600 }}>{t(role)}</td>
              {cs.map((on, i) => (
                <td key={i} style={{ textAlign: "center" }}>
                  {on ? <span style={{ color: "var(--ok)", display: "inline-grid", placeItems: "center" }}><Icon name="check" size={15} /></span>
                      : <span style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>·</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- RoleCard: una tarjeta de rol. `scope` (texto) o `perms` (badges). ----
export function RoleCard({ name, meta, scope, perms }) {
  const { t } = useI18n();
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row between center" style={{ marginBottom: (scope || perms) ? 9 : 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t(name)}</span>
        {meta != null && <span className="t-faint mono" style={{ fontSize: 11 }}>{meta}</span>}
      </div>
      {scope && <div className="t-dim" style={{ fontSize: 12.5 }}>{t(scope)}</div>}
      {perms && <div className="row gap-6 wrap">{perms.map(p => <span key={p} className="badge" style={{ fontSize: 9.5 }}>{t(p)}</span>)}</div>}
    </div>
  );
}

// ---- AccessRequests: cola de solicitudes (grant/deny). Misma UI en
// Governance (global) y en la pestaña Access del proyecto (con scope). ----
export function AccessRequests({ requests, title }) {
  const { t } = useI18n();
  const [reqs, setReqs] = useState(requests || []);
  function resolve(i) { setReqs(rs => rs.filter((_, j) => j !== i)); }
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{title ? t(title) : t('Pending access requests · {n}', { n: reqs.length })}</div>
      <div className="col gap-10">
        {reqs.map((r, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div className="row between center" style={{ marginBottom: 10 }}>
              <div className="row gap-10 center">
                <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--bg-2)", display: "grid", placeItems: "center", color: "var(--text-dim)", fontSize: 12, fontWeight: 600 }}>{r.who.split(" ").map(w => w[0]).slice(0, 2).join("")}</span>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{r.who}</div><div className="t-faint" style={{ fontSize: 12 }}>{t('requests')} <b style={{ color: "var(--text-dim)" }}>{t(r.role)}</b> · {t(r.scope)}</div></div>
              </div>
              <MarkingChip level={r.cls} />
            </div>
            <div className="t-dim" style={{ fontSize: 12.5, marginBottom: 12, paddingLeft: 2 }}>“{t(r.reason)}”</div>
            <div className="row gap-8">
              <button className="btn primary sm" onClick={() => resolve(i)}><Icon name="check" size={13} />{t('Grant')}</button>
              <button className="btn sm" onClick={() => resolve(i)}>{t('Deny')}</button>
            </div>
          </div>
        ))}
        {reqs.length === 0 && <EmptyState title={t('No pending requests')} />}
      </div>
    </div>
  );
}
