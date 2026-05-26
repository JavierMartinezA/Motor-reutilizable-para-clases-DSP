/**
 * Slide 04 — Implementación del Prototipo.
 *
 * Tres columnas: synth.py, reward.py, env.py.
 * Nota al pie sobre el target fijo.
 * Diagrama inferior: ciclo de retroalimentación cerrado.
 *   SAC → Motor FM → Estado S_t / Recompensa R_t → SAC
 */

import SlideLayout from '../../components/SlideLayout';
import MathFormula from '../../components/MathFormula';

const BLUE   = '#2563eb';
const AMBER  = '#d97706';
const VIOLET = '#7c3aed';
const GREEN  = '#16a34a';
const INK       = '#1a1a2e';
const INK_MUTED = '#6b6b8a';
const INK_FAINT = '#9e9eb8';

const COLUMNS = [
  {
    color: AMBER,
    kicker: 'Sintetizador',
    file: 'synth.py',
    bullets: [
      <><strong>Motor DSP:</strong> 2 operadores FM (Chowning, 1973).</>,
      <><strong>Espacio Acústico:</strong> Control de pitch, envolvente ADSR y Feedback.</>,
      <>
        <strong>Desempeño:</strong> Vectorizado en NumPy puro (
        <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>22050 Hz</code>,{' '}
        <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>1 s</code>).
      </>,
    ],
  },
  {
    color: GREEN,
    kicker: 'Función de recompensa',
    file: 'reward.py',
    bullets: [
      <><strong>Log-Spec MAE</strong> <span style={{ color: INK_FAINT }}>(w = 0.4)</span>: Diferencia de energía frecuencial.</>,
      <><strong>MFCC MAE</strong> <span style={{ color: INK_FAINT }}>(w = 0.4)</span>: Discrepancia del timbre cepstral.</>,
      <><strong>Spectral Convergence</strong> <span style={{ color: INK_FAINT }}>(w = 0.2)</span>: Diferencia de estructura global.</>,
      <span><MathFormula t="r = \exp(-2.0 \cdot d)" /></span>,
    ],
  },
  {
    color: BLUE,
    kicker: 'Entorno',
    file: 'env.py',
    bullets: [
      <><strong>Orquestador del MDP:</strong> Implementa la API Gymnasium.</>,
      <>
        <strong>Acción Segura:</strong> Desnormaliza el vector continuo{' '}
        <MathFormula t="[-1,1]^8" /> a valores físicos.
      </>,
      <>
        <strong>Episodios:</strong> 50 pasos máximos, con término anticipado si la similitud
        supera el{' '}
        <code style={{ fontFamily: "'JetBrains Mono', monospace", color: GREEN }}>95 %</code>.
      </>,
    ],
  },
];

export default function SlideImplementacionPrototipo() {
  return (
    <SlideLayout
      sectionId="04"
      sectionLabel="Implementación · pipeline"
      title={<>Cómo funciona el <em style={{ color: VIOLET }}>prototipo</em>.</>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── Tres columnas ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
          maxWidth: 1100, margin: '0 auto', width: '100%',
        }}>
          {COLUMNS.map((col) => (
            <ColumnCard key={col.file} {...col} />
          ))}
        </div>

        {/* ── Ciclo de retroalimentación cerrado ────────────────────── */}
        <FeedbackCycle />

        {/* ── Nota al pie ───────────────────────────────────────────── */}
        <div style={{
          padding: '12px 18px', borderLeft: `3px solid ${AMBER}`,
          background: '#fffaf0', borderRadius: 4, maxWidth: 920, margin: '0 auto', width: '100%',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: AMBER, fontWeight: 700,
          }}>Nota</span>
          <p style={{
            fontFamily: "'Newsreader', serif", fontSize: 15.5, color: INK,
            lineHeight: 1.5, margin: '4px 0 0', fontStyle: 'italic',
          }}>
            El agente actual resuelve <strong>un target a la vez</strong> — validación deliberada
            del pipeline completo antes de generalizar.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}

// ── Column card ───────────────────────────────────────────────────────────────

