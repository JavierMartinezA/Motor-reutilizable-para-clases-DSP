# Lessons · Bitácora de errores y aprendizajes

> Convención: cada entrada incluye **Síntoma**, **Causa raíz** y **Remedio**.
> Mantener orden cronológico inverso (más reciente arriba).

## 2026-04-30 · Rename `sms-slides/` → `frontend/` y servicios Render

**Síntoma:** El directorio raíz seguía llamándose `sms-slides/` y los nombres
de servicio en `render.yaml` eran `sms-backend` / `sms-frontend`,
contradiciendo el espíritu de "boilerplate desacoplado".

**Causa raíz:** Renombrar afecta a 8 archivos (`render.yaml`, `package.json`,
`package-lock.json`, `sync_to_public.py`, `CLAUDE.md`, `README.md`,
`INSTRUCCIONES.md`, `tasks/lessons.md`, `.claude/rules/python-dsp-base.md`,
`.gitignore`). Riesgo de romper deploy si se hace mal.

**Remedio:** `mv sms-slides frontend`; `Edit` con `replace_all: true` sobre
`sms-slides` → `frontend` en todos los archivos. Servicios Render renombrados
a `dsp-backend` / `dsp-frontend`. Nombre del paquete npm a `dsp-slides`.

**Aviso de deploy:** Render tratará los nuevos nombres como servicios nuevos.
Si había deploys con los nombres viejos, deben removerse manualmente desde el
dashboard. Las URLs públicas cambian.

**Anti-patrón a evitar:** `git mv` falla si el índice tiene archivos eliminados
(restos de purgas previas) que ya no existen en disco. Usar `mv` plano y
dejar que `git status` detecte el rename al hacer commit.

---

## 2026-04-30 · La memoria del agente debe residir en la raíz

**Síntoma:** `CLAUDE.md` se había escrito dentro de `frontend/` (la subcarpeta
del frontend), heredando el path original del proyecto SMS. Esto rompía la
carga de contexto global: agentes ejecutados desde la raíz, desde
`backend/` o desde `dsp_pipelines/` no tenían visibilidad
del documento maestro.

**Causa raíz:** Confusión entre "instrucciones para Copilot del frontend"
(scope local) y "memoria persistente del repositorio" (scope global). En un
monorepo con varios subproyectos hermanos (frontend, backend Python,
pipelines DSP), la memoria del agente debe vivir UNA vez y en la raíz.

**Remedio:**
- `CLAUDE.md` movido a la raíz, con paths absolutos al monorepo
  (`frontend/src/...`, `dsp_pipelines/pipelines/...`).
- `frontend/.github/copilot-instructions.md` ahora apunta a `../../CLAUDE.md`.
- `.claude/` y `.claude/rules/` ya estaban en la raíz (verificado).

**Anti-patrón a evitar:** Nunca duplicar `CLAUDE.md` en subcarpetas. Si una
herramienta exige un archivo de instrucciones en una ubicación específica
(p. ej. `.github/copilot-instructions.md` para GitHub Copilot), usar un
**puntero corto** al canónico de la raíz, no copiar el contenido.

**Regla derivada:** La memoria del agente debe residir siempre en la raíz
para garantizar la carga de contexto global, sin importar desde dónde se
invoque al agente.

---

## 2026-04-30 · Documentos de instrucciones duplicados

**Síntoma:** Tras la purga inicial olvidé `frontend/.github/copilot-instructions.md`,
una segunda copia (más vieja) de las instrucciones SMS específicas, paralela
a `frontend/CLAUDE.md`.

**Causa raíz:** Existían dos sistemas de "agent instructions" en paralelo
(GitHub Copilot vía `.github/copilot-instructions.md` y Claude Code vía
`CLAUDE.md`) con contenido duplicado y propenso a divergir.

**Remedio:** `copilot-instructions.md` ahora es un puntero al `CLAUDE.md`
canónico (con un resumen ejecutivo de 6 reglas). Editar SOLO `CLAUDE.md`.

**Anti-patrón a evitar:** Mantener dos archivos de instrucciones largos en
paralelo. Si aparece un nuevo agente, hacer que apunte al canónico, no copiar.

---

## 2026-04-30 · Topología del nuevo motor (post-purga SMS)

**Contexto:** transformación del repo de "presentación SMS" a boilerplate
genérico (purga ejecutada en abril 2026; el plan original se conservó solo
en el historial de git). El motor quedó así:

```
                    ┌─────────────────────────────────────┐
                    │  course_config.json (single source) │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              ▼                    ▼                     ▼
   src/slides/index.js     src/content/content.md   pipelines/<id>.py
   (registry id→Comp)      (texto/fórmulas)          (DSP en Python)
              │                    │                     │
              └─────► <App.jsx>◄───┘                     │
                          │                              │
                  ┌───────┴────────┐                     │
                  ▼                ▼                     ▼
          <SlideLayout>    <RecorderProvider>     outputs/*.wav,*.png
          <MathFormula>           │                     │
          <DSPCanvas3D>           ▼                     ▼
          <AudioPlayer>     POST /api/upload     sync_to_public.py
                            POST /api/run/<id>          │
                                                        ▼
                                          frontend/public/{audio,imagenes}/
```

**Capas**

| Capa | Archivos | Toca al cambiar de clase |
|---|---|---|
| **Motor (intocable)** | `App.jsx`, `main.jsx`, `index.css`, `components/*`, `voice/LiveVoiceContext.jsx`, `backend/main.py`, `vite.config.js`, `package.json` | ❌ |
| **Configuración (única fuente)** | `course_config.json` | ✅ |
| **Contenido (slot-based)** | `src/slides/<id>/Slide.jsx`, `src/slides/index.js`, `src/content/content.md` | ✅ |
| **Pipelines DSP** | `dsp_pipelines/pipelines/<id>.py` | ✅ (opcional) |
| **Context OS** | `.claude/rules/*.md`, `_template/*` | rara vez |
| **Automatización** | `sync_to_public.py`, `.claude/settings.json` (PostToolUse) | ❌ |

**Few-shot preservado:** la topología pedagógica del slide pipeline (header
serif + dos columnas + cards con estados pending/revealed/active + panel
visual con fade) está congelada en `_template/SlideTemplate.jsx`.
La estructura del contexto teórico (5 secciones: limitación → matemática →
algoritmo → modelo de señal → mapeo a código) está en
`_template/theory_context_template.md`.

**Hook PostToolUse:** registrado en `.claude/settings.json` (raíz).
Dispara `python sync_to_public.py` cuando:
- un Bash ejecuta un script Python en `dsp_pipelines/`,
- un Write/Edit toca `dsp_pipelines/outputs/` o `pipelines/`.

Modo permisivo del sync: si `course_config.pipelines` está vacío, copia
todos los `.wav/.png` de `outputs/` al frontend con sus nombres originales.

---

## Plantilla para futuros aprendizajes

### YYYY-MM-DD · Título corto

**Síntoma:** Qué se observó (mensaje de error, comportamiento inesperado).

**Causa raíz:** Por qué ocurría (no el síntoma — la causa real).

**Remedio:** Qué se hizo. Si aplica, archivo y línea modificados.

**Anti-patrón a evitar:** Una frase imperativa ("nunca importar X con Y").
