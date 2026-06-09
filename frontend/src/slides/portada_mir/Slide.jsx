/**
 * Clase 11 · MIR & Shazam — Slide 01 · Portada
 * De producir sonido a entenderlo. El giro del curso: CREATION → ANALYSIS.
 * Fuentes: presentacion_mir_shazam.md (Slide 1) · slides_11.md (§1, §9).
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import { INK, INK_MUTED, INK_FAINT, VIOLET, BLUE, GREEN, RevealButton } from '../_mir_shared.jsx';

const TIMELINE = [
  { id: 'S07', label: 'Modelo sinusoidal', note: 'picos para re-sintetizar', tone: INK_FAINT, phase: 'CREACIÓN' },
  { id: 'S08–10', label: 'Substractiva · FM · físico', note: 'sintetizar timbre', tone: INK_FAINT, phase: 'CREACIÓN' },
  { id: 'S11', label: 'MIR & Fingerprinting', note: 'entender — hoy', tone: VIOLET, phase: 'ANÁLISIS' },
  { id: 'S12', label: 'Difusión generativa', note: 'features → audio', tone: GREEN, phase: 'GENERACIÓN' },
];

export default function SlidePortadaMIR() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="01"
      sectionLabel="MIR · Portada"
      title={<>De producir sonido a <em>entenderlo</em></>}
      subtitle="MIR & Audio Fingerprinting — ¿cómo el computador escucha la música? La ciencia detrás de Shazam y Spotify."
      footer={
        <RevealButton
          step={step}
          total={2}
          onAdvance={() => setStep((s) => s + 1)}
          onReset={() => setStep(0)}
          labels={['Plantea la pregunta de hoy', 'El hilo conductor']}
        />
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', minHeight: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 21, lineHeight: 1.55, color: INK }}>
            Sesiones 07–10: <strong>sintetizar</strong> — aditiva, substractiva, FM, físico.
            {' '}Hoy la pregunta gira 180°.
          </p>
          <div style={{
            padding: '18px 22px', borderRadius: 12, background: '#f3eefc',
            borderLeft: `4px solid ${VIOLET}`,
            opacity: step >= 1 ? 1 : 0.18, transition: 'opacity 0.45s',
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: VIOLET, fontWeight: 800 }}>
              La pregunta de hoy
            </span>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 23, fontStyle: 'italic', color: INK, marginTop: 6, lineHeight: 1.4 }}>
              Dado un audio, ¿qué puedo decir sobre él?
            </p>
          </div>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 15.5, lineHeight: 1.5, color: INK_MUTED,
            opacity: step >= 2 ? 1 : 0.18, transition: 'opacity 0.45s',
          }}>
            Una de las preguntas centrales de <strong>MIR</strong> (Music Information Retrieval): <em>¿qué canción es esta?</em>
            {' '}El hilo conductor será uno solo — <strong style={{ color: BLUE }}>el espectrograma es la materia prima de casi todo MIR</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700, marginBottom: 4 }}>
            El arco del curso
          </span>
          {TIMELINE.map((s) => (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 14, alignItems: 'center',
              padding: '12px 16px', borderRadius: 10,
              background: s.tone === VIOLET ? '#f3eefc' : '#fbf9f5',
              border: `1px solid ${s.tone === VIOLET ? VIOLET + '55' : '#e8e3d8'}`,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: s.tone }}>{s.id}</span>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, fontWeight: 700, color: INK }}>{s.label}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK_MUTED }}>{s.note}</div>
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.tone, fontWeight: 800 }}>{s.phase}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
