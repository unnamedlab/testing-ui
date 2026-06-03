import { Icon } from './ui.jsx';

/* ============================================================
   AXIOM — ArtifactExplorer (cluster ⑬)
   Explorador de artefactos COMPARTIDO. Antes había tres
   navegadores con columnas y lógica propias: DriveTab (Code),
   Files (Workspaces) y el visor de Evidence. Esta capa unifica
   la resolución de iconos por tipo y la fila del explorador, que
   ahora reutilizan Drive y Files. (Evidence es un visor de
   documentos especializado — usa la misma resolución de iconos.)
   ============================================================ */

// kind/extension → icono y color, una sola fuente para todos los exploradores.
export function fileIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.endsWith(".pdf")) return "doc";
  if (n.endsWith(".csv") || n.endsWith(".xlsx")) return "table";
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(n)) return "image";
  return "file";
}

const KIND_ICON = {
  folder:"folder", dataset:"layers", chart:"graph", dashboard:"layers", board:"grid",
  notebook:"note", search:"search", pipeline:"pipeline", watchlist:"bookmark", app:"blocks", report:"doc",
};
const KIND_COLOR = {
  folder:"var(--accent)", dataset:"var(--ok)", chart:"var(--violet)", dashboard:"var(--info)",
  board:"var(--accent)", notebook:"var(--info)", search:"var(--accent)", pipeline:"var(--ok)",
  watchlist:"var(--accent)", app:"var(--violet)", report:"var(--warn)",
};

// Resuelve icono para una entrada de explorador (artefacto, fichero o entrada de Drive).
export function artifactIcon(e) {
  if (!e) return "file";
  if (e.type === "Model") return "hdd";
  if (e.kind && KIND_ICON[e.kind]) return KIND_ICON[e.kind];
  if (e.kind === "file" || !e.kind) return fileIcon(e.name);
  return "file";
}
export function artifactColor(e) {
  if (!e) return "var(--text-dim)";
  if (e.type === "Model") return "var(--violet)";
  if (e.kind && KIND_COLOR[e.kind]) return KIND_COLOR[e.kind];
  return "var(--text-dim)";
}

// Fila única del explorador. Cada vista mapea sus campos a estas props.
export function ArtifactRow({ icon, color, name, meta, badge, trailing, onClick }) {
  const c = color || "var(--text-dim)";
  return (
    <div className="row gap-12 center" onClick={onClick}
      style={{ padding: "12px 16px", borderBottom: "1px solid var(--line-soft)", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
        background: `color-mix(in oklab, ${c} 16%, var(--bg-2))`, color: c,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 30%, transparent)` }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-8 center" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
          {badge}
        </div>
        {meta && <div className="t-faint mono" style={{ fontSize: 11, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</div>}
      </div>
      {trailing && <div className="row gap-10 center" style={{ flex: "none" }}>{trailing}</div>}
    </div>
  );
}

// Contenedor (card) del explorador, con estado vacío.
export function ArtifactList({ children, count, empty }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {children}
      {count === 0 && <div className="t-faint" style={{ padding: "26px", textAlign: "center", fontSize: 13 }}>{empty || "Empty."}</div>}
    </div>
  );
}
