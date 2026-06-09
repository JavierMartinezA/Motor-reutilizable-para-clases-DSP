/**
 * Clase 11 · MIR & Shazam — Slide 05 · El Pipeline (Avery Wang, 2003)
 * Stepper de 4 etapas: STFT → constelación → pares (f1,f2,Δt) → hash table.
 * El panel visual evoluciona con cada etapa (espectro → picos → pares → tabla).
 * Fuentes: presentacion (Slide 5) · slides_11.md (§3 + zona objetivo + estrellas).
 */

import { useMemo, useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, VIOLET, BLUE, GREEN, AMBER, ANCHOR_RED,
  PillButton, Spectrogram, getSpec, getPeaks,
} from '../_mir_shared.jsx';

const STAGES = [
  { tag: 'audio → STFT', desc: 'Del dominio del tiempo al tiempo-frecuencia. El espectrograma es la materia prima.', color: BLUE },
  { tag: 'constelación', desc: 'Solo los máximos locales fuertes. ~3 picos por frame. La canción ES esta nube de puntos.', color: AMBER },
  { tag: 'pares (f₁,f₂,Δt)', desc: 'Un pico solo es frágil. Emparejamos un ancla con targets en una zona objetivo: hash geométrico estable.', color: GREEN },
  { tag: 'hash table', desc: 'Guardamos {H → (ID, t₁)}. Búsqueda O(1) contra millones de canciones.', color: VIOLET },
];

export default function SlidePipelineShazam() {
  const [step, setStep] = useState(0);

  const spec = useMemo(() => getSpec('A'), []);
  const peaks = useMemo(() => getPeaks('A'), []);
  // ancla cómoda hacia el inicio de la melodía para mostrar pares con fan-out
  const anchorIdx = 6;

  return (
    <SlideLayout
      sectionId="05"
      sectionLabel="MIR · Pipeline"
      title={<>Anatomía de un <em>buscador acústico</em></>}
      subtitle="Avery Wang, 2003 — cuatro etapas que convierten una canción en una constelación buscable."
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <PillButton color={INK_MUTED} kind="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>← Atrás</PillButton>
          <PillButton color={STAGES[step].color} onClick={() => setStep((s) => (s + 1) % 4)}>
            {step < 3 ? `Siguiente etapa · ${STAGES[step + 1].tag}` : '↻ Volver al inicio'} →
          </PillButton>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.4fr', gap: 26, alignItems: 'start' }}>
        {/* Diagrama de bloques */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STAGES.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.tag} style={{
                padding: '12px 16px', borderRadius: 10,
                border: `2px solid ${active ? s.color : done ? s.color + '66' : '#e0ddd4'}`,
                background: active ? s.color + '14' : done ? '#fbf9f5' : '#faf9f7',
                opacity: active || done ? 1 : 0.5, transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color: s.color }}>{i + 1}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 700, color: INK }}>{s.tag}</span>
                </div>
                {active && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: INK_MUTED, marginTop: 6, lineHeight: 1.45 }}>{s.desc}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel visual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step < 3 ? (
            <>
              <Spectrogram
                spec={spec}
                peaks={step >= 1 ? peaks : null}
                anchorIdx={step >= 2 ? anchorIdx : null}
                fanOut={5} dtMax={15}
                height={560}
              />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: INK_FAINT, textAlign: 'center' }}>
                {step === 0 && 'espectrograma de la Melodía A — magnitud en dB'}
                {step === 1 && 'puntos amarillos = constelación de picos (la huella)'}
                {step === 2 && 'rojo = ancla · líneas verdes = pares dentro de la zona objetivo punteada'}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#08111d', borderRadius: 10, padding: '20px 18px', color: '#e3d4ff', textAlign: 'center' }}>
                <MathFormula t="H = (\textcolor{#5b9bff}{f_1},\ \textcolor{#4ade80}{f_2},\ \textcolor{#fbbf24}{\Delta t})\ \longrightarrow\ (\text{ID\_canción},\ t_1)" color="#e3d4ff" size={1.25} display />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 14.5, padding: '14px 18px', background: '#fbf9f5', borderRadius: 10, border: '1px solid #e8e3d8', color: INK_MUTED }}>
                <span style={{ color: INK, fontWeight: 700 }}>(112, 140, 7)</span><span>→ (Melodía A, t=6)</span>
                <span style={{ color: INK, fontWeight: 700 }}>(98, 165, 11)</span><span>→ (Melodía A, t=6)</span>
                <span style={{ color: INK, fontWeight: 700 }}>(140, 112, 4)</span><span>→ (Melodía B, t=22)</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 8, background: '#f3eefc' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: VIOLET }}>≈ 17M</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK_MUTED }}>cubetas posibles</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 8, background: '#eefcf2' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: GREEN }}>O(1)</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: INK_MUTED }}>look-up por hash</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '13px 18px', background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`, borderRadius: 6, fontFamily: "'Newsreader', serif", fontSize: 15.5, color: INK, lineHeight: 1.5, fontStyle: 'italic' }}>
            "Una estrella sola no identifica una constelación. Dos estrellas, con su distancia y orientación, sí."
            {' '}<span style={{ color: INK_MUTED, fontStyle: 'normal', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>— A. Wang. Por eso el hash es un <strong>par</strong>, no un pico suelto.</span>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
