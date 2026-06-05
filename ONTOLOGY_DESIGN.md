# AXIOM — Ontología clase mundial (mejor que Palantir), anclada en el código

> Análisis derivado **exclusivamente** del código de AXIOM (frontend React/Vite), endurecido por una crítica adversarial multi-agente. `✓` = anclado en tu código · `★` = net-new · marcado "no determinable" donde el código no lo decide.

## Veredicto honesto primero

La mayor parte de una "ontología clase mundial" es **paridad con Palantir Foundry, no superioridad** — y construirla igualmente vale la pena porque **cierra los huecos de AXIOM** hasta el nivel que Foundry ya cumple. Pero solo **4 cosas** superan o extienden de verdad a Foundry en la capa de ontología, y todas comparten una sola idea:

> **AXIOM guarda la *afirmación* (claim), no solo el *valor*.**

Esa es la tesis. Una propiedad no es `risk_score = 92`; es *"92, derivado por el modelo `/fn/risk/v3` v2024.3, confianza 0.74, según el documento sha:ab… el 12-mar, y hay una afirmación rival que dice 61"*. Foundry tiene procedencia a nivel de *dataset/build*; AXIOM la baja a **nivel de cada valor**. Todo lo demás se deriva de ahí.

*(Auto-corrección: un agente afirmó que faltaba la capa física; la síntesis detectó que `BACKEND_ARCHITECTURE.md` ya la especifica, y lo corrigió.)*

---

## El stack en 6 capas (endurecido por la crítica, KISS)

```
L6  GOBERNANZA & SEGURIDAD (policy-as-data)
    SCHEMA_VERSIONS + SchemaProposal (reusa la máquina de estados de Actions + two-person)
    PolicyEvaluator decide(subject,resource,purpose)->{grant,reasons[]}
    SecurityLabels (objeto + propiedad selecta) · RedactionRenderer (portion-mark) · AccessAuditRecord
                              │ lee / restringe
L5  CAPA SEMÁNTICA / LLM-NATIVA
    SemanticDescriptor (desc/synonyms/examples/enumValues)
      -> emitToolManifest()  [tool-use Anthropic, función pura]
      -> toJSONLD()/toOWL()/toSKOS()  [estándares abiertos, puras]
    cites[] grounding ampliado a objeto|propiedad|edge
                              │ describe / fundamenta
L4  DERIVACIÓN & PROCEDENCIA ML
    DERIVATIONS map (marker -> modelRef+version+endpoint)
    derivedMeta sidecar {modelRef,version,asOf}  (sin mutar el valor)
    promoción champion-only (sella version+asOf + 1 fila de audit)
                              │ computa valores como
L3  RESOLUCIÓN DE ENTIDADES (canónica <- raw)
    MergeDecision / SplitDecision  (persistidas, atribuidas, conf real, membresía de cluster)
    entities_resolved sigue siendo el golden record MATERIALIZADO (no event-sourced fold)
                              │ produce objetos canónicos cuyos valores son
L2  NÚCLEO DE AFIRMACIONES & TEMPORAL  (la columna — "guarda el claim")
    Assertion {object_id, property, value, method, source(+sha), confidence, asserted_by, recorded_at}
      append-only, pero LOG solo donde hay disputa; si no, valor único + sources[]
    ResolvedValue {value, method, confidence, contested}
    valid-time (vt_from = .since)  +  transaction-time (tx)  ->  asOf() / asKnownAt()
                              │ materializado desde / escrito hacia
L1  BACKING FÍSICO & ESCALA  (según BACKEND_ARCHITECTURE.md)
    Medallion raw->clean->ontology (SoR) · SourceConnector · MaterializationTransform
    ObjectTypeBinding {typeId,sourceDataset,pkColumn} · WritebackDataset (edits separados; revert = drop)
    Read models (search/graph/OLAP) + sharding = DIFERIDO (ADR hasta medir carga)

Transversal: un único patrón append-only (Assertion, Merge/Split, ActionRun, SchemaProposal, AuditRecord).
```

---

## Catálogo de componentes (✓ = anclado en tu código · ★ = net-new)

