/**
 * Clase 11 · MIR & Shazam — Slide 02 · El Problema
 * Escenario 2003 + descartar la fuerza bruta (~10^14 ops/query) + huellas.
 * Fuentes: presentacion (Slide 2) · slides_11.md (§3 "la trampa").
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, RED, GREEN, VIOLET, RevealButton,
} from '../_mir_shared.jsx';

const RETOS = [
  ['10 segundos', 'grabados con el teléfono, no la canción completa'],
  ['Bar ruidoso', 'gente hablando, distorsión de bocina, ecualización'],
  ['Millones', 'la base de datos tiene millones de grabaciones'],
  ['< 3 segundos', 'la respuesta debe llegar casi inmediata'],
];

export default function SlideProblemaShazam() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="02"
      sectionLabel="MIR · El Problema"
      title={<>El <em>"milagro"</em> de Shazam</>}
      subtitle="Identificar una canción en ~3 s contra millones, desde 10 s grabados en un bar ruidoso."
      footer={
        <RevealButton
          step={step}
          total={3}
          onAdvance={() => setStep((s) => s + 1)}
          onReset={() => setStep(0)}
          labels={['Probemos la fuerza bruta', '¿Por qué no sirve?', 'La idea correcta']}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 36, alignItems: 'start', minHeight: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            Las cuatro restricciones
          </span>
          {RETOS.map(([k, v]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, alignItems: 'baseline', padding: '11px 16px', borderRadius: 10, background: '#fbf9f5', border: '1px solid #e8e3d8' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15.5, fontWeight: 700, color: INK }}>{k}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: INK_MUTED, lineHeight: 1.4 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 360 }}>
          {/* Paso 1: la tentación */}
          <div style={{
            padding: '16px 20px', borderRadius: 12, background: '#fbeeee',
            border: `1px solid ${RED}44`, opacity: step >= 1 ? 1 : 0.25,
            transition: 'opacity 0.4s',
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: RED, fontWeight: 800 }}>
              ⚠ La trampa
            </span>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 18.5, color: INK, marginTop: 6, lineHeight: 1.45 }}>
              "Calculemos correlación cruzada entre el query y <em>cada</em> canción de la base de datos."
            </p>
          </div>

          {/* Paso 2: el muro numérico */}
          <div style={{ opacity: step >= 2 ? 1 : 0.25, transition: 'opacity 0.4s', textAlign: 'center' }}>
            <div style={{ background: '#08111d', borderRadius: 10, padding: '18px 14px', color: '#ffb3b3' }}>
              <MathFormula t="\underbrace{10^{7}}_{\text{canciones}}\times\ \underbrace{240\,\text{s}}_{\text{duración}}\times\ \underbrace{44100}_{f_s}\ \approx\ 10^{14}\ \text{ops/query}" color="#ffb3b3" size={1.15} display />
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: RED, fontWeight: 700, marginTop: 8 }}>
              Inviable. Ni con todos los servidores del mundo.
            </p>
          </div>

          {/* Paso 3: la respuesta */}
          <div style={{
            padding: '16px 20px', borderRadius: 12, background: '#eefcf2',
            borderLeft: `4px solid ${GREEN}`, opacity: step >= 3 ? 1 : 0.25,
            transition: 'opacity 0.4s',
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN, fontWeight: 800 }}>
              ✓ La idea correcta
            </span>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 18.5, color: INK, marginTop: 6, lineHeight: 1.45 }}>
              No compara audio muestra a muestra. Compara <strong style={{ color: VIOLET }}>huellas digitales</strong>
              {' '}(<em>fingerprints</em>) — robustas, comprimidas, con búsqueda <strong>O(1)</strong>.
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
