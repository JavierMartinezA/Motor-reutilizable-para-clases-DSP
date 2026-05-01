/**
 * Slide Registry
 * ==============
 * Mapa id → componente. Es la fuente de imports físicos.
 * `course_config.json` lista los ids; este archivo los conecta a sus
 * componentes React.
 *
 * Para añadir una slide nueva:
 *   1. Crear src/slides/<id>/Slide.jsx (copiar _template/SlideTemplate.jsx).
 *   2. Importar abajo y agregar entrada al SLIDE_REGISTRY.
 *   3. Declarar `{ id, label }` en course_config.json.
 *
 * Si `course_config.json` lista un id que no existe en este registro, el
 * motor renderiza un placeholder con instrucciones (ver `<MissingSlide>`).
 */

// Importa aquí cada slide concreta:
// import SlideExample from './example/Slide.jsx';

export const SLIDE_REGISTRY = {
  // 'example': SlideExample,
};

export function getSlideComponent(id) {
  return SLIDE_REGISTRY[id] ?? null;
}