### L2 · Núcleo de afirmaciones/temporal — *aquí están los diferenciadores*
| | Componente | Qué es | vs Palantir |
|---|---|---|---|
|★| **Assertion record** | `{object_id, property, value, method(manual\|extracted\|derived\|ML), source(+sha), confidence, asserted_by, recorded_at}`; append-only, usado como log **solo** donde la propiedad está disputada | **diferenciador** |
|★| **ResolvedValue + flag `contested`** | vista materializada por propiedad `{value, method, confidence, contested}`; política por defecto = mayor confianza + adjudicación manual | **diferenciador** |
|★| **eje transaction-time + `asKnownAt()`** | 2º timestamp = *cuándo AXIOM se enteró*; corrección-como-append; reproduce el dossier tal como estaba un día dado | **diferenciador** |
|✓| Method taxonomy + source binding | sube los markers `Derived/ML` y el `sha/conf` de evidencia de nivel-tipo a hechos por-valor | paridad |
|✓| eje valid-time (`vt_from = .since`) | el `.since` actual + filtro as-of, generalizado | paridad |

### L3 · Resolución
| | Componente | Qué es | vs Palantir |
|---|---|---|---|
|★| **MergeDecision / SplitDecision** | Merge y "Not-the-same" escriben resultados **distintos**, persistidos, con autor + conf real + membresía de cluster; split = inverso auditado | **diferenciador (ergonomía)** |
|✓| Canonical entity materializada | `entities_resolved` sigue siendo el golden record; las decisiones son rastro append-only al lado | paridad |
|✓| Política de resolución versionada | blocking keys + umbral (name/iban, 0.82) ya en el transform | paridad |

### L4 · Derivación/ML
| | Componente | Qué es | vs Palantir |
|---|---|---|---|
|★| DERIVATIONS binding map | lookup `<tipo>.<prop>` -> `{kind, modelRef, version, endpoint}`; sin DSL de expresiones | paridad |
|★| derivedMeta sidecar | `{modelRef,version,asOf}` sin mutar la forma del valor (no rompe el render de EntityView) | paridad |
|★| Promoción champion-only | sella version+asOf + 1 fila audit; sin backfill engine ni challenger | paridad |
|✓| MODELS registry + serving `/fn/*` | versiones champion/staging, endpoints, inputs, usedBy | paridad |

### L5 · Semántica/LLM
| | Componente | Qué es | vs Palantir |
|---|---|---|---|
|★| SemanticDescriptor overlay | desc/synonyms/examples/enumValues por tipo/prop/link/action, encima de `OBJECT_SCHEMA` | paridad |
|★| `emitToolManifest()` (pura) | deriva el manifiesto tool-use Anthropic desde tipos+links+actions+funciones del graph engine | paridad |
|★| **`toJSONLD()/toOWL()/toSKOS()` (puras)** | tipos->owl:Class, links->owl:ObjectProperty, props->owl:DatatypeProperty, synonyms->skos:altLabel, enums->owl:oneOf | **diferenciador** |
|✓| Contrato de citación/grounding | `cites[]` ampliado de id-objeto a objeto\|propiedad\|edge | paridad |
|★| Resolver de sinónimos/id | tabla `synonyms[]` + map `DISPLAY_NAME->id` (arregla el desajuste `→ Organization` vs id `org`); **sin** índice vectorial a esta escala | paridad |

### L6 · Gobernanza & Seguridad
| | Componente | Qué es | vs Palantir |
|---|---|---|---|
|★| SCHEMA_VERSIONS registry | snapshots inmutables append-only + puntero HEAD; reemplaza el `useState` mutable de `OBJECT_SCHEMA` | paridad |
|✓| SchemaProposal + máquina de aprobación reusada | el edit de esquema pasa por la **misma** máquina STATUS de Actions + two-person | paridad |
|✓| Schema audit kind | proposal/publish/revert emiten filas al ledger AUDIT existente con un kind `schema` | paridad |
|★| **PolicyEvaluator `decide()`** | un único `decide(subject,resource,purpose)->{effect,reasons[]}`: dominancia de nivel + superset de compartimentos + ack de caveats + purpose; el único chokepoint que llama todo read path | paridad |
|★| SecurityLabel + Clearances | labels reificados a nivel objeto (y propiedad selecta); clearances tipados | paridad |
|★| **RedactionRenderer (portion-mark)** | renderiza una propiedad denegada como redacción marcada en el Entity 360 en vez de ocultar el objeto entero | **diferenciador (UX menor)** |
|✓| AccessAuditRecord | salida tipada de `decide()`: `{subject,resource,property?,purpose,effect,ruleId,missingCompartment?}` | paridad |
|✓| Purpose (un solo arg) | argumento opcional `purpose` en `decide()` + logging de propósito (ProjectsView ya tiene el panel); NO un DSL de grants por propósito | paridad |

