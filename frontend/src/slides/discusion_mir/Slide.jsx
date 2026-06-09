/**
 * Clase 11 · MIR & Shazam — Slide 11 · El veredicto y dónde se rompe
 * =================================================================
 * Cierre del fork: la rúbrica de 4 criterios COMPLETA. DESCRIBIR falló los
 * cuatro; IDENTIFICAR los pasó — por eso Shazam eligió ese camino. Pero ganar
 * IDENTIFICAR tiene un precio: ancla frecuencias absolutas → no reconoce
 * covers, versiones en vivo ni transposiciones. Para eso hay que VOLVER a la
 * rama DESCRIBIR con descriptores más listos (chroma). Conecta con la Fun Task
 * y con S12 (difusión generativa).
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import { INK, INK_MUTED, INK_FAINT, BLUE, VIOLET, GREEN, RED, RevealButton } from '../_mir_shared.jsx';

const CRITERIA = ['Localización temporal', 'Invariancia traslacional', 'Robustez al ruido', 'Entropía / especificidad'];

const QUESTIONS = [
  'Fingerprinting robusto a transposición: relative-pitch hashes',
  'Detectar un riff sampleado entre dos temas: búsqueda parcial',
  'YouTube Content ID: ¿es Shazam, o algo más?',
];

function RubricCell({ ok }) {
  return (
    <div style={{ padding: '6px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color: ok ? GREEN : RED }}>
      {ok ? '✓' : '✗'}
    </div>
  );
}

export default function SlideDiscusionMIR() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="11"
      sectionLabel="MIR · Síntesis"
      title={<>Síntesis y <em>límites</em></>}
      subtitle="Dos tareas, una rúbrica: DESCRIBIR falló los 4 criterios, IDENTIFICAR los cumplió. Shazam optó por IDENTIFICAR, con una limitación a cambio."
      footer={
        <RevealButton
          step={step}
          total={3}
          onAdvance={() => setStep((s) => s + 1)}
          onReset={() => setStep(0)}
          labels={['¿Reconoce un cover?', 'La salida: descriptores invariantes', 'Preguntas para debatir']}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 28, alignItems: 'start' }}>
        {/* ── La rúbrica COMPLETA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            La rúbrica, completa
          </span>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e3d8' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr', background: '#f0ece2', fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 800, color: INK }}>
              <div style={{ padding: '8px 14px' }}>criterio</div>
              <div style={{ padding: '8px 8px', textAlign: 'center', color: BLUE }}>DESCRIBIR</div>
              <div style={{ padding: '8px 8px', textAlign: 'center', color: VIOLET }}>IDENTIFICAR</div>
            </div>
            {CRITERIA.map((c, i) => (
              <div key={c} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr', background: i % 2 ? '#fbf9f5' : '#fff', borderTop: '1px solid #efeadf' }}>
                <div style={{ padding: '7px 14px', fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK }}>{c}</div>
                <RubricCell ok={false} />
                <RubricCell ok={true} />
              </div>
            ))}
          </div>
          <div style={{ padding: '13px 18px', borderRadius: 12, background: '#f3eefc', borderLeft: `4px solid ${VIOLET}`, fontFamily: "'Newsreader', serif", fontSize: 16.5, fontStyle: 'italic', color: INK, lineHeight: 1.5 }}>
            Shazam descartó los descriptores promedio y eligió la huella local y robusta.
            Pero esa misma elección — anclar <strong>frecuencias absolutas</strong> — es su punto ciego.
          </div>
        </div>

        {/* ── El precio + la salida + preguntas ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '13px 18px', borderRadius: 12, background: '#fbeeee', border: `1px solid ${RED}33`, opacity: step >= 1 ? 1 : 0.18, transition: 'opacity 0.45s' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 800, color: INK }}>
              ¿Un cover transpuesto medio tono?
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: INK_MUTED, lineHeight: 1.5, marginTop: 5 }}>
              Wang <strong style={{ color: RED }}>falla</strong>: cada pico salta de bin de frecuencia absoluta
              y toda la llave del diccionario cambia. Identifica una <em>grabación</em>, no una <em>canción</em>.
            </p>
          </div>
          <div style={{ padding: '13px 18px', borderRadius: 12, background: '#eefcf2', borderLeft: `4px solid ${GREEN}`, opacity: step >= 2 ? 1 : 0.18, transition: 'opacity 0.45s' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN, fontWeight: 800 }}>
              La salida: volver a DESCRIBIR, con descriptores invariantes
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: INK, lineHeight: 1.5, marginTop: 5 }}>
              <strong>Chroma</strong> (energía mapeada a las 12 notas, ignora octava) y <strong>relative-pitch hashes</strong>:
              guardar la <em>proporción</em>, no la frecuencia absoluta.
            </p>
            <div style={{ background: '#08111d', borderRadius: 8, padding: '10px 14px', marginTop: 7, color: '#cdeccd', textAlign: 'center' }}>
              <MathFormula t="H_{\text{rel}} = \left(\textcolor{#4ade80}{\tfrac{f_2}{f_1}},\ \Delta t\right)\ \Rightarrow\ \text{invariante a transposición}" color="#cdeccd" size={1.05} display />
            </div>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700, marginTop: 2, opacity: step >= 3 ? 1 : 0.18, transition: 'opacity 0.45s' }}>
            Para debatir → Fun Task · S12
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, opacity: step >= 3 ? 1 : 0.18, transition: 'opacity 0.45s' }}>
            {QUESTIONS.map((q, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10, alignItems: 'baseline', padding: '7px 12px', borderRadius: 8, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800, color: VIOLET }}>{['a', 'b', 'c'][i]}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK, lineHeight: 1.35 }}>{q}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_FAINT, textAlign: 'center', lineHeight: 1.4, opacity: step >= 3 ? 1 : 0.18, transition: 'opacity 0.45s' }}>
            <strong style={{ color: BLUE }}>S12 · difusión generativa</strong> invierte el ciclo: features → audio nuevo.
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
