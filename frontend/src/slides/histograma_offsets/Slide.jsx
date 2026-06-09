/**
 * Clase 11 · MIR & Shazam — Slide 09 · El histograma de offsets (cierre del círculo)
 * ==================================================================================
 * Payoff del teaser (beat 3): "¿recuerdas las barras?". El sistema calcula
 * δt = t_db − t_query para cada match; la canción correcta concentra todos sus
 * aciertos en un offset (pico de Dirac), las incorrectas quedan planas. Esa es
 * la baja tasa de falsos positivos de Shazam a escala industrial.
 *
 * Vuelve a la demo: embebe <MiniShazam /> (modo completo) para re-correrlo en
 * vivo, ahora con el histograma EXPLICADO.
 */

import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import { INK, VIOLET, GREEN, RED, useMirAudio } from '../_mir_shared.jsx';
import { MiniShazam } from '../_mir_modules.jsx';

export default function SlideHistogramaOffsets() {
  const audio = useMirAudio();

  return (
    <SlideLayout
      sectionId="09"
      sectionLabel="MIR · Coherencia temporal"
      title={<>Coherencia temporal: <em>el histograma de offsets</em></>}
      subtitle="Compartir hashes no basta: algunos coinciden por azar. El discriminante real es temporal — la consistencia de los offsets."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Banner: la fórmula + Dirac vs nube + el porqué */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: 12, alignItems: 'stretch' }}>
          <div style={{ background: '#08111d', borderRadius: 10, padding: '10px 12px', color: '#e3d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MathFormula t="\delta t = t_{db} - t_{query}" color="#e3d4ff" size={1.12} display />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
            <div style={{ padding: '7px 12px', borderRadius: 7, background: '#eefcf2', borderLeft: `3px solid ${GREEN}`, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK }}>
              <strong style={{ color: GREEN }}>correcta →</strong> pico (Dirac)
            </div>
            <div style={{ padding: '7px 12px', borderRadius: 7, background: '#fbeeee', borderLeft: `3px solid ${RED}`, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK }}>
              <strong style={{ color: RED }}>incorrecta →</strong> nube plana
            </div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`, fontFamily: "'Newsreader', serif", fontSize: 14.5, fontStyle: 'italic', color: INK, lineHeight: 1.45, display: 'flex', alignItems: 'center' }}>
            ¿Gana la canción con más hashes en común? Córrelo: gana la que forma el <strong>pico</strong> más alto — de ahí su bajísima tasa de falsos positivos.
          </div>
        </div>

        {/* La demo, otra vez — ahora explicada, con el scatterplot 2D como
            puente: la diagonal de pendiente 1 se proyecta al pico del histograma. */}
        <MiniShazam audio={audio} scatter />
      </div>
    </SlideLayout>
  );
}
