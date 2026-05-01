# Copilot Instructions

> Las instrucciones canónicas viven en la **raíz del repositorio**:
> [`../../CLAUDE.md`](../../CLAUDE.md). Este archivo existe solo para que
> GitHub Copilot las detecte (su convención exige `.github/copilot-instructions.md`
> dentro del proyecto frontend). No editar aquí — modificar el `CLAUDE.md`
> de la raíz y, si es estrictamente necesario, sincronizar.

## Resumen ejecutivo

Boilerplate genérico para presentaciones interactivas de DSP. Arquitectura
config-driven:

- **Fuente de verdad**: `src/config/course_config.json`.
- **Componente por slide**: `src/slides/<id>/Slide.jsx` + registro en `src/slides/index.js`.
- **Texto/fórmulas**: `src/content/content.md`.
- **Motor (no tocar)**: `src/App.jsx`, `src/components/{SlideLayout,MathFormula,DSPCanvas3D,AudioPlayer}.jsx`, `src/voice/LiveVoiceContext.jsx`.

## Reglas en una línea

1. Zero-scroll por slide (proyección en sala).
2. KaTeX para matemáticas; nunca imágenes ni MathJax.
3. Audio desde `/audio/...` en `public/`; nunca `import` de WAV.
4. Sin `setTimeout` para avanzar pasos — el profesor controla el ritmo.
5. No hardcodear slides en `App.jsx`; el config es la única fuente.
6. Paleta canónica: azul `#2563eb`, rojo `#c0392b`, verde `#16a34a`, ámbar `#d97706`, violeta `#7c3aed`.

Para detalle ver `CLAUDE.md` y las reglas modulares en `../.claude/rules/`.
