/* ============================================================
   AXIOM — data_rules.js · MOTOR DE REGLAS ÚNICO (Cuando → Entonces)
   ------------------------------------------------------------
   Antes el mismo patrón "condición → acción → contador" vivía 3 veces:
     · RulesView            → reglas de alerta del CASO
     · Actions › Automations→ AUTO_RULES (operaciones)
     · Health › Alert rules → (stub sin datos)
   Ahora hay UNA lista `RULES` etiquetada por `context`:
     · "case" → alertas de investigación
     · "ops"  → automatizaciones de operaciones (= AUTO_RULES, re-exportado)
     · "data" → reglas de calidad / salud de datos
   Un único componente <RulesEngine rules onToggle/> las pinta en los 3 sitios.

   Forma de la regla: { id, context, name, when, then, on, fired?, runs?, needs? }
   ============================================================ */
export const RULES = [
  // ---- contexto: CASO (antes RulesView SEED) ----
  { id: "c1", context: "case", name: "Layering de alto valor", when: "Cadena > $1M en ≤ 5 saltos", then: "Crear alerta crítica", on: true, fired: 38 },
  { id: "c2", context: "case", name: "Gap AIS en puerto sancionado", when: "Pérdida de señal a < 50nm de puerto OFAC", then: "Crear alerta + marcar buque", on: true, fired: 12 },
  { id: "c3", context: "case", name: "Estructuración", when: "≥ 6 transferencias bajo umbral en 24h", then: "Crear alerta media", on: true, fired: 21 },
  { id: "c4", context: "case", name: "Cambio de bandera", when: "Buque cambia de pabellón en < 90 días", then: "Notificar al analista", on: false, fired: 4 },
  { id: "c5", context: "case", name: "Coincidencia con sanciones", when: "Objeto coincide con lista OFAC/UE", then: "Crear alerta crítica + bloquear", on: true, fired: 7 },

  // ---- contexto: OPERACIONES (antes AUTO_RULES) ----
  { id: "o1", context: "ops", name: "Auto-add vessels with AIS gap > 6h to watchlist", when: "AIS gap > 6h", then: "Add vessel to watchlist", on: true, runs: "14 this week", needs: "no approval" },
  { id: "o2", context: "ops", name: "Freeze on confirmed OFAC match", when: "Confirmed OFAC match", then: "Freeze account", on: false, runs: "held", needs: "Reviewer approval" },
  { id: "o3", context: "ops", name: "Open case on any Critical alert", when: "Any Critical alert", then: "Open investigation case", on: true, runs: "3 this week", needs: "no approval" },

  // ---- contexto: DATOS (salud / calidad — antes el botón stub de Health) ----
  { id: "d1", context: "data", name: "Frescura fuera de SLA", when: "Freshness supera el SLA del dataset", then: "Abrir incidencia + avisar a data-eng", on: true, fired: 9 },
  { id: "d2", context: "data", name: "Caída de checks de calidad", when: "Tasa de checks < 90%", then: "Crear alerta media", on: true, fired: 3 },
  { id: "d3", context: "data", name: "Drift de esquema", when: "El esquema diverge del contrato", then: "Bloquear pipeline + revisar", on: false, fired: 1 },
];

export const rulesByContext = (ctx) =>
  !ctx ? RULES : RULES.filter((r) => r.context === ctx);
