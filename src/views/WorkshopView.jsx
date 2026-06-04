import { Icon, SectionHead, PageHeader } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';

/* ============================================================
   AXIOM — WorkshopView
   Builder for mini-apps over the ontology (gallery + templates).
   (UX-01: English source + i18n.)
   ============================================================ */
const APPS = [
  { name: "Alert review", desc: "Triage queue with one-click escalate", icon: "bell", color: "var(--alert)", tag: "Operational" },
  { name: "Vessel panel", desc: "360° profile + embedded AIS track", icon: "ship", color: "var(--accent)", tag: "Maritime" },
  { name: "KYC express", desc: "Form → entity resolution → risk", icon: "merge", color: "var(--violet)", tag: "Onboarding" },
  { name: "UBO request", desc: "Beneficial-ownership request workflow", icon: "doc", color: "var(--warn)", tag: "Legal" },
];
const TEMPLATES = [
  { name: "Form → Object", icon: "table" }, { name: "Approval queue", icon: "check" },
  { name: "Map + table", icon: "globe" }, { name: "Blank canvas", icon: "plus" },
];
export function WorkshopView() {
  const { t } = useI18n();
  return (
    <div className="content" style={{ padding: "var(--page-py) var(--page-px) 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }} className="fade-in">
        <PageHeader eyebrow={t('Decide & Act')} title={t('Workshop')} sub={t('Operational applications')}>
          <button className="btn primary"><Icon name="plus" />{t('New app')}</button>
        </PageHeader>
        <SectionHead eyebrow={t('Published')} title={t('Your apps')} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14, marginBottom: 36 }}>
          {APPS.map((a) => (
            <div key={a.name} className="card hover" style={{ padding: 18, cursor: "pointer" }}>
              <div className="row between center" style={{ marginBottom: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: `color-mix(in oklab, ${a.color} 16%, var(--bg-2))`, color: a.color }}><Icon name={a.icon} size={21} /></span>
                <span className="badge">{t(a.tag)}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t(a.name)}</div>
              <div className="t-faint" style={{ fontSize: 12.5, marginTop: 4 }}>{t(a.desc)}</div>
            </div>
          ))}
        </div>
        <SectionHead eyebrow={t('Templates')} title={t('Start from')} />
        <div className="row gap-12 wrap">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.name} className="card hover" style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--bg-2)", color: "var(--accent)" }}><Icon name={tpl.icon} size={17} /></span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t(tpl.name)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
