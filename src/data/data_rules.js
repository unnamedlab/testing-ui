/* ============================================================
   AXIOM — data_rules.js · MOTOR DE REGLAS ÚNICO (cluster ⑪)
   ------------------------------------------------------------
   Antes las reglas estaban dispersas en tres sitios con modelos
   distintos: RulesView (Cuando→Entonces, alertas del caso),
   Automations en ActionsView (AUTO_RULES) y "Alert rules" en
   HealthView. Ahora hay UN modelo único Cuando→Entonces y cada
   contexto es una vista filtrada por `scope`:
     · scope 'case'       → reglas de alerta (RulesView)
     · scope 'automation' → acciones event-driven (ActionsView)
   ============================================================ */
export const RULES = [
  // --- Alertas del caso (antes RulesView SEED) ---
  { id:"r1", scope:"case", name:"Layering de alto valor",          when:"Cadena > $1M en ≤ 5 saltos",                 then:"Crear alerta crítica",            on:true,  fired:38 },
  { id:"r2", scope:"case", name:"Gap AIS en puerto sancionado",    when:"Pérdida de señal a < 50nm de puerto OFAC",   then:"Crear alerta + marcar buque",     on:true,  fired:12 },
  { id:"r3", scope:"case", name:"Estructuración",                  when:"≥ 6 transferencias bajo umbral en 24h",      then:"Crear alerta media",              on:true,  fired:21 },
  { id:"r4", scope:"case", name:"Cambio de bandera",               when:"Buque cambia de pabellón en < 90 días",      then:"Notificar al analista",           on:false, fired:4 },
  { id:"r5", scope:"case", name:"Coincidencia con sanciones",      when:"Objeto coincide con lista OFAC/UE",          then:"Crear alerta crítica + bloquear", on:true,  fired:7 },

  // --- Automatizaciones / acciones event-driven (antes ActionsView AUTO_RULES) ---
  { id:"a1", scope:"automation", name:"Auto-add vessels with AIS gap > 6h to watchlist", when:"Gap AIS > 6h",          then:"Añadir a watchlist", on:true,  runs:"14 this week", needs:"no approval" },
  { id:"a2", scope:"automation", name:"Freeze on confirmed OFAC match",                  when:"Match OFAC confirmado",  then:"Congelar cuenta",    on:false, runs:"held",         needs:"Reviewer approval" },
  { id:"a3", scope:"automation", name:"Open case on any Critical alert",                 when:"Alerta crítica",         then:"Abrir caso",         on:true,  runs:"3 this week",  needs:"no approval" },
];

export function rulesByScope(scope){ return RULES.filter((r) => r.scope === scope); }
