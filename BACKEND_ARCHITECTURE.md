# AXIOM — Arquitectura del backend (Go) derivada del frontend

## Qué es realmente tu código (anclado, no inventado)

AXIOM es una plataforma de inteligencia/operaciones estilo Foundry/Gotham. **El backend "vivo" hoy es UNA sola llamada de red**: el `POST` a Anthropic en `claude.js`. Todo lo demás son fixtures estáticos en `src/data/*.js`. Eso es decisivo para el árbol: la regla KISS manda **monolito modular**, no enjambre de microservicios.

- **Ontología (núcleo)** — `ontology_schema.js`: 8 tipos (`person, org, vessel, port, account, txn, shipment, device`) con marcadores `Indexed/Derived/Primary key/Link/ML/enum`.
- **Motor de grafo** — `graph_model.js`: adyacencia, BFS shortest-path, common-neighbors, centralidad grado+betweenness (**O(V²)** → no puede ser endpoint síncrono a escala).
- **Gancho LLM exacto** — `claude.js:42`: el frontend ya espera `VITE_CLAUDE_PROXY_URL`, un **proxy server-side** que custodia la API key y reenvía el shape Anthropic Messages con prompt-caching. No streaming.
- **Taxonomía real** — `ROUTES` en `App.jsx:60` + `NAV_GROUPS` en `Shell.jsx`: Explore&Model · Analyze · Decide&Act · Integrate · Govern.

La crítica adversarial eliminó invenciones que un primer borrador metió: capa gRPC/proto (no existe en tu código), framing MCP, máquina de saga/compensación, y colapsó **21 binarios → 6**.

---

## El árbol del repositorio (KISS + LLM-friendly, Go)

