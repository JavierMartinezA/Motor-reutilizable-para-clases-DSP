/**
 * Recreando los 80s — Fun Task 09.
 * Puente entre la teoría matemática (Chowning · Bessel) y la aplicación
 * artística: clonar un timbre icónico (When Doves Cry · Africa) usando
 * síntesis FM 2-operador en NumPy y validar visualmente vía espectrograma.
 *
 * 3 pasos controlados manualmente por el profesor:
 *   1. Parámetros detectados a oído (f_c, ratio, I_max, ADSR)
 *   2. Lógica de generación (ecuación + código + máster)
 *   3. Validación cruzada (espectrogramas + audio original vs clon)
 */

import { useState } from 'react';
import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';
import AudioPlayer from '../../components/AudioPlayer';

// === Paleta canónica del curso ===
const BLUE = '#2563eb';
const RED = '#c0392b';
const AMBER = '#d97706';
const VIOLET = '#7c3aed';
const GREEN = '#16a34a';
const INK = '#1a1a2e';
const INK_MUTED = '#6b6b8a';
const INK_FAINT = '#9e9eb8';

const TOTAL_STEPS = 3;

const STEP_TITLES = [
  '1 · Parámetros detectados a oído',
  '2 · Lógica de generación · NumPy',
  '3 · Validación · espectrograma + audio',
];

// Sub-pasos internos: cada label revela un nuevo bloque de la slide.
// La navegación entre slides queda exclusivamente para App.jsx (footer global).
const SUB_ITEMS = [
  { label: 'Parámetros detectados a oído', color: AMBER },
  { label: 'Revelar generación · NumPy',  color: BLUE  },
  { label: 'Revelar validación · espectro + audio', color: VIOLET },
];


// ============================================================
// Stepper top
// ============================================================
function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 22, height: 22, borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 700,
              background: i === step ? AMBER : i < step ? 'rgba(217,119,6,0.18)' : 'transparent',
              color: i === step ? '#fff' : i < step ? AMBER : INK_FAINT,
              border: `1.5px solid ${i <= step ? AMBER : INK_FAINT}`,
              transition: 'all 0.2s ease',
            }}
          >
            {i + 1}
          </div>
          {i < TOTAL_STEPS - 1 && (
            <div style={{ width: 14, height: 1.5, background: i < step ? AMBER : INK_FAINT, opacity: i < step ? 0.7 : 0.4 }} />
          )}
        </div>
      ))}
      <span style={{ marginLeft: 12, fontFamily: "'Inter', sans-serif", fontSize: 13, color: INK, fontWeight: 600 }}>
        {STEP_TITLES[step]}
      </span>
    </div>
  );
}

