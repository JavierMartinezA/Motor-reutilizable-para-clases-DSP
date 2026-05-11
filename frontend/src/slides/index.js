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

// Sesión 09 — Síntesis FM (7 slides lógicas).
import SlidePortada     from './sintesis_fm/Slide.jsx';   // 01 Portada + DX7
import SlideIntuicion   from './fm_intuicion/Slide.jsx';   // 02 vibrato → timbre
import SlideEcuacion    from './fm_ecuacion/Slide.jsx';    // 03 ecuación + plano
import SlideBessel      from './fm_bessel/Slide.jsx';      // 04 Bessel sin álgebra
import SlidePlanoVivo   from './fm_vivo/Slide.jsx';        // 05 plano en vivo
import SlideRecreando80s from './recreando_80s/Slide.jsx'; // 06 Fun Task 09
import SlideDebate      from './fm_debate/Slide.jsx';      // 07 vacío de Bessel

export const SLIDE_REGISTRY = {
  'sintesis_fm':   SlidePortada,
  'fm_intuicion':  SlideIntuicion,
  'fm_ecuacion':   SlideEcuacion,
  'fm_bessel':     SlideBessel,
  'fm_vivo':       SlidePlanoVivo,
  'recreando_80s': SlideRecreando80s,
  'fm_debate':     SlideDebate,
};

export function getSlideComponent(id) {
  return SLIDE_REGISTRY[id] ?? null;
}