function ColumnCard({ color, kicker, file, bullets }) {
  return (
    <div style={{
      borderTop: `3px solid ${color}`, padding: '14px 18px',
      background: 'rgba(255,255,255,0.5)', borderRadius: '0 0 8px 8px',
      display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200,
    }}>
      <div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.2em',
          textTransform: 'uppercase', color, fontWeight: 700,
        }}>{kicker}</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: INK,
          fontWeight: 700, marginTop: 2,
        }}>{file}</div>
      </div>
      <ul style={{
        margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8,
        fontFamily: "'Newsreader', serif", fontSize: 14.5, color: INK_MUTED, lineHeight: 1.5,
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ marginLeft: 0 }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Closed feedback-loop cycle diagram ───────────────────────────────────────
//
// Layout  (W=1080, H=140):
//
//   ┌──────────────┐           ┌─────────────────┐   ┌─────────────────────┐
//   │  Agente SAC  │──Acción θ▶│    Motor FM      │──▶│    Estado S_t       │
//   │   (violet)   │           │    (amber)       │   │    (blue)           │
//   └──────────────┘           └─────────────────┘   └─────────────────────┘
//         ▲   ▲                                       ┌─────────────────────┐
//         │   │                                   ──▶│  Recompensa R_t     │
//         │   └──────── r ──────────────────────────  │    (green)          │
//         └──────────── s_t ────────────────────────  └─────────────────────┘
//
// Return paths route along the outer edges of the SVG:
//   • s_t  → top  rail (y = 5)
//   • r    → bottom rail (y = 133)
//
// Node geometry:
//   SAC       x=15,  y=33, w=185, h=62  → cx=107.5, cy=64, right=200
//   MotorFM   x=340, y=33, w=185, h=62  → cx=432.5, cy=64, right=525
//   Estado    x=620, y=17, w=205, h=53  → cx=722.5, cy=43, top=17
//   Recomp    x=620, y=80, w=205, h=48  → cx=722.5, cy=104, bottom=128

function FeedbackCycle() {
  return (
    <svg
      viewBox="0 0 1080 140"
      width="100%"
      style={{ maxWidth: 1080, margin: '0 auto', display: 'block' }}
    >
      <defs>
        {/* Shared arrowhead marker */}
        <marker id="fb-arr" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
          <polygon points="0 0, 8 3.5, 0 7" fill={INK} />
        </marker>
      </defs>

      {/* ── Arrows (drawn before nodes so nodes cover entry stubs) ──── */}

      {/* 1. Agente SAC → Motor FM  (horizontal) */}
      <line x1={200} y1={64} x2={338} y2={64}
        stroke={INK} strokeWidth={1.4} markerEnd="url(#fb-arr)" />
      <text x={270} y={57} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={10.5} fill={AMBER} fontWeight={700}>
        Acción θ
      </text>

      {/* 2. Motor FM → Estado S_t  (diagonal up-right) */}
      <line x1={525} y1={52} x2={618} y2={43}
        stroke={INK} strokeWidth={1.4} markerEnd="url(#fb-arr)" />

      {/* 3. Motor FM → Recompensa R_t  (diagonal down-right) */}
      <line x1={525} y1={76} x2={618} y2={100}
        stroke={INK} strokeWidth={1.4} markerEnd="url(#fb-arr)" />

      {/* 4. Estado S_t → Agente SAC  (top rail: s_t) */}
      <path
        d="M722.5,17 L722.5,5 L107.5,5 L107.5,33"
        stroke={INK} strokeWidth={1.4} fill="none" markerEnd="url(#fb-arr)"
      />
      <text x={415} y={14} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={10} fill={BLUE} fontWeight={700}>
        s_t
      </text>

      {/* 5. Recompensa R_t → Agente SAC  (bottom rail: r) */}
      <path
        d="M722.5,128 L722.5,133 L107.5,133 L107.5,95"
        stroke={INK} strokeWidth={1.4} fill="none" markerEnd="url(#fb-arr)"
      />
      <text x={415} y={130} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={10} fill={GREEN} fontWeight={700}>
        r
      </text>

      {/* ── Nodes (drawn last — cover the underlying arrow stubs) ─────── */}
      <FBNode x={15}  y={33} w={185} h={62} color={VIOLET} title="Agente SAC"     sub="política π_φ" />
      <FBNode x={340} y={33} w={185} h={62} color={AMBER}  title="Motor FM"       sub="synth.py" />
      <FBNode x={620} y={17} w={205} h={53} color={BLUE}   title="Estado Sₜ"      sub="features MIR · 54 dims" />
      <FBNode x={620} y={80} w={205} h={48} color={GREEN}  title="Recompensa Rₜ"  sub="reward.py" />
    </svg>
  );
}

function FBNode({ x, y, w, h, color, title, sub }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={`${color}12`} stroke={color} strokeWidth={1.3} />
      <text x={x + w / 2} y={y + h * 0.44} textAnchor="middle"
        fontFamily="'Newsreader', serif" fontSize={14} fill={color} fontWeight={700}>
        {title}
      </text>
      <text x={x + w / 2} y={y + h * 0.76} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize={9.5} fill={INK_MUTED}>
        {sub}
      </text>
    </g>
  );
}