### L1 · Backing físico
Todo paridad, ya cubierto por `BACKEND_ARCHITECTURE.md`: DatasetLayer medallion (raw/clean/ontology, SoR), SourceConnector (Kafka/SFTP/S3/REST), MaterializationTransform, **★ ObjectTypeBinding** (thin: `{typeId,sourceDataset,pkColumn,ontologyLayerDataset}`), **★ WritebackDataset** (edits separados del source inmutable; revert = drop la fila), y read models (search/graph/OLAP) + sharding **diferidos a un ADR** hasta medir carga.

---

## Los 4 diferenciadores que de verdad superan a Palantir

1. **Afirmaciones por-valor con flag `contested`.** El valor lleva su propia fuente (+sha), método y confianza; cuando dos afirmaciones vivas chocan, el campo se marca para que un analista lo adjudique. Separa *el claim* de *la verdad* en la capa de ontología. **~70% pre-sembrado** en `confColor/res/sha` de `EvidenceView` + `data_evidence.js`. *Caveat honesto: hoy es un win de diseño, no en ejecución — solo gana cuando los botones inertes de Evidence escriban afirmaciones de verdad.*

2. **Eje transaction-time para replay "as-known-at".** Un 2º timestamp (cuándo *AXIOM aprendió* un hecho) sobre el `since` (valid-time) existente permite reproducir un dossier/alerta exactamente como estaba el día que se presentó un STR, con corrección-como-append (la historia nunca se reescribe). La riqueza temporal de Foundry vive a nivel dataset/build, no como segundo eje por-hecho. *Caveat: valid-time solo es paridad; el eje tx es net-new y sin construir.*

3. **Proyección a estándares abiertos (JSON-LD/OWL/SKOS)** emitida desde el **mismo** `SemanticDescriptor` que alimenta el manifiesto de tools del agente — *autor una vez, emite dos superficies interoperables*. Hace la ontología portable y federable con vocabularios externos de sanciones/registros con tooling W3C estándar — lo único que Foundry no presenta de forma nativa (su interop es vía su propio SDK). Emisores puros, bajo riesgo. **El win de capacidad más claro y defendible.**

4. **Resolución de entidades reversible y atribuida.** Merge y "Not-the-same" pasan a ser registros distintos, persistidos, atribuidos al analista, con confianza real y membresía de cluster; split = inverso auditado. Hoy ambos botones llaman al mismo `resolve(id)` no-op (`ResolveView.jsx:46-47`). *Caveat: vence a AXIOM-hoy con holgura, pero append/split logs son MDM estándar — frente a Foundry es ventaja de ergonomía/atribución, no leapfrog de capacidad.*

---

## Anclado en tu código (mapeo componente → archivo)

| Componente | Anclado en |
|---|---|
| Tipos de objeto (8) + glyph/count/desc | `src/data/data.js` OBJECT_TYPES, TYPE_BY_ID, TOTAL_OBJECTS |
| Property schema `[name,type,marker]` + markers PK/Indexed/Derived/ML | `src/data/ontology_schema.js` OBJECT_SCHEMA (vessel.imo Primary key, person.risk_score Derived, txn.pattern ML) |
| Semántica de render de markers (Link→accent, Derived/ML→info) | `src/views/OntologyView.jsx` |
| CRUD de propiedades + Publish=setDirty(false) | `src/views/OntologyAuthor.jsx` (addProp/setProp/delProp) |
| Layouts de Object-view como datos (CARD_LIBRARY, DEFAULT_LAYOUT, highlight por NOMBRE = bug de rename) | `src/views/ObjectViewsAuthor.jsx` |
| Link types (16 `{id,label,from,to}`) + linkLabel fallback | `src/data/data.js` LINK_TYPES, LINK_BY_ID |
| Motor de grafo único: ADJACENCY, shortestPath(BFS), commonNeighbors, centrality O(V²) | `src/data/graph_model.js` |
| valid-time `.since` + filtro as-of | `src/data/data_ext.js` (EDGE_SINCE_DAYS/ENT_SINCE_DAYS), `src/views/GraphView.jsx` |
| Time scrubber | `src/components/TimeScrubber.jsx` |
| Semilla de afirmación: conf/res/sha por extracción + confColor | `src/data/data_evidence.js`, `src/views/EvidenceView.jsx` |
| Entity 360 renderiza attrs planos (Object.entries) — el hueco que llenan las afirmaciones | `src/views/EntityView.jsx` |
| ResolveView merge no-op (Merge==Not-the-same==resolve(id); conf sintética) | `src/views/ResolveView.jsx:17,26,46-47` |
| Medallion datasets raw/clean/ontology + checks unique/schema_contract | `src/data/data_health.js` DATASETS |
| ER transform (blocking keys name,iban; umbral 0.82; ontology.upsert) | `src/data/data_code.js` (id:er) |
| MODELS registry + versiones + deploy `/fn/*` + lineage | `src/data/data_models.js`, `src/views/ModelsView.jsx` |
| FUNCTIONS + TOOLS cards (display-only) + cites[] grounding | `src/data/data_agents.js`, `src/views/ReasonView.jsx` |
| Cliente Claude (Messages API, prompt cache, proxy split, sin tools array) | `src/services/claude.js` |
| Action types + targets + cadenas de aprobación + EFFECT | `src/data/data_actions.js` ACTION_TYPES, EFFECT |
| Ciclo de vida de acción + two-person (STATUS, ME, isOwn, decide()) | `src/views/ActionsView.jsx` |
| Rules WHEN→THEN detection/response + gating de aprobación | `src/data/data_rules.js`, `src/views/RulesView.jsx` |
| Vocabulario de clasificación (CLASS_LEVELS, ENTITY_MARKINGS, markingFor) | `src/data/data_ext.js` |
| Markings/clearance UI (display-only, SIN enforcement) + USERS.clearance/ROLES.perms | `src/components/Security.jsx`, `src/data/data_admin.js`, `src/views/GovernanceView.jsx` |
| Panel de acceso por propósito | `src/views/ProjectsView.jsx` |
| Ledger AUDIT sintetizado + lineageFor (cadena hardcodeada idéntica) | `src/data/data_ext.js` AUDIT, lineageFor; `src/views/GovernanceView.jsx` |
| Prior art físico/escala (monolito Go, stores diferidos, workers, writeback) | `BACKEND_ARCHITECTURE.md` |

