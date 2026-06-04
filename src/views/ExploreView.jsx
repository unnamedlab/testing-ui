import { ObjectIndex } from '../components/ObjectIndex.jsx';

/* ============================================================
   AXIOM — ExploreView (consolidación · clúster B)
   "Browse" tab del OntologyWorkbench. Ahora es una envoltura fina
   sobre el índice de objetos compartido (ObjectIndex), en modo tabla.
   Search y Watchlists comparten el MISMO motor con otro contexto.
   ============================================================ */
export function ExploreView({ openEntity }) {
  return (
    <ObjectIndex
      openEntity={openEntity}
      initialView="table"
      eyebrow="Explore & Model"
      title="Object explorer"
    />
  );
}