```
axiom/                                  # monorepo root (era testing-ui/)
├── README.md                           # qué es AXIOM, layout, por dónde empezar (humanos + agentes)
├── Makefile                            # up / down / build / test / gen-openapi / seed / lint
├── .env.example                        # ANTHROPIC_API_KEY (server-side), DSNs DB/REDIS/KAFKA/S3
│
├── web/                                # frontend React/Vite EXISTENTE — movido verbatim, sin tocar
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                  # ÚNICO cambio: dev proxy '/api' -> monolito, '/v1/messages' -> llm-proxy
│   └── src/                            # App.jsx, components/, views/, data/, i18n.jsx, services/claude.js
│                                       #   claude.js: VITE_CLAUDE_PROXY_URL -> /v1/messages (ya soportado en el código)
│
├── api/                                # CONTRATOS MACHINE-READABLE — primer dir que rastrea un agente
│   ├── README.md                       # "toda capacidad del backend está aquí; REST/JSON (igual que claude.js)"
│   ├── openapi/                        # UN OpenAPI 3.1 por bounded context (único transporte — no gRPC en el código)
│   │   ├── ontology.yaml               #   object-types, property-schema, link-types, view-layouts, action-bindings, publish/revert
│   │   ├── objects.yaml                #   GET /objects/{id}, /objects/search, saved-views, /connections, /transactions, /comments
│   │   ├── graph.yaml                  #   /graph (?asof=), /neighbors, /path, /common, /centrality (lectura precomputada)
│   │   ├── geo.yaml                    #   /geo/places, /vessels, /vessels/{id}/track, /routes, /events (feed marítimo)
│   │   ├── ingest.yaml                 #   /sources, /provision, /pipelines, /pipelines/{id}/run, /coderepo, /builds, /drive
│   │   ├── resolve.yaml                #   /resolve/pairs, POST /resolve/{pair}/merge|reject
│   │   ├── evidence.yaml               #   /docs, /docs/{id}/extract, confirm-match, create-object, add-to-case
│   │   ├── cases.yaml                  #   /projects, /alerts (status/assignee/notes), /watchlists, /notifications
│   │   ├── actions.yaml                #   /action-types, POST /actions, /actions/{id}/approve|reject, status
│   │   ├── rules.yaml                  #   /rules (detection|response), toggle, create
│   │   ├── analytics.yaml              #   POST /analytics/query {groupBy,measure,agg,filters,pivot}, /dashboards, /overview/*
│   │   ├── health.yaml                 #   /datasets, /incidents, re-run, acknowledge, dq-checks
│   │   ├── reports.yaml                #   /reports (blocks autosave), /dossier/{caseId}
│   │   ├── governance.yaml             #   /audit, /access-requests grant|deny, /markings, /lineage/{id}
│   │   ├── iam.yaml                     #   /users (invite), /roles, /access-matrix, /me (contexto usuario actual)
│   │   ├── agents.yaml                  #   /agents CRUD+publish, /agents/{id}/run, /functions, /evals
│   │   ├── models.yaml                  #   /models, versions promote, deploy live/offline, /fn/* descriptores inferencia
│   │   └── llm.yaml                     #   POST /v1/messages (proxy compatible Anthropic-Messages — anclado en claude.js)
│   └── tools/                          # MANIFIESTO DE TOOLS DE AGENTE — taxonomía TOOLS de ReasonView (fixture anclado)
│       ├── README.md                   #   tool = wrapper fino sobre un op OpenAPI existente; guardrails approval+grounding
│       ├── search.tool.json            #   -> objects.yaml /objects/search
│       ├── graph.tool.json             #   -> graph.yaml traversal
│       ├── txn.tool.json               #   -> objects.yaml /objects/{id}/transactions + analytics
│       ├── geo.tool.json               #   -> geo.yaml
│       └── model.tool.json             #   -> models.yaml /fn/* inference
│
├── cmd/                                # POCOS deployables — KISS: un monolito + sólo los binarios que el código FUERZA a separar
│   ├── axiom/main.go                   # EL monolito modular: sirve /api/* (todos los contextos), monta internal/*
│   ├── llm-proxy/main.go               # separado SÓLO porque guarda la key Anthropic + rate-limit por usuario (modo proxy de claude.js)
│   ├── stream-worker/main.go           # consumer Kafka de los 2 feeds streaming anclados (AIS, SIGINT): ingest + rules-eval + ER dispatch
│   ├── batch-worker/main.go            # conectores SFTP/S3/REST (SWIFT Hourly, customs/registry/ofac Daily): bulk-load, NO streaming
│   ├── action-worker/main.go           # ejecuta efectos de acciones gobernadas vs conectores externos; transiciones de estado; retry idempotente
│   └── centrality-job/main.go          # precompute offline de grado+betweenness (O(V²)) -> scores materializados (no en request-time)
│                                       #   NOTA: cada cmd/* es wire-up fino de internal/* — colapsables dentro de cmd/axiom si se quiere.
│
├── internal/                          # TODA la lógica de negocio — un paquete por bounded context, 1:1 con el mapa de capacidades
│   ├── platform/                      # kernel transversal — ÚNICO hogar de cada concern compartido (sin duplicados de dominio)
│   │   ├── README.md
│   │   ├── identity/                   #   resolución usuario-actual/clearance (CURRENT_USER='AR' estático hoy; endpoint /me)
│   │   ├── rbac/                       #   matriz de capacidades (View/Comment/Edit/Action/Export/Admin) + two-person integrity
│   │   ├── classification/             #   markings (UNCLASS/CONFIDENTIAL/SECRET), compartment AXIOM-INT, caveat NEED-TO-KNOW, herencia
│   │   ├── audit/                      #   writer append-only access/action/export/view ("Access is logged"); ÚNICO writer de audit
│   │   ├── lineage/                    #   emisor de cadena de procedencia (Source->Cleanse->ER->Sanctions->Object)
│   │   ├── httpx/                      #   router, middleware (request-id, header clasificación, hook audit), serving OpenAPI, error shape
│   │   ├── events/                     #   helpers Kafka producer/consumer (sólo 2 feeds streaming anclados + ejec. acciones)
│   │   ├── config/                     #   carga env 12-factor (mismos binarios para compose + helm)
│   │   └── store/                      #   clientes pg / olap / search / blob / cache / kafka (un sitio para cambiar impls)
│   ├── ontology/                       # object-types, property-schema, link-types, action-bindings, view-layouts, publish/revert
│   ├── objects/                        # instancias (attrs/risk/watch/since), connections, comments, transactions por objeto, search
│   ├── graph/                          # adyacencia, BFS path, common-neighbors, filtro asof; lee centralidad materializada
│   ├── geo/                            # places/vessels/routes, keyframes de track AIS, feed de eventos/detección marítima
│   ├── ingest/                         # registro+health conectores, provisioning, grafo de stages+schedule+historial, coderepo, drive
│   ├── resolve/                        # pares candidatos, confianza, merge/split
│   ├── evidence/                       # doc store (provenance SHA) + extracción NLP/object-detection/CSV-mapping (llama a models)
│   ├── cases/                          # projects (tasks/artifacts/activity/SLA), kanban triage de alertas, watchlists, feed notifications
│   ├── actions/                        # catálogo, invoke, cadenas de aprobación multi-parte, ciclo de vida de estado, dispatch de efecto
│   ├── rules/                          # reglas detection/response, toggle, contadores, dispatch a alerts/actions (incl. 'block')
│   ├── analytics/                      # OLAP aggregate/pivot/histogram/series, recetas guardadas, KPIs (source-of-truth) con invalidación de caché
│   ├── health/                         # estado dataset/dq-checks/drift, incidentes, re-run/acknowledge, lineage pipeline->dataset->ontology
│   ├── reports/                        # editor de bloques (autosave), embeds vivos, ensamblado de dossier clasificado + render-to-PDF
│   ├── governance/                     # queries del ledger de audit, cola de access-request + resolver de acceso efectivo, inventario markings
│   ├── iam/                            # directorio de usuarios, invite, roles+permisos, member counts
│   ├── llm/                            # core del proxy: body Anthropic, system cache ephemeral, cancel opts.signal, rate-limit
│   ├── agents/                         # config de agentes CRUD/publish, orquestación de runs, guardrails grounding+approval, dispatch de tools
│   └── models/                         # registry ML, versiones (champion/challenger), descriptores serving, invocación /fn/* + telemetría
│
├── deploy/                            # MISMO repo -> laptop compose Y k8s helm (idéntico conjunto de servicios)
│   ├── README.md                       # "make up" (compose) vs "helm install" (k8s); stores single-node en laptop, managed en prod
│   ├── docker-compose.yml              # cmd/* + postgres, redis, redpanda(kafka), minio(s3); + perfiles clickhouse/opensearch (opt-in)
│   ├── docker-compose.override.yml     # laptop: hot-reload, seed data, una réplica
│   ├── seed/                           # objects/edges/alerts/etc derivados de web/src/data/*.js (paridad con la demo)
│   ├── Dockerfile.go                   # build multi-stage para cualquier cmd/* (ARG SERVICE)
│   ├── Dockerfile.web                  # build + nginx-serve del dist de Vite
│   └── helm/axiom/                     # UN umbrella chart
│       ├── Chart.yaml
│       ├── values.yaml                 # prod: Kafka/PG/S3 managed, ClickHouse + OpenSearch activos, HPA en workers
│       ├── values-laptop.yaml          # k3d/kind: stores single-node in-cluster (Postgres FTS en vez de OpenSearch, sin sharding)
│       └── templates/                  # deployment+service por cmd/*, ingress, configmap, secret, hpa (workers + llm-proxy)
│
├── docs/
│   ├── architecture.md                 # bounded contexts + data stores + este árbol (humanos + agentes)
│   ├── data-stores.md                  # pg (system-of-record) + redis; clickhouse/opensearch/graph DIFERIDOS tras carga medida
│   ├── llm-integration.md              # contrato proxy + manifiesto de tools + guardrails de agentes
│   └── adr/                            # decisiones: monolito modular primero, transporte REST único, diferir stores de escala
│
├── scripts/
│   ├── gen-openapi.sh                  # regenerar stubs de servidor desde api/openapi/*
│   └── seed.sh                         # cargar deploy/seed en los stores (paridad con los viejos fixtures)
│
└── test/
    ├── e2e/                            # flujos golden (search->graph->action->approval->audit) contra cmd/axiom
    └── contract/                       # tests de conformidad OpenAPI por contexto
```

