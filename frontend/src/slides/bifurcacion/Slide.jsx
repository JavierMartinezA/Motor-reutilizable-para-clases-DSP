/**
 * Clase 11 · MIR & Shazam — Slide 04 · El tronco común y la bifurcación
 * ====================================================================
 * Slide-keystone del refactor. La STFT (espectrograma) es la materia prima
 * de TODO MIR; desde ahí la historia se bifurca en dos caminos según la
 * pregunta: DESCRIBIR (¿qué tipo de sonido?) vs IDENTIFICAR (¿qué grabación?).
 *
 * Introduce la rúbrica de 4 criterios (los principios de Wang 2003) que
 * recorre toda la clase: el beat 6 llena la columna DESCRIBIR con ❌, los
 * beats 7–9 llenan IDENTIFICAR con ✅, y el cierre muestra la tabla completa.
 *
 * Paso 1: Separa las dos tareas (columnas + imagen bifurcación).
 * Paso 2: Plantea la rúbrica (4 criterios con "?").
 * Paso 3: "Revelar rúbrica" — llena DESCRIBIR con ✗ e IDENTIFICAR con ✓.
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import {
  INK, INK_MUTED, INK_FAINT, BLUE, VIOLET, GREEN, AMBER, RED,
  RevealButton, Spectrogram, getSpec, PillButton,
} from '../_mir_shared.jsx';

const spec = getSpec('A');

const PATHS = [
  {
    key: 'DESCRIBIR', color: BLUE, q: '¿qué tipo de sonido es?',
    ej: 'género, BPM, "key", mood', who: 'Spotify · radios · recomendación',
    how: 'agrega descriptores (centroide, ZCR…) en estadísticas globales',
  },
  {
    key: 'IDENTIFICAR', color: VIOLET, q: '¿qué grabación exacta es?',
    ej: 'esta toma, este master', who: 'Shazam · Content ID · monitoreo',
    how: 'extrae una huella robusta y la busca en una base gigante',
  },
];

// Los 4 principios de un buen descriptor (Wang 2003 §2.4.1). Verdicts ocultos
// hasta que el profesor pulse "Revelar rúbrica".
const CRITERIA = ['Localización temporal', 'Invariancia traslacional', 'Robustez al ruido', 'Entropía / especificidad'];

// Valores correctos de la rúbrica
const DESCRIBIR_VALS = ['✗', '✗', '✗', '✗'];
const IDENTIFICAR_VALS = ['✓', '✓', '✓', '✓'];

export default function SlideBifurcacion() {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  return (
    <SlideLayout
      sectionId="04"
      sectionLabel="MIR · Dos tareas"
      title={<>Una representación, <em>dos tareas</em></>}
      subtitle="El sistema no recibe música, sino una matriz tiempo–frecuencia. Qué se calcula sobre ella depende de la tarea."
      footer={
        step < 2 ? (
          <RevealButton
            step={step}
            total={2}
            onAdvance={() => setStep((s) => s + 1)}
            onReset={() => setStep(0)}
            labels={['Separa las dos tareas', 'Plantea la rúbrica']}
          />
        ) : !revealed ? (
          <PillButton color={AMBER} onClick={() => setRevealed(true)}>
            Revelar rúbrica →
          </PillButton>
        ) : (
          <PillButton kind="outline" color={INK_MUTED} onClick={() => { setStep(0); setRevealed(false); }}>
            ↻ Reiniciar revelado
          </PillButton>
        )
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '0.78fr 1.22fr', gap: 28, alignItems: 'start', minHeight: 392 }}>
        {/* ── El tronco: la STFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            La representación común · |STFT|²
          </span>
          <div style={{ background: '#08111d', borderRadius: 10, padding: '16px 14px', color: '#cfe0ff', textAlign: 'center' }}>
            <MathFormula t="X[\textcolor{#5b9bff}{k},\textcolor{#fbbf24}{m}] = \sum_{n} x[n]\,w[n-\textcolor{#fbbf24}{m}H]\,e^{-j2\pi \textcolor{#5b9bff}{k} n/N}" color="#cfe0ff" size={1.0} display />
          </div>
          <Spectrogram spec={spec} height={300} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: INK_FAINT, textAlign: 'center' }}>
            espectrograma = |STFT|² · eje X = tiempo, eje Y = frecuencia
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, lineHeight: 1.5, color: INK }}>
            Casi todo MIR parte de aquí. Spotify y Shazam reciben la misma entrada;
            difieren en <strong>qué calculan</strong> sobre ella.
          </p>
        </div>

        {/* ── La bifurcación + rúbrica ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Tarjetas DESCRIBIR / IDENTIFICAR (texto original, sin imágenes) */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
            opacity: step >= 1 ? 1 : 0.18, transition: 'opacity 0.45s',
          }}>
            {PATHS.map((p) => (
              <div key={p.key} style={{ padding: '14px 16px', borderRadius: 12, background: p.color + '10', border: `2px solid ${p.color}` }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16.5, fontWeight: 800, color: p.color, letterSpacing: '0.04em' }}>{p.key}</div>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontStyle: 'italic', color: INK, marginTop: 3, lineHeight: 1.3 }}>{p.q}</div>
                <div style={{ marginTop: 8, fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK_MUTED, lineHeight: 1.45 }}>
                  <div><strong style={{ color: INK }}>sirve para:</strong> {p.ej}</div>
                  <div><strong style={{ color: INK }}>quién:</strong> {p.who}</div>
                  <div style={{ marginTop: 4 }}>{p.how}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Imágenes bifurcación — dos imágenes lado a lado */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
            opacity: step >= 1 ? 1 : 0.18,
            transition: 'opacity 0.45s',
          }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e3d8', background: '#fff', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/imagenes/Imagenslide04_describir.png"
                alt="Diagrama DESCRIBIR"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e3d8', background: '#fff', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/imagenes/Imagenslide04_identificar.png"
                alt="Diagrama IDENTIFICAR"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Fila Inferior (Ancho Completo): Rúbrica + Caja Ámbar ── */}
      <div style={{ marginTop: 24, opacity: step >= 2 ? 1 : 0.18, transition: 'opacity 0.45s' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
          La rúbrica · un buen descriptor debe cumplir 4 propiedades (Wang 2003)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 8, alignItems: 'center' }}>
          {/* Tabla de rúbrica */}
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e8e3d8' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr', background: '#f0ece2', fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 800, color: INK }}>
              <div style={{ padding: '8px 14px' }}>criterio</div>
              <div style={{ padding: '8px 8px', textAlign: 'center', color: BLUE }}>DESCRIBIR</div>
              <div style={{ padding: '8px 8px', textAlign: 'center', color: VIOLET }}>IDENTIFICAR</div>
            </div>
            {CRITERIA.map((c, i) => (
              <div key={c} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr', background: i % 2 ? '#fbf9f5' : '#fff', borderTop: '1px solid #efeadf' }}>
                <div style={{ padding: '7px 14px', fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: INK }}>{c}</div>
                {/* DESCRIBIR cell */}
                <div style={{ padding: '7px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, position: 'relative' }}>
                  <span style={{
                    color: INK_FAINT, opacity: revealed ? 0 : 1,
                    transform: revealed ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                    display: 'inline-block',
                  }}>?</span>
                  <span style={{
                    color: RED, opacity: revealed ? 1 : 0,
                    transform: revealed ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s',
                    position: 'absolute', left: 0, right: 0,
                  }}>{DESCRIBIR_VALS[i]}</span>
                </div>
                {/* IDENTIFICAR cell */}
                <div style={{ padding: '7px 8px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, position: 'relative' }}>
                  <span style={{
                    color: INK_FAINT, opacity: revealed ? 0 : 1,
                    transform: revealed ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                    display: 'inline-block',
                  }}>?</span>
                  <span style={{
                    color: GREEN, opacity: revealed ? 1 : 0,
                    transform: revealed ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s',
                    position: 'absolute', left: 0, right: 0,
                  }}>{IDENTIFICAR_VALS[i]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Caja Ámbar */}
          <div style={{ padding: '16px 20px', background: '#fffbf2', borderLeft: `4px solid ${AMBER}`, borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: INK, lineHeight: 1.5 }}>
            {revealed ? (
              <>
                <strong>DESCRIBIR falla en los 4 criterios</strong> — descriptores globales como ZCR o centroide
                pierden localización temporal y son demasiado genéricos para identificar una grabación exacta.
                <br/><br/>
                <strong style={{ color: VIOLET }}>IDENTIFICAR cumple todos</strong>, y eso determina la elección de Shazam.
              </>
            ) : (
              <>
                Completaremos esta tabla durante la clase.<br/><br/>
                <strong>DESCRIBIR falla en los mismos criterios donde IDENTIFICAR cumple</strong> — y eso determina la elección algorítmica de Shazam.
              </>
            )}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