// ============================================================
// SVG: envolvente ADSR sobre I (auxiliar paso 2)
// ============================================================
function AdsrIChart({ A = 0.04, D = 0.35, S = 0.55, R = 0.6, Imax = 7 }) {
  const W = 460;
  const H = 130;
  const total = A + D + 0.6 + R; // sustain visible 0.6s
  const xToPx = (t) => 28 + (t / total) * (W - 40);
  const yToPx = (i) => H - 22 - (i / Imax) * (H - 36);
  const path = (() => {
    const points = [
      [0, 0],
      [A, Imax],                  // ataque al pico
      [A + D, S * Imax],          // decae al sustain
      [A + D + 0.6, S * Imax],    // sustain
      [A + D + 0.6 + R, 0],       // release
    ];
    return points.map(([t, v], i) => `${i === 0 ? 'M' : 'L'}${xToPx(t).toFixed(2)},${yToPx(v).toFixed(2)}`).join(' ');
  })();
  const labels = [
    { x: A / 2, label: 'A', t: A },
    { x: A + D / 2, label: 'D', t: D },
    { x: A + D + 0.3, label: 'S', t: 0.6 },
    { x: A + D + 0.6 + R / 2, label: 'R', t: R },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: '#faf8f3', borderRadius: 10 }}>
      {/* ejes */}
      <line x1={28} y1={H - 22} x2={W - 12} y2={H - 22} stroke={INK_FAINT} strokeWidth={1} />
      <line x1={28} y1={14} x2={28} y2={H - 22} stroke={INK_FAINT} strokeWidth={1} />
      <text x={W - 12} y={H - 6} textAnchor="end" fontFamily="Inter,sans-serif" fontSize={9.5} fill={INK_MUTED}>tiempo</text>
      <text x={30} y={12} fontFamily="Inter,sans-serif" fontSize={9.5} fill={AMBER}>I(t) — índice de modulación</text>
      {/* curva */}
      <path d={path} stroke={AMBER} strokeWidth={2.4} fill="none" />
      <circle cx={xToPx(A)} cy={yToPx(Imax)} r={3.5} fill={AMBER} />
      <text x={xToPx(A) + 6} y={yToPx(Imax) + 3} fontFamily="JetBrains Mono,monospace" fontSize={10} fill={INK}>
        I_max
      </text>
      {/* etiquetas ADSR */}
      {labels.map((l) => (
        <text key={l.label} x={xToPx(l.x)} y={H - 8} textAnchor="middle"
          fontFamily="JetBrains Mono,monospace" fontSize={10.5} fill={INK_MUTED} fontWeight={700}>
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// ============================================================
// Espectrograma "placeholder" estilizado — reemplazable por <img/>
// si el pipeline Python ya generó el PNG en public/imagenes/.
// Recibe `imgSrc` opcional; si no se provee, dibuja un mock SVG.
// ============================================================
function SpectrogramPanel({ title, kicker, accent, imgSrc }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: 12, borderRadius: 12,
      background: '#fff', border: `1px solid ${INK_FAINT}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: accent, fontWeight: 700,
        }}>
          {kicker}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: INK_FAINT }}>
          STFT · n_fft=2048 · hop=512
        </span>
      </div>
      {imgSrc ? (
        <img src={imgSrc} alt={title} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
      ) : (
        <SpectrogramMock accent={accent} />
      )}
      <span style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: INK, fontStyle: 'italic' }}>
        {title}
      </span>
    </div>
  );
}

function SpectrogramMock({ accent }) {
  // Mock visual: bandas horizontales de energía simulando un sonido FM
  // (carrier + sidebands) que decae con el tiempo.
  const W = 380, H = 170;
  const bands = [
    { y: 0.78, base: 0.95 }, // f_c
    { y: 0.58, base: 0.78 },
    { y: 0.40, base: 0.55 },
    { y: 0.26, base: 0.35 },
    { y: 0.16, base: 0.22 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', borderRadius: 6, background: '#0d0d1c' }}>
      {/* Eje tiempo */}
      <line x1={28} y1={H - 18} x2={W - 8} y2={H - 18} stroke="#5a5a72" strokeWidth={0.5} />
      {/* Bandas espectrales con gradiente temporal */}
      {bands.map((b, i) => (
        <g key={i}>
          {Array.from({ length: 60 }).map((_, t) => {
            const x = 28 + (t / 60) * (W - 36);
            const decay = Math.exp(-t * 0.04);
            const intensity = b.base * decay;
            const w = (W - 36) / 60;
            return (
              <rect
                key={t}
                x={x}
                y={H - 18 - b.y * (H - 24)}
                width={w + 0.5}
                height={6 + (1 - b.y) * 2}
                fill={accent}
                fillOpacity={intensity * 0.85}
              />
            );
          })}
        </g>
      ))}
      {/* etiquetas eje frecuencia */}
      {[0.16, 0.40, 0.78].map((y, i) => {
        const labels = ['f_c+2f_m', 'f_c+f_m', 'f_c'];
        return (
          <text
            key={i}
            x={4}
            y={H - 18 - y * (H - 24) + 3}
            fontFamily="JetBrains Mono,monospace"
            fontSize={8}
            fill="#9e9eb8"
          >
            {labels[i]}
          </text>
        );
      })}
      <text x={W - 8} y={H - 6} textAnchor="end" fontFamily="JetBrains Mono,monospace" fontSize={8} fill="#9e9eb8">
        t →
      </text>
    </svg>
  );
}

// ============================================================
// Bloque de código analítico (estilo editorial, no terminal)
// ============================================================
function CodeBlock({ children, accent = AMBER }) {
  return (
    <pre style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      lineHeight: 1.55,
      color: INK,
      background: '#fbf8f1',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 4,
      padding: '12px 16px',
      margin: 0,
      overflow: 'auto',
      whiteSpace: 'pre',
    }}>
      {children}
    </pre>
  );
}

// ============================================================
// Tarjeta de parámetro detectado (paso 1)
// ============================================================
function ParamCard({ label, value, unit, color, hint }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 12,
      background: '#fff',
      border: `1.5px solid ${color}`,
      borderLeft: `5px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 4,
      minHeight: 88,
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color, fontWeight: 700,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: INK, fontWeight: 700,
      }}>
        {value}
        <span style={{ fontSize: 13, color: INK_MUTED, marginLeft: 4 }}>{unit}</span>
      </span>
      {hint && (
        <span style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: INK_MUTED, fontStyle: 'italic' }}>
          {hint}
        </span>
      )}
    </div>
  );
}

