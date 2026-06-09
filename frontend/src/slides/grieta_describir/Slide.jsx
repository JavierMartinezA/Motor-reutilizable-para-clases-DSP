/**
 * Clase 11 · MIR & Shazam — Slide 06 · La grieta de DESCRIBIR
 * ==========================================================
 * El pivote narrativo: ¿por qué Shazam NO usa el centroide para buscar?
 * Porque un descriptor global es un PROMEDIO sobre el frame — en un bar
 * ruidoso se mezcla con las voces y el número se desplaza. Aquí se llena la
 * columna DESCRIBIR de la rúbrica con ❌ en los 4 criterios, justificando el
 * salto al fingerprinting. Incluye mención de 30 s al Flujo Espectral / onsets
 * (alto nivel, pero igual de frágil al ruido).
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, BLUE, VIOLET, RED, GREEN,
  RevealButton,
} from '../_mir_shared.jsx';

const ROWS = [
  ['Localización temporal', 'es un promedio del frame entero: un evento lejano (una voz) contamina el número'],
  ['Invariancia traslacional', 'el valor depende de qué trozo tomaste; no se reproduce entre fragmentos'],
  ['Robustez al ruido', 'en el bar, el centroide de la canción se suma al de la gente → se desplaza'],
  ['Entropía / especificidad', 'son pocos números: millones de canciones comparten el mismo centroide medio'],
];

export default function SlideGrietaDescribir() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="07"
      sectionLabel="MIR · Límite de los descriptores"
      title={<>¿Qué descriptor necesita Shazam (y por qué <em>no</em> el centroide)?</>}
      subtitle="ZCR, Rolloff o Centroide caracterizan la textura, pero son métricas agregadas. Todo promedio global se destruye con ruido aditivo."
      footer={
        <RevealButton
          step={step}
          total={2}
          onAdvance={() => setStep((s) => s + 1)}
          onReset={() => setStep(0)}
          labels={['Completa la columna DESCRIBIR', 'Qué necesitamos en su lugar']}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 28, alignItems: 'start', minHeight: 392 }}>
        {/* ── El experimento mental: los descriptores globales colapsan ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            La trampa de la masa espectral
          </span>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 18, lineHeight: 1.5, color: INK }}>
            <em>¿Buscarías una grabación comparando un promedio global (como el centroide o ZCR) contra millones de canciones?</em>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#eef4fc', border: `1px solid ${BLUE}55` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>audio original</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 800, color: BLUE, marginTop: 4 }}>1200 Hz</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: RED, fontWeight: 800 }}>+ ruido →</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: '#fbeeee', border: `1px solid ${RED}55` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: INK_MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>voces en un bar</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 800, color: RED, marginTop: 4 }}>1850 Hz</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK_MUTED, textAlign: 'center', lineHeight: 1.4 }}>
            El ruido suma energía y desplaza el centro de masa. Los valores <strong>no son reproducibles</strong> fuera del estudio.
          </div>

          {/* Mención a otros descriptores: ZCR, Rolloff, Flux */}
          <div style={{ marginTop: 4, padding: '12px 16px', background: '#fbf9f5', borderRadius: 10, border: '1px solid #e8e3d8' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 800, color: INK }}>¿Y el Flujo Espectral o el Rolloff?</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED, lineHeight: 1.45, marginTop: 6 }}>
              Padecen la misma vulnerabilidad. Incluso el <em>Flujo Espectral</em> calcula un diferencial sumando todas las frecuencias juntas. Cualquier ruido de fondo enmascara la señal y destruye la métrica. Necesitamos algo que sobreviva al <strong>ruido aditivo</strong>.
            </div>
          </div>
        </div>

        {/* ── La rúbrica: columna DESCRIBIR con ❌ ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: BLUE, fontWeight: 800 }}>
            Rúbrica · columna DESCRIBIR
          </span>
          <div style={{ opacity: step >= 1 ? 1 : 0.18, transition: 'opacity 0.45s', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROWS.map(([crit, why], i) => (
              <div key={crit} style={{
                display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, alignItems: 'start',
                padding: '11px 14px', borderRadius: 10, background: '#fbeeee', border: `1px solid ${RED}33`,
                transitionDelay: `${i * 60}ms`,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, color: RED, textAlign: 'center' }}>✗</span>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 700, color: INK }}>{crit}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK_MUTED, lineHeight: 1.4, marginTop: 1 }}>{why}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            opacity: step >= 2 ? 1 : 0.18, transition: 'opacity 0.45s', marginTop: 4,
            padding: '14px 18px', borderRadius: 12, background: '#f3eefc', borderLeft: `4px solid ${VIOLET}`,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: VIOLET, fontWeight: 800 }}>
              Qué necesitamos
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 18, fontStyle: 'italic', color: INK, marginTop: 6, lineHeight: 1.45 }}>
              Para <strong>identificar</strong> necesitamos lo contrario a un promedio global: una representación
              {' '}<strong style={{ color: GREEN }}>local, reproducible y robusta</strong>. Es exactamente lo que propone Wang (2003).
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
