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

// Hito 2 — Sound matching FM con RL (6 slides).
import SlidePivote               from './pivote_proyecto/Slide.jsx';        // 01 pivote del proyecto
import SlideSoundMatchingFM      from './sound_matching_fm/Slide.jsx';      // 02 problema sound matching
import SlideRLMDP                from './rl_mdp/Slide.jsx';                 // 03 RL + MDP
import SlideImplementacionProto  from './implementacion_prototipo/Slide.jsx'; // 04 prototipo
import SlideResultados           from './resultados/Slide.jsx';             // 05 resultados
import SlideConclusiones         from './conclusiones/Slide.jsx';           // 06 conclusiones

// Clase 11 — MIR & Audio Fingerprinting / Shazam (9 slides).
import SlidePortadaMIR        from './portada_mir/Slide.jsx';        // 01 portada
import SlideProblemaShazam    from './problema_shazam/Slide.jsx';    // 02 el problema
import SlideFeaturesAudio     from './features_audio/Slide.jsx';     // 03 descriptores
import SlideOnsetBPM          from './onset_bpm/Slide.jsx';          // 04 onsets & BPM
import SlidePipelineShazam    from './pipeline_shazam/Slide.jsx';    // 05 pipeline Shazam
import SlideDemoMIR           from './demo_mir/Slide.jsx';           // 06 demo en vivo
import SlideHistogramaOffsets from './histograma_offsets/Slide.jsx'; // 07 histograma offsets
import SlideLimitesShazam     from './limites_shazam/Slide.jsx';     // 08 fun task & límites
import SlideDiscusionMIR      from './discusion_mir/Slide.jsx';      // 09 discusión & Q&A

export const SLIDE_REGISTRY = {
  'sintesis_fm':   SlidePortada,
  'fm_intuicion':  SlideIntuicion,
  'fm_ecuacion':   SlideEcuacion,
  'fm_bessel':     SlideBessel,
  'fm_vivo':       SlidePlanoVivo,
  'recreando_80s': SlideRecreando80s,
  'fm_debate':     SlideDebate,

  // Hito 2
  'pivote_proyecto':         SlidePivote,
  'sound_matching_fm':       SlideSoundMatchingFM,
  'rl_mdp':                  SlideRLMDP,
  'implementacion_prototipo': SlideImplementacionProto,
  'resultados':              SlideResultados,
  'conclusiones':            SlideConclusiones,

  // Clase 11 — MIR & Shazam
  'portada_mir':        SlidePortadaMIR,
  'problema_shazam':    SlideProblemaShazam,
  'features_audio':     SlideFeaturesAudio,
  'onset_bpm':          SlideOnsetBPM,
  'pipeline_shazam':    SlidePipelineShazam,
  'demo_mir':           SlideDemoMIR,
  'histograma_offsets': SlideHistogramaOffsets,
  'limites_shazam':     SlideLimitesShazam,
  'discusion_mir':      SlideDiscusionMIR,
};

export function getSlideComponent(id) {
  return SLIDE_REGISTRY[id] ?? null;
}
