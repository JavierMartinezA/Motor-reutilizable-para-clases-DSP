# TODO · DSP Slides Boilerplate

## Pendientes vivos

- [x] Slide **`sintesis-clasica`** (“Síntesis Clásica: Arquitectos del Aire”):
      `frontend/src/slides/sintesis-clasica/Slide.jsx`, registro en
      `src/slides/index.js` y `course_config.json`.
- [x] Pipeline **`sintesis_clasica`**: `dsp_pipelines/pipelines/sintesis_clasica.py`
      (tres demos WAV + PNG; clave JSON sin guion por import Python).
- [x] Slide **`sintesis_fm`** ("La Magia de la Síntesis FM y el DX7"):
      8 pasos · motor Web Audio (FM ≡ PM), curvas de Bessel J_n(I), espectro
      |J_n(I)| en líneas, envolvente ADSR sobre I (campana / Rhodes),
      nulo de Bessel destacado en J_0(2.4048).
- [x] `npm run build` verifica que el motor compila sin imports rotos.
- [ ] Verificar el hook `PostToolUse` ejecutándolo manualmente con un pipeline
      placeholder y un input dummy.
- [ ] (Opcional) Pipeline Python `sintesis_fm` que genere WAV/PNG estáticos
      de respaldo para casos sin audio interactivo (proyectores sin sonido).
- [ ] Escribir un primer item en `tasks/lessons.md` después de la primera
      iteración real del flujo end-to-end (Python → sync → React).

## Mantenimiento periódico

- [ ] **Memoria global en raíz**: `CLAUDE.md` y `.claude/` deben permanecer
      siempre en la raíz del repo. Si un agente o herramienta exige otra
      ubicación, crear un puntero corto al canónico, nunca duplicar el
      contenido. Verificar tras cualquier reestructuración.
- [ ] Mantener cada archivo en `.claude/rules/` ≤ 150 líneas.
- [ ] Revisar `course_config.json` antes de cada release: que toda `id`
      declarada esté en `slides/index.js`.
- [ ] Limpiar `backend/sessions/` si crece demasiado (TTL 30
      min ya cubre la mayoría de casos).
