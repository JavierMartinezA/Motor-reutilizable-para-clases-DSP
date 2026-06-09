/**
 * Clase 11 · MIR & Shazam — Slide · Coherencia temporal (Wang scatterplots)
 * ==========================================================================
 * Puente cognitivo entre hashing_combinatorio (08) e histograma_offsets (09).
 *
 * Muestra las figuras originales de Wang 2003: cuando la canción es la correcta
 * los matches comparten el mismo δt = t_db − t_query → el scatterplot forma una
 * diagonal y el histograma un pico Dirac. Cuando no coincide → nube dispersa,
 * histograma plano. El criterio NO es "más hashes en común" sino "pico más alto".
 *
 * Paso interactivo:
 *   step 0 → solo el caso NO-match (rojo).
 *   step 1 → revela el caso match (verde) + la explicación del Dirac.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, VIOLET, GREEN, RED, AMBER,
  RevealButton,
} from '../_mir_shared.jsx';

export default function SlideWangCoherencia() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="08b"
      sectionLabel="MIR · Coherencia"
      title={<>Coherencia temporal: <em>el histograma de offsets</em></>}
      subtitle="Compartir hashes no basta — algunos coinciden por azar. El discriminante real es la consistencia temporal de los matches."
      footer={
        <RevealButton
          step={step}
          total={1}
          onAdvance={() => setStep(1)}
          onReset={() => setStep(0)}
          labels={['Revelar: ¿y si la canción SÍ coincide?']}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Fórmula ancla */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <div style={{
            background: '#08111d', borderRadius: 10, padding: '10px 18px',
            color: '#e3d4ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 1,
          }}>
            <MathFormula
              t="\textcolor{#d97706}{\delta t} = \textcolor{#7c3aed}{t_{db}} - \textcolor{#2563eb}{t_{query}}"
              color="#e3d4ff" size={1.2} display
            />
          </div>
          <div style={{
            flex: 1.8, padding: '12px 16px', borderRadius: 10,
            background: '#f3eefc', borderLeft: `3px solid ${VIOLET}`,
            fontFamily: "'Newsreader', serif", fontSize: 15, color: INK, lineHeight: 1.5,
          }}>
            La llave <strong>H=(f₁,f₂,Δt) → (ID,t₁)</strong> produce matches de hashes.
            Para cada match se calcula <strong style={{ color: AMBER }}>δt</strong>: la diferencia
            temporal entre la posición en la base de datos y la posición en la query.
          </div>
        </div>

        {/* Dos paneles: NO-match (siempre visible) y match (revelado) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
          {/* ── NO-match (izquierda, rojo) ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '14px 16px', borderRadius: 14,
            background: `${RED}08`, border: `2px solid ${RED}`,
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 800,
              color: RED, letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>✗</span> Señales NO coinciden
            </div>
            <div style={{
              borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e3d8',
              background: '#fff',
            }}>
              <img
                src="/imagenes/Wang_noMatch.png"
                alt="Wang Fig. 2: scatterplot sin diagonal + histograma plano — señales no coinciden"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED,
              lineHeight: 1.45,
            }}>
              Los matches son <strong style={{ color: RED }}>casuales</strong>: δt toma valores
              aleatorios → scatterplot disperso, histograma plano.
            </div>
          </div>

          {/* ── Match (derecha, verde) — revelado con step ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '14px 16px', borderRadius: 14,
            background: step >= 1 ? `${GREEN}08` : '#fbfaf8',
            border: `2px solid ${step >= 1 ? GREEN : '#e8e3d8'}`,
            opacity: step >= 1 ? 1 : 0.18,
            transform: step >= 1 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease, background 0.5s ease, border-color 0.5s ease',
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 800,
              color: GREEN, letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>✓</span> Señales SÍ coinciden
            </div>
            <div style={{
              borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e3d8',
              background: '#fff',
            }}>
              <img
                src="/imagenes/Wang_Match.png"
                alt="Wang Fig. 3: scatterplot con diagonal + pico Dirac en histograma — señales coinciden"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED,
              lineHeight: 1.45,
            }}>
              Todos los matches comparten el <strong style={{ color: GREEN }}>mismo δt</strong>{' '}
              → diagonal en el scatterplot, <strong style={{ color: GREEN }}>pico Dirac</strong> en el histograma.
            </div>
          </div>
        </div>

        {/* Explicación del Dirac — aparece con el match */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'stretch',
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
          pointerEvents: step >= 1 ? 'auto' : 'none',
        }}>
          <div style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: '#eefcf2', borderLeft: `3px solid ${GREEN}`,
            fontFamily: "'Newsreader', serif", fontSize: 15, color: INK, lineHeight: 1.5,
          }}>
            <strong style={{ color: GREEN }}>¿Por qué un pico?</strong> El fragmento grabado <em>es</em> la
            canción desplazada un offset constante. Todos los hashes que coinciden en la llave
            comparten ese mismo desplazamiento → el histograma acumula todo en una sola barra.
          </div>
          <div style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: '#fffbf2', borderLeft: `3px solid ${AMBER}`,
            fontFamily: "'Newsreader', serif", fontSize: 15, color: INK, lineHeight: 1.5,
          }}>
            <strong style={{ color: AMBER }}>El criterio final</strong> no es <em>"más hashes en común"</em>{' '}
            sino <strong><em>"pico más alto en el histograma de offsets"</em></strong>.
            Eso le da a Shazam su bajísima tasa de falsos positivos a escala industrial.
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
