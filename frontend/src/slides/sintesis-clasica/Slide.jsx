/**
 * Síntesis clásica — aditiva, wavetable, sustractiva.
 * Props desde course_config.json (ver slides[].props).
 */

import { Suspense, useMemo, useState } from 'react';
import { Line } from '@react-three/drei';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import AudioPlayer from '../../components/AudioPlayer';
import DSPCanvas3D from '../../components/DSPCanvas3D';

const BLUE = '#2563eb';
const RED = '#c0392b';
const AMBER = '#d97706';
const GREEN = '#16a34a';

const CARD_BORDER_PENDING = '#e0ddd4';
const CARD_BG_PENDING = '#faf9f7';

function HarmonicLines({ nHarmonics = 8 }) {
  const segments = useMemo(() => {
    const K = nHarmonics;
    const raw = Array.from({ length: K }, (_, i) => 1 / (i + 1));
    const s = raw.reduce((a, b) => a + b, 0);
    const norm = raw.map((v) => (v / s) * 2.4);
    const out = [];
    for (let k = 0; k < K; k += 1) {
      const z = (k + 1) * 0.48;
      const y = norm[k];
      out.push({
        key: `h-${k}`,
        points: [
          [0, 0, z],
          [2.2, 0, z],
          [2.2, y, z],
          [0, y, z],
          [0, 0, z],
        ],
      });
    }
    return out;
  }, [nHarmonics]);

  return (
    <group>
      {segments.map(({ key, points }) => (
        <Line key={key} points={points} color={BLUE} lineWidth={1.5} />
      ))}
    </group>
  );
}

/** Un ciclo de tabla en el plano X–Y (Z≈0): X fase, Y muestra. */
function WavetableCycleLine({ tableSize = 128 }) {
  const points = useMemo(() => {
    const N = tableSize;
    const w = [];
    for (let i = 0; i < N; i += 1) {
      const ph = (i / N) * Math.PI * 2;
      let s = 0;
      for (let k = 1; k <= 12; k += 1) {
        s += (2 / (Math.PI * k)) * ((-1) ** (k + 1)) * Math.sin(k * ph);
      }
      w.push(s);
    }
    const mx = Math.max(...w.map(Math.abs), 1e-9);
    const pts = w.map((v, i) => {
      const x = (i / (N - 1)) * 2.2;
      const y = (v / mx) * 1.1 + 0.6;
      return [x, y, 0.15];
    });
    return pts;
  }, [tableSize]);

  return <Line points={points} color={AMBER} lineWidth={2} />;
}

function cardStyle(state) {
  if (state === 'active') {
    return {
      border: `2px solid ${BLUE}`,
      background: 'rgba(37, 99, 235, 0.06)',
      opacity: 1,
    };
  }
  if (state === 'revealed') {
    return {
      border: '2px solid rgba(37, 99, 235, 0.35)',
      background: '#faf9f7',
      opacity: 0.85,
    };
  }
  return {
    border: `2px solid ${CARD_BORDER_PENDING}`,
    background: CARD_BG_PENDING,
    opacity: 0.4,
  };
}

function nextLabel(step) {
  if (step === 0) return 'Siguiente · Wavetable';
  if (step === 1) return 'Siguiente · Sustractiva';
  return 'Volver · Aditiva';
}

const FORMULAS = [
  String.raw`x(t)=\sum_{k=1}^{K} \textcolor{#2563eb}{A_k}\cos\!\bigl(2\pi \textcolor{#7c3aed}{k f_0}\, t + \phi_k\bigr)`,
  String.raw`x[n]=\textcolor{#2563eb}{w}\bigl[\lfloor \textcolor{#d97706}{\theta[n]}\rfloor \bmod N\bigr],\quad \theta[n{+}1]=\theta[n]+\frac{\textcolor{#7c3aed}{f_0}}{\textcolor{#16a34a}{f_s}}N`,
  String.raw`y(t)=(\textcolor{#c0392b}{x}*\textcolor{#2563eb}{h})(t),\quad Y(\omega)=\textcolor{#c0392b}{X}(\omega)\,\textcolor{#2563eb}{H}(\omega)`,
];

