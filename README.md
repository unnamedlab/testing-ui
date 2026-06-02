# AXIOM — Intelligence & Operations Platform (UI)

Prototipo de interfaz para una plataforma de análisis de inteligencia (estilo
"intelligence/operations"): grafo de entidades, mapa, casos, reglas, ontología,
pipeline de datos y un copilot de lenguaje natural. Datos de demo incluidos.

Construido como **React + Vite** (ES modules). Anteriormente corría con Babel
en el navegador desde un único HTML; ahora es un proyecto estándar con build.

## Requisitos

- Node.js ≥ 18

## Puesta en marcha

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo → http://localhost:5173
npm run build    # build de producción → dist/
npm run preview  # servir el build de producción localmente
npm run lint     # ESLint
npm run format   # Prettier (formatea src/)
```

## Estructura

```
.
├── index.html              # entry de Vite (carga /src/main.jsx)
├── vite.config.js          # configuración de Vite + plugin React
├── eslint.config.js        # ESLint (flat config)
├── .prettierrc             # estilo de Prettier
└── src/
    ├── main.jsx            # punto de entrada: monta <App/>
    ├── App.jsx             # raíz: router de vistas, estado global, atajos
    ├── styles.css          # estilos globales (theming por CSS vars)
    ├── components/         # UI compartida y paneles de feature
    │   ├── ui.jsx          #   primitivas: Icon, Badge, RiskPill, Stat…
    │   ├── Shell.jsx       #   Rail, TopBar, CommandPalette, NotifDrawer…
    │   ├── Copilot.jsx     #   copilot de lenguaje natural
    │   ├── TweaksPanel.jsx #   panel de ajustes (tema/acento/densidad)
    │   ├── TimeScrubber.jsx#   control temporal del grafo/mapa
    │   ├── Reports.jsx     #   dossier / informes
    │   └── Security.jsx    #   clasificación, marcados, control de acceso
    ├── views/              # una vista por pantalla (HomeView, GraphView…)
    ├── data/               # datos de demo (mock fixtures) + helpers
    └── services/
        └── claude.js       # abstracción del proveedor de modelo (copilot)
```

## Notas

- **Tema/ajustes:** el panel de ajustes se abre con **Cmd/Ctrl + ,** y persiste
  en `localStorage`. Atajos: **Cmd/Ctrl+K** (paleta), **Cmd/Ctrl+J** (copilot),
  **?** (ayuda de atajos).
- **Copilot:** usa un modelo real si el host inyecta `window.claude` (entorno de
  artifacts); en standalone degrada a respuestas de demo. Para conectar un
  backend propio, implementa `complete()` en [src/services/claude.js](src/services/claude.js)
  (haz la llamada a la API de Anthropic desde tu servidor, nunca expongas la API key en el cliente).
- Los datos de `src/data/` son ficticios, generados para la demo.
