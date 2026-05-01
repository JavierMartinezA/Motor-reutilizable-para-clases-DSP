# DSP Slides Boilerplate

Scaffold genérico para presentaciones interactivas de procesamiento digital
de señales (DSP) en contexto académico. Sirve como punto de partida para
clases sobre filtros, modulación, STFT, modelado espectral, codecs, etc.

## Componentes

| Capa | Stack | Responsabilidad |
|---|---|---|
| Frontend | React 19, Vite, Tailwind v4, KaTeX, Three.js | Presentación interactiva config-driven |
| Backend  | FastAPI, NumPy, SciPy, soundfile, matplotlib | Pipelines DSP + sesiones temporales |
| Sync     | Python script + hook `.claude/settings.json` | Copia `outputs/` → `frontend/public/` |

## Filosofía: Slot-Based Architecture

```
course_config.json     ← única fuente de verdad
       │
       ▼
src/slides/<id>/Slide.jsx ← componente concreto por clase
       │
       ▼
src/components/{SlideLayout,MathFormula,DSPCanvas3D,AudioPlayer}
       │  (motor genérico — no se toca al cambiar de clase)
       ▼
   <App.jsx renderiza dinámicamente desde el JSON>
```

Para una clase nueva, **no se toca el motor**: solo se editan
`course_config.json`, se añade un componente en `slides/`, y opcionalmente
un pipeline DSP en Python.

## Arranque

```bash
# backend
cd backend && pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8765

# frontend (otra terminal)
cd frontend && npm install && npm run dev
# → http://localhost:4020
```

Detalle paso a paso: ver [`INSTRUCCIONES.md`](INSTRUCCIONES.md).

## Documentos clave

- [`CLAUDE.md`](CLAUDE.md) — memoria maestra del agente (raíz).
- [`tasks/todo.md`](tasks/todo.md) — pendientes vivos.
- [`tasks/lessons.md`](tasks/lessons.md) — bitácora de errores y aprendizajes.
- [`.claude/rules/`](.claude/rules/) — context OS modular (WHAT/WHY/HOW).
- [`_template/`](_template/) — plantillas few-shot para teoría y slides.

## Licencia / Atribución

Boilerplate académico. Ajustar según el contexto del curso.
