/**
 * Clase 11 · MIR & Shazam — Slide 09 · Discusión y evolución
 * Colisiones · transposición · AcoustID/Chroma · relative-pitch hashes ·
 * preguntas para debatir + puente a S12 (difusión generativa).
 * Fuentes: presentacion (Slide 9) · slides_11.md (§9 + preguntas a/b/c).
 */

import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import { INK, INK_MUTED, INK_FAINT, VIOLET, GREEN, RED, AMBER, BLUE } from '../_mir_shared.jsx';

const QUESTIONS = [
  '¿Cómo harías el fingerprinting robusto a transposición? (pista: relative-pitch hashes)',
  '¿Cómo detectarías que dos canciones usan el mismo riff sampleado? (búsqueda parcial)',
  'YouTube Content ID: ¿es Shazam, o algo distinto? ¿Qué desafío extra tiene?',
];

export default function SlideDiscusionMIR() {
  return (
    <SlideLayout
      sectionId="09"
      sectionLabel="MIR · Q&A"
      title={<>Q&amp;A y <em>evolución</em> del modelo</>}
      subtitle="Shazam identifica una grabación, no una canción en abstracto. ¿Cómo se supera esa limitación?"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '14px 18px', borderRadius: 12, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 800, color: INK }}>
              ¿Dos canciones distintas con el mismo fingerprint?
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED, lineHeight: 1.5, marginTop: 6 }}>
              A nivel de <em>hash individual</em>, sí (colisión). Pero que una <strong>secuencia</strong> de hashes
              se alinee temporalmente en dos canciones es astronómicamente improbable: el espacio
              {' '}<span style={{ fontFamily: "'JetBrains Mono', monospace", color: INK }}>f₁×f₂×Δt</span> tiene millones de cubetas.
            </p>
          </div>
          <div style={{ padding: '14px 18px', borderRadius: 12, background: '#fbeeee', border: `1px solid ${RED}33` }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 800, color: INK }}>
              ¿Y un cover transpuesto un semitono?
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED, lineHeight: 1.5, marginTop: 6 }}>
              El algoritmo de Wang <strong style={{ color: RED }}>fracasa</strong>: cada pico salta de bin de frecuencia
              absoluta y toda la llave del diccionario cambia.
            </p>
          </div>
          <div style={{ padding: '14px 18px', borderRadius: 12, background: '#eefcf2', borderLeft: `4px solid ${GREEN}` }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN, fontWeight: 800 }}>
              La solución moderna
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK, lineHeight: 1.5, marginTop: 6 }}>
              <strong>AcoustID / Chroma</strong> (energía mapeada a las 12 notas, ignorando octava) y
              {' '}<strong>relative-pitch hashes</strong>: guardar la <em>proporción</em>, no la frecuencia absoluta.
            </p>
            <div style={{ background: '#08111d', borderRadius: 8, padding: '10px 14px', marginTop: 8, color: '#9cf0b4', textAlign: 'center' }}>
              <MathFormula t="H_{\text{rel}} = \left(\textcolor{#16a34a}{\tfrac{f_2}{f_1}},\ \Delta t\right)\ \Rightarrow\ \text{invariante a transposición}" display />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            Para pensar hasta la próxima clase
          </span>
          {QUESTIONS.map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, alignItems: 'baseline', padding: '12px 14px', borderRadius: 10, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color: VIOLET }}>{['a', 'b', 'c'][i]}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK, lineHeight: 1.45 }}>{q}</span>
            </div>
          ))}

          <div style={{ marginTop: 6, padding: '14px 18px', borderRadius: 12, background: '#f3eefc', borderLeft: `4px solid ${VIOLET}` }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: VIOLET, fontWeight: 800 }}>
              Hacia adelante · S12
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, fontStyle: 'italic', color: INK, lineHeight: 1.5, marginTop: 6 }}>
              Hoy: audio → features. La próxima (difusión generativa) invierte el problema:
              {' '}<strong>features → audio nuevo</strong>. Cerramos el ciclo análisis → síntesis → generación.
            </p>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: INK_FAINT, textAlign: 'center' }}>
            <strong style={{ color: BLUE }}>Fingerprinting</strong> responde "¿es esta grabación?" ·
            {' '}<strong style={{ color: AMBER }}>Music similarity</strong> responde "¿qué se le parece?"
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
