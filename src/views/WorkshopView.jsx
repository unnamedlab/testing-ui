import { Icon, SectionHead } from '../components/ui.jsx';

/* ============================================================
   AXIOM — WorkshopView (regenerado)
   Constructor de mini-apps sobre la ontología (galería + plantillas).
   ============================================================ */
const APPS = [
  { name: "Revisión de alertas", desc: "Cola de triaje con un clic para escalar", icon: "bell", color: "var(--alert)", tag: "Operativa" },
  { name: "Panel de buque", desc: "Ficha 360° + track AIS embebido", icon: "ship", color: "var(--accent)", tag: "Marítima" },
  { name: "KYC express", desc: "Formulario → resolución de entidad → riesgo", icon: "merge", color: "var(--violet)", tag: "Onboarding" },
  { name: "Solicitud de UBO", desc: "Workflow de petición de titularidad real", icon: "doc", color: "var(--warn)", tag: "Legal" },
];
const TEMPLATES = [
  { name: "Formulario → Objeto", icon: "table" }, { name: "Cola de aprobación", icon: "check" },
  { name: "Mapa + tabla", icon: "globe" }, { name: "Lienzo en blanco", icon: "plus" },
];
export function WorkshopView() {
  return (
    <div className="content" style={{ padding: "24px 28px 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }} className="fade-in">
        <div className="row between" style={{ alignItems: "flex-end", marginBottom: 22 }}>
          <div><div className="eyebrow" style={{ marginBottom: 6 }}>Workshop</div><h1 className="serif" style={{ fontSize: 30, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>Aplicaciones operativas</h1></div>
          <button className="btn primary"><Icon name="plus" />Nueva app</button>
        </div>
        <SectionHead eyebrow="Publicadas" title="Tus apps" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14, marginBottom: 36 }}>
          {APPS.map((a) => (
            <div key={a.name} className="card hover" style={{ padding: 18, cursor: "pointer" }}>
              <div className="row between center" style={{ marginBottom: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: `color-mix(in oklab, ${a.color} 16%, var(--bg-2))`, color: a.color }}><Icon name={a.icon} size={21} /></span>
                <span className="badge">{a.tag}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{a.name}</div>
              <div className="t-faint" style={{ fontSize: 12.5, marginTop: 4 }}>{a.desc}</div>
            </div>
          ))}
        </div>
        <SectionHead eyebrow="Plantillas" title="Empezar desde" />
        <div className="row gap-12 wrap">
          {TEMPLATES.map((t) => (
            <button key={t.name} className="card hover" style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--bg-2)", color: "var(--accent)" }}><Icon name={t.icon} size={17} /></span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
