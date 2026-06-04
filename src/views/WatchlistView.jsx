import { ObjectIndex } from '../components/ObjectIndex.jsx';

/* ============================================================
   AXIOM — WatchlistView (consolidación · clúster B)
   Las watchlists ya no son un módulo aparte: son "vistas guardadas"
   (presets) del índice de objetos compartido. Esta entrada abre el
   índice con la vista marítima preseleccionada; el usuario conmuta
   entre presets (On watch · Maritime · Financial · Sanctions) sin
   cambiar de pantalla.
   ============================================================ */
export function WatchlistView({ openEntity }) {
  return (
    <ObjectIndex
      openEntity={openEntity}
      initialView="list"
      initialPreset="maritime"
      eyebrow="Decide & Act"
      title="Watchlists"
    />
  );
}