---

## Net-new (honesto — sin análogo en el código actual)

- **Assertion record** (claim atómico por-valor) — log solo donde hay disputa; si no, valor único + `sources[]` opcional.
- **ResolvedValue + flag `contested`** + política por defecto (mayor confianza) con adjudicación manual.
- **eje transaction-time (`tx`)** + `asKnownAt()` + writer corrección-como-append + 2º scrubber. grep confirma cero tx-time/recordedAt/bitemporal; solo existe `.since`.
- **MergeDecision / SplitDecision** persistidas/atribuidas/conf-real/membresía. Hoy `resolve(id)` solo quita de la cola.
- **DERIVATIONS binding map** (marker → modelRef/version/endpoint).
- **derivedMeta sidecar** `{modelRef,version,asOf}` (sidecar, NO cambio de forma del valor).
- **Champion-only promotion stamp** (version+asOf + 1 fila audit).
- **SemanticDescriptor overlay** (description/synonyms/examples/enumValues a nivel propiedad/link/action). enumValues son PLACEHOLDERS.
- **`emitToolManifest()`** puro (shape tool-use Anthropic) — los TOOLS hoy son cards sin `input_schema`.
- **`toJSONLD()/toOWL()/toSKOS()`** — grep encuentra cero RDF/OWL/SKOS/JSON-LD en src.
- **Synonym table + resolver `DISPLAY_NAME->id`** (org/port) — arregla el desajuste `→ Organization`. Sin índice de embeddings (cortado por over-engineering a ~74 elementos de esquema).
- **SCHEMA_VERSIONS** append-only + HEAD — reemplaza el `OBJECT_SCHEMA` mutable.
- **SchemaProposal** change-set por la máquina de aprobación reusada de Actions.
- **PolicyEvaluator `decide(subject,resource,purpose)`** — el chokepoint de enforcement que hoy no existe.
- **SecurityLabel** (objeto + propiedad selecta) + Clearances tipados; AccessAuditRecord; RedactionRenderer portion-mark.
- **ObjectTypeBinding** (thin) + **WritebackDataset**. Read models + sharding viven como ADR, no como componentes v1.

---

## No determinable (tu regla — no lo inventé)