---

## Por qué este layout (decisiones, no estética)

- **Monolito modular `cmd/axiom` + 6 binarios totales.** Tu código sólo *fuerza* a separar lo que tiene una razón real: `llm-proxy` (custodia la key, rate-limit propio), `stream-worker` (los 2 únicos feeds Kafka: AIS 1.2B, SIGINT 210M en `data_ext.js`), `batch-worker` (SWIFT SFTP/Hourly, customs/registry/ofac REST·S3/Daily — **batch, no stream**), `action-worker` (ejecución async idempotente), `centrality-job` (el O(V²) no puede ser request-time). El resto vive en el monolito y es colapsable.
- **`internal/<context>` 1:1 con el mapa de capacidades.** Un agente encuentra cualquier feature mecánicamente: `api/openapi/cases.yaml ↔ internal/cases ↔ rutas cases en cmd/axiom`. Eso *es* LLM-friendly.
- **REST/OpenAPI como único transporte.** Es lo único que tu código realmente hace (el `POST` de claude.js). No metí gRPC porque no hay rastro de ello.
- **`api/` primero, con READMEs por módulo + manifiesto de tools.** El manifiesto refleja exactamente la taxonomía `TOOLS` de `ReasonView` + `data_agents.js` (search/graph/txn/geo/model); cada tool es un wrapper fino sobre un op OpenAPI. Discoverable por agentes.
- **Transversales en UN solo sitio (`internal/platform`).** `rbac`, `classification`, `audit`, `lineage` no se duplican; `governance` hace *queries* de audit y workflow de acceso, `platform/audit` es el único *writer*.
- **Paridad compose↔helm honesta a escala.** Day-one: **Postgres (system-of-record) + Redis + MinIO + Kafka/Redpanda**. **ClickHouse (OLAP), OpenSearch (search) y motor de grafo nativo van DIFERIDOS** tras perfiles de compose / values de helm (laptop usa Postgres FTS). Para "cientos de TB/día + 6000 concurrentes" el lake es MinIO/S3, el fact-table de txn es columnar, y el grafo de millones de nodos sale de Postgres — pero se introducen *cuando la carga medida lo exige* (un ADR lo documenta, no lo esconde).

