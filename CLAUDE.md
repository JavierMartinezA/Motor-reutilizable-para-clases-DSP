# CLAUDE.md — Memoria Maestra del Repositorio

> Documento canónico de instrucciones del agente. Reside en la **raíz del
> monorepo** para que cualquier herramienta (Claude Code, GitHub Copilot vía
> el puntero en `frontend/.github/copilot-instructions.md`, etc.) lo cargue
> como contexto global.
>
> Reglas modulares detalladas: [`./.claude/rules/`](./.claude/rules/).
> Templates few-shot: [`./_template/`](./_template/).

## Topología del monorepo

```
.                                   ← raíz (configs globales)
├── CLAUDE.md                       ← este archivo (memoria del agente)
├── .claude/
│   ├── rules/{react-templates,python-dsp-base,threejs-canvas}.md
│   ├── settings.json               ← hooks PostToolUse
│   └── settings.local.json         ← permisos por usuario
├── _template/                      ← few-shot frozen (theory + slide)
├── tasks/{todo,lessons}.md         ← bitácora viva
├── render.yaml                     ← deploy
├── sync_to_public.py               ← Python → frontend bridge
├── frontend/                     ← FRONTEND (React 19 + Vite + Tailwind v4)
│   ├── package.json, vite.config.js
│   ├── src/{config,content,slides,components,voice}/
│   └── public/{audio,imagenes}/
├── backend/         ← BACKEND (FastAPI scaffold genérico)
│   ├── main.py
│   └── requirements.txt
└── dsp_pipelines/              ← PIPELINES DSP (numpy/scipy/soundfile)
    ├── pipelines/<id>.py
    ├── inputs/, outputs/
```

Backend, frontend y módulos DSP son **directorios hermanos** al mismo nivel.
No mezclan dependencias. La raíz solo contiene configuración global.

## Contexto del Proyecto

Boilerplate genérico para presentaciones interactivas universitarias sobre
**procesamiento de señales digitales** (DSP). Scaffold reutilizable entre
clases (filtros, AM/FM, STFT, codecs, modelado espectral, etc.).

El frontend (Vite + React 19) consume:
- `frontend/src/config/course_config.json` — fuente de verdad: lista de slides, tema, pipelines.
- `frontend/src/slides/<id>/Slide.jsx` — componente concreto por clase.
- `frontend/src/content/content.md` — texto teórico y fórmulas, separado de la UI.

El backend (FastAPI) ejecuta pipelines DSP genéricos en
`dsp_pipelines/pipelines/<id>.py` y deja artefactos (.wav, .png) que
`sync_to_public.py` copia a `frontend/public/`.

## Estilo Visual

### Principios de diseño
- **Estética editorial/académica** (Distill.pub). Sin slides corporativas.
- **Fondo cream** (`#faf8f3`), texto oscuro (`#1a1a2e`). Fondos negros solo en canvas 3D.
- **Tipografía**: Newsreader (serif) para títulos/cuerpo, Inter (sans) para UI, JetBrains Mono para datos numéricos.
- **Espaciado generoso**: zero-scroll, proyección en sala.
- **Animaciones sutiles**: `anim-fade-up` para entrada, transiciones CSS suaves.

### Paleta canónica (usar consistentemente)
- **Azul** `#2563eb`: componente principal/determinista
- **Rojo** `#c0392b`: componente secundario/error/estocástico
- **Verde** `#16a34a`: nacimiento/aceptación
- **Ámbar** `#d97706`: advertencia/transición
- **Violeta** `#7c3aed`: pipeline completo

### Patrones de componentes (motor)
- `<SlideLayout>` — shell con header serif + slot de contenido + footer.
- `<MathFormula t="..." display />` — wrapper KaTeX (`trust:true, strict:false`). Para colorear variables: `\textcolor{#hex}{...}` dentro del LaTeX.
- `<DSPCanvas3D>` — wrapper @react-three/fiber con cámara/luces/ejes estándar. Convención: X tiempo, Y magnitud, Z frecuencia.
- `<AudioPlayer src="/audio/foo.wav" />` — HTML Audio, debounce 280 ms.
- `<RecorderProvider>` (alias `LiveVoiceProvider`) — graba mic, sube a `/api/upload`.

### Patrón de pasos interactivos
- State `step` controlado por botón manual (NO `setTimeout` automático — el profesor controla el ritmo).
- Botón con label descriptivo del próximo paso, color del paso activo.
- Elementos aparecen con `opacity` + `translate-y` vía CSS transitions.

### Patrón de audio
- Archivos servidos desde `frontend/public/audio/` como assets estáticos (NO importar con `import`).
- Referenciar con rutas absolutas: `/audio/foo.wav`.
- Web Audio API solo cuando se necesite síntesis en cliente.

## Cómo añadir una nueva presentación (Workflow del Agente)

Cuando el usuario pida crear una nueva presentación, proveerá un archivo `.md` en la raíz (ej. `Plan_presentacionACTUAL.md`) con las especificaciones y detalles de cada slide. El agente debe:

1. **Leer el plan:** Analizar el archivo `.md` (ej. `Plan_presentacionACTUAL.md`) en la raíz del proyecto para entender las slides requeridas.
2. **Construir iterativamente:** Crear las slides una por una según el plan:
   - `cp -r frontend/src/slides/_template frontend/src/slides/<mi-id>`
   - Editar `frontend/src/slides/<mi-id>/Slide.jsx` con el contenido correspondiente.
   - Registrar en `frontend/src/slides/index.js` agregándolo al `SLIDE_REGISTRY`.
   - Declarar en `frontend/src/config/course_config.json` dentro del array `slides`.
   - Añadir texto/fórmulas en `frontend/src/content/content.md` bajo el encabezado `## <mi-id>`.
3. **Pausar para feedback:** Al terminar de construir la presentación según el plan, informar al usuario y esperar instrucciones para refinar slides específicas.

> **No tocar `frontend/src/App.jsx`** para añadir/quitar slides. Es parte del motor.

## Cómo añadir un pipeline DSP

1. `cp dsp_pipelines/pipelines/_template.py dsp_pipelines/pipelines/<mi-id>.py`
2. Implementar `def run(input_wav, out_dir, **params) -> PipelineResult`.
3. Registrar en `frontend/src/config/course_config.json` bajo `pipelines.<mi-id>` (input, params, outputs).
4. Ejecutar `python sync_to_public.py` (o dejar que el hook `PostToolUse` lo dispare automáticamente).

## Reglas Importantes

1. **Zero-scroll**: cada slide debe caber sin scroll (proyección en sala).
2. **Matemáticas en KaTeX** (nunca MathJax). `trust: true, strict: false` para colores hex.
3. **Consistencia cromática**: si una variable es ámbar en la fórmula, su gráfica también.
4. **Botones de paso son del profesor**: no automatizar con timers.
5. **Audio**: nunca `import` de WAV — siempre rutas `/audio/...` hacia `frontend/public/`.
6. **Config-driven**: `course_config.json` es la única fuente de verdad. `App.jsx` no debe hardcodear slides.
7. **Reglas de contexto**: ver `.claude/rules/` (`react-templates.md`, `python-dsp-base.md`, `threejs-canvas.md`). Cada una ≤ 150 líneas con formato WHAT/WHY/HOW.
8. **Memoria del agente reside en raíz**: este archivo. No duplicar en subcarpetas — usar punteros si una herramienta requiere otra ubicación.