- **Conjunto de valores de cualquier `enum`** (currency, org.status, port.sanctions_exposure, txn.pattern): el código guarda solo el literal `'enum'`. Miembros como GBP/AED/Dissolved/Medium **no aparecen** → sembrar solo desde literales observados, no inventar.
- Si los `conf` de evidencia son probabilidades calibradas del modelo o literales de demo — `data_evidence.js` guarda el número sin productor.
- Cómo resuelven las referencias `→ Person/Organization/Facility/Account` a los ids (`org/port/account`) — no hay resolver; el map es propuesto, no anclado.
- Cardinalidad/inverso/obligatoriedad de los links — `LINK_TYPES` solo lleva `{id,label,from,to}`.
- Si **algún** `/fn/*` se invoca en runtime — Live/Offline es estado UI local; `risk:92` es literal estático.
- Si **se aplica alguna** decisión de acceso — cero comparación clearance-vs-marking en todo el repo; "Access denied — clearance" es fila AUDIT hardcodeada.
- Cómo se asignan compartimento (AXIOM-INT) y caveat (NEED-TO-KNOW) por objeto — `CLASSIFICATION` global; solo `level` varía por objeto vía `ENTITY_MARKINGS`.
- Si existe **cualquier** persistencia/versionado de esquema/afirmaciones/decisiones/acciones/audit — todo en-memoria; `Publish = setDirty(false)`. El backend Go es un doc de **diseño**, no código corriendo.
- Cardinalidad/throughput reales — 1.2B AIS, 48 213 txn son fixtures/`Math.sin`; el NFR (cientos-TB/día, 6000 usuarios) es un dato externo.
- Qué registros raw forman cada entidad canónica — `lineageFor(id)` devuelve la misma cadena hardcodeada para todos los ids; "3 records merged" es un string estático.
- Si ResolveView Merge produjo alguna vez un golden record/survivorship — ambos botones comparten `resolve(id)`.
- Si el set estructural `LINK_TYPES` es autorable — los botones de add Link de OntologyAuthor no tienen handler (read-only).

---

## Orden de construcción (KISS, cada fase es desplegable)

0. **Fase 0 — Correcciones de base (sin motor nuevo):** clave estable por-propiedad separada del display name (arregla el bug de rename en ObjectViewsAuthor que resalta por *nombre*); resolver `DISPLAY_NAME->id`; enums sembrados **solo** desde literales observados en `ENTITIES.attrs`.
1. **Fase 1 — Resolución real (máximo valor, más barato, 100% anclado):** Merge / Not-the-same escriben decisiones distintas, persistidas, atribuidas, con conf real y membresía de cluster; audit ligado a un decision id; `entities_resolved` sigue siendo el canónico materializado.
2. **Fase 2 — Núcleo de afirmaciones, acotado:** cablear los botones inertes de Evidence para **escribir** `{id,value,source,sha,conf,res}`; chips `ResolvedValue` en EntityView (valor + punto confColor + glyph de método + "n fuentes/contested"); log append-only **solo** cuando hay disputa; promover markers Derived/ML a labels de método por-valor.
3. **Fase 3 — Procedencia de derivación (sidecar, no rompe nada):** `DERIVATIONS` map + `derivedMeta` sidecar; Promote sella version+asOf + 1 fila audit. Sin backfill, sin challenger, sin DSL.
4. **Fase 4 — Transaction-time:** `.since -> vt_from`, añadir `tx_from` + convención `tx_to=Infinity`, un `asKnownAt()` en graph_model.js, 2º TimeScrubber tras toggle "time-travel". Granularidad objeto/link primero.
5. **Fase 5 — Gobernanza como datos:** `SCHEMA_VERSIONS` append-only + HEAD; `SchemaProposal` por la máquina de aprobación reusada + two-person; Publish acuña versión, Revert mueve HEAD; kind `schema` en audit. Sin branches, sin DSL de migración.
6. **Fase 6 — Enforcement de seguridad:** el único `PolicyEvaluator decide()`; SecurityLabels objeto (+ propiedad selecta) + Clearances tipados; cablear `decide()` en el read path de EntityView con RedactionRenderer; AUDIT como salida tipada de `decide()`. Purpose = un arg opcional + logging existente de ProjectsView.
7. **Fase 7 — Emisores semánticos/LLM (puros):** `SemanticDescriptor` overlay; `emitToolManifest()` (y ReasonView TOOLS pasa a ser una *vista* de él); `toJSONLD()` (luego OWL/SKOS bajo demanda) desde los mismos descriptors. Enviar el manifiesto como tools array; diferir el executor multi-turno y cualquier runtime de citación.
8. **Fase 8 — Backing físico, solo cuando la carga lo exija:** monolito Go + Postgres SoR + WritebackDataset + ObjectTypeBinding thin; ClickHouse(OLAP)/OpenSearch(search)/graph read models + centrality-job + sharding **diferidos** a un ADR hasta medir carga real.

---

**Hilo conductor:** un solo record de afirmación, un solo log append-only acotado a donde hay disputa, un solo `PolicyEvaluator`, una sola máquina de estados (reusada de Actions) y funciones puras para tools/RDF — **cero motores nuevos, cero reescritura por-celda de datos a escala de TB**.