---

## Mapeo vista (UI) → módulo backend

| Vista / feature (archivo) | Route | Paquete backend | Contrato |
|---|---|---|---|
| `Shell.jsx` CommandPalette (⌘K) | search | internal/objects (search) | objects.yaml |
| `Shell.jsx` NotifDrawer (NOTIFS) | (shell) | internal/cases (notifications) | cases.yaml |
| `Copilot.jsx` (⌘J) | (overlay) | internal/llm + internal/agents (+ cmd/llm-proxy) | llm.yaml, agents.yaml, tools/* |
| `OntologyView`/`OntologyAuthor`/`ObjectViewsAuthor` | ontology | internal/ontology | ontology.yaml |
| `ResolveView.jsx` (merge/split) | resolve | internal/resolve | resolve.yaml |
| `GraphView`/`GraphAnalysisView` | graph/graph2 | internal/graph (+ cmd/centrality-job) | graph.yaml |
| `BrushingView.jsx` (lentes vinculadas) | brushing | internal/graph + internal/geo | graph.yaml, geo.yaml |
| `MapView.jsx` (AIS, tracks, eventos) | map | internal/geo (incl. /geo/events) | geo.yaml |
| `HomeView`/`DashboardView`/`AnalyticsView` | home/dashboard/analytics | internal/analytics (+ health, cases) | analytics.yaml |
| `CasesWorkbench` AlertsBoard | cases | internal/cases (alerts) | cases.yaml |
| `EvidenceView.jsx` | evidence | internal/evidence | evidence.yaml |
| `ActionsView.jsx` (invoke + approval) | actions | internal/actions (+ cmd/action-worker) | actions.yaml |
| `RulesView.jsx` (detection/response, 'block') | rules | internal/rules (+ cmd/stream-worker eval) | rules.yaml |
| `ReasonView.jsx` (agents/evals) | reason | internal/agents | agents.yaml, tools/* |
| `ReportsView` + `Reports.jsx` DossierModal | reports | internal/reports | reports.yaml |
| `ModelsView.jsx` (registry/deploy, /fn/*) | models | internal/models | models.yaml |
| `GovernanceView.jsx` (audit/access/markings/lineage) | govern | internal/governance + platform/{audit,classification,lineage} | governance.yaml |
| `AdminView.jsx` (users/roles) | admin | internal/iam + platform/rbac | iam.yaml |
| `SourcesView`+`SourceWizard`/`PipelineView`/`CodeRepoView` | sources/pipeline/code | internal/ingest (+ stream/batch workers) | ingest.yaml |
| `HealthView.jsx` | health | internal/health | health.yaml |
| `EntityView.jsx` (Overview/Connections/Lineage) | entity | internal/objects + internal/graph + platform/lineage | objects.yaml, graph.yaml |
| `EntityView` Transactions (OLTP por id, **no** OLAP) | entity | internal/objects /objects/{id}/transactions | objects.yaml |
| `EntityView` discusión (COMMENTS, write) | entity | internal/objects /objects/{id}/comments | objects.yaml |
| `Workbenches.jsx` / `TweaksPanel` / i18n / rail | (UI) | **sin backend** — composición / localStorage | n/a |

---

## No determinable (según tu regla — no lo inventé)

Cada vista lee `src/data/*.js` estático; sólo `claude.js` hace una llamada real. Por tanto:

- **Auth/sesión/login** — `CURRENT_USER='AR'` es un índice estático; no hay token ni flujo de login.
- **Protocolo de transporte** — cero `fetch`/HTTP salvo `claude.js`. REST se *elige* por coincidir con la única llamada real; si quieres GraphQL/gRPC no está en el código.
- **Cardinalidad/throughput reales** — '1.2B', '48,213', '$58.7M', '44 MB' son literales / `Math.sin` en fixtures. Las elecciones de sharding/particionado asumen tu NFR declarada, **no** carga medida.
- **Streaming a la UI (SSE/websocket)** — la traza de ReasonView y "Live AIS" son `setTimeout` cliente; `claude.js` es explícitamente no-streaming.
- **Reversibilidad de write-backs** — ActionsView afirma "reversible" pero no hay lógica de compensación/undo.
- **Contratos de conectores externos** — SWIFT-GW, FIU, OFAC/EU, registry son sólo strings de efecto; sin adapters → interfaz (API/file-drop/mensaje) desconocida.
- **Runtime del Workshop app-builder** — `APPS`/`TEMPLATES` estáticos, "New app" sin handler → sin contrato backend.
- **Persistencia server-side** — todo editor/grant/merge/toggle/invite muta estado React o localStorage; el contrato de persistencia está implícito, no en código.

---

¿Siguiente paso útil? Puedo (a) generar los `api/openapi/*.yaml` anclados a los campos reales de tus `data/*.js`, (b) andamiar el esqueleto Go (`go.mod`, `cmd/axiom`, `internal/platform/httpx`, un contexto de ejemplo end-to-end), o (c) escribir el `docker-compose.yml` + chart Helm de arranque. Dime cuál y lo monto.