export default function SlideSintesisClasica({
  audioAdditive = '/audio/sintesis_clasica_aditiva.wav',
  audioWavetable = '/audio/sintesis_clasica_wavetable.wav',
  audioSubtractive = '/audio/sintesis_clasica_sustractiva.wav',
  imgHarmonics = '/imagenes/sintesis_clasica_harmonics.png',
  imgFilter = '/imagenes/sintesis_clasica_filter.png',
}) {
  const [step, setStep] = useState(0);
  const audios = [audioAdditive, audioWavetable, audioSubtractive];
  const labels = ['Demo · aditiva', 'Demo · wavetable', 'Demo · sustractiva'];
  const accents = [BLUE, AMBER, RED];

  const cardStates = [0, 1, 2].map((i) => {
    if (i === step) return 'active';
    if (i < step) return 'revealed';
    return 'pending';
  });

  return (
    <SlideLayout
      sectionId="01"
      sectionLabel="Síntesis"
      title={<>Síntesis clásica · <em>Arquitectos del aire</em></>}
      subtitle="Del espectro armónico al timbre: sumar, tabular, esculpir."
      footer={
        <button
          type="button"
          onClick={() => setStep((s) => (s + 1) % 3)}
          style={{
            padding: '12px 32px',
            borderRadius: 50,
            border: `2.5px solid ${BLUE}`,
            background: BLUE,
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {nextLabel(step)}
        </button>
      }
    >
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'stretch',
          minHeight: 0,
        }}
      >
        <div style={{ flex: '1 1 44%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { title: 'Aditiva', sub: 'Parciales explícitos', desc: 'Cada armónico es un generador; el timbre nace de la suma.' },
            { title: 'Wavetable', sub: 'Un ciclo, muchas lecturas', desc: 'La fase avanza en la tabla; la frecuencia fija el incremento.' },
            { title: 'Sustractiva', sub: 'Espectro denso + filtro', desc: 'Una fuente rica y un filtro que talla el brillo.' },
          ].map((c, i) => (
            <div
              key={c.title}
              style={{
                borderRadius: 14,
                padding: '10px 14px',
                transition: 'opacity 0.25s ease, border-color 0.25s ease',
                ...cardStyle(cardStates[i]),
              }}
            >
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>
                {c.title}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>
                {c.sub}
              </div>
              {cardStates[i] === 'active' && (
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: '#1a1a2e', marginTop: 8, marginBottom: 0, lineHeight: 1.35 }}>
                  {c.desc}
                </p>
              )}
            </div>
          ))}
          <div className="math-box" style={{ marginTop: 4 }}>
            <MathFormula t={FORMULAS[step]} display />
          </div>
          <AudioPlayer src={audios[step]} label={labels[step]} sublabel="PIPELINE" accent={accents[step]} />
        </div>

        <div style={{ flex: '1 1 56%', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div
            style={{
              height: 240,
              borderRadius: 14,
              overflow: 'hidden',
              border: '2px solid #e0ddd4',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <Suspense fallback={<div style={{ height: '100%', display: 'grid', placeItems: 'center', background: '#f7f5f0', color: '#6b6b8a', fontFamily: 'Inter, sans-serif' }}>Cargando vista 3D…</div>}>
              <DSPCanvas3D
                cameraPosition={[5.5, 4.2, 7.2]}
                fov={40}
                background="#f7f5f0"
                axes
                axisLabels={['t', 'Mag', 'f']}
                orbitControls={{ enablePan: true, enableZoom: true, autoRotate: false }}
                style={{ width: '100%', height: '100%' }}
              >
                {step === 0 && <HarmonicLines nHarmonics={8} />}
                {step === 1 && <WavetableCycleLine tableSize={160} />}
                {step === 2 && (
                  <group>
                    <mesh position={[1.1, 1.0, 1.2]} rotation={[0.4, 0.5, 0]}>
                      <boxGeometry args={[0.35, 1.6, 0.35]} />
                      <meshStandardMaterial color={RED} roughness={0.45} metalness={0.1} />
                    </mesh>
                    <mesh position={[1.45, 1.0, 1.2]} rotation={[0.4, 0.5, 0]}>
                      <boxGeometry args={[0.12, 2.0, 0.5]} />
                      <meshStandardMaterial color={BLUE} roughness={0.35} metalness={0.15} transparent opacity={0.85} />
                    </mesh>
                  </group>
                )}
              </DSPCanvas3D>
            </Suspense>
          </div>
          <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
            {step === 0 && (
              <img
                src={imgHarmonics}
                alt="Barras de armónicos"
                style={{ width: '100%', maxHeight: 140, objectFit: 'contain', borderRadius: 10, border: '1px solid #e0ddd4', background: '#fff' }}
              />
            )}
            {step === 1 && (
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: '#1a1a2e', padding: '8px 12px', border: '1px dashed #d97706', borderRadius: 10, background: '#fffdf8' }}>
                La vista 3D muestra un <strong>ciclo</strong> de tabla (fase → muestra). El audio demo usa lectura lineal con incremento de fase fijado por <span style={{ color: AMBER }}>f₀</span> y <span style={{ color: GREEN }}>f_s</span>.
              </div>
            )}
            {step === 2 && (
              <img
                src={imgFilter}
                alt="Respuesta en frecuencia del filtro"
                style={{ width: '100%', maxHeight: 140, objectFit: 'contain', borderRadius: 10, border: '1px solid #e0ddd4', background: '#fff' }}
              />
            )}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
