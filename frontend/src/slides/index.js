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

// Clase 11 — MIR & Audio Fingerprinting / Shazam (refactor narrativo · 11 beats).
import SlidePortadaMIR          from './portada_mir/Slide.jsx';          // 01 portada
import SlideProblemaShazam      from './problema_shazam/Slide.jsx';      // 02 el misterio
import SlideShazamTeaser        from './shazam_teaser/Slide.jsx';        // 03 truco de magia (teaser)
import SlideBifurcacion         from './bifurcacion/Slide.jsx';          // 04 tronco común + fork
import SlideFeaturesAudio       from './features_audio/Slide.jsx';       // 05 DESCRIBIR: features
import SlideGrietaDescribir     from './grieta_describir/Slide.jsx';     // 06 la grieta de describir
import SlideConstelacionWang    from './constelacion_wang/Slide.jsx';    // 07 constelación de Wang
import SlideHashingCombinatorio from './hashing_combinatorio/Slide.jsx'; // 08 hashing + índice
import SlideWangCoherencia     from './wang_coherencia/Slide.jsx';      // 08b coherencia temporal (Wang)
import SlideHistogramaOffsets   from './histograma_offsets/Slide.jsx';   // 09 histograma de offsets
import SlideLimitesShazam       from './limites_shazam/Slide.jsx';       // 10 rompiendo el algoritmo
import SlideShazamPipeline      from './shazam_pipeline/Slide.jsx';      // 12 pipeline completo
// Apéndices / backup (fuera del flujo principal).
import SlideOnsetBPM            from './onset_bpm/Slide.jsx';            // A · onsets & BPM
import SlidePipelineShazam      from './pipeline_shazam/Slide.jsx';      // A · pipeline (stepper)
import SlideDemoMIR             from './demo_mir/Slide.jsx';             // A · laboratorio libre

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

  // Clase 11 — MIR & Shazam (refactor narrativo)
  'portada_mir':          SlidePortadaMIR,
  'problema_shazam':      SlideProblemaShazam,
  'shazam_teaser':        SlideShazamTeaser,
  'bifurcacion':          SlideBifurcacion,
  'features_audio':       SlideFeaturesAudio,
  'grieta_describir':     SlideGrietaDescribir,
  'constelacion_wang':    SlideConstelacionWang,
  'hashing_combinatorio': SlideHashingCombinatorio,
  'wang_coherencia':      SlideWangCoherencia,
  'histograma_offsets':   SlideHistogramaOffsets,
  'limites_shazam':       SlideLimitesShazam,
  'shazam_pipeline':      SlideShazamPipeline,
  // Apéndices / backup
  'onset_bpm':            SlideOnsetBPM,
  'pipeline_shazam':      SlidePipelineShazam,
  'demo_mir':             SlideDemoMIR,
};

export function getSlideComponent(id) {
  return SLIDE_REGISTRY[id] ?? null;
}