// ============================================================
// SLIDE PRINCIPAL
// ============================================================
export default function SlideRecreando80s() {
  const [step, setStep] = useState(0);

  return (
    <SlideLayout
      sectionId="06"
      sectionLabel="Fun Task 09 · Recreando los 80s"
      title={<>De la <em>ecuación de Chowning</em> al sintetizador clásico</>}
      subtitle="Clonar el bajo de “When Doves Cry” o el brass de “Africa” codificando f_c, ratio e I(t) — y validar a oído + vía espectrograma."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SubStepTabs items={SUB_ITEMS} value={step} onChange={setStep} />
        <StepIndicator step={step} />

        {step === 0 && <Step1Params />}
        {step === 1 && <Step2Generacion />}
        {step === 2 && <Step3Validacion />}
      </div>
    </SlideLayout>
  );
}

// SubStepTabs reusable (idéntico patrón al usado en las slides FM).
function SubStepTabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {items.map((it, i) => {
        const active = value === i;
        return (
          <button key={i} type="button" onClick={() => onChange(i)}
            style={{
              padding: '7px 16px', borderRadius: 50,
              border: `1.5px solid ${active ? it.color : INK_FAINT}`,
              background: active ? it.color : 'transparent',
              color: active ? '#fff' : INK_MUTED,
              fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700,
              letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 8, opacity: 0.85 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// PASO 1 · Parámetros detectados a oído
// ============================================================
function Step1Params() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 420 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
            El método del compositor FM
          </span>
          <h3 style={{ fontFamily: "'Newsreader', serif", fontSize: 22, lineHeight: 1.22, color: INK, margin: 0, fontWeight: 500 }}>
            Antes de escribir una línea de código,{' '}
            <em style={{ color: AMBER }}>se escucha</em>: ¿qué tono fundamental? ¿qué brillo? ¿qué ataque?
          </h3>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14.5, color: INK_MUTED, lineHeight: 1.55, margin: 0 }}>
            Cada timbre clásico de los 80 está descrito por <strong>cinco números</strong>: una frecuencia
            portadora, un <em>ratio</em> entre osciladores, un índice máximo de modulación y los tiempos
            de su envolvente. Estos cinco números son nuestra hipótesis — el código es la verificación.
          </p>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK_MUTED, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
            Ejemplo: bajo percusivo de “When Doves Cry” (Prince, 1984) → ratio cercano a 1:1 y un I(t)
            que decae rápido, dejando una cola casi senoidal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ParamCard label="f_c (carrier)" value="73.4" unit="Hz" color={BLUE} hint="≈ D2 · grave del bajo" />
          <ParamCard label="ratio  f_m / f_c" value="1.00" unit="" color={RED} hint="armónico — espectro alineado a la serie" />
          <ParamCard label="I_max" value="6.5" unit="" color={AMBER} hint="brillo metálico al ataque" />
          <ParamCard label="ADSR(I)" value="A 5  D 350  R 600" unit="ms" color={VIOLET} hint="ataque rápido · cola limpia" />
        </div>
      </div>

      <div style={{
        background: '#fffbf2',
        borderLeft: `3px solid ${AMBER}`,
        padding: '12px 16px',
        borderRadius: 4,
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
          Hipótesis perceptual
        </span>
        <p style={{ margin: '4px 0 0', fontFamily: "'Newsreader', serif", fontSize: 13.5, color: INK, lineHeight: 1.55 }}>
          La nota base se identifica con un piano o un afinador. El ratio se intuye por la “familia”
          (armónica → instrumental, irracional → metálica). El I_max y el ADSR se ajustan iterando: si el
          ataque suena <em>vidrioso</em>, sube I_max; si suena <em>blando</em>, alarga el attack.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PASO 2 · Lógica de generación · NumPy
// ============================================================
function Step2Generacion() {
  const formula = String.raw`y(t)\;=\;\textcolor{#7c3aed}{A(t)}\,\sin\!\Bigl(2\pi\,\textcolor{#2563eb}{f_c}\, t\;+\;\textcolor{#d97706}{I(t)}\,\sin(2\pi\,\textcolor{#c0392b}{f_m}\, t)\Bigr)`;
  const formulaI = String.raw`\textcolor{#d97706}{I(t)} \;=\; I_{\max} \cdot \mathrm{ADSR}(t)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 420 }}>
      {/* Fórmulas */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '12px 18px',
        background: '#fffbf2',
        borderRadius: 10,
        border: `1px solid rgba(217,119,6,0.22)`,
      }}>
        <div className="math-box" style={{ fontSize: 17 }}>
          <MathFormula t={formula} display />
        </div>
        <div className="math-box" style={{ fontSize: 14 }}>
          <MathFormula t={formulaI} display />
        </div>
        <div style={{
          marginTop: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: AMBER,
          lineHeight: 1.5,
        }}>
          [WHY] el índice se modula con la envolvente para que el <em>brillo</em> y el <em>ancho de banda</em>{' '}
          del espectro <strong>“florezcan”</strong> en el ataque y se limpien progresivamente — emulando
          la transferencia modal de los instrumentos físicos.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 18, alignItems: 'start' }}>
        {/* Bloque de código */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            síntesis FM 2-operador en NumPy
          </span>
          <CodeBlock accent={AMBER}>{`import numpy as np

sr = 44100
dur = 1.4
t = np.arange(int(sr * dur)) / sr

# parámetros detectados a oído
f_c   = 73.4         # Hz · D2
ratio = 1.0          # f_m / f_c
I_max = 6.5

# envolvente sobre I(t) — "florece y se limpia"
I_t = I_max * adsr(t, A=0.005, D=0.35, S=0.55, R=0.60)
A_t =      adsr_amp(t, A=0.005, D=0.20, S=0.85, R=0.50)

# ecuación de Chowning
y = A_t * np.sin(2*np.pi*f_c*t + I_t * np.sin(2*np.pi*f_c*ratio*t))

# máster: -1.4 dBFS para evitar clipping
y *= 10 ** (-1.4 / 20) / np.max(np.abs(y))

# anchura espacial: ±0.5 Hz de detune entre L y R
y_L = render(f_c - 0.5, ratio, I_t, A_t)
y_R = render(f_c + 0.5, ratio, I_t, A_t)
stereo = np.stack([y_L, y_R], axis=1)

sf.write('cover_80s.wav', stereo, sr, subtype='PCM_16')`}</CodeBlock>
        </div>

        {/* Envolvente + notas analíticas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_MUTED, fontWeight: 700 }}>
            envolvente sobre I(t)
          </span>
          <AdsrIChart />

          <div style={{
            padding: '10px 14px', background: 'rgba(124,58,237,0.07)',
            borderLeft: `3px solid ${VIOLET}`, borderRadius: 4,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: VIOLET, fontWeight: 700 }}>
              máster · seguridad digital
            </div>
            <p style={{ margin: '4px 0 0', fontFamily: "'Newsreader', serif", fontSize: 13, color: INK, lineHeight: 1.5 }}>
              La FM 2-op puede explotar fácil con I altos. Normalizamos a <strong>−1.4 dBFS</strong> antes
              de escribir el WAV → margen seguro contra clipping inter-sample.
            </p>
          </div>

          <div style={{
            padding: '10px 14px', background: 'rgba(22,163,74,0.07)',
            borderLeft: `3px solid ${GREEN}`, borderRadius: 4,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: GREEN, fontWeight: 700 }}>
              psicoacústica · anchura espacial
            </div>
            <p style={{ margin: '4px 0 0', fontFamily: "'Newsreader', serif", fontSize: 13, color: INK, lineHeight: 1.5 }}>
              Renderizar dos voces con <strong>±0.5 Hz de detune</strong> entre L y R produce un{' '}
              <em>chorus mínimo</em> que el oído interpreta como “amplitud estéreo” sin desafinar la nota.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PASO 3 · Validación · espectrograma + audio
// ============================================================
function Step3Validacion() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 420 }}>
      <div style={{
        padding: '12px 16px',
        background: '#fffbf2',
        borderLeft: `3px solid ${AMBER}`,
        borderRadius: 4,
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMBER, fontWeight: 700 }}>
          Diagnóstico vía Fourier
        </span>
        <p style={{ margin: '4px 0 0', fontFamily: "'Newsreader', serif", fontSize: 14, color: INK, lineHeight: 1.55 }}>
          Comparar espectrogramas es lo que te dice si <strong>acertaste el ratio</strong>. Si tu espectrograma
          tiene bandas en lugares distintos al original, no es un problema de mezcla — es un problema
          del <span style={{ fontFamily: "'JetBrains Mono', monospace", color: RED, fontWeight: 700 }}>ratio f_m / f_c</span>.
        </p>
      </div>

      {/* Espectrogramas comparativos · generados por dsp_pipelines/pipelines/recreando_80s.py */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SpectrogramPanel
          kicker="Original · referencia"
          title="el timbre que queremos clonar (snippet de la canción)"
          accent={BLUE}
          imgSrc="/imagenes/recreando_80s_spec_original.png"
        />
        <SpectrogramPanel
          kicker="Cover · nuestra síntesis FM"
          title="generado con f_c, ratio, I(t) detectados a oído"
          accent={AMBER}
          imgSrc="/imagenes/recreando_80s_spec_cover.png"
        />
      </div>

      {/* Audio · cover sintetizado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 520px)', justifyContent: 'center' }}>
        <AudioPlayer
          src="/audio/cover_80s.wav"
          label="Un bajo · Cover síntesis FM 2-op"
          sublabel="GENERADO · NUMPY · −1.4 dBFS"
          accent={AMBER}
        />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
      }}>
        {[
          { kicker: 'si las bandas coinciden', desc: 'el ratio está bien · ajustá I_max si el brillo difiere', color: GREEN },
          { kicker: 'si las bandas están desplazadas', desc: 'cambiá el ratio f_m/f_c · primero las posiciones, luego las amplitudes', color: RED },
          { kicker: 'si el ataque difiere', desc: 'reescribí la envolvente A·D del índice — no la del volumen', color: VIOLET },
        ].map((c) => (
          <div key={c.kicker} style={{
            padding: '10px 14px', borderRadius: 8,
            background: '#fff', border: `1px solid ${c.color}`,
            borderLeft: `4px solid ${c.color}`,
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.color, fontWeight: 700 }}>
              {c.kicker}
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 12.5, color: INK_MUTED, marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>
              {c.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
