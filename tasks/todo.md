# TODO · DSP Slides Boilerplate

## Pendientes vivos

- [ ] Crear la primera slide concreta del próximo curso siguiendo
      `_template/SlideTemplate.jsx`. Registrar en `src/slides/index.js` y
      `course_config.json`.
- [ ] Implementar el primer pipeline DSP real en
      `dsp_pipelines/pipelines/<id>.py`. Usar `_template.py` como base.
- [ ] Verificar el hook `PostToolUse` ejecutándolo manualmente con un pipeline
      placeholder y un input dummy.
- [ ] Probar `npm run build` tras la purga para confirmar que el motor
      compila sin imports rotos.
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
